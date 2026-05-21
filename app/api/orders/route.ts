import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAuth, jsonError } from "@/lib/api-utils"

const orderSchema = z.object({
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

export async function GET() {
  const { error, user } = await requireAuth()
  if (error) return error

  const orders = await db.order.findMany({
    where: { userId: user!.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orders)
}

export async function POST(request: Request) {
  const { error, user } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")

  if (parsed.data.items.length === 0) return jsonError("Cart is empty")

  const subtotal = parsed.data.items.reduce(
    (sum, item) => sum + (item.discountedPrice ?? item.price),
    0
  )

  let discount = 0
  if (parsed.data.couponCode?.toUpperCase() === "SAVE20") {
    discount = subtotal * 0.2
  }

  const afterDiscount = subtotal - discount
  const tax = Math.round(afterDiscount * 0.18)
  const total = afterDiscount + tax

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: user!.id,
        subtotal,
        discount,
        tax,
        total,
        couponCode: parsed.data.couponCode?.toUpperCase(),
        status: "completed",
        items: {
          create: parsed.data.items.map((item) => ({
            itemType: item.type,
            itemId: item.id,
            title: item.title,
            price: item.discountedPrice ?? item.price,
          })),
        },
      },
      include: { items: true },
    })

    for (const item of parsed.data.items) {
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

  return NextResponse.json(order, { status: 201 })
}
