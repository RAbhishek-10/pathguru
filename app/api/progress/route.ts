import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAuth, jsonError } from "@/lib/api-utils"

const progressSchema = z.object({
  lectureId: z.string().min(1),
  completed: z.boolean().optional(),
  watchedSeconds: z.number().int().min(0).optional(),
})

export async function POST(request: Request) {
  const { error, user } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const parsed = progressSchema.safeParse(body)
  if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")

  const lecture = await db.lecture.findUnique({ where: { id: parsed.data.lectureId } })
  if (!lecture) return jsonError("Lecture not found", 404)

  const enrolled = await db.enrollment.findUnique({
    where: { userId_batchId: { userId: user!.id, batchId: lecture.batchId } },
  })
  if (!enrolled) return jsonError("Not enrolled in this batch", 403)

  const progress = await db.lectureProgress.upsert({
    where: { userId_lectureId: { userId: user!.id, lectureId: parsed.data.lectureId } },
    create: {
      userId: user!.id,
      lectureId: parsed.data.lectureId,
      completed: parsed.data.completed ?? false,
      watchedSeconds: parsed.data.watchedSeconds ?? 0,
    },
    update: {
      ...(parsed.data.completed !== undefined && { completed: parsed.data.completed }),
      ...(parsed.data.watchedSeconds !== undefined && { watchedSeconds: parsed.data.watchedSeconds }),
    },
  })

  const totalLectures = await db.lecture.count({ where: { batchId: lecture.batchId } })
  const completedCount = await db.lectureProgress.count({
    where: { userId: user!.id, lecture: { batchId: lecture.batchId }, completed: true },
  })
  const batchProgress = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0

  await db.enrollment.update({
    where: { userId_batchId: { userId: user!.id, batchId: lecture.batchId } },
    data: { progress: batchProgress },
  })

  return NextResponse.json({ ...progress, batchProgress })
}

export async function GET() {
  const { error, user } = await requireAuth()
  if (error) return error

  const progress = await db.lectureProgress.findMany({
    where: { userId: user!.id },
    include: { lecture: { select: { batchId: true } } },
  })

  return NextResponse.json(progress)
}
