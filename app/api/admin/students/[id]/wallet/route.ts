import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole, jsonError } from "@/lib/api-utils"
import { z } from "zod"

const walletSchema = z.object({
  amount: z.number().positive(),
  action: z.enum(["credit", "debit"]),
})

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(["ADMIN"])
  if (error) return error

  const { id } = await params

  try {
    const body = await request.json()
    const parsed = walletSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")
    }

    const { amount, action } = parsed.data

    const student = await db.user.findUnique({ where: { id, role: "STUDENT" } })
    if (!student) {
      return jsonError("Student not found", 404)
    }

    let newBalance = student.walletBalance
    if (action === "credit") {
      newBalance += amount
    } else {
      if (student.walletBalance < amount) {
        return jsonError("Insufficient wallet balance for debit action", 400)
      }
      newBalance -= amount
    }

    const updated = await db.user.update({
      where: { id },
      data: {
        walletBalance: newBalance,
      },
    })

    return NextResponse.json({
      id: updated.id,
      walletBalance: updated.walletBalance,
      success: true,
    })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to adjust wallet balance", 500)
  }
}
