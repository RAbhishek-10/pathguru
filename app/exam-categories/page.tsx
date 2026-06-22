"use client"

import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ExamCategory } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"

export default function ExamCategoriesPage() {
  const { data: examCategories, loading } = useFetch<ExamCategory[]>("/api/exams", [])
  const iconColors = [
    "from-emerald-500 to-emerald-600",
    "from-blue-500 to-blue-600",
    "from-orange-500 to-orange-600",
    "from-amber-500 to-amber-600",
    "from-teal-500 to-teal-600",
    "from-red-500 to-red-600",
    "from-indigo-500 to-indigo-600",
    "from-cyan-500 to-cyan-600",
  ]

  if (loading) {
    return <p className="p-12 text-center text-muted-foreground">Loading...</p>
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-foreground">All Exam Categories</h1>
        <p className="text-muted-foreground">Choose your target exam and start your preparation journey with PathGuru</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {examCategories.map((cat, i) => (
          <Link key={cat.slug} href={`/exam/${cat.slug}`}>
            <Card className="pg-card group h-full cursor-pointer border-border/60 bg-card py-0">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div
                  className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${iconColors[i % iconColors.length]} text-white shadow-sm`}
                >
                  <BookOpen className="h-7 w-7" />
                </div>
                <h2 className="mb-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  {cat.name}
                </h2>
                <p className="mb-3 text-sm text-muted-foreground">{cat.description}</p>
                <p className="text-xs font-medium text-primary">{cat.batchCount} Batches Available</p>
                <Button variant="ghost" size="sm" className="mt-3 gap-1 text-primary">
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
