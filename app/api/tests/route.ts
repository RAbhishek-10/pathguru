import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toTestSeries } from "@/lib/content-serializers"
import { withDbFallback } from "@/lib/db-fallback"
import { testSeries as mockTestSeries } from "@/lib/mock-data"

export async function GET(request: Request) {
  const examSlug = new URL(request.url).searchParams.get("examSlug")

  const tests = await withDbFallback(async () => {
    const rows = await db.testSeries.findMany({
      where: examSlug ? { examSlug } : undefined,
      orderBy: { title: "asc" },
    })
    return rows.map(toTestSeries)
  }, () => (examSlug ? mockTestSeries.filter((t) => t.examSlug === examSlug) : mockTestSeries))

  return NextResponse.json(tests)
}
