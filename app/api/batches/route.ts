import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toBatch } from "@/lib/serializers"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const examSlug = searchParams.get("examSlug")
  const status = searchParams.get("status")

  const batches = await db.batch.findMany({
    where: {
      ...(examSlug ? { examSlug } : {}),
      ...(status ? { status: status.toUpperCase() as "ACTIVE" | "UPCOMING" | "ARCHIVED" } : {}),
    },
    include: {
      faculty: { include: { faculty: { include: { user: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(batches.map(toBatch))
}
