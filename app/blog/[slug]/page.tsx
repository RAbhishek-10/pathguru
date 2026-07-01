"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, User, Calendar, Clock, Share2, Heart, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { BlogPost } from "@/lib/types"
import { toast } from "sonner"

// Premium mock articles content mapping
const BLOG_ARTICLES: Record<string, string[]> = {
  "neet-biology-score-340": [
    "To achieve a 340+ in NEET Biology, you need to understand that NCERT is your holy grail. More than 95% of questions are directly or indirectly derived from NCERT lines.",
    "First, create a structured revision map. Focus heavily on high-yield chapters such as Genetics & Evolution, Ecology, Human Physiology, and Plant Physiology. These chapters account for a massive chunk of questions.",
    "Second, practice active recall. Don't just read the chapters passively. Cover the page, explain concepts to yourself, and draw complex diagrams from memory (like the Krebs cycle or DNA replication fork).",
    "Third, attempt weekly topic-wise mock tests. Analyze your mistakes meticulously. Did you make a silly mistake in reading the question options, or was it a conceptual gap? Keep a dedicated 'error logbook' to revise a week before the actual exam."
  ],
  "jee-mains-physics-tips": [
    "Physics in JEE Mains is highly analytical but highly scoring if your foundations are strong. The trend of the past few years shows a mix of formula-based application and visual mechanics problems.",
    "Prioritize Modern Physics, Semiconductors, Current Electricity, and Electrostatics. These chapters offer maximum return on investment (ROI) with relatively straightforward questions.",
    "Always focus on deriving formulas once rather than just memorizing them. Understanding the derivation helps you crack tricky twist questions where direct formulas fail.",
    "Solve previous years' question papers (PYQs) from 2020-2025. JEE Mains often repeats question types with minor numerical adjustments. Master these patterns to save critical time during the exam."
  ]
}

const DEFAULT_ARTICLE = [
  "Preparing for competitive national exams requires a blend of hard work, discipline, and strategic smart work. Having the right tools and guidance makes a world of difference.",
  "First and foremost, establish a routine. Consistency beats intensity every single time. Studying 6 hours daily is significantly better than cramming for 15 hours once a week.",
  "Make sure to take timely breaks. The Pomodoro technique (25 minutes study, 5 minutes break) is highly recommended to sustain high cognitive load without burnout.",
  "Finally, leverage modern tools like AI-driven doubt solving and digital test analytics. Knowing your weak chapters allows you to optimize your prep efficiently."
]

export default function BlogPostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setPost(data)
        fetch("/api/blog")
          .then((r) => r.json())
          .then((list: BlogPost[]) => {
            setRelatedPosts(list.filter((p) => p.slug !== slug).slice(0, 3))
          })
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading article...</div>
  if (!post) return <div className="p-12 text-center text-destructive">Article not found</div>

  const articleContent = BLOG_ARTICLES[post.slug] || DEFAULT_ARTICLE

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Article link copied to clipboard!")
    }
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
      <Link href="/blog" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Articles
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" /> {post.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {post.readTime} read
          </span>
        </div>
      </header>

      {/* Banner */}
      <div className="mb-8 aspect-video w-full rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-8 border border-border">
        <span className="text-sm font-semibold text-muted-foreground">PathGuru Academic Prep Series</span>
      </div>

      {/* Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none text-sm md:text-base leading-relaxed text-muted-foreground space-y-6">
        {articleContent.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>

      {/* Footer Social Actions */}
      <footer className="mt-8 flex items-center justify-between border-y border-border py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className={`gap-1.5 ${liked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"}`} onClick={() => setLiked(!liked)}>
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} /> {liked ? "Liked" : "Like"}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <MessageSquare className="h-4 w-4" /> Comment
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleShare}>
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </footer>

      {/* Related articles */}
      <section className="mt-12">
        <h3 className="mb-6 text-lg font-bold text-foreground">Related Articles</h3>
        <div className="grid gap-6 sm:grid-cols-3">
          {relatedPosts.map((rel) => (
            <Card key={rel.slug} className="overflow-hidden border-border bg-card">
              <div className="h-24 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-3 text-center border-b border-border">
                <span className="text-[10px] font-medium text-muted-foreground">{rel.readTime} read</span>
              </div>
              <CardContent className="p-4">
                <h4 className="text-xs font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
                  <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                </h4>
                <p className="text-[10px] text-muted-foreground mt-2">{rel.date}</p>
              </CardContent>
            </Card>
          ))}
          {relatedPosts.length === 0 && (
            <p className="text-xs text-muted-foreground col-span-full">No other articles available.</p>
          )}
        </div>
      </section>
    </article>
  )
}
