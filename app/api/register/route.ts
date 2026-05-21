import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { jsonError } from "@/lib/api-utils"

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(8),
  examTarget: z.string().optional(),
})

function generateReferralCode(name: string) {
  const base = name.replace(/\s+/g, "").slice(0, 6).toUpperCase()
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${base}${suffix}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")
    }

    const { name, email, phone, password, examTarget } = parsed.data
    const normalizedEmail = email.toLowerCase()

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) return jsonError("Email already registered", 409)

    const passwordHash = await bcrypt.hash(password, 12)
    let referralCode = generateReferralCode(name)
    while (await db.user.findUnique({ where: { referralCode } })) {
      referralCode = generateReferralCode(name)
    }

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        passwordHash,
        examTarget,
        role: "STUDENT",
        referralCode,
      },
    })

    return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 })
  } catch {
    return jsonError("Registration failed", 500)
  }
}
