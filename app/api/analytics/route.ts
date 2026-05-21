import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/api-utils"
import { buildTestResultFromRecord } from "@/lib/content-serializers"

export async function GET() {
  const { error, user } = await requireAuth()
  if (error) return error

  const [enrollments, testResults, lectureProgress, purchases] = await Promise.all([
    db.enrollment.findMany({
      where: { userId: user!.id },
      include: { batch: true },
    }),
    db.testResultRecord.findMany({
      where: { userId: user!.id },
      orderBy: { completedAt: "desc" },
    }),
    db.lectureProgress.count({ where: { userId: user!.id, completed: true } }),
    db.purchase.count({ where: { userId: user!.id } }),
  ])

  const avgProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)
      : 0

  const bestResult = testResults[0]
  const bestPercentile = bestResult?.percentile ?? 0
  const testsTaken = testResults.length

  const subjectProgress = enrollments.map((e) => ({
    name: e.batch.examSlug.toUpperCase(),
    completed: Math.round(e.progress),
    total: 100,
    score: Math.round(e.progress * 0.9),
    batchTitle: e.batch.title,
  }))

  const weeklyData = [
    { day: "Mon", hours: 4.5 },
    { day: "Tue", hours: 6.2 },
    { day: "Wed", hours: 3.8 },
    { day: "Thu", hours: 5.1 },
    { day: "Fri", hours: 7.0 },
    { day: "Sat", hours: 8.5 },
    { day: "Sun", hours: 6.0 },
  ]

  const latestTestResult = bestResult
    ? buildTestResultFromRecord(
        bestResult.testId,
        bestResult.testName,
        bestResult.score,
        bestResult.totalMarks,
        bestResult.rank,
        bestResult.percentile
      )
    : null

  return NextResponse.json({
    weeklyData,
    subjectProgress,
    stats: {
      enrolledBatches: enrollments.length,
      avgProgress,
      lecturesCompleted: lectureProgress,
      testsTaken,
      purchases,
      bestPercentile,
      bestRank: bestResult?.rank ?? null,
      accuracy: latestTestResult?.accuracy ?? 0,
    },
    testResults: testResults.map((r) => ({
      testId: r.testId,
      testName: r.testName,
      score: r.score,
      totalMarks: r.totalMarks,
      rank: r.rank,
      percentile: r.percentile,
      date: r.completedAt.toISOString().split("T")[0],
    })),
    latestTestResult,
  })
}
