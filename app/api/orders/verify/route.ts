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

    // Calculate details for order
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

    // Execute transaction to save Order and Enroll/Purchase items
    const order = await db.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: user!.id,
          subtotal,
          discount,
          tax,
          total,
          couponCode: couponCode?.toUpperCase(),
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
