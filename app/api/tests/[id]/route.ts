import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toTestSeries, toQuestion } from "@/lib/content-serializers"
import { requireAuth, jsonError } from "@/lib/api-utils"
import { withDbFallback } from "@/lib/db-fallback"
import { testSeries as mockTestSeries, sampleQuestions as mockQuestions } from "@/lib/mock-data"
import { auth } from "@/lib/auth"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const result = await withDbFallback(async () => {
    const test = await db.testSeries.findUnique({
      where: { id },
      include: { questions: { orderBy: { sortOrder: "asc" } } },
    })

    if (!test) return null

    // Check Paywall Access
    if (!test.isFree) {
      const session = await auth()
      if (!session?.user?.id) return { error: "unauthorized" }
      
      const purchase = await db.purchase.findUnique({
        where: { userId_itemType_itemId: { userId: session.user.id, itemType: "test", itemId: test.id } }
      })
      if (!purchase) return { error: "payment_required" }
    }

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
  if (result.error === "unauthorized") return jsonError("Unauthorized", 401)
  if (result.error === "payment_required") return jsonError("Payment required", 403)
  
  return NextResponse.json(result)
}
