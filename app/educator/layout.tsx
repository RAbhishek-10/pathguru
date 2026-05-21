"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/educator" },
  { icon: BookOpen, label: "My Batches", href: "/educator/batches" },
  { icon: Users, label: "Students", href: "/educator/students" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export default function EducatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [sideOpen, setSideOpen] = useState(false)

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs capitalize text-muted-foreground">{user?.role} Portal</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3">
            {sidebarItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`mb-0.5 w-full justify-start gap-3 text-sm ${
                    pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Button>
              </Link>
            ))}
          </nav>
          <div className="border-t border-border p-3">
            <Link href="/educator/batches/new">
              <Button className="mb-2 w-full gap-2 bg-primary text-primary-foreground">
                <Plus className="h-4 w-4" /> New Batch
              </Button>
            </Link>
            <Button variant="ghost" onClick={logout} className="w-full justify-start gap-3 text-sm text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {sideOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setSideOpen(false)} />
          <aside className="relative z-10 h-full w-64 bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="text-sm font-semibold text-foreground">Educator Menu</p>
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

      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSideOpen(true)} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Educator Dashboard</h1>
          </div>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </div>
    </div>
  )
}
