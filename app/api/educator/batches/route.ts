import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireRole, jsonError } from "@/lib/api-utils"
import { toBatch } from "@/lib/serializers"

const batchSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  examSlug: z.string().min(2),
  description: z.string().min(10),
  price: z.number().min(0),
  discountedPrice: z.number().min(0),
  thumbnail: z.string().optional(),
  mode: z.enum(["online", "offline", "hybrid"]).default("online"),
  startDate: z.string(),
  status: z.enum(["active", "upcoming", "archived"]).default("active"),
  tags: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
})

export async function GET() {
  const { error, user } = await requireRole(["FACULTY", "ADMIN"])
  if (error) return error

  const where = user!.role === "ADMIN" ? {} : { creatorId: user!.id }

  const batches = await db.batch.findMany({
    where,
    include: { faculty: { include: { faculty: { include: { user: true } } } } },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(batches.map(toBatch))
}

export async function POST(request: Request) {
  const { error, user } = await requireRole(["FACULTY", "ADMIN"])
  if (error) return error

  const body = await request.json()
  const parsed = batchSchema.safeParse(body)
  if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")

  const data = parsed.data
  const existing = await db.batch.findUnique({ where: { slug: data.slug } })
  if (existing) return jsonError("Slug already exists", 409)

  const batch = await db.batch.create({
    data: {
      title: data.title,
      slug: data.slug,
      examSlug: data.examSlug,
      description: data.description,
      price: data.price,
      discountedPrice: data.discountedPrice,
      thumbnail: data.thumbnail ?? "/placeholder.svg?height=400&width=600",
      mode: data.mode.toUpperCase() as "ONLINE" | "OFFLINE" | "HYBRID",
      startDate: new Date(data.startDate),
      status: data.status.toUpperCase() as "ACTIVE" | "UPCOMING" | "ARCHIVED",
      tags: JSON.stringify(data.tags),
      features: JSON.stringify(data.features),
      creatorId: user!.id,
    },
    include: { faculty: { include: { faculty: { include: { user: true } } } } },
  })

  const facultyProfile = await db.facultyProfile.findUnique({ where: { userId: user!.id } })
  if (facultyProfile) {
    await db.batchFaculty.create({
      data: { batchId: batch.id, facultyId: facultyProfile.id },
    })
  }

  const full = await db.batch.findUnique({
    where: { id: batch.id },
    include: { faculty: { include: { faculty: { include: { user: true } } } } },
  })

  return NextResponse.json(toBatch(full!), { status: 201 })
}
