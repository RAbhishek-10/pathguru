import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toBook } from "@/lib/content-serializers"

export async function GET() {
  const books = await db.book.findMany({ orderBy: { title: "asc" } })
  return NextResponse.json(books.map(toBook))
}
