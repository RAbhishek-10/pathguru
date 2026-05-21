import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { toFacultyFromProfile } from "@/lib/content-serializers"

export async function GET() {
  const faculty = await db.facultyProfile.findMany({ include: { user: true } })
  return NextResponse.json(faculty.map(toFacultyFromProfile))
}
