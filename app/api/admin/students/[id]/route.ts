import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole, jsonError } from "@/lib/api-utils"
import { z } from "zod"

const updateStudentSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional().nullable(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  examTarget: z.string().optional().nullable(),
})

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(["ADMIN"])
  if (error) return error

  const { id } = await params

  try {
    const student = await db.user.findUnique({
      where: { id, role: "STUDENT" },
      include: {
        enrollments: {
          include: {
            batch: true,
          },
          orderBy: { enrolledAt: "desc" },
        },
        purchases: {
          orderBy: { createdAt: "desc" },
        },
        testResults: {
          orderBy: { completedAt: "desc" },
        },
      },
    })

    if (!student) {
      return jsonError("Student not found", 404)
    }

    return NextResponse.json({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      status: student.status.toLowerCase(),
      examTarget: student.examTarget,
      walletBalance: student.walletBalance,
      referralCode: student.referralCode,
      createdAt: student.createdAt.toISOString(),
      enrollments: student.enrollments.map((e) => ({
        id: e.id,
        progress: e.progress,
        enrolledAt: e.enrolledAt.toISOString(),
        batch: {
          id: e.batch.id,
          title: e.batch.title,
          slug: e.batch.slug,
          examSlug: e.batch.examSlug,
          price: e.batch.price,
        },
      })),
      purchases: student.purchases.map((p) => ({
        id: p.id,
        itemId: p.itemId,
        itemType: p.itemType,
        purchasedAt: p.createdAt.toISOString(),
      })),
      testResults: student.testResults.map((tr) => ({
        id: tr.id,
        testId: tr.testId,
        testName: tr.testName,
        score: tr.score,
        totalMarks: tr.totalMarks,
        rank: tr.rank,
        percentile: tr.percentile,
        completedAt: tr.completedAt.toISOString(),
      })),
    })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to fetch student details", 500)
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRole(["ADMIN"])
  if (error) return error

  const { id } = await params

  try {
    const body = await request.json()
    const parsed = updateStudentSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")
    }

    const existing = await db.user.findUnique({ where: { id, role: "STUDENT" } })
    if (!existing) {
      return jsonError("Student not found", 404)
    }

    // Check if updating email to one that is already registered
    if (parsed.data.email && parsed.data.email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailExists = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } })
      if (emailExists) return jsonError("Email already in use", 409)
    }

    const updateData: Record<string, any> = { ...parsed.data }
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase()
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      status: updated.status.toLowerCase(),
      examTarget: updated.examTarget,
    })
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to update student", 500)
  }
}
