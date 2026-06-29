import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAuth, jsonError } from "@/lib/api-utils"
import crypto from "crypto"

const verifySchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string().optional(),
  isMock: z.boolean(),
  items: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["batch", "test", "lecture", "note", "book"]),
      title: z.string(),
      price: z.number(),
      discountedPrice: z.number().optional(),
    })
  ),
  couponCode: z.string().optional(),
})

export async function POST(request: Request) {
  const { error, user } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const parsed = verifySchema.safeParse(body)
    if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")

    const { orderId, paymentId, signature, isMock, items, couponCode } = parsed.data

    // --- IDEMPOTENCY: Prevent duplicate orders for the same paymentId ---
    // (For mock payments, use orderId as the idempotency key)
    const idempotencyKey = isMock ? orderId : paymentId
    const existingOrder = await db.order.findFirst({
      where: {
        userId: user!.id,
        // Store payment/order reference in couponCode field as a temp approach
        // or check via a dedicated paymentId field. We use the status+timestamp guard here.
        // If paymentId field doesn't exist yet, we guard by checking if all items are already purchased.
      },
    }).catch(() => null)

    // Check if all items are already purchased/enrolled to detect duplicate calls
    const alreadyProcessed = await checkAllItemsProcessed(user!.id, items)
    if (alreadyProcessed) {
      // Idempotent: return success without creating a duplicate order
      return NextResponse.json({ success: true, idempotent: true }, { status: 200 })
    }

    // --- SIGNATURE VERIFICATION for real Razorpay payments ---
    if (!isMock) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET
      if (!keySecret) {
        return jsonError("Server misconfiguration: Razorpay secret not set")
      }
      
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex")

      if (generatedSignature !== signature) {
        return jsonError("Payment verification failed: Invalid signature")
      }
    }

    // Calculate order financials
    const subtotal = items.reduce(
      (sum, item) => sum + (item.discountedPrice ?? item.price),
      0
    )

    let discount = 0
    if (couponCode?.toUpperCase() === "SAVE20") {
      discount = subtotal * 0.2
    }

    const afterDiscount = subtotal - discount
    const tax = Math.round(afterDiscount * 0.18)
    const total = afterDiscount + tax

    // Execute transaction: create Order + enroll/purchase items atomically
    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: user!.id,
          subtotal,
          discount,
          tax,
          total,
          couponCode: couponCode?.toUpperCase() ?? null,
          status: "completed",
          items: {
            create: items.map((item) => ({
              itemType: item.type,
              itemId: item.id,
              title: item.title,
              price: item.discountedPrice ?? item.price,
            })),
          },
        },
        include: { items: true },
      })

      for (const item of items) {
        if (item.type === "batch") {
          const existing = await tx.enrollment.findUnique({
            where: { userId_batchId: { userId: user!.id, batchId: item.id } },
          })
          if (!existing) {
            await tx.enrollment.create({ data: { userId: user!.id, batchId: item.id } })
            await tx.batch.update({ where: { id: item.id }, data: { enrolledCount: { increment: 1 } } })
          }
        } else {
          // upsert prevents duplicate purchases for tests, notes, books, lectures
          await tx.purchase.upsert({
            where: { userId_itemType_itemId: { userId: user!.id, itemType: item.type, itemId: item.id } },
            create: { userId: user!.id, itemType: item.type, itemId: item.id },
            update: {},
          })
        }
      }

      return created
    })

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Verification failed")
  }
}

/**
 * Check if all items in the cart are already owned by the user.
 * Used as an idempotency guard against duplicate checkout calls.
 */
async function checkAllItemsProcessed(
  userId: string,
  items: Array<{ id: string; type: string }>
): Promise<boolean> {
  try {
    for (const item of items) {
      if (item.type === "batch") {
        const enrollment = await db.enrollment.findUnique({
          where: { userId_batchId: { userId, batchId: item.id } },
        })
        if (!enrollment) return false
      } else {
        const purchase = await db.purchase.findUnique({
          where: {
            userId_itemType_itemId: { userId, itemType: item.type, itemId: item.id },
          },
        })
        if (!purchase) return false
      }
    }
    return true
  } catch {
    return false
  }
}
