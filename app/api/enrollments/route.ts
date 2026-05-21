import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAuth, jsonError } from "@/lib/api-utils"
import { toBatch } from "@/lib/serializers"

const enrollSchema = z.object({
  batchId: z.string().min(1),
})

export async function GET() {
  const { error, user } = await requireAuth()
  if (error) return error

  const enrollments = await db.enrollment.findMany({
    where: { userId: user!.id },
    include: {
      batch: {
        include: { faculty: { include: { faculty: { include: { user: true } } } } },
      },
    },
    orderBy: { enrolledAt: "desc" },
  })

  return NextResponse.json(
    enrollments.map((e) => ({
      ...toBatch(e.batch),
      progress: e.progress,
      enrolledAt: e.enrolledAt.toISOString(),
    }))
  )
}

export async function POST(request: Request) {
  const { error, user } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const parsed = enrollSchema.safeParse(body)
  if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")

  const batch = await db.batch.findUnique({ where: { id: parsed.data.batchId } })
  if (!batch) return jsonError("Batch not found", 404)

  const existing = await db.enrollment.findUnique({
    where: { userId_batchId: { userId: user!.id, batchId: parsed.data.batchId } },
  })
  if (existing) return jsonError("Already enrolled", 409)

  const enrollment = await db.enrollment.create({
    data: { userId: user!.id, batchId: parsed.data.batchId },
    include: {
      batch: { include: { faculty: { include: { faculty: { include: { user: true } } } } } },
    },
  })

  await db.batch.update({
    where: { id: parsed.data.batchId },
    data: { enrolledCount: { increment: 1 } },
  })

  return NextResponse.json(
    { ...toBatch(enrollment.batch), progress: enrollment.progress, enrolledAt: enrollment.enrolledAt.toISOString() },
    { status: 201 }
  )
}
