import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/api-utils"

export async function GET() {
  const { error, user } = await requireRole(["FACULTY", "ADMIN"])
  if (error) return error

  const batchFilter = user!.role === "ADMIN" ? {} : { batch: { creatorId: user!.id } }

  const enrollments = await db.enrollment.findMany({
    where: batchFilter,
    include: {
      user: true,
      batch: true,
    },
    orderBy: { enrolledAt: "desc" },
  })

  return NextResponse.json(
    enrollments.map((e) => ({
      id: e.id,
      progress: e.progress,
      enrolledAt: e.enrolledAt.toISOString(),
      user: {
        id: e.user.id,
        name: e.user.name,
        email: e.user.email,
        phone: e.user.phone,
        status: e.user.status.toLowerCase(),
      },
      batch: { id: e.batch.id, title: e.batch.title, examSlug: e.batch.examSlug },
    }))
  )
}
