"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BookOpen, Calendar, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ContentCard from "@/components/shared/ContentCard"
import type { Batch, ExamCategory, Faculty } from "@/lib/types"

export default function ExamLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [exam, setExam] = useState<ExamCategory | null>(null)
  const [examBatches, setExamBatches] = useState<Batch[]>([])
  const [examFaculty, setExamFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/exams").then((r) => r.json()),
      fetch(`/api/batches?examSlug=${slug}`).then((r) => r.json()),
      fetch("/api/faculty").then((r) => r.json()),
    ])
      .then(([categories, batches, faculty]) => {
        const cat = categories.find((e: ExamCategory) => e.slug === slug)
        setExam(
          cat ?? {
            slug,
            name: slug.toUpperCase(),
            icon: "BookOpen",
            description: "Exam preparation",
            batchCount: batches.length,
            color: "bg-blue-500",
          }
        )
        setExamBatches(batches)
        setExamFaculty(faculty.slice(0, 4))
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading || !exam) {
    return <p className="p-12 text-center text-muted-foreground">Loading...</p>
  }

  const faqs = [
    { q: `What is the best way to prepare for ${exam.name}?`, a: "Start with NCERT, follow a structured study plan, take regular mock tests, and use our AI doubt resolution for instant clarifications." },
    { q: `How long does it take to prepare for ${exam.name}?`, a: "Ideally 12-18 months of focused preparation. Our batches are designed to cover the complete syllabus within this timeframe." },
    { q: "Are there any free resources available?", a: "Yes! We offer free scholarship tests, sample notes, and selected video lectures to help you get started." },
    { q: "Can I switch batches after enrollment?", a: "Yes, you can upgrade or switch batches within 15 days of enrollment. Contact our support team for assistance." },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/[0.05] to-primary/[0.02] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <Link href="/exam-categories" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All Exams
          </Link>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3 border-primary/20 bg-primary/10 text-primary">{exam.name} 2026/2027</Badge>
              <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">{exam.name} Preparation</h1>
              <p className="max-w-xl text-muted-foreground">{exam.description}. Join the most comprehensive {exam.name} coaching program with expert faculty, daily live classes, and advanced test series.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/scholarship"><Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" /> Free Scholarship Test</Button></Link>
              <Button onClick={() => document.getElementById("batches-section")?.scrollIntoView({ behavior: "smooth" })} className="gap-2 bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" /> Browse Batches
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Batch Grid */}
      <section id="batches-section" className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Available Batches ({examBatches.length})</h2>
          <Button variant="outline" size="sm" className="gap-2"><Filter className="h-4 w-4" /> Filters</Button>
        </div>
        {examBatches.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {examBatches.map((batch) => (
              <ContentCard key={batch.id} batch={batch} />
            ))}
          </div>
        ) : (
          <Card className="border-border bg-card py-0">
            <CardContent className="flex flex-col items-center p-12 text-center">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">No batches found</h3>
              <p className="mb-4 text-sm text-muted-foreground">New batches for {exam.name} are coming soon!</p>
              <Link href="/exam-categories"><Button variant="outline">Browse Other Exams</Button></Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Faculty */}
      <section className="bg-muted/50 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-8 text-xl font-bold text-foreground">{exam.name} Faculty</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {examFaculty.map((f) => (
              <Card key={f.id} className="border-border bg-card py-0">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">{f.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{f.name}</h3>
                    <p className="text-xs text-primary">{f.subject}</p>
                    <p className="text-xs text-muted-foreground">{f.experience}+ yrs</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <h2 className="mb-8 text-xl font-bold text-foreground">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full max-w-3xl">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium text-foreground">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  )
}
