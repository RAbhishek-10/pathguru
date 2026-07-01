"use client"

import Link from "next/link"
import { User, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BlogPost } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"

export default function BlogPage() {
  const { data: blogPosts, loading } = useFetch<BlogPost[]>("/api/blog", [])

  if (loading) return <p className="p-12 text-center text-muted-foreground">Loading...</p>

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Blog & Articles</h1>
        <p className="text-muted-foreground">Expert tips, strategies, and updates for exam preparation</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
            <Card className="group overflow-hidden border-border bg-card transition-shadow hover:shadow-md h-full">
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                <Badge variant="secondary" className="text-xs">{post.readTime} read</Badge>
              </div>
              <CardContent className="p-5">
                <p className="mb-2 text-xs text-muted-foreground">{post.date}</p>
                <h2 className="mb-2 line-clamp-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                <footer className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" /> {post.author}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary">
                    Read more <ArrowRight className="h-3 w-3" />
                  </span>
                </footer>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  )
}
