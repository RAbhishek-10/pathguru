import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toNote } from "@/lib/content-serializers"
import { withDbFallback } from "@/lib/db-fallback"
import { notes as mockNotes } from "@/lib/mock-data"
import { jsonError } from "@/lib/api-utils"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const note = await withDbFallback(async () => {
    const row = await db.note.findUnique({
      where: { id },
    })
    return row ? toNote(row) : null
  }, () => {
    return mockNotes.find((n) => n.id === id) ?? null
  })

  if (!note) return jsonError("Note not found", 404)
  return NextResponse.json(note)
}
