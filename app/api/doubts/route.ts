import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAuth, jsonError } from "@/lib/api-utils"
import { toDoubt } from "@/lib/content-serializers"

const doubtSchema = z.object({
  subject: z.string().min(2),
  topic: z.string().min(2),
  question: z.string().min(10),
})

const AI_RESPONSES: Record<string, string> = {
  Physics: "Based on fundamental principles, this concept relates to conservation laws and field theory. Let me break down the key ideas step by step...",
  Chemistry: "This chemical phenomenon can be explained through molecular interactions and thermodynamic principles...",
  Biology: "From a biological perspective, this involves cellular mechanisms and genetic regulation patterns...",
  default: "Thank you for your question. Our AI has analyzed your query and provided an initial explanation. A faculty member will review if needed.",
}

export async function GET() {
  const { error, user } = await requireAuth()
  if (error) return error

  const doubts = await db.doubt.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(doubts.map(toDoubt))
}

export async function POST(request: Request) {
  const { error, user } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const parsed = doubtSchema.safeParse(body)
  if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")

  const aiResponse = AI_RESPONSES[parsed.data.subject] ?? AI_RESPONSES.default

  const doubt = await db.doubt.create({
    data: {
      userId: user!.id,
      subject: parsed.data.subject,
      topic: parsed.data.topic,
      question: parsed.data.question,
      status: "ai-answered",
      aiResponse,
      aiConfidence: 0.85 + Math.random() * 0.1,
    },
  })

  return NextResponse.json(toDoubt(doubt), { status: 201 })
}
