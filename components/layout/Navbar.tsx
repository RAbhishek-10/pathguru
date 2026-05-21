"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Search, ShoppingCart, ChevronDown, BookOpen, GraduationCap, LogOut, BarChart3, HelpCircle, Settings, Bell, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import type { ExamCategory } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"

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
  const { data: examCategories } = useFetch<ExamCategory[]>("/api/exams", [])

  const isTestPage = pathname?.startsWith("/test/")
  if (isTestPage) return null

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            True<span className="text-primary">Educator</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 lg:flex">
          <div className="relative" onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
            <Button variant="ghost" className="gap-1 text-sm font-medium text-foreground/80 hover:text-foreground">
              All Courses <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            {megaOpen && (
              <div className="absolute left-0 top-full z-50 w-[600px] rounded-xl border border-border bg-card p-6 shadow-xl">
                <div className="grid grid-cols-2 gap-3">
                  {examCategories.map((cat) => (
                    <Link key={cat.slug} href={`/exam/${cat.slug}`} className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted" onClick={() => setMegaOpen(false)}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cat.color} text-white`}>
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
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" className={`text-sm font-medium ${pathname === link.href ? "text-primary" : "text-foreground/80 hover:text-foreground"}`}>
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <Link href="/exam-categories">
            <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </Link>

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Button>
            {count > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
                {count}
              </Badge>
            )}
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/notifications" className="hidden md:block">
                <Button variant="ghost" size="icon" className="relative text-foreground/70 hover:text-foreground">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden gap-2 md:flex">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {user?.name?.charAt(0)}
                    </div>
                    <span className="max-w-[100px] truncate text-sm font-medium text-foreground">{user?.name?.split(" ")[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/dashboard" className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link></DropdownMenuItem>
                  {(user?.role === "faculty" || user?.role === "admin") && (
                    <DropdownMenuItem asChild><Link href="/educator" className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Educator Portal</Link></DropdownMenuItem>
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
            <Link href="/login">
              <Button size="sm" className="hidden bg-primary text-primary-foreground hover:bg-primary/90 md:inline-flex">Login</Button>
            </Link>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-card p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-16 items-center border-b border-border px-6">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <GraduationCap className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold text-foreground">True<span className="text-primary">Educator</span></span>
                </Link>
              </div>
              <div className="flex flex-col gap-1 p-4">
                {isAuthenticated && (
                  <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{user?.name?.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                )}
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-sm font-medium text-foreground/80">{link.label}</Button>
                  </Link>
                ))}
                <div className="my-2 h-px bg-border" />
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2 text-sm"><LayoutDashboard className="h-4 w-4" /> Dashboard</Button></Link>
                    <Link href="/analytics" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2 text-sm"><BarChart3 className="h-4 w-4" /> Analytics</Button></Link>
                    <Link href="/doubts" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2 text-sm"><HelpCircle className="h-4 w-4" /> Doubts</Button></Link>
                    <Button variant="ghost" onClick={() => { logout(); setMobileOpen(false) }} className="w-full justify-start gap-2 text-sm text-destructive"><LogOut className="h-4 w-4" /> Logout</Button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}><Button className="w-full bg-primary text-primary-foreground">Login / Register</Button></Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
