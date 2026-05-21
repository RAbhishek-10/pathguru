import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toTestSeries, toQuestion } from "@/lib/content-serializers"
import { jsonError } from "@/lib/api-utils"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const test = await db.testSeries.findUnique({
    where: { id },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  })

  if (!test) return jsonError("Test not found", 404)

  return NextResponse.json({
    ...toTestSeries(test),
    questions: test.questions.map(toQuestion),
  })
}
