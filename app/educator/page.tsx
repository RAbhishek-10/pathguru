"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, Users, TrendingUp, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

interface Stats {
  batchCount: number
  enrollmentCount: number
  studentCount: number
  recentEnrollments: { userName: string; batchTitle: string; enrolledAt: string; progress: number }[]
}

export default function EducatorOverviewPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch("/api/educator/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground md:text-2xl">
          {greeting}, {user?.name?.split(" ")[0]}!
        </h2>
        <p className="text-sm text-muted-foreground">Manage your courses, students, and content</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, label: "Active Batches", value: stats?.batchCount ?? "—", color: "text-blue-500 bg-blue-500/10" },
          { icon: Users, label: "Total Students", value: stats?.studentCount ?? "—", color: "text-emerald-500 bg-emerald-500/10" },
          { icon: TrendingUp, label: "Enrollments", value: stats?.enrollmentCount ?? "—", color: "text-orange-500 bg-orange-500/10" },
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

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Enrollments</h3>
        <Link href="/educator/students">
          <Button variant="ghost" size="sm" className="gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-3">
        {(stats?.recentEnrollments ?? []).length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No enrollments yet. Create a batch to get started.
            </CardContent>
          </Card>
        ) : (
          stats?.recentEnrollments.map((e, i) => (
            <Card key={i} className="border-border bg-card py-0">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">{e.userName}</p>
                  <p className="text-xs text-muted-foreground">Enrolled in {e.batchTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{e.progress}%</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.enrolledAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
