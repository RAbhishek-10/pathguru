import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toExamCategory } from "@/lib/content-serializers"

export async function GET() {
  const [categories, batchCounts] = await Promise.all([
    db.examCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    db.batch.groupBy({ by: ["examSlug"], _count: { id: true } }),
  ])

  const countMap = Object.fromEntries(batchCounts.map((b) => [b.examSlug, b._count.id]))

  return NextResponse.json(categories.map((c) => toExamCategory(c, countMap[c.slug] ?? 0)))
}
