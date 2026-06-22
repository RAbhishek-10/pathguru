import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toLiveClass } from "@/lib/content-serializers"
import { withDbFallback } from "@/lib/db-fallback"
import { liveClasses as mockLiveClasses } from "@/lib/mock-data"

export async function GET() {
  const classes = await withDbFallback(async () => {
    const rows = await db.liveClass.findMany({ orderBy: { startTime: "asc" } })
    return rows.map(toLiveClass)
  }, mockLiveClasses)

  return NextResponse.json(classes)
}
