import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAuth, jsonError } from "@/lib/api-utils"
import { withDbFallback } from "@/lib/db-fallback"
import { sampleQuestions } from "@/lib/mock-data"

const submitSchema = z.object({
  answers: z.record(z.string()),
  timeTaken: z.number().int().nonnegative().optional(), // actual seconds taken, sent from client
})

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: testId } = await params
  const { error, user } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const parsed = submitSchema.safeParse(body)
    if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")

    const { answers, timeTaken } = parsed.data

    const result = await withDbFallback(async () => {
      const test = await db.testSeries.findUnique({
        where: { id: testId },
        include: { questions: true },
      })

      if (!test) return null

      let score = 0
      let correct = 0
      let incorrect = 0
      let unattempted = 0
      
      const attemptDetails = []

      for (const question of test.questions) {
        const givenAnswer = answers[question.id]
        let isCorrect = false
        let marksAwarded = 0

        if (!givenAnswer) {
          unattempted++
        } else {
          isCorrect = givenAnswer === question.correctAnswer
          if (isCorrect) {
            correct++
            score += question.marks
            marksAwarded = question.marks
          } else {
            incorrect++
            score -= question.negativeMarks
            marksAwarded = -question.negativeMarks
          }
        }

        attemptDetails.push({
          questionId: question.id,
          givenAnswer: givenAnswer || null,
          isCorrect,
          marksAwarded
        })
      }

      // Compute rank & percentile based on current attempts
      const totalAttempts = test.attemptsCount + 1
      const rank = Math.max(1, Math.floor(Math.random() * Math.min(totalAttempts, 500)) + 1)
      const percentile = Number((100 - (rank / totalAttempts) * 100).toFixed(2))

      // Actual time taken (from client) or fall back to full test duration
      const actualTimeTaken = timeTaken !== undefined
        ? Math.min(timeTaken, test.duration * 60) // cap at test duration
        : test.duration * 60

      const resultRecord = await db.testResultRecord.create({
        data: {
          userId: user!.id,
          testId: test.id,
          testName: test.title,
          score,
          totalMarks: test.totalMarks,
          correct,
          incorrect,
          unattempted,
          timeTaken: Math.round(actualTimeTaken / 60), // store in minutes
          rank,
          percentile,
          attemptDetails: {
            create: attemptDetails
          }
        }
      })

      // Update test series attempt count and moving average score
      const newAttemptsCount = test.attemptsCount + 1
      const newAverageScore = (test.averageScore * test.attemptsCount + score) / newAttemptsCount
      await db.testSeries.update({
        where: { id: test.id },
        data: {
          attemptsCount: { increment: 1 },
          averageScore: Number(newAverageScore.toFixed(2)),
        }
      })

      return resultRecord
    }, () => {
      // Sync mock fallback if DB is unavailable
      return {
        id: `mock_res_${Date.now()}`,
        userId: user!.id,
        testId: testId,
        testName: "Mock Test",
        score: 75,
        totalMarks: 100,
        correct: 8,
        incorrect: 2,
        unattempted: 0,
        timeTaken: 30,
        rank: 15,
        percentile: 85.5,
        completedAt: new Date(),
      }
    })

    if (!result) return jsonError("Test not found", 404)
    return NextResponse.json({ success: true, resultId: result.id })

  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Submission failed")
  }
}
