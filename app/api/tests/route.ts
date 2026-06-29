import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toTestSeries } from "@/lib/content-serializers"
import { withDbFallback } from "@/lib/db-fallback"
import { testSeries as mockTestSeries } from "@/lib/mock-data"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const examSlug = url.searchParams.get("examSlug") || undefined
  const isFreeParam = url.searchParams.get("isFree")
  const mode = url.searchParams.get("mode") || undefined

  // Build Prisma where clause from query params
  const where: Record<string, any> = {}
  if (examSlug) where.examSlug = examSlug
  if (isFreeParam === "true") where.isFree = true
  if (isFreeParam === "false") where.isFree = false
  if (mode) where.mode = mode

  const tests = await withDbFallback(async () => {
    const rows = await db.testSeries.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [{ isFree: "desc" }, { title: "asc" }],
    })

    // Fetch purchase records for current user (if logged in) in one query
    const session = await auth()
    let userPurchases = new Set<string>()
    if (session?.user?.id) {
      const purchases = await db.purchase.findMany({
        where: { userId: session.user.id, itemType: "test" },
        select: { itemId: true },
      })
      purchases.forEach((p) => userPurchases.add(p.itemId))
    }

    return rows.map((r) => ({
      ...toTestSeries(r),
      isPurchased: userPurchases.has(r.id),
    }))
  }, () => {
    let mock = mockTestSeries
    if (examSlug) mock = mock.filter((t) => t.examSlug === examSlug)
    if (isFreeParam === "true") mock = mock.filter((t) => t.isFree)
    if (isFreeParam === "false") mock = mock.filter((t) => !t.isFree)
    if (mode) mock = mock.filter((t) => t.mode === mode)
    return mock.map((t) => ({ ...t, isPurchased: t.isFree }))
  })

  return NextResponse.json(tests)
}
