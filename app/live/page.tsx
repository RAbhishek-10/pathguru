"use client"

import { Video, Clock, User, Radio, Play, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LiveClass } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })
}

function ClassCard({ cls }: { cls: LiveClass }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            cls.status === "live" ? "bg-destructive/10 text-destructive" :
            cls.status === "upcoming" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            {cls.status === "live" ? <Radio className="h-5 w-5 animate-pulse" /> :
             cls.status === "upcoming" ? <Calendar className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{cls.title}</h3>
              {cls.status === "live" && <Badge className="bg-destructive text-destructive-foreground text-xs animate-pulse" variant="destructive">LIVE</Badge>}
              {cls.status === "upcoming" && <Badge variant="secondary" className="text-xs">Upcoming</Badge>}
              {cls.status === "ended" && <Badge variant="outline" className="text-xs">Ended</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {cls.faculty}</span>
              <span className="flex items-center gap-1"><Video className="h-3 w-3" /> {cls.batchName}</span>
              <span>{cls.subject}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDate(cls.startTime)} | {formatTime(cls.startTime)} - {formatTime(cls.endTime)}</span>
            </div>
          </div>
        </div>
        <div>
          {cls.status === "live" && (
            <Button size="sm" className="gap-1 bg-destructive text-white hover:bg-destructive/90">
              <Radio className="h-3.5 w-3.5" /> Join Live
            </Button>
          )}
          {cls.status === "upcoming" && (
            <Button size="sm" variant="outline" className="gap-1">
              <Calendar className="h-3.5 w-3.5" /> Set Reminder
            </Button>
          )}
          {cls.status === "ended" && cls.recordingUrl && (
            <Button size="sm" variant="secondary" className="gap-1">
              <Play className="h-3.5 w-3.5" /> Watch Recording
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function LiveSchedulePage() {
  const { data: liveClasses, loading } = useFetch<LiveClass[]>("/api/live-classes", [])
  const live = liveClasses.filter((c) => c.status === "live")
  const upcoming = liveClasses.filter((c) => c.status === "upcoming")
  const ended = liveClasses.filter((c) => c.status === "ended")

  if (loading) return <p className="p-12 text-center text-muted-foreground">Loading...</p>

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Live Classes Schedule</h1>
        <p className="text-muted-foreground">Join live classes and watch recordings at your convenience</p>
      </div>

      {live.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Happening Now</h2>
          <div className="flex flex-col gap-3">
            {live.map((cls) => <ClassCard key={cls.id} cls={cls} />)}
          </div>
        </div>
      )}

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past Classes ({ended.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <div className="flex flex-col gap-3">
            {upcoming.map((cls) => <ClassCard key={cls.id} cls={cls} />)}
            {upcoming.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">No upcoming classes scheduled</div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="past">
          <div className="flex flex-col gap-3">
            {ended.map((cls) => <ClassCard key={cls.id} cls={cls} />)}
            {ended.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">No past classes yet</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
