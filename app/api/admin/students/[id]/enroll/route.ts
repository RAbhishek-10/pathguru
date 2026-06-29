import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole, jsonError } from "@/lib/api-utils"
import { z } from "zod"

const enrollSchema = z.object({
  batchId: z.string(),
})

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(["ADMIN"])
  if (error) return error

  const { id: userId } = await params

  try {
    const body = await request.json()
    const parsed = enrollSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")
    }

    const { batchId } = parsed.data

    const student = await db.user.findUnique({ where: { id: userId, role: "STUDENT" } })
    if (!student) {
      return jsonError("Student not found", 404)
    }

    const batch = await db.batch.findUnique({ where: { id: batchId } })
    if (!batch) {
      return jsonError("Batch not found", 404)
    }

    // Check if already enrolled
    const existing = await db.enrollment.findUnique({
      where: {
        userId_batchId: {
          userId,
          batchId,
        },
      },
    })

    if (existing) {
      return jsonError("Student is already enrolled in this batch", 409)
    }

    // Transaction to enroll and update counts
    const enrollment = await db.$transaction(async (tx) => {
      const e = await tx.enrollment.create({
        data: {
          userId,
          batchId,
          progress: 0,
        },
        include: {
          batch: true,
        },
      })

      await tx.batch.update({
        where: { id: batchId },
        data: {
          enrolledCount: { increment: 1 },
        },
      })

      return e
    })

    return NextResponse.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        progress: enrollment.progress,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        batch: {
          id: enrollment.batch.id,
          title: enrollment.batch.title,
        },
      },
    })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to enroll student", 500)
  }
}
