"use client"

import { useEffect, useState } from "react"
import { Mail, Phone, Calendar, Wallet, Award, BookOpen, Copy, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import type { Batch } from "@/lib/types"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user } = useAuth()
  const [enrolledBatchData, setEnrolledBatchData] = useState<Batch[]>([])

  useEffect(() => {
    fetch("/api/enrollments")
      .then((r) => (r.ok ? r.json() : []))
      .then(setEnrolledBatchData)
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
      <h1 className="mb-8 text-3xl font-bold text-foreground">My Profile</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
              {user?.name?.charAt(0)}
            </div>
            <h2 className="mb-1 text-lg font-bold text-foreground">{user?.name}</h2>
            <Badge variant="secondary" className="mb-4 capitalize text-xs">{user?.role}</Badge>
            <Separator className="mb-4" />
            <div className="flex w-full flex-col gap-3 text-left text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" /> {user?.email}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4" /> +91 {user?.phone}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4" /> Joined {new Date(user?.createdAt ?? "").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info cards */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{"₹"}{user?.walletBalance ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Wallet Balance</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <BookOpen className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{user?.enrolledBatches?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Enrolled Batches</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-5/10">
                  <Award className="h-5 w-5 text-chart-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{user?.testResults?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Tests Completed</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Refer & Earn</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-muted-foreground">Share your referral code and earn {"₹"}200 for each friend who enrolls in a batch.</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-dashed border-primary bg-primary/5 px-4 py-2.5 text-center font-mono text-sm font-bold tracking-wider text-primary">
                  {user?.referralCode ?? ""}
                </div>
                <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(user?.referralCode ?? ""); toast.success("Copied!") }}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy referral code</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
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
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share referral code</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enrolled batches */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">My Enrolled Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {enrolledBatchData.map((batch) => (
                  <div key={batch.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{batch.title}</p>
                      <p className="text-xs text-muted-foreground">{batch.examSlug.toUpperCase()} | {batch.mode}</p>
                    </div>
                    <Badge className="bg-success/10 text-success text-xs">{batch.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
