"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Play, CheckCircle2, Lock, FileText, Clock, Video, ChevronLeft, ChevronRight, Menu, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/AuthContext"
import type { Batch, Lecture, Note, TestSeries } from "@/lib/types"
import { toast } from "sonner"

export default function BatchLearnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, refreshUser, isLoading: authLoading } = useAuth()
  const [batch, setBatch] = useState<(Batch & { lectures?: Lecture[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null)
  const [markingProgress, setMarkingProgress] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  // Associated resources
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [testSeriesList, setTestSeriesList] = useState<TestSeries[]>([])

  // Load batch data
  useEffect(() => {
    fetch(`/api/batches/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load batch")
        return r.json()
      })
      .then((data) => {
        setBatch(data)
        const lecs = data.lectures ?? []
        if (lecs.length > 0) {
          // Set first lecture as active by default
          setActiveLecture(lecs[0])
        }
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Error loading batch details")
      })
      .finally(() => setLoading(false))
  }, [id])

  // Guard routing
  useEffect(() => {
    if (!authLoading && user) {
      const isEnrolled = user.enrolledBatches.includes(id) || user.role === "admin" || user.role === "faculty"
      if (!isEnrolled) {
        toast.error("You must enroll in this batch to access the learning portal.")
        router.push(`/batch/${id}`)
      }
    }
  }, [user, authLoading, id, router])

  // Load resources based on exam slug
  useEffect(() => {
    if (!batch?.examSlug) return
    Promise.all([
      fetch(`/api/notes?examSlug=${batch.examSlug}`).then((r) => r.json()),
      fetch(`/api/tests?examSlug=${batch.examSlug}`).then((r) => r.json()),
    ]).then(([notes, tests]) => {
      setAllNotes(notes)
      setTestSeriesList(tests)
    })
  }, [batch?.examSlug])

  // Handle completion toggle
  const handleToggleComplete = async (lectureId: string, currentStatus: boolean) => {
    setMarkingProgress(true)
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId,
          completed: !currentStatus,
        }),
      })

      if (res.ok) {
        toast.success(!currentStatus ? "Marked as completed!" : "Marked as incomplete")
        // Update local state
        if (batch) {
          const updatedLectures = (batch.lectures ?? []).map((l) =>
            l.id === lectureId ? { ...l, isCompleted: !currentStatus } : l
          )
          setBatch({ ...batch, lectures: updatedLectures })
          if (activeLecture?.id === lectureId) {
            setActiveLecture({ ...activeLecture, isCompleted: !currentStatus })
          }
        }
        await refreshUser()
      } else {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to update progress")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error updating lecture status")
    } finally {
      setMarkingProgress(false)
    }
  }

  if (authLoading || loading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading class environment...</div>
  }

  if (!batch) {
    return <div className="p-12 text-center text-destructive">Batch not found</div>
  }

  const lectures = batch.lectures ?? []
  const completedCount = lectures.filter((l) => l.isCompleted).length
  const progressPct = lectures.length > 0 ? Math.round((completedCount / lectures.length) * 100) : 0

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background text-foreground lg:flex-row">
      {/* Sidebar Toggle for Mobile */}
      <div className="flex items-center justify-between border-b border-border bg-card p-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
          <Menu className="h-6 w-6" />
        </Button>
        <span className="text-sm font-semibold truncate max-w-[200px]">{batch.title}</span>
        <Link href={`/batch/${batch.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Info
          </Button>
        </Link>
      </div>

      {/* Sidebar List of Lectures */}
      {showSidebar && (
        <aside className="w-full shrink-0 border-r border-border bg-card lg:w-80 flex flex-col">
          <div className="p-4 border-b border-border hidden lg:block">
            <Link href={`/batch/${batch.id}`} className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Batch Details
            </Link>
            <h2 className="text-sm font-bold text-foreground line-clamp-1 mt-1">{batch.title}</h2>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{completedCount} / {lectures.length} Completed</span>
              <span className="font-semibold">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-1.5 mt-1.5" />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[400px] lg:max-h-none">
            {lectures.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">No lectures in this batch yet.</p>
            ) : (
              <div className="flex flex-col">
                {lectures.map((lec, idx) => {
                  const isActive = activeLecture?.id === lec.id
                  return (
                    <button
                      key={lec.id}
                      onClick={() => {
                        setActiveLecture(lec)
                        // Close sidebar on mobile
                        if (window.innerWidth < 1024) setShowSidebar(false)
                      }}
                      className={`flex items-start gap-3 border-b border-border/50 p-4 text-left transition-colors hover:bg-muted/50 ${
                        isActive ? "bg-primary/5 border-l-4 border-l-primary" : ""
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {lec.isCompleted ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-muted-foreground/30 text-xs font-semibold text-muted-foreground">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold line-clamp-2 ${isActive ? "text-primary" : "text-foreground"}`}>
                          {lec.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{lec.subject}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {lec.duration}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main Player & Tabs Panel */}
      <main className="flex-1 p-4 lg:p-6 flex flex-col gap-6 max-w-full overflow-x-hidden">
        {activeLecture ? (
          <div className="flex flex-col gap-4">
            {/* HTML5 Video Player Container */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-lg">
              {activeLecture.videoUrl ? (
                <video
                  src={activeLecture.videoUrl}
                  controls
                  poster={activeLecture.thumbnail || "/placeholder.svg?height=400&width=600"}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-neutral-900 to-black">
                  <Play className="h-16 w-16 text-primary animate-pulse mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Video lecture content is ready</h3>
                  <p className="max-w-md text-sm text-neutral-400">Class for {activeLecture.title} is hosted securely. Click play to start streaming.</p>
                </div>
              )}
            </div>

            {/* Video Meta & Complete Action */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="capitalize text-xs">{activeLecture.subject}</Badge>
                  <Badge variant="secondary" className="text-xs">{activeLecture.duration}</Badge>
                </div>
                <h1 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">{activeLecture.title}</h1>
              </div>

              <Button
                onClick={() => handleToggleComplete(activeLecture.id, activeLecture.isCompleted)}
                disabled={markingProgress}
                variant={activeLecture.isCompleted ? "outline" : "default"}
                className={`gap-2 ${activeLecture.isCompleted ? "border-success text-success hover:bg-success/5" : "bg-primary text-primary-foreground"}`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {activeLecture.isCompleted ? "Completed" : "Mark as Completed"}
              </Button>
            </div>

            {/* Resources Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-muted">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="notes">Notes & DPPs</TabsTrigger>
                <TabsTrigger value="tests">Related Tests</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <Card className="border-border bg-card">
                  <CardContent className="p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-2">About this Lecture</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This lecture covers key topics in {activeLecture.subject}. Ensure you review the formula sheet and attempt the relevant DPPs uploaded in the Notes section after completing this class.
                    </p>
                    <div className="mt-6 border-t border-border pt-6">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Your Instructor</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {batch.faculty[0]?.name.charAt(0) || "F"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{batch.faculty[0]?.name || "Expert Faculty"}</p>
                          <p className="text-xs text-muted-foreground">{batch.faculty[0]?.subject || activeLecture.subject} Expert</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {allNotes.map((note) => (
                    <Card key={note.id} className="border-border bg-card py-0">
                      <CardContent className="p-5 flex flex-col justify-between h-full">
                        <div>
                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <h4 className="mb-1 text-sm font-semibold text-foreground line-clamp-1">{note.title}</h4>
                          <p className="mb-4 text-xs text-muted-foreground">{note.pages} pages | {note.subject}</p>
                        </div>
                        <Link href={`/notes/${note.id}`} className="w-full">
                          <Button size="sm" className="w-full bg-primary text-primary-foreground">
                            Open & Download
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                  {allNotes.length === 0 && (
                    <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No notes found for this exam Category.</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tests" className="mt-4">
                <div className="flex flex-col gap-3">
                  {testSeriesList.map((test) => (
                    <Card key={test.id} className="border-border bg-card py-0">
                      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">{test.title}</h4>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>{test.totalQuestions} questions</span>
                            <span>{test.duration} min</span>
                            <span>{test.totalMarks} marks</span>
                            <Badge variant="outline" className="capitalize text-[10px]">{test.mode}</Badge>
                          </div>
                        </div>
                        <Link href={`/test/${test.id}`}>
                          <Button size="sm" className="bg-primary text-primary-foreground">
                            Start Test
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                  {testSeriesList.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">No tests found for this exam Category.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-8 bg-card border border-border rounded-xl">
            <Video className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No lectures found</h2>
            <p className="text-sm text-muted-foreground">No video lectures have been uploaded to this batch yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}
