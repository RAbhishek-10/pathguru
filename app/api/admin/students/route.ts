import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole, jsonError } from "@/lib/api-utils"
import bcrypt from "bcryptjs"
import { z } from "zod"

const createStudentSchema = z.object({
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

export async function GET(request: Request) {
  const { error } = await requireRole(["ADMIN"])
  if (error) return error

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("search") || ""
  const status = searchParams.get("status") // ACTIVE, SUSPENDED
  const examTarget = searchParams.get("examTarget")

  const where: Record<string, any> = {
    role: "STUDENT",
  }

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
    ]
  }

  if (status && status !== "all") {
    where.status = status.toUpperCase()
  }

  if (examTarget && examTarget !== "all") {
    where.examTarget = examTarget
  }

  try {
    const students = await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        enrollments: true,
      },
    })

    return NextResponse.json(
      students.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        status: s.status.toLowerCase(),
        examTarget: s.examTarget,
        walletBalance: s.walletBalance,
        referralCode: s.referralCode,
        createdAt: s.createdAt.toISOString(),
        enrollmentsCount: s.enrollments.length,
      }))
    )
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Failed to fetch students", 500)
  }
}

export async function POST(request: Request) {
  const { error } = await requireRole(["ADMIN"])
  if (error) return error

  try {
    const body = await request.json()
    const parsed = createStudentSchema.safeParse(body)
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
        status: "ACTIVE",
      },
    })

    return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 })
  } catch (err) {
    return jsonError("Student creation failed", 500)
  }
}
