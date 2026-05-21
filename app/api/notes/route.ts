import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toNote } from "@/lib/content-serializers"

export async function GET(request: Request) {
  const examSlug = new URL(request.url).searchParams.get("examSlug")

  const notes = await db.note.findMany({
    where: examSlug ? { examSlug } : undefined,
    orderBy: { title: "asc" },
  })

  return NextResponse.json(notes.map(toNote))
}
