import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { requireAuth, jsonError } from "@/lib/api-utils"
import { toApiUser } from "@/lib/serializers"
import { z } from "zod"

export async function GET() {
  const { error, user } = await requireAuth()
  if (error) return error

  const dbUser = await db.user.findUnique({
    where: { id: user!.id },
    include: {
      enrollments: { include: { batch: true } },
      testResults: { orderBy: { completedAt: "desc" } },
      purchases: true,
    },
  })

  if (!dbUser) return jsonError("User not found", 404)

  return NextResponse.json(toApiUser(dbUser, dbUser.enrollments, dbUser.testResults, dbUser.purchases))
}

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  examTarget: z.string().min(2).max(50).optional(),
  avatar: z.string().url().optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).optional(),
}).refine((data) => !data.newPassword || !!data.currentPassword, {
  message: "Current password is required",
  path: ["currentPassword"],
})

export async function PATCH(request: Request) {
  const { error, user } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")

  const { currentPassword, newPassword, ...profileData } = parsed.data
  const data: typeof profileData & { passwordHash?: string } = { ...profileData }

  if (newPassword) {
    const existing = await db.user.findUnique({ where: { id: user!.id } })
    if (!existing) return jsonError("User not found", 404)

    const valid = await bcrypt.compare(currentPassword!, existing.passwordHash)
    if (!valid) return jsonError("Current password is incorrect", 400)

    data.passwordHash = await bcrypt.hash(newPassword, 12)
  }

  const updated = await db.user.update({
    where: { id: user!.id },
    data,
    include: {
      enrollments: { include: { batch: true } },
      testResults: { orderBy: { completedAt: "desc" } },
      purchases: true,
    },
  })

  return NextResponse.json(toApiUser(updated, updated.enrollments, updated.testResults, updated.purchases))
}
