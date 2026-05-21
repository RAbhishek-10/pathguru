"use client"

import Link from "next/link"
import { Clock, Users, FileText, Filter, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { TestSeries } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"

export default function TestSeriesListPage() {
  const { data: testSeries, loading } = useFetch<TestSeries[]>("/api/tests", [])

  if (loading) return <p className="p-12 text-center text-muted-foreground">Loading...</p>

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Test Series</h1>
          <p className="text-muted-foreground">Practice with exam-pattern tests and track your progress</p>
        </div>
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filter</Button>
      </div>

      <div className="flex flex-col gap-4">
        {testSeries.map((test) => (
          <Card key={test.id} className="border-border bg-card py-0">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{test.title}</h3>
                  <Badge variant="outline" className="capitalize text-xs">{test.examSlug}</Badge>
                  <Badge variant="secondary" className="capitalize text-xs">{test.mode}</Badge>
                  {test.isFree && <Badge className="bg-success/10 text-success text-xs" variant="secondary">Free</Badge>}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {test.totalQuestions} questions</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {test.duration} min</span>
                  <span>{test.totalMarks} marks</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {test.attemptsCount.toLocaleString()} attempts</span>
                  {test.scheduledDate && <span>Scheduled: {new Date(test.scheduledDate).toLocaleDateString("en-IN")}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!test.isFree && <span className="text-lg font-bold text-foreground">{"₹"}{test.price}</span>}
                <Link href={`/test/${test.id}`}>
                  <Button className="gap-2 bg-primary text-primary-foreground" size="sm">
                    {test.isFree ? "Start Test" : "Attempt"} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
