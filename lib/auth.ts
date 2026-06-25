import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
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

function generateReferralCode(name: string) {
  const base = name.replace(/\s+/g, "").slice(0, 6).toUpperCase()
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${base}${suffix}`
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

        // Google-only accounts have no passwordHash
        if (!user.passwordHash) return null

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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Only run DB upsert for Google OAuth sign-ins
      if (account?.provider === "google") {
        if (!user.email) return false
        const email = user.email.toLowerCase()

        const existing = await db.user.findUnique({ where: { email } })

        if (existing) {
          // Link Google account to existing user if not already linked
          if (!existing.googleId) {
            await db.user.update({
              where: { id: existing.id },
              data: {
                googleId: account.providerAccountId,
                avatar: existing.avatar ?? user.image ?? null,
              },
            })
          }
          // Populate next-auth user with DB values
          user.id = existing.id
          user.role = existing.role
          user.avatar = existing.avatar ?? user.image ?? null
        } else {
          // Create a brand-new user for first-time Google sign-in
          let referralCode = generateReferralCode(user.name ?? email)
          while (await db.user.findUnique({ where: { referralCode } })) {
            referralCode = generateReferralCode(user.name ?? email)
          }

          const created = await db.user.create({
            data: {
              name: user.name ?? email.split("@")[0],
              email,
              googleId: account.providerAccountId,
              avatar: user.image ?? null,
              role: "STUDENT",
              referralCode,
            },
          })

          user.id = created.id
          user.role = created.role
          user.avatar = created.avatar
        }
      }
      return true
    },

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
