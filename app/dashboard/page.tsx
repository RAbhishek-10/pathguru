"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, ClipboardList, Trophy, Flame, Play, ArrowRight, BarChart3, Calendar, Clock, Award, Wallet, Copy, Share2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import type { Batch } from "@/lib/types"
import { toast } from "sonner"

interface EnrolledBatch extends Batch {
  progress: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [enrolledBatches, setEnrolledBatches] = useState<EnrolledBatch[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [liveClasses, setLiveClasses] = useState<any[]>([])
  const [upcomingTests, setUpcomingTests] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/enrollments")
      .then((r) => (r.ok ? r.json() : []))
      .then(setEnrolledBatches)
      .catch(() => setEnrolledBatches([]))

    fetch("/api/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .catch(() => setOrders([]))

    fetch("/api/live-classes")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLiveClasses(data.filter((c: any) => c.status !== "ended")))
      .catch(() => setLiveClasses([]))

    // Fetch upcoming/scheduled tests
    fetch("/api/tests")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setUpcomingTests(data.filter((t: any) => t.mode === "scheduled" || t.scheduledDate)))
      .catch(() => setUpcomingTests([]))
  }, [])

  const now = new Date()
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening"

  // Use real test result data — best rank from actual result records
  const testResults = user?.testResults ?? []
  const bestRank = testResults.length ? `#${Math.min(...testResults.map((r) => r.rank))}` : "—"

  // Compute study streak: count consecutive days with test activity (simplified from testResults)
  const streakDays = computeStreak(testResults.map((r) => r.date))

  return (
    <div>
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground md:text-2xl">{greeting}, {user?.name?.split(" ")[0]}!</h2>
        <p className="text-sm text-muted-foreground">{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* Quick stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: BookOpen, label: "Enrolled Batches", value: enrolledBatches.length, color: "text-blue-500 bg-blue-500/10" },
          { icon: ClipboardList, label: "Upcoming Tests", value: upcomingTests.length, color: "text-orange-500 bg-orange-500/10" },
          { icon: Trophy, label: "Best Rank", value: bestRank, color: "text-amber-500 bg-amber-500/10" },
          { icon: Flame, label: "Study Streak", value: streakDays > 0 ? `${streakDays} days` : "Start today!", color: "text-red-500 bg-red-500/10" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="learning">
        <TabsList className="mb-6">
          <TabsTrigger value="learning">My Learning</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="results">Recent Results</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
        </TabsList>

        {/* My Learning */}
        <TabsContent value="learning">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledBatches.map((batch) => (
                <Card key={batch.id} className="border-border bg-card py-0">
                  <CardContent className="p-5">
                    <Badge className="mb-3 bg-primary/10 text-primary text-xs" variant="secondary">{batch.examSlug.toUpperCase()}</Badge>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">{batch.title}</h3>
                    <div className="mb-3">
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{batch.progress}% completed</span>
                      </div>
                      <Progress value={batch.progress} className="h-2" />
                    </div>
                    <Link href={`/batch/${batch.id}`}>
                      <Button size="sm" className="w-full gap-2 bg-primary text-primary-foreground">
                        <Play className="h-3.5 w-3.5" /> Continue
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            {enrolledBatches.length === 0 && (
              <Card className="col-span-full border-border bg-card py-0">
                <CardContent className="flex flex-col items-center p-12 text-center">
                  <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold text-foreground">No batches enrolled yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Start your preparation journey today</p>
                  <Link href="/exam-categories"><Button className="bg-primary text-primary-foreground">Browse Courses</Button></Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Upcoming */}
        <TabsContent value="upcoming">
          <div className="flex flex-col gap-3">
            {liveClasses.length === 0 && upcomingTests.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No upcoming live classes or tests.</p>
            )}
            {liveClasses.map((event, i) => (
              <Card key={`live-${i}`} className="border-border bg-card py-0">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {new Date(event.startTime).toLocaleString("en-IN", { weekday: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
                        <span>|</span>
                        <span>{event.batchName}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    Join
                  </Button>
                </CardContent>
              </Card>
            ))}
            {upcomingTests.map((test) => (
              <Card key={`test-${test.id}`} className="border-border bg-card py-0">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{test.title}</h4>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        {test.scheduledDate && <><Clock className="h-3 w-3" /> {new Date(test.scheduledDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</>}
                        <span>{test.totalQuestions} Qs · {test.totalMarks} marks</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize border-orange-500/30 text-orange-500 bg-orange-500/5">
                    Scheduled
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recent Results — FIX: use r.resultId for the href */}
        <TabsContent value="results">
          <div className="overflow-x-auto">
            {testResults.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No test results yet. <Link href="/test-series" className="text-primary underline">Take a test</Link> to see your performance here.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Test Name</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Score</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Percentile</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Rank</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((r) => (
                    <tr key={r.resultId} className="border-b border-border">
                      <td className="py-3 text-sm font-medium text-foreground">{r.testName}</td>
                      <td className="py-3 text-sm text-foreground">{r.score}/{r.totalMarks}</td>
                      <td className="py-3 text-sm text-foreground">{r.percentile}%</td>
                      <td className="py-3 text-sm text-foreground">#{r.rank}</td>
                      <td className="py-3 text-sm text-muted-foreground">{r.date}</td>
                      {/* FIX: use r.resultId not r.testId */}
                      <td className="py-3">
                        <Link href={`/results/${r.resultId}`}>
                          <Button variant="ghost" size="sm" className="gap-1 text-primary">
                            Details <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders">
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">No orders found.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Order ID</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Items</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border">
                      <td className="py-3 text-xs font-mono text-muted-foreground max-w-[120px] truncate">{o.id}</td>
                      <td className="py-3 text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="py-3 text-sm text-foreground">
                        {o.items.map((i: any) => i.title).join(", ")}
                      </td>
                      <td className="py-3 text-sm font-bold text-foreground">{"₹"}{o.total}</td>
                      <td className="py-3 text-sm">
                        <Badge variant="outline" className="capitalize bg-success/10 text-success border-success/20">{o.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>

        {/* Analytics Preview */}
        <TabsContent value="analytics">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testResults.slice(0, 3).length > 0 ? (
              // Show subject breakdown from recent test results if available
              testResults.slice(0, 3).map((r, i) => {
                const pct = Math.round((r.score / r.totalMarks) * 100)
                const colors = ["bg-blue-500", "bg-emerald-500", "bg-orange-500"]
                return (
                  <Card key={r.resultId} className="border-border bg-card py-0">
                    <CardContent className="p-5">
                      <h4 className="mb-1 text-sm font-semibold text-foreground">{r.testName}</h4>
                      <p className="mb-3 text-xs text-muted-foreground">{r.date}</p>
                      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Score</span>
                        <span className="font-semibold text-foreground">{r.score}/{r.totalMarks} ({pct}%)</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              [
                { subject: "Physics", score: 73, color: "bg-blue-500" },
                { subject: "Chemistry", score: 82, color: "bg-emerald-500" },
                { subject: "Biology", score: 68, color: "bg-orange-500" },
              ].map((s) => (
                <Card key={s.subject} className="border-border bg-card py-0">
                  <CardContent className="p-5">
                    <h4 className="mb-3 text-sm font-semibold text-foreground">{s.subject}</h4>
                    <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Average Score</span>
                      <span className="font-semibold text-foreground">{s.score}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.score}%` }} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <Link href="/analytics" className="mt-4 block">
            <Button variant="outline" className="gap-2"><BarChart3 className="h-4 w-4" /> View Full Analytics</Button>
          </Link>
        </TabsContent>

        {/* Wallet */}
        <TabsContent value="wallet">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-border bg-card py-0">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Wallet className="h-6 w-6 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Wallet Balance</h3>
                </div>
                <p className="text-3xl font-bold text-foreground">{"₹"}{(user?.walletBalance ?? 0).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card py-0">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <Award className="h-6 w-6 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Refer & Earn</h3>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">Share your referral code with friends</p>
                <div className="flex items-center gap-2">
                  <code className="rounded-lg bg-muted px-3 py-2 text-sm font-mono font-semibold text-foreground">{user?.referralCode}</code>
                  <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(user?.referralCode ?? ""); toast.success("Copied!") }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => {
                    if (typeof navigator !== "undefined" && navigator.share) {
                      navigator.share({
                        title: "PathGuru Referral",
                        text: `Join PathGuru with my referral code ${user?.referralCode} and get study credits!`,
                        url: window.location.origin
                      }).catch(() => {})
                    } else {
                      navigator.clipboard.writeText(user?.referralCode || "")
                      toast.success("Referral code copied to clipboard!")
                    }
                  }}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Compute study streak: count consecutive calendar days (ending today)
 * where at least one test was taken.
 */
function computeStreak(datestamps: string[]): number {
  if (datestamps.length === 0) return 0
  const uniqueDays = new Set(datestamps)
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split("T")[0]
    if (uniqueDays.has(key)) {
      streak++
    } else {
      break
    }
  }
  return streak
}
