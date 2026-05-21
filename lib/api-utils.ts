import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { Role } from "@prisma/client"

export async function getSessionUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getSessionUser()
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null }
  }
  return { error: null, user }
}

export async function requireRole(roles: Role[]) {
  const { error, user } = await requireAuth()
  if (error || !user) return { error: error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null }
  if (!roles.includes(user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null }
  }
  return { error: null, user }
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export { parseJsonArray } from "@/lib/json"
