import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/api-utils"

export async function GET() {
  const { error, user } = await requireRole(["FACULTY", "ADMIN"])
  if (error) return error

  const where = user!.role === "ADMIN" ? {} : { creatorId: user!.id }

  const [batchCount, enrollmentCount, studentCount] = await Promise.all([
    db.batch.count({ where }),
    db.enrollment.count({
      where: user!.role === "ADMIN" ? {} : { batch: { creatorId: user!.id } },
    }),
    db.enrollment.groupBy({
      by: ["userId"],
      where: user!.role === "ADMIN" ? {} : { batch: { creatorId: user!.id } },
    }).then((g) => g.length),
  ])

  const recentEnrollments = await db.enrollment.findMany({
    where: user!.role === "ADMIN" ? {} : { batch: { creatorId: user!.id } },
    include: { user: true, batch: true },
    orderBy: { enrolledAt: "desc" },
    take: 5,
  })

  return NextResponse.json({
    batchCount,
    enrollmentCount,
    studentCount,
    recentEnrollments: recentEnrollments.map((e) => ({
      userName: e.user.name,
      batchTitle: e.batch.title,
      enrolledAt: e.enrolledAt.toISOString(),
      progress: e.progress,
    })),
  })
}
