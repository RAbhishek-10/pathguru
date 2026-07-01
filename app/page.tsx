"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Star, Users, MapPin, Award, Clock, Brain, ChevronLeft, ChevronRight, Play, Download, Phone, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import ContentCard from "@/components/shared/ContentCard"
import type { Batch, ExamCategory, Faculty, Topper, Testimonial, BlogPost, LiveClass } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"

interface HomeData {
  examCategories: ExamCategory[]
  batches: Batch[]
  faculty: Faculty[]
  toppers: Topper[]
  testimonials: Testimonial[]
  blogPosts: BlogPost[]
  liveClasses: LiveClass[]
}

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden pg-gradient-hero">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#1E88FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-[#FF7A1A]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[#0A4DBF]/5 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 text-center lg:py-28 lg:px-6">
        <Badge variant="secondary" className="animate-fade-in gap-1.5 rounded-full border border-[#0A4DBF]/20 bg-white dark:bg-card px-4 py-1.5 text-[#0A4DBF] dark:text-primary shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-[#FF7A1A]" /> The Future of Learning
        </Badge>
        <h1 className="animate-fade-in-up max-w-4xl text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Your <span className="pg-text-gradient">Learning Path</span> to Academic Excellence
        </h1>
        <p className="animate-fade-in-up max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg" style={{ animationDelay: "0.1s" }}>
          Live classes, comprehensive test series, AI-powered doubt resolution, and expert faculty for NEET, JEE, GATE, UPSC & more. Join 50,000+ successful students on PathGuru.
        </p>
        <div className="animate-fade-in-up flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "0.2s" }}>
          <Button size="lg" className="gap-2" asChild>
            <Link href="/exam-categories">
              Explore Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="cta" className="gap-2" asChild>
            <Link href="/scholarship">
              Free Scholarship Test
            </Link>
          </Button>
        </div>
        <div className="animate-fade-in-up mt-6 grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4" style={{ animationDelay: "0.3s" }}>
          {[
            { value: "50,000+", label: "Students", color: "text-[#0A4DBF]" },
            { value: "500+", label: "Live Classes", color: "text-[#1E88FF]" },
            { value: "15+", label: "Centres", color: "text-[#0A4DBF]" },
            { value: "95%", label: "Satisfaction", color: "text-[#FF7A1A]" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border/50 bg-white/80 dark:bg-card/80 px-4 py-4 shadow-sm backdrop-blur-sm">
              <p className={`text-xl font-extrabold md:text-2xl ${stat.color}`}>{stat.value}</p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Announcement Ticker ─── */
function AnnouncementTicker() {
  return (
    <div className="overflow-hidden border-y border-[#0A4DBF]/10 dark:border-border bg-[#EEF5FF] dark:bg-muted/50">
      <div className="animate-marquee flex whitespace-nowrap py-3">
        {[
          "NEET 2026 Arjuna Batch Now Open - Limited Seats!",
          "JEE Advanced Results: 15 Students in Top 100!",
          "Free Scholarship Test (NSAT) - Register Now",
          "New: AI Doubt Resolution - Get Answers in Seconds",
          "GATE CSE Prayas Batch Starting Aug 2025",
        ].map((text, i) => (
          <span key={i} className="mx-8 inline-flex items-center gap-2 text-sm font-semibold text-[#0A4DBF] dark:text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A1A]" />
            {text}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee { from { transform: translateX(0%); } to { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; min-width: 200%; }
      `}</style>
    </div>
  )
}

/* ─── Exam Category Grid ─── */
function ExamCategoryGrid({ examCategories }: { examCategories: ExamCategory[] }) {
  const iconColors = [
    "from-emerald-500 to-emerald-600", "from-blue-500 to-blue-600", "from-orange-500 to-orange-600",
    "from-amber-500 to-amber-600", "from-teal-500 to-teal-600", "from-red-500 to-red-600",
    "from-indigo-500 to-indigo-600", "from-cyan-500 to-cyan-600",
  ]
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">Explore Exam Categories</h2>
        <p className="text-muted-foreground">Choose your exam and start preparing with the best faculty</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5">
        {examCategories.map((cat, i) => (
          <Link key={cat.slug} href={`/exam/${cat.slug}`}>
            <Card className="pg-card group cursor-pointer border-border/60 bg-card py-0">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${iconColors[i]} text-white shadow-md`}>
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{cat.batchCount} Batches</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ─── Featured Batches Carousel ─── */
function FeaturedBatchesSection({ batches }: { batches: Batch[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" })
  }
  return (
    <section className="pg-section-alt py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Featured Batches</h2>
            <p className="text-muted-foreground">Handpicked courses by our academic experts</p>
          </div>
          <div className="hidden gap-2 md:flex">
            <Button variant="outline" size="icon" onClick={() => scroll("left")} aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll("right")} aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-5 overflow-x-auto scroll-smooth pb-4 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {batches.map((batch) => (
            <div key={batch.id} className="w-[300px] flex-shrink-0">
              <ContentCard batch={batch} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Live Now Strip ─── */
function LiveNowStrip({ liveClasses }: { liveClasses: LiveClass[] }) {
  const liveClass = liveClasses.find((c) => c.status === "live")
  if (!liveClass) return null
  return (
    <section className="border-y border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-6">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">LIVE NOW: {liveClass.title}</p>
            <p className="text-xs text-muted-foreground">{liveClass.faculty} | {liveClass.batchName}</p>
          </div>
        </div>
        <Button size="sm" className="gap-2 bg-red-500 text-white hover:bg-red-600">
          <Play className="h-3.5 w-3.5" /> Join Now
        </Button>
      </div>
    </section>
  )
}

/* ─── Stats Counter ─── */
function StatsSection() {
  const stats = [
    { value: 50000, suffix: "+", label: "Students Enrolled", icon: Users },
    { value: 100000, suffix: "+", label: "Tests Taken", icon: BookOpen },
    { value: 15, suffix: "+", label: "Centres Nationwide", icon: MapPin },
    { value: 8, suffix: "+", label: "Years of Excellence", icon: Award },
  ]
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <stat.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
            <CountUp target={stat.value} suffix={stat.suffix} />
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0
          const duration = 2000
          const step = (ts: number) => {
            if (!start) start = ts
            const progress = Math.min((ts - start) / duration, 1)
            setCount(Math.floor(progress * target))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])
  return (
    <p ref={ref} className="text-3xl font-bold text-foreground md:text-4xl">
      {count.toLocaleString()}{suffix}
    </p>
  )
}

/* ─── Why Choose Us ─── */
function WhyChooseUs() {
  const features = [
    { icon: BookOpen, title: "Affordable Pricing", desc: "Premium quality education at the most affordable prices in India" },
    { icon: Brain, title: "AI Doubts 24/7", desc: "Get instant AI-powered doubt resolution anytime, anywhere" },
    { icon: MapPin, title: "Offline Centres", desc: "15+ centres across India for hybrid learning experience" },
    { icon: Award, title: "Top Faculty", desc: "Learn from India's best educators with decades of experience" },
    { icon: Clock, title: "Flexible Learning", desc: "Study at your own pace with recorded lectures and notes" },
    { icon: Users, title: "Community", desc: "Join a community of 50,000+ like-minded aspirants" },
  ]
  return (
    <section className="pg-section-alt py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">Why Choose PathGuru?</h2>
          <p className="text-muted-foreground">Everything you need to crack your dream exam</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="pg-card border-border/60 bg-card py-0">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF] dark:bg-muted text-[#0A4DBF] dark:text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Faculty Carousel ─── */
function FacultySection({ faculty }: { faculty: Faculty[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">Learn from the Best</h2>
        <p className="text-muted-foreground">Our faculty brings decades of combined teaching experience</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        {faculty.slice(0, 6).map((f) => (
          <Card key={f.id} className="border-border bg-card py-0">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                {f.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{f.name}</h3>
                <p className="text-xs font-medium text-primary">{f.subject}</p>
                <p className="mt-1 text-xs text-muted-foreground">{f.experience}+ years experience</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

/* ─── Toppers Showcase ─── */
function ToppersSection({ toppers }: { toppers: Topper[] }) {
  return (
    <section className="pg-section-alt py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">Our Toppers</h2>
          <p className="text-muted-foreground">Students who made us proud</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {toppers.map((t) => (
            <Card key={t.name} className="border-border bg-card py-0 text-center">
              <CardContent className="p-5">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {t.name.charAt(0)}
                </div>
                <h3 className="text-sm font-semibold text-foreground">{t.name}</h3>
                <Badge className="mt-1 bg-primary/10 text-primary text-xs font-medium" variant="secondary">
                  AIR {t.rank}
                </Badge>
                <p className="mt-1 text-xs text-muted-foreground">{t.exam}</p>
                <p className="mt-2 text-xs italic leading-relaxed text-muted-foreground line-clamp-3">{`"${t.quote}"`}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Blog Teasers ─── */
function BlogSection({ blogPosts }: { blogPosts: BlogPost[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">Latest from Our Blog</h2>
          <p className="text-muted-foreground">Tips, strategies, and exam updates</p>
        </div>
        <Link href="/blog">
          <Button variant="ghost" className="gap-1 text-primary">View All <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="group cursor-pointer border-border bg-card transition-all hover:shadow-md py-0">
              <div className="aspect-video bg-muted" />
              <CardContent className="p-5">
                <p className="mb-2 text-xs text-muted-foreground">{post.date} | {post.readTime} read</p>
                <h3 className="mb-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{post.excerpt}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ─── Testimonials ─── */
function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="pg-section-alt py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">What Our Students Say</h2>
          <p className="text-muted-foreground">Real stories from real achievers</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-border bg-card py-0">
              <CardContent className="p-5">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                  ))}
                </div>
                <p className="mb-4 text-sm italic leading-relaxed text-muted-foreground">{`"${t.quote}"`}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{t.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.exam} Aspirant</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Download App CTA ─── */
function DownloadAppCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
      <div className="overflow-hidden rounded-3xl pg-gradient-navy px-8 py-14 text-center text-white md:px-16">
        <h2 className="mb-3 text-2xl font-bold md:text-3xl">Download the PathGuru App</h2>
        <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed opacity-90">
          Study on the go with our mobile app. Access live classes, take tests, and resolve doubts from anywhere.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" variant="secondary" className="gap-2">
            <Download className="h-4 w-4" /> Play Store
          </Button>
          <Button size="lg" variant="secondary" className="gap-2">
            <Download className="h-4 w-4" /> App Store
          </Button>
        </div>
      </div>
    </section>
  )
}

/* ─── Counsellor CTA ─── */
function CounsellorCTA() {
  return (
    <section className="border-t border-border bg-muted/50 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row lg:px-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Need help choosing the right batch?</h3>
          <p className="text-sm text-muted-foreground">Talk to our academic counsellor for free guidance</p>
        </div>
        <Button size="lg" variant="cta" className="gap-2" asChild>
          <a href="tel:+919876543210">
            <Phone className="h-4 w-4" /> Call +91 98765 43210
          </a>
        </Button>
      </div>
    </section>
  )
}

/* ─── Main Page Component ─── */
export default function HomePage() {
  const emptyHome: HomeData = {
    examCategories: [],
    batches: [],
    faculty: [],
    toppers: [],
    testimonials: [],
    blogPosts: [],
    liveClasses: [],
  }
  const { data, loading } = useFetch<HomeData>("/api/home", emptyHome)

  if (loading && data.batches.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <>
      <HeroSection />
      <AnnouncementTicker />
      <ExamCategoryGrid examCategories={data.examCategories} />
      <FeaturedBatchesSection batches={data.batches} />
      <LiveNowStrip liveClasses={data.liveClasses} />
      <StatsSection />
      <WhyChooseUs />
      <FacultySection faculty={data.faculty} />
      <ToppersSection toppers={data.toppers} />
      <BlogSection blogPosts={data.blogPosts} />
      <TestimonialsSection testimonials={data.testimonials} />
      <DownloadAppCTA />
      <CounsellorCTA />
    </>
  )
}
