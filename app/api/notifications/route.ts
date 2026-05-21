import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, jsonError } from "@/lib/api-utils"
import { toNotification } from "@/lib/content-serializers"

export async function GET() {
  const { error, user } = await requireAuth()
  if (error) return error

  const notifications = await db.notification.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(notifications.map(toNotification))
}

export async function PATCH(request: Request) {
  const { error, user } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const { id, readAll } = body as { id?: string; readAll?: boolean }

  if (readAll) {
    await db.notification.updateMany({
      where: { userId: user!.id },
      data: { read: true },
    })
    return NextResponse.json({ success: true })
  }

  if (!id) return jsonError("Notification id required")

  const notification = await db.notification.update({
    where: { id, userId: user!.id },
    data: { read: true },
  })

  return NextResponse.json(toNotification(notification))
}
