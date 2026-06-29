"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Wallet,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

const sidebarItems = [
  { icon: Users, label: "Student Management", href: "/admin/students" },
  { icon: Settings, label: "App Settings", href: "/settings" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout, isLoading, isAuthenticated } = useAuth()
  const [sideOpen, setSideOpen] = useState(false)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-muted-foreground animate-pulse">Loading Admin Portal...</p>
      </div>
    )
  }

  // Security Check: Guarding pages
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex min-h-[calc(100vh-4.25rem)] flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
        <div className="max-w-md space-y-4 rounded-2xl border border-border/80 bg-white p-8 shadow-sm">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground">
            You do not have administrative privileges to access this area.
          </p>
          <Link href="/dashboard" className="block">
            <Button className="w-full bg-primary text-primary-foreground">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4.25rem)] bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-border/60 p-5">
            <div className="flex items-center gap-3 rounded-xl bg-purple-50 p-3 text-purple-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs uppercase font-bold text-purple-600">Administrator</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3">
            {sidebarItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`mb-0.5 w-full justify-start gap-3 rounded-xl text-sm ${
                    pathname === item.href || pathname?.startsWith(item.href + "/")
                      ? "bg-purple-50 text-purple-700"
                      : "text-muted-foreground hover:bg-purple-50/50 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Button>
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-3">
            <Button variant="ghost" onClick={logout} className="w-full justify-start gap-3 text-sm text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setSideOpen(false)} />
          <aside className="relative z-10 h-full w-64 bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="text-sm font-semibold text-foreground">Admin Menu</p>
              <Button variant="ghost" size="icon" onClick={() => setSideOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <nav className="p-3">
              {sidebarItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setSideOpen(false)}>
                  <Button variant="ghost" className="mb-0.5 w-full justify-start gap-3 text-sm text-muted-foreground hover:text-foreground">
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-border/60 bg-white px-4 py-3.5 shadow-sm lg:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSideOpen(true)} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
          </div>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </div>
    </div>
  )
}
