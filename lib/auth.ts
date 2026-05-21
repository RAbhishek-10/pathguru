import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import type { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: Role
      avatar?: string | null
    }
  }

  interface User {
    role: Role
    avatar?: string | null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
        if (!user || user.status === "SUSPENDED") return null

        const valid = await bcrypt.compare(password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const t = token as typeof token & { id: string; role: Role; avatar?: string | null }
        t.id = user.id!
        t.role = user.role
        t.avatar = user.avatar
        return t
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as typeof token & { id: string; role: Role; avatar?: string | null }
        session.user.id = t.id
        session.user.role = t.role
        session.user.avatar = t.avatar
      }
      return session
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isLoggedIn = !!auth?.user

      const protectedPaths = ["/dashboard", "/profile", "/settings", "/analytics", "/educator"]
      const needsAuth = protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))

      if (needsAuth && !isLoggedIn) return false

      if (pathname.startsWith("/educator") && isLoggedIn) {
        const role = auth?.user?.role
        if (role !== "FACULTY" && role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", request.nextUrl))
        }
      }

      return true
    },
  },
})
