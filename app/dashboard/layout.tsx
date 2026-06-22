"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, ClipboardList, BarChart3, HelpCircle, Award, Wallet, User, Settings, LogOut, Menu, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import BrandLogo from "@/components/brand/BrandLogo"
import { cn } from "@/lib/utils"

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

  const isActive = (item: (typeof sidebarItems)[0]) =>
    pathname === item.href && (item.label === "Overview" ? pathname === "/dashboard" : true)

  return (
    <div className="flex min-h-[calc(100vh-4.25rem)] bg-[#F8FAFC]">
      <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-border/60 p-5">
            <BrandLogo size="sm" href={undefined} className="mb-4" />
            <div className="flex items-center gap-3 rounded-xl bg-[#EEF5FF] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full pg-gradient-primary text-sm font-bold text-white">{user?.name?.charAt(0)}</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 p-3">
            {sidebarItems.map((item) => (
              <Button
                key={item.href + item.label}
                variant="ghost"
                asChild
                className={cn(
                  "mb-0.5 w-full justify-start gap-3 rounded-xl text-sm font-medium",
                  isActive(item) ? "bg-[#EEF5FF] text-[#0A4DBF]" : "text-muted-foreground hover:bg-[#EEF5FF]/60 hover:text-foreground"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="border-t border-border/60 p-3">
            <Button variant="ghost" onClick={logout} className="w-full justify-start gap-3 rounded-xl text-sm text-destructive hover:bg-destructive/5 hover:text-destructive">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {sideOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#072A63]/40 backdrop-blur-sm" onClick={() => setSideOpen(false)} />
          <aside className="relative z-10 h-full w-72 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 p-4">
              <BrandLogo size="sm" href={undefined} />
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSideOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <nav className="space-y-0.5 p-3">
              {sidebarItems.map((item) => (
                <Button key={item.href + item.label} variant="ghost" asChild className="mb-0.5 w-full justify-start gap-3 rounded-xl text-sm" onClick={() => setSideOpen(false)}>
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Link>
                </Button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-border/60 bg-white px-4 py-3.5 shadow-sm lg:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSideOpen(true)} className="rounded-xl lg:hidden"><Menu className="h-5 w-5" /></Button>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Dashboard</h1>
          </div>
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative rounded-xl text-muted-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF7A1A]" />
            </Button>
          </Link>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </div>
    </div>
  )
}
