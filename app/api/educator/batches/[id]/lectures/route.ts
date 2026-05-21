import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireRole, jsonError } from "@/lib/api-utils"
import { toLecture } from "@/lib/serializers"

const lectureSchema = z.object({
  title: z.string().min(2),
  duration: z.string().min(1),
  subject: z.string().min(2),
  isFree: z.boolean().default(false),
  videoUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  sortOrder: z.number().int().optional(),
})

async function assertBatchAccess(batchId: string, userId: string, role: string) {
  const batch = await db.batch.findUnique({ where: { id: batchId } })
  if (!batch) return { error: jsonError("Batch not found", 404) }
  if (role !== "ADMIN" && batch.creatorId !== userId) {
    return { error: jsonError("Forbidden", 403) }
  }
  return { error: null }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireRole(["FACULTY", "ADMIN"])
  if (error) return error

  const { id: batchId } = await params
  const access = await assertBatchAccess(batchId, user!.id, user!.role)
  if (access.error) return access.error

  const body = await request.json()
  const parsed = lectureSchema.safeParse(body)
  if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")

  const count = await db.lecture.count({ where: { batchId } })
  const lecture = await db.lecture.create({
    data: {
      batchId,
      title: parsed.data.title,
      duration: parsed.data.duration,
      subject: parsed.data.subject,
      isFree: parsed.data.isFree,
      videoUrl: parsed.data.videoUrl,
      thumbnail: parsed.data.thumbnail ?? "/placeholder.svg?height=120&width=200",
      sortOrder: parsed.data.sortOrder ?? count,
    },
  })

  return NextResponse.json(toLecture(lecture), { status: 201 })
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireRole(["FACULTY", "ADMIN"])
  if (error) return error

  const { id: batchId } = await params
  const access = await assertBatchAccess(batchId, user!.id, user!.role)
  if (access.error) return access.error

  const lectures = await db.lecture.findMany({
    where: { batchId },
    orderBy: { sortOrder: "asc" },
  })

  return NextResponse.json(lectures.map((l) => toLecture(l)))
}
