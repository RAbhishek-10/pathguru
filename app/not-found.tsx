"use client"

import Link from "next/link"
import { Compass, Home, BookOpen, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive animate-bounce">
        <Compass className="h-12 w-12" />
      </div>
      <h1 className="mb-2 text-4xl font-extrabold text-foreground md:text-5xl">404</h1>
      <h2 className="mb-4 text-lg font-bold text-foreground md:text-xl">Lost your study path?</h2>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        The page you are looking for does not exist or has been relocated. Let's redirect you back to your learning space.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/dashboard">
          <Button className="w-full gap-2 bg-primary text-primary-foreground">
            <Home className="h-4 w-4" /> Go to Dashboard
          </Button>
        </Link>
        <Link href="/exam-categories">
          <Button variant="outline" className="w-full gap-2 border-border text-foreground">
            <BookOpen className="h-4 w-4" /> Browse Courses
          </Button>
        </Link>
      </div>
    </div>
  )
}
