import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, jsonError } from "@/lib/api-utils"
import { toBatch, toLecture } from "@/lib/serializers"
import { withDbFallback } from "@/lib/db-fallback"
import { batches as mockBatches, lectures as mockLectures } from "@/lib/mock-data"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const result = await withDbFallback(async () => {
    const batch = await db.batch.findUnique({
      where: { id },
      include: {
        faculty: { include: { faculty: { include: { user: true } } } },
        lectures: { orderBy: { sortOrder: "asc" } },
      },
    })

    if (!batch) return null

    let completedLectureIds = new Set<string>()
    const session = await requireAuth()
    if (!session.error && session.user) {
      const progress = await db.lectureProgress.findMany({
        where: { userId: session.user.id, lectureId: { in: batch.lectures.map((l) => l.id) }, completed: true },
      })
      completedLectureIds = new Set(progress.map((p) => p.lectureId))
    }

    return {
      ...toBatch(batch),
      lectures: batch.lectures.map((l) => toLecture(l, completedLectureIds.has(l.id))),
    }
  }, () => {
    const batch = mockBatches.find((b) => b.id === id)
    if (!batch) return null
    return { ...batch, lectures: mockLectures }
  })

  if (!result) return jsonError("Batch not found", 404)
  return NextResponse.json(result)
}
