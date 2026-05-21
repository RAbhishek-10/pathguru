import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toTestSeries } from "@/lib/content-serializers"

export async function GET(request: Request) {
  const examSlug = new URL(request.url).searchParams.get("examSlug")

  const tests = await db.testSeries.findMany({
    where: examSlug ? { examSlug } : undefined,
    orderBy: { title: "asc" },
  })

  return NextResponse.json(tests.map(toTestSeries))
}
