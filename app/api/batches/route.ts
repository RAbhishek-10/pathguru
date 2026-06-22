import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toBatch } from "@/lib/serializers"
import { withDbFallback } from "@/lib/db-fallback"
import { batches as mockBatches } from "@/lib/mock-data"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const examSlug = searchParams.get("examSlug")
  const status = searchParams.get("status")

  const batches = await withDbFallback(async () => {
    const rows = await db.batch.findMany({
      where: {
        ...(examSlug ? { examSlug } : {}),
        ...(status ? { status: status.toUpperCase() as "ACTIVE" | "UPCOMING" | "ARCHIVED" } : {}),
      },
      include: {
        faculty: { include: { faculty: { include: { user: true } } } },
      },
      orderBy: { createdAt: "desc" },
    })
    return rows.map(toBatch)
  }, () => {
    let result = mockBatches
    if (examSlug) result = result.filter((b) => b.examSlug === examSlug)
    if (status) result = result.filter((b) => b.status === status.toLowerCase())
    return result
  })

  return NextResponse.json(batches)
}
