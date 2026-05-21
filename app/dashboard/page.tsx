"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, ClipboardList, Trophy, Flame, Play, ArrowRight, BarChart3, Calendar, Clock, Award, Wallet, Copy } from "lucide-react"
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

  useEffect(() => {
    fetch("/api/enrollments")
      .then((r) => (r.ok ? r.json() : []))
      .then(setEnrolledBatches)
      .catch(() => setEnrolledBatches([]))
  }, [])

  const now = new Date()
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening"
  const bestRank = user?.testResults?.length ? `#${Math.min(...user.testResults.map((r) => r.rank))}` : "—"

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
          { icon: ClipboardList, label: "Upcoming Tests", value: 3, color: "text-orange-500 bg-orange-500/10" },
          { icon: Trophy, label: "Best Rank", value: bestRank, color: "text-amber-500 bg-amber-500/10" },
          { icon: Flame, label: "Study Streak", value: "12 days", color: "text-red-500 bg-red-500/10" },
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
            {[
              { type: "Live Class", title: "Thermodynamics - Heat Transfer", time: "Today, 2:00 PM", batch: "NEET Arjuna", icon: Calendar },
              { type: "Test", title: "NEET Mock Test 3", time: "Tomorrow, 10:00 AM", batch: "NEET Full Mock", icon: ClipboardList },
              { type: "Live Class", title: "Organic Chemistry - Alcohols", time: "Jul 3, 9:00 AM", batch: "NEET Arjuna", icon: Calendar },
            ].map((event, i) => (
              <Card key={i} className="border-border bg-card py-0">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${event.type === "Live Class" ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500"}`}>
                      <event.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{event.title}</h4>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {event.time}
                        <span>|</span>
                        <span>{event.batch}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant={event.type === "Live Class" ? "default" : "outline"} className={event.type === "Live Class" ? "bg-primary text-primary-foreground" : ""}>
                    {event.type === "Live Class" ? "Join" : "Attempt"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recent Results */}
        <TabsContent value="results">
          <div className="overflow-x-auto">
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
                {(user?.testResults ?? []).map((r) => (
                  <tr key={r.testId} className="border-b border-border">
                    <td className="py-3 text-sm font-medium text-foreground">{r.testName}</td>
                    <td className="py-3 text-sm text-foreground">{r.score}/{r.totalMarks}</td>
                    <td className="py-3 text-sm text-foreground">{r.percentile}%</td>
                    <td className="py-3 text-sm text-foreground">#{r.rank}</td>
                    <td className="py-3 text-sm text-muted-foreground">{r.date}</td>
                    <td className="py-3"><Link href={`/results/${r.testId}`}><Button variant="ghost" size="sm" className="gap-1 text-primary">Details <ArrowRight className="h-3.5 w-3.5" /></Button></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Analytics Preview */}
        <TabsContent value="analytics">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
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
            ))}
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
                <p className="text-3xl font-bold text-foreground">{"₹"}{user?.walletBalance.toLocaleString()}</p>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
