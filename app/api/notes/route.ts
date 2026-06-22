import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toNote } from "@/lib/content-serializers"
import { withDbFallback } from "@/lib/db-fallback"
import { notes as mockNotes } from "@/lib/mock-data"

export async function GET(request: Request) {
  const examSlug = new URL(request.url).searchParams.get("examSlug")

  const notes = await withDbFallback(async () => {
    const rows = await db.note.findMany({
      where: examSlug ? { examSlug } : undefined,
      orderBy: { title: "asc" },
    })
    return rows.map(toNote)
  }, () => (examSlug ? mockNotes.filter((n) => n.examSlug === examSlug) : mockNotes))

  return NextResponse.json(notes)
}
