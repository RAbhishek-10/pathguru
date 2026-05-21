"use client"

import React, { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react"
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react"
import type { ApiUser } from "@/lib/types"

interface AuthContextType {
  user: ApiUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  isFaculty: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; phone: string; password: string; examTarget?: string }) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<ApiUser>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthContextBridge({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<ApiUser | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const refreshUser = useCallback(async () => {
    if (!session?.user) {
      setUser(null)
      return
    }
    setProfileLoading(true)
    try {
      const res = await fetch("/api/users/me")
      if (res.ok) {
        setUser(await res.json())
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setProfileLoading(false)
    }
  }, [session?.user])

  useEffect(() => {
    if (status === "authenticated") {
      refreshUser()
    } else if (status === "unauthenticated") {
      setUser(null)
    }
  }, [status, refreshUser])

  const isLoading = status === "loading" || profileLoading
  const isAuthenticated = !!session?.user && !!user
  const isAdmin = user?.role === "admin"
  const isFaculty = user?.role === "faculty" || isAdmin

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) throw new Error("Invalid email or password")
  }, [])

  const register = useCallback(
    async (data: { name: string; email: string; phone: string; password: string; examTarget?: string }) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Registration failed")
      }
      await login(data.email, data.password)
    },
    [login]
  )

  const logout = useCallback(() => {
    setUser(null)
    signOut({ redirect: false })
  }, [])

  const updateProfile = useCallback(
    async (data: Partial<ApiUser>) => {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Profile update failed")
      }
      setUser(await res.json())
    },
    []
  )

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isAdmin, isFaculty, isLoading, login, register, logout, updateProfile, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextBridge>{children}</AuthContextBridge>
    </SessionProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
