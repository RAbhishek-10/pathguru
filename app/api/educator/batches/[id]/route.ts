import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireRole, jsonError } from "@/lib/api-utils"
import { toBatch, toLecture } from "@/lib/serializers"

const batchUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  price: z.number().min(0).optional(),
  discountedPrice: z.number().min(0).optional(),
  thumbnail: z.string().optional(),
  mode: z.enum(["online", "offline", "hybrid"]).optional(),
  startDate: z.string().optional(),
  status: z.enum(["active", "upcoming", "archived"]).optional(),
  tags: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
})

async function getOwnedBatch(id: string, userId: string, role: string) {
  const batch = await db.batch.findUnique({ where: { id } })
  if (!batch) return { error: jsonError("Batch not found", 404), batch: null }
  if (role !== "ADMIN" && batch.creatorId !== userId) {
    return { error: jsonError("Forbidden", 403), batch: null }
  }
  return { error: null, batch }
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireRole(["FACULTY", "ADMIN"])
  if (error) return error

  const { id } = await params
  const owned = await getOwnedBatch(id, user!.id, user!.role)
  if (owned.error) return owned.error

  const batch = await db.batch.findUnique({
    where: { id },
    include: {
      faculty: { include: { faculty: { include: { user: true } } } },
      lectures: { orderBy: { sortOrder: "asc" } },
      enrollments: {
        include: { user: true },
        orderBy: { enrolledAt: "desc" },
      },
    },
  })

  return NextResponse.json({
    ...toBatch(batch!),
    lectures: batch!.lectures.map((l) => toLecture(l)),
    enrollments: batch!.enrollments.map((e) => ({
      id: e.id,
      progress: e.progress,
      enrolledAt: e.enrolledAt.toISOString(),
      user: { id: e.user.id, name: e.user.name, email: e.user.email, phone: e.user.phone },
    })),
  })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireRole(["FACULTY", "ADMIN"])
  if (error) return error

  const { id } = await params
  const owned = await getOwnedBatch(id, user!.id, user!.role)
  if (owned.error) return owned.error

  const body = await request.json()
  const parsed = batchUpdateSchema.safeParse(body)
  if (!parsed.success) return jsonError(parsed.error.errors[0]?.message ?? "Invalid input")

  const data = parsed.data
  const updated = await db.batch.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.discountedPrice !== undefined && { discountedPrice: data.discountedPrice }),
      ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
      ...(data.mode !== undefined && { mode: data.mode.toUpperCase() as "ONLINE" | "OFFLINE" | "HYBRID" }),
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.status !== undefined && { status: data.status.toUpperCase() as "ACTIVE" | "UPCOMING" | "ARCHIVED" }),
      ...(data.tags !== undefined && { tags: JSON.stringify(data.tags) }),
      ...(data.features !== undefined && { features: JSON.stringify(data.features) }),
    },
    include: { faculty: { include: { faculty: { include: { user: true } } } } },
  })

  return NextResponse.json(toBatch(updated))
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireRole(["FACULTY", "ADMIN"])
  if (error) return error

  const { id } = await params
  const owned = await getOwnedBatch(id, user!.id, user!.role)
  if (owned.error) return owned.error

  await db.batch.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
