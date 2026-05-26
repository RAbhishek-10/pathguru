import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth, jsonError } from "@/lib/api-utils"
import Razorpay from "razorpay"

const orderInitSchema = z.object({
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
    const parsed = orderInitSchema.safeParse(body)
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
    const totalAmount = afterDiscount + tax

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      // Sandbox mode fallback
      return NextResponse.json({
        isMock: true,
        amount: totalAmount,
        currency: "INR",
        orderId: `mock_order_${Date.now()}`,
        keyId: "mock_key_id",
      })
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const options = {
      amount: totalAmount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      isMock: false,
      amount: totalAmount,
      currency: "INR",
      orderId: order.id,
      keyId: keyId,
    })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Razorpay order creation failed")
  }
}
