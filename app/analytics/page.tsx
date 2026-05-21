"use client"

import { BarChart3, TrendingUp, Target, Clock, BookOpen, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useFetch } from "@/lib/hooks/use-fetch"

interface AnalyticsData {
  weeklyData: { day: string; hours: number }[]
  subjectProgress: { name: string; completed: number; total: number; score: number; batchTitle?: string }[]
  stats: { testsTaken: number; bestPercentile: number; accuracy: number }
  testResults: { testId: string; testName: string; score: number; totalMarks: number; rank: number; percentile: number; date: string }[]
}

export default function AnalyticsPage() {
  const { data, loading } = useFetch<AnalyticsData>("/api/analytics")
  const weeklyData = data?.weeklyData ?? []
  const subjectProgress = data?.subjectProgress ?? []
  const testResults = data?.testResults ?? []
  const stats = data?.stats

  const totalHours = weeklyData.reduce((s, d) => s + d.hours, 0)
  const maxHours = Math.max(...weeklyData.map((d) => d.hours), 1)

  if (loading) return <p className="p-12 text-center text-muted-foreground">Loading analytics...</p>

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Learning Analytics</h1>
        <p className="text-muted-foreground">Track your progress, study hours, and performance trends</p>
      </div>

      {/* KPI cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(0)}h</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.bestPercentile ?? 0}%</p>
              <p className="text-xs text-muted-foreground">Best Percentile</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-5/10">
              <Target className="h-6 w-6 text-chart-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.accuracy ?? 0}%</p>
              <p className="text-xs text-muted-foreground">Avg Accuracy</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-4/10">
              <CheckCircle2 className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.testsTaken ?? 0}</p>
              <p className="text-xs text-muted-foreground">Tests Taken</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Study hours chart */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BarChart3 className="h-4 w-4 text-primary" /> Weekly Study Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3" style={{ height: 200 }}>
              {weeklyData.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-foreground">{d.hours}h</span>
                  <div className="w-full rounded-t-md bg-primary/20" style={{ height: `${(d.hours / maxHours) * 160}px` }}>
                    <div className="h-full w-full rounded-t-md bg-primary transition-all" style={{ height: `${(d.hours / maxHours) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subject progress */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BookOpen className="h-4 w-4 text-primary" /> Subject Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              {subjectProgress.map((sub) => (
                <div key={sub.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{sub.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{sub.completed}/{sub.total} topics</Badge>
                      <Badge variant="outline" className="text-xs">Avg: {sub.score}%</Badge>
                    </div>
                  </div>
                  <Progress value={(sub.completed / sub.total) * 100} className="h-2.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test history */}
      <Card className="mt-6 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-foreground">Recent Test Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Test</th>
                  <th className="pb-3 font-medium text-muted-foreground">Score</th>
                  <th className="pb-3 font-medium text-muted-foreground">Rank</th>
                  <th className="pb-3 font-medium text-muted-foreground">Percentile</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((tr) => (
                  <tr key={tr.testId} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium text-foreground">{tr.testName}</td>
                    <td className="py-3 text-foreground">{tr.score}/{tr.totalMarks}</td>
                    <td className="py-3 text-foreground">#{tr.rank}</td>
                    <td className="py-3"><Badge className="bg-success/10 text-success text-xs">{tr.percentile}%</Badge></td>
                    <td className="py-3 text-muted-foreground">{new Date(tr.date).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
