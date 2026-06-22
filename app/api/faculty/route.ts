import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toFacultyFromProfile } from "@/lib/content-serializers"
import { withDbFallback } from "@/lib/db-fallback"
import { faculty as mockFaculty } from "@/lib/mock-data"

export async function GET() {
  const faculty = await withDbFallback(async () => {
    const rows = await db.facultyProfile.findMany({ include: { user: true } })
    return rows.map(toFacultyFromProfile)
  }, mockFaculty)

  return NextResponse.json(faculty)
}
