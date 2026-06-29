import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, jsonError } from "@/lib/api-utils"
import { buildTestResultFromRecord } from "@/lib/content-serializers"
import { withDbFallback } from "@/lib/db-fallback"
import { sampleTestResult } from "@/lib/mock-data"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error, user } = await requireAuth()
  if (error) return error

  const result = await withDbFallback(async () => {
    const record = await db.testResultRecord.findUnique({
      where: { id },
      include: {
        attemptDetails: {
          include: {
            question: {
              select: {
                id: true,
                section: true,
                marks: true,
                negativeMarks: true,
                stem: true,
                type: true,
                options: true,
                correctAnswer: true,
                explanation: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    })

    if (!record || record.userId !== user!.id) return null

    // Pass real attempt details to build accurate per-section analytics
    const formatted = buildTestResultFromRecord(
      record.testId,
      record.testName,
      record.score,
      record.totalMarks,
      record.rank,
      record.percentile,
      record.attemptDetails, // real data — no more hardcoded sections
      record.timeTaken,      // real time taken
    )

    return { record, formatted }
  }, () => null as any)  // sync fallback: null triggers the 404 handler below

  if (!result) return jsonError("Result not found", 404)
  return NextResponse.json(result)
}
