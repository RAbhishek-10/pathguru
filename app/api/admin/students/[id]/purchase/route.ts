import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole, jsonError } from "@/lib/api-utils"
import { z } from "zod"

const purchaseSchema = z.object({
  itemId: z.string(),
  itemType: z.enum(["test", "note", "book"]),
})

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(["ADMIN"])
  if (error) return error

  const { id: userId } = await params

  try {
    const body = await request.json()
    const parsed = purchaseSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")
    }

    const { itemId, itemType } = parsed.data

    const student = await db.user.findUnique({ where: { id: userId, role: "STUDENT" } })
    if (!student) {
      return jsonError("Student not found", 404)
    }

    // Verify item exists
    if (itemType === "test") {
      const exists = await db.testSeries.findUnique({ where: { id: itemId } })
      if (!exists) return jsonError("Test Series not found", 404)
    } else if (itemType === "note") {
      const exists = await db.note.findUnique({ where: { id: itemId } })
      if (!exists) return jsonError("Notes not found", 404)
    } else if (itemType === "book") {
      const exists = await db.book.findUnique({ where: { id: itemId } })
      if (!exists) return jsonError("Book not found", 404)
    }

    // Check if already purchased
    const existing = await db.purchase.findUnique({
      where: {
        userId_itemType_itemId: {
          userId,
          itemType,
          itemId,
        },
      },
    })

    if (existing) {
      return jsonError(`Student already purchased this ${itemType}`, 409)
    }

    const purchase = await db.purchase.create({
      data: {
        userId,
        itemType,
        itemId,
      },
    })

    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        itemId: purchase.itemId,
        itemType: purchase.itemType,
        purchasedAt: purchase.createdAt.toISOString(),
      },
    })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to add purchase", 500)
  }
}
