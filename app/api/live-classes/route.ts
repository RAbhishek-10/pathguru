import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toLiveClass } from "@/lib/content-serializers"

export async function GET() {
  const classes = await db.liveClass.findMany({ orderBy: { startTime: "asc" } })
  return NextResponse.json(classes.map(toLiveClass))
}
