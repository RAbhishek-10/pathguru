import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, jsonError } from "@/lib/api-utils"
import { toBatch, toLecture } from "@/lib/serializers"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const batch = await db.batch.findUnique({
    where: { id },
    include: {
      faculty: { include: { faculty: { include: { user: true } } } },
      lectures: { orderBy: { sortOrder: "asc" } },
    },
  })

  if (!batch) return jsonError("Batch not found", 404)

  let completedLectureIds = new Set<string>()
  const session = await requireAuth()
  if (!session.error && session.user) {
    const progress = await db.lectureProgress.findMany({
      where: { userId: session.user.id, lectureId: { in: batch.lectures.map((l) => l.id) }, completed: true },
    })
    completedLectureIds = new Set(progress.map((p) => p.lectureId))
  }

  return NextResponse.json({
    ...toBatch(batch),
    lectures: batch.lectures.map((l) => toLecture(l, completedLectureIds.has(l.id))),
  })
}
