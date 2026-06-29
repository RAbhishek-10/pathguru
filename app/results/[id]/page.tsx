"use client"

import { use } from "react"
import Link from "next/link"
import { Trophy, Target, Clock, TrendingUp, CheckCircle2, XCircle, MinusCircle, ArrowLeft, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TestResult, Question, SectionResult } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: resData } = useFetch<{ formatted: TestResult; record: any }>(`/api/results/${id}`)
  const result: TestResult | undefined = resData?.formatted
  const record = resData?.record

  if (!result) {
    return <p className="p-12 text-center text-muted-foreground">Loading results...</p>
  }

  const attemptDetails = record?.attemptDetails || []
  // Questions pulled from real attemptDetails (with question data included)
  const questions = attemptDetails.map((ad: any) => ad.question) || []
  const scorePercent = (result.obtainedMarks / result.totalMarks) * 100

  // Real completion date from DB record (not hardcoded today)
  const completedAtDisplay = record?.completedAt
    ? new Date(record.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN")

  // Format time taken from minutes
  const timeTakenMins = result.timeTaken ?? 0
  const timeTakenDisplay = timeTakenMins >= 60
    ? `${Math.floor(timeTakenMins / 60)}h ${timeTakenMins % 60}m`
    : `${timeTakenMins}m`

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/test-series" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Test Series
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{result.testName}</h1>
          <p className="text-sm text-muted-foreground">Completed on {completedAtDisplay}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => window.print()}><Download className="h-4 w-4" /> Download PDF</Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => { navigator.clipboard.writeText(window.location.href); }}><Share2 className="h-4 w-4" /> Copy Link</Button>
        </div>
      </div>

      {/* Score Hero */}
      <Card className="mb-8 overflow-hidden border-border bg-card">
        <CardContent className="p-0">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center bg-primary/5 p-8">
              <div className="relative mb-4 flex h-32 w-32 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/40" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={`${scorePercent * 2.64} ${264 - scorePercent * 2.64}`} className="text-primary" strokeLinecap="round" />
                </svg>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">{result.obtainedMarks}</p>
                  <p className="text-xs text-muted-foreground">/ {result.totalMarks}</p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary">Score: {scorePercent.toFixed(1)}%</Badge>
            </div>

            <div className="flex flex-col justify-center gap-4 p-6 md:col-span-2">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <Trophy className="mx-auto mb-1 h-5 w-5 text-chart-5" />
                  <p className="text-xl font-bold text-foreground">{result.rank}</p>
                  <p className="text-xs text-muted-foreground">Rank</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <TrendingUp className="mx-auto mb-1 h-5 w-5 text-success" />
                  <p className="text-xl font-bold text-foreground">{result.percentile}%</p>
                  <p className="text-xs text-muted-foreground">Percentile</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <Target className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xl font-bold text-foreground">{result.accuracy}%</p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <Clock className="mx-auto mb-1 h-5 w-5 text-chart-4" />
                  <p className="text-xl font-bold text-foreground">{timeTakenDisplay}</p>
                  <p className="text-xs text-muted-foreground">Time Taken</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="flex items-center justify-center gap-2 rounded-lg bg-success/10 p-2.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm font-semibold text-foreground">{result.correct} Correct</span>
                </div>
                <div className="flex items-center justify-center gap-2 rounded-lg bg-destructive/10 p-2.5">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-foreground">{result.incorrect} Incorrect</span>
                </div>
                <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-2.5">
                  <MinusCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">{result.unattempted} Skipped</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="sections">Section Analysis</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        {/* Section Analysis */}
        <TabsContent value="sections">
          <div className="grid gap-4 md:grid-cols-3">
            {result.sections.map((sec) => {
              const pct = (sec.obtainedMarks / sec.totalMarks) * 100
              return (
                <Card key={sec.name} className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm font-semibold text-foreground">
                      {sec.name}
                      <Badge variant="secondary" className="text-xs">{pct.toFixed(0)}%</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>{sec.obtainedMarks} / {sec.totalMarks}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded bg-success/10 p-1.5">
                        <p className="font-bold text-success">{sec.correct}</p>
                        <p className="text-muted-foreground">Correct</p>
                      </div>
                      <div className="rounded bg-destructive/10 p-1.5">
                        <p className="font-bold text-destructive">{sec.incorrect}</p>
                        <p className="text-muted-foreground">Wrong</p>
                      </div>
                      <div className="rounded bg-muted p-1.5">
                        <p className="font-bold text-foreground">{sec.unattempted}</p>
                        <p className="text-muted-foreground">Skipped</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Solutions */}
        <TabsContent value="solutions">
          <div className="flex flex-col gap-4">
            {questions.map((q: any, i: number) => {
              const attempt = attemptDetails.find((ad: any) => ad.questionId === q.id)
              const status = attempt?.isCorrect ? "Correct" : attempt?.givenAnswer ? "Incorrect" : "Skipped"
              
              let options: any[] = []
              try {
                if (q.options) {
                  options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options
                }
              } catch (e) {}

              return (
              <Card key={q.id} className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Q{i + 1}</Badge>
                      <Badge variant="secondary" className="text-xs">{q.section}</Badge>
                    </div>
                    {status === "Correct" ? (
                      <Badge className="bg-success/10 text-success text-xs">Correct</Badge>
                    ) : status === "Incorrect" ? (
                      <Badge className="bg-destructive/10 text-destructive text-xs">Incorrect</Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground text-xs">Skipped</Badge>
                    )}
                  </div>
                  <p className="mb-3 text-sm text-foreground">{q.stem}</p>
                  {options.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {options.map((opt, oi) => {
                        const isCorrectOption = opt.id === q.correctAnswer
                        const isGivenOption = opt.id === attempt?.givenAnswer
                        let classes = "border-border text-muted-foreground"
                        if (isCorrectOption) classes = "border-success bg-success/5 text-foreground"
                        else if (isGivenOption) classes = "border-destructive bg-destructive/5 text-foreground"

                        return (
                        <div key={opt.id} className={`rounded-lg border px-3 py-2 text-sm ${classes}`}>
                          <span className="mr-2 font-semibold">{String.fromCharCode(65 + oi)}.</span>
                          {opt.text}
                          {isCorrectOption && <CheckCircle2 className="ml-2 inline h-4 w-4 text-success" />}
                          {isGivenOption && !isCorrectOption && <XCircle className="ml-2 inline h-4 w-4 text-destructive" />}
                        </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm">
                      <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                      <p><strong>Your Answer:</strong> {attempt?.givenAnswer || "Not answered"}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )})}
          </div>
        </TabsContent>

        {/* Comparison */}
        <TabsContent value="comparison">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Your Score vs Average vs Topper</h3>
              <div className="flex flex-col gap-4">
                {result.sections.map((sec) => (
                  <div key={sec.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{sec.name}</span>
                      <span className="text-muted-foreground">{sec.obtainedMarks}/{sec.totalMarks}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-xs text-muted-foreground">You</span>
                        <Progress value={(sec.obtainedMarks / sec.totalMarks) * 100} className="h-2 flex-1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-xs text-muted-foreground">Avg</span>
                        <Progress value={(sec.obtainedMarks / sec.totalMarks) * 60} className="h-2 flex-1 [&>div]:bg-chart-5" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-xs text-muted-foreground">Top</span>
                        <Progress value={Math.min(98, (sec.obtainedMarks / sec.totalMarks) * 110)} className="h-2 flex-1 [&>div]:bg-success" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-center gap-4">
        <Link href="/test-series"><Button variant="outline">Take Another Test</Button></Link>
        <Link href="/dashboard"><Button className="bg-primary text-primary-foreground">Go to Dashboard</Button></Link>
      </div>
    </div>
  )
}
