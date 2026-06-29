import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, jsonError } from "@/lib/api-utils"
import { withDbFallback } from "@/lib/db-fallback"

export async function GET(request: Request) {
  const { error, user } = await requireAuth()
  if (error) return error

  const orders = await withDbFallback(async () => {
    return await db.order.findMany({
      where: { userId: user!.id },
      include: { items: true },
      orderBy: { createdAt: "desc" }
    })
  }, () => {
    // Mock data for fallback
    return [
      {
        id: "mock_order_1",
        userId: user!.id,
        subtotal: 14999,
        discount: 0,
        tax: 2700,
        total: 17699,
        couponCode: null,
        status: "completed",
        createdAt: new Date(),
        items: [
          {
            id: "mock_item_1",
            orderId: "mock_order_1",
            itemType: "batch",
            itemId: "neet-arjuna-2026",
            title: "NEET 2026 Arjuna Batch",
            price: 14999
          }
        ]
      }
    ]
  })

  return NextResponse.json(orders)
}
