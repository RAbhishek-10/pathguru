"use client"

import { useState, useEffect, useCallback, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Clock, ChevronLeft, ChevronRight, Flag, Eye, Send, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import type { TestSeries, Question } from "@/lib/types"

type QStatus = "unanswered" | "answered" | "marked" | "visited"

export default function TestEnginePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [test, setTest] = useState<TestSeries | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    fetch(`/api/tests/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setTest(data)
          setQuestions(data.questions ?? [])
        }
      })
  }, [id])

  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [statuses, setStatuses] = useState<Record<string, QStatus>>({})
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showPalette, setShowPalette] = useState(false)

  useEffect(() => {
    if (questions.length > 0) {
      const s: Record<string, QStatus> = {}
      questions.forEach((q) => (s[q.id] = "unanswered"))
      setStatuses(s)
    }
  }, [questions])

  useEffect(() => {
    if (test) setTimeLeft(test.duration * 60)
  }, [test])

  useEffect(() => {
    if (!test) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(`/results/${test.id}`)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router, test])

  const handleAnswer = useCallback((qId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
    setStatuses((prev) => ({ ...prev, [qId]: "answered" }))
  }, [])

  const markForReview = useCallback(() => {
    const qId = questions[currentQ].id
    setStatuses((prev) => ({ ...prev, [qId]: prev[qId] === "marked" ? (answers[qId] ? "answered" : "visited") : "marked" }))
  }, [currentQ, questions, answers])

  const clearResponse = useCallback(() => {
    const qId = questions[currentQ].id
    setAnswers((prev) => { const next = { ...prev }; delete next[qId]; return next })
    setStatuses((prev) => ({ ...prev, [qId]: "visited" }))
  }, [currentQ, questions])

  const goToQ = useCallback((i: number) => {
    const qId = questions[i].id
    if (statuses[qId] === "unanswered" && !answers[qId]) {
      setStatuses((prev) => ({ ...prev, [qId]: "visited" }))
    }
    setCurrentQ(i)
    setShowPalette(false)
  }, [questions, statuses, answers])

  const answeredCount = Object.values(statuses).filter((s) => s === "answered").length
  const markedCount = Object.values(statuses).filter((s) => s === "marked").length
  const unansweredCount = questions.length - answeredCount

  const statusColor = (s: QStatus) => {
    switch (s) {
      case "answered": return "bg-success text-success-foreground"
      case "marked": return "bg-chart-5 text-foreground"
      case "visited": return "bg-destructive/20 text-destructive"
      default: return "bg-muted text-muted-foreground"
    }
  }

  if (!test || questions.length === 0) {
    return <p className="p-12 text-center text-muted-foreground">Loading test...</p>
  }

  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60

  const q = questions[currentQ]
  const sections = [...new Set(questions.map((x) => x.section))]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5 lg:px-6">
        <div className="flex items-center gap-3">
          <Link href="/test-series">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
              <ChevronLeft className="h-4 w-4" /> Exit
            </Button>
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-foreground">{test.title}</h1>
            <p className="text-xs text-muted-foreground">
              {questions.length} questions | {test.totalMarks} marks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-mono font-bold ${timeLeft < 300 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-muted text-foreground"}`}>
            <Clock className="h-4 w-4" />
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowPalette(!showPalette)}>
            <Eye className="mr-1 h-4 w-4" /> {answeredCount}/{questions.length}
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => setShowSubmitDialog(true)}>
            <Send className="mr-1 h-4 w-4" /> Submit
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Question area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Section tabs */}
          <div className="flex gap-1 border-b border-border bg-card px-4 py-2">
            {sections.map((sec) => (
              <Badge key={sec} variant={q.section === sec ? "default" : "outline"} className={`cursor-pointer text-xs ${q.section === sec ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => {
                  const idx = questions.findIndex((x) => x.section === sec)
                  if (idx !== -1) goToQ(idx)
                }}>
                {sec}
              </Badge>
            ))}
          </div>

          <div className="flex-1 p-4 lg:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Q {currentQ + 1}/{questions.length}</Badge>
                <Badge variant="secondary" className="text-xs">{q.section}</Badge>
                <Badge variant="outline" className="text-xs">+{q.marks} / -{q.negativeMarks}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={markForReview} className={`gap-1 text-xs ${statuses[q.id] === "marked" ? "text-chart-5" : "text-muted-foreground"}`}>
                <Flag className="h-3.5 w-3.5" /> {statuses[q.id] === "marked" ? "Unmark" : "Mark for Review"}
              </Button>
            </div>

            <Card className="mb-6 border-border bg-card">
              <CardContent className="p-5">
                <p className="mb-6 text-base leading-relaxed text-foreground">{q.stem}</p>

                {q.type === "mcq" || q.type === "mmcq" ? (
                  <RadioGroup value={answers[q.id] || ""} onValueChange={(val) => handleAnswer(q.id, val)}>
                    <div className="flex flex-col gap-3">
                      {q.options?.map((opt) => (
                        <Label key={opt.id} htmlFor={opt.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${answers[q.id] === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/50"}`}>
                          <RadioGroupItem value={opt.id} id={opt.id} />
                          <span className="text-sm text-foreground">{opt.text}</span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="flex items-center gap-3">
                    <Label className="text-sm font-medium text-foreground">Answer:</Label>
                    <Input type="text" placeholder="Type your numerical answer" className="max-w-xs bg-background text-foreground" value={answers[q.id] || ""} onChange={(e) => handleAnswer(q.id, e.target.value)} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => goToQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" onClick={clearResponse} className="text-muted-foreground">Clear</Button>
              </div>
              <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => goToQ(Math.min(questions.length - 1, currentQ + 1))} disabled={currentQ === questions.length - 1}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="border-t border-border bg-card px-4 py-2">
            <Progress value={(answeredCount / questions.length) * 100} className="h-2" />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{answeredCount} answered</span>
              <span>{markedCount} marked</span>
              <span>{unansweredCount} remaining</span>
            </div>
          </div>
        </div>

        {/* Question palette - desktop */}
        <aside className="hidden w-64 shrink-0 flex-col border-l border-border bg-card lg:flex">
          <div className="border-b border-border p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Question Palette</h3>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-success" /> Answered</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-destructive/20" /> Visited</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-chart-5" /> Marked</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-muted" /> Not visited</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {sections.map((sec) => (
              <div key={sec} className="mb-4">
                <p className="mb-2 text-xs font-semibold text-muted-foreground">{sec}</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((qItem, i) => qItem.section === sec && (
                    <button key={qItem.id} onClick={() => goToQ(i)} className={`flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors ${i === currentQ ? "ring-2 ring-primary" : ""} ${statusColor(statuses[qItem.id])}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-4">
            <Button className="w-full bg-primary text-primary-foreground" onClick={() => setShowSubmitDialog(true)}>
              Submit Test
            </Button>
          </div>
        </aside>

        {/* Mobile palette overlay */}
        {showPalette && (
          <div className="fixed inset-0 z-50 bg-foreground/20 lg:hidden" onClick={() => setShowPalette(false)}>
            <div className="absolute bottom-0 left-0 right-0 max-h-[60vh] overflow-y-auto rounded-t-2xl bg-card p-4" onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
              <h3 className="mb-3 text-sm font-semibold text-foreground">Question Palette</h3>
              <div className="grid grid-cols-8 gap-2">
                {questions.map((qItem, i) => (
                  <button key={qItem.id} onClick={() => goToQ(i)} className={`flex h-9 w-9 items-center justify-center rounded text-xs font-medium ${i === currentQ ? "ring-2 ring-primary" : ""} ${statusColor(statuses[qItem.id])}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-warning" /> Submit Test
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to submit? You cannot change your answers after submission.
            </DialogDescription>
          </DialogHeader>
          <div className="my-2 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-success/10 p-3">
              <p className="text-lg font-bold text-success">{answeredCount}</p>
              <p className="text-xs text-muted-foreground">Answered</p>
            </div>
            <div className="rounded-lg bg-chart-5/10 p-3">
              <p className="text-lg font-bold text-chart-5">{markedCount}</p>
              <p className="text-xs text-muted-foreground">Marked</p>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3">
              <p className="text-lg font-bold text-destructive">{unansweredCount}</p>
              <p className="text-xs text-muted-foreground">Unanswered</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Continue Test</Button>
            <Button className="bg-primary text-primary-foreground" onClick={() => router.push(`/results/${test.id}`)}>
              Submit Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
