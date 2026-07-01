"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search, ShoppingCart, ChevronDown, BookOpen, LogOut, BarChart3, HelpCircle, Settings, Bell, LayoutDashboard, Users, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import BrandLogo from "@/components/brand/BrandLogo"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import type { ExamCategory } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

const navLinks = [
  { href: "/exam-categories", label: "All Courses" },
  { href: "/test-series", label: "Test Series" },
  { href: "/notes", label: "Notes" },
  { href: "/books-store", label: "Books" },
  { href: "/live", label: "Live Classes" },
  { href: "/scholarship", label: "Scholarship" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const { count } = useCart()
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { data: examCategories } = useFetch<ExamCategory[]>("/api/exams", [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  const isTestPage = pathname?.startsWith("/test/")
  if (isTestPage) return null

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/")

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/90 shadow-[0_1px_12px_rgba(10,77,191,0.06)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:bg-card/90">
      <nav className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-4 lg:px-6">
        <BrandLogo size="md" href="/" className="shrink-0" />

        {/* Desktop nav links */}
        <div className="hidden items-center gap-0.5 lg:flex">
          <div className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
            <Button
              variant="ghost"
              className={cn("gap-1 rounded-xl text-sm font-medium", isActive("/exam-categories") || pathname?.startsWith("/exam/") ? "pg-nav-active" : "text-muted-foreground hover:text-foreground")}
              asChild
            >
              <Link href="/exam-categories">
                All Courses <ChevronDown className="h-3.5 w-3.5" />
              </Link>
            </Button>
            {megaOpen && examCategories.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-1 w-[600px] animate-fade-in rounded-2xl border border-border/60 bg-card p-6 shadow-[0_8px_40px_rgba(10,77,191,0.12)]">
                <div className="grid grid-cols-2 gap-2">
                  {examCategories.map((cat) => (
                    <Link key={cat.slug} href={`/exam/${cat.slug}`} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#EEF5FF]" onClick={() => setMegaOpen(false)}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cat.color} text-white shadow-sm`}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">{cat.batchCount} batches</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          {navLinks.slice(1).map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className={cn("rounded-xl text-sm font-medium", isActive(link.href) ? "pg-nav-active" : "text-muted-foreground hover:text-foreground")}
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          <Link href="/exam-categories">
            <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </Link>

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Button>
            {count > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF7A1A] p-0 text-[10px] text-white">
                {count}
              </Badge>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/notifications" className="hidden md:block">
                <Button variant="ghost" size="icon" className="relative rounded-xl text-muted-foreground hover:text-foreground">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF7A1A]" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden gap-2 rounded-xl md:flex">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full pg-gradient-primary text-sm font-semibold text-white">
                      {user?.name?.charAt(0)}
                    </div>
                    <span className="max-w-[100px] truncate text-sm font-medium text-foreground">{user?.name?.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/dashboard" className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link></DropdownMenuItem>
                  {(user?.role === "faculty" || user?.role === "admin") && (
                    <DropdownMenuItem asChild><Link href="/educator" className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Educator Portal</Link></DropdownMenuItem>
                  )}
                  {user?.role === "admin" && (
                    <DropdownMenuItem asChild><Link href="/admin/students" className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Admin Portal</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild><Link href="/analytics" className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Analytics</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/doubts" className="flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Doubts</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/settings" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Settings</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive"><LogOut className="h-4 w-4" /> Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button size="sm" className="hidden md:inline-flex" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl lg:hidden">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 border-border/60 bg-card p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-[4.25rem] items-center border-b border-border/60 px-6">
                <BrandLogo size="sm" href="/" className="shrink-0" />
              </div>
              <div className="flex flex-col gap-1 p-4">
                {isAuthenticated && (
                  <div className="mb-4 flex items-center gap-3 rounded-xl bg-[#EEF5FF] p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full pg-gradient-primary text-sm font-bold text-white">{user?.name?.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                )}
                {navLinks.map((link) => (
                  <Button key={link.href} variant="ghost" asChild className={cn("w-full justify-start rounded-xl text-sm font-medium", isActive(link.href) ? "bg-[#EEF5FF] text-primary" : "text-muted-foreground")}>
                    <Link href={link.href} onClick={() => setMobileOpen(false)}>{link.label}</Link>
                  </Button>
                ))}
                <div className="my-2 h-px bg-border" />
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2 rounded-xl text-sm"><LayoutDashboard className="h-4 w-4" /> Dashboard</Button></Link>
                    {(user?.role === "faculty" || user?.role === "admin") && (
                      <Link href="/educator" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2 rounded-xl text-sm"><BookOpen className="h-4 w-4" /> Educator Portal</Button></Link>
                    )}
                    {user?.role === "admin" && (
                      <Link href="/admin/students" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2 rounded-xl text-sm"><Users className="h-4 w-4 text-primary" /> Admin Portal</Button></Link>
                    )}
                    <Link href="/analytics" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2 rounded-xl text-sm"><BarChart3 className="h-4 w-4" /> Analytics</Button></Link>
                    <Link href="/doubts" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2 rounded-xl text-sm"><HelpCircle className="h-4 w-4" /> Doubts</Button></Link>
                    <Button variant="ghost" onClick={() => { logout(); setMobileOpen(false) }} className="w-full justify-start gap-2 rounded-xl text-sm text-destructive"><LogOut className="h-4 w-4" /> Logout</Button>
                  </>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>Login / Register</Link>
                  </Button>
                )}
                {mounted && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark")
                      setMobileOpen(false)
                    }}
                    className="w-full justify-start gap-2 rounded-xl text-sm text-muted-foreground"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
                    <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
