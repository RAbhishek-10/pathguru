import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toTestSeries, toQuestion } from "@/lib/content-serializers"
import { jsonError } from "@/lib/api-utils"
import { withDbFallback } from "@/lib/db-fallback"
import { testSeries as mockTestSeries, sampleQuestions as mockQuestions } from "@/lib/mock-data"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const result = await withDbFallback(async () => {
    const test = await db.testSeries.findUnique({
      where: { id },
      include: { questions: { orderBy: { sortOrder: "asc" } } },
    })

    if (!test) return null

    return {
      ...toTestSeries(test),
      questions: test.questions.map(toQuestion),
    }
  }, () => {
    const test = mockTestSeries.find((t) => t.id === id)
    if (!test) return null
    return { ...test, questions: mockQuestions }
  })

  if (!result) return jsonError("Test not found", 404)
  return NextResponse.json(result)
}
