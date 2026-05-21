import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { jsonError } from "@/lib/api-utils"

const scholarshipSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  email: z.string().email(),
  exam: z.string().min(2).max(50),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = scholarshipSchema.safeParse(body)
  if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")

  const registration = await db.scholarshipRegistration.create({
    data: {
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
    },
  })

  return NextResponse.json({ id: registration.id }, { status: 201 })
}
