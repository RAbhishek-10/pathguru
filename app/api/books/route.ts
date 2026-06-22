import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toBook } from "@/lib/content-serializers"
import { withDbFallback } from "@/lib/db-fallback"
import { books as mockBooks } from "@/lib/mock-data"

export async function GET() {
  const books = await withDbFallback(async () => {
    const rows = await db.book.findMany({ orderBy: { title: "asc" } })
    return rows.map(toBook)
  }, mockBooks)

  return NextResponse.json(books)
}
