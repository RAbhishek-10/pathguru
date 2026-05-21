"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, ClipboardList, BarChart3, HelpCircle, Award, Wallet, User, Settings, LogOut, Menu, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: BookOpen, label: "My Batches", href: "/dashboard" },
  { icon: ClipboardList, label: "Tests", href: "/test-series" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: HelpCircle, label: "Doubts", href: "/doubts" },
  { icon: Award, label: "Certificates", href: "/certificates" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [sideOpen, setSideOpen] = useState(false)

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{user?.name?.charAt(0)}</div>
              <div>
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3">
            {sidebarItems.map((item) => (
              <Link key={item.href + item.label} href={item.href}>
                <Button variant="ghost" className={`mb-0.5 w-full justify-start gap-3 text-sm ${pathname === item.href && item.label === "Overview" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
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

      {/* Mobile sidebar */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setSideOpen(false)} />
          <aside className="relative z-10 h-full w-64 bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="text-sm font-semibold text-foreground">Menu</p>
              <Button variant="ghost" size="icon" onClick={() => setSideOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <nav className="p-3">
              {sidebarItems.map((item) => (
                <Link key={item.href + item.label} href={item.href} onClick={() => setSideOpen(false)}>
                  <Button variant="ghost" className="mb-0.5 w-full justify-start gap-3 text-sm text-muted-foreground hover:text-foreground">
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSideOpen(true)} className="lg:hidden"><Menu className="h-5 w-5" /></Button>
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </div>
    </div>
  )
}
