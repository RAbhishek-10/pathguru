import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toExamCategory } from "@/lib/content-serializers"
import { withDbFallback } from "@/lib/db-fallback"
import { examCategories as mockExamCategories } from "@/lib/mock-data"

export async function GET() {
  const categories = await withDbFallback(async () => {
    const [categories, batchCounts] = await Promise.all([
      db.examCategory.findMany({ orderBy: { sortOrder: "asc" } }),
      db.batch.groupBy({ by: ["examSlug"], _count: { id: true } }),
    ])

    const countMap = Object.fromEntries(batchCounts.map((b) => [b.examSlug, b._count.id]))
    return categories.map((c) => toExamCategory(c, countMap[c.slug] ?? 0))
  }, mockExamCategories)

  return NextResponse.json(categories)
}
