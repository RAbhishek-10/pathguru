"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Batch, Lecture } from "@/lib/types"
import { toast } from "sonner"

interface BatchDetail extends Batch {
  lectures: Lecture[]
  enrollments: { id: string; progress: number; enrolledAt: string; user: { id: string; name: string; email: string; phone: string | null } }[]
}

export default function ManageBatchPage() {
  const { id } = useParams<{ id: string }>()
  const [batch, setBatch] = useState<BatchDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [lectureForm, setLectureForm] = useState({ title: "", duration: "", subject: "", isFree: false, videoUrl: "" })

  const loadBatch = useCallback(() => {
    fetch(`/api/educator/batches/${id}`)
      .then((r) => r.json())
      .then(setBatch)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadBatch() }, [loadBatch])

  const addLecture = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`/api/educator/batches/${id}/lectures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lectureForm),
    })
    if (res.ok) {
      toast.success("Lecture added")
      setLectureForm({ title: "", duration: "", subject: "", isFree: false, videoUrl: "" })
      loadBatch()
    } else {
      const err = await res.json()
      toast.error(err.error ?? "Failed to add lecture")
    }
  }

  const deleteBatch = async () => {
    if (!confirm("Delete this batch? This cannot be undone.")) return
    const res = await fetch(`/api/educator/batches/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Batch deleted")
      window.location.href = "/educator/batches"
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>
  if (!batch) return <p className="text-sm text-destructive">Batch not found</p>

  return (
    <div>
      <Link href="/educator/batches" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to batches
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary">{batch.examSlug.toUpperCase()}</Badge>
            <Badge variant="outline" className="capitalize">{batch.status}</Badge>
          </div>
          <h2 className="text-xl font-bold text-foreground">{batch.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{batch.enrolledCount} students enrolled</p>
        </div>
        <Button variant="destructive" size="sm" onClick={deleteBatch}>
          <Trash2 className="mr-1 h-4 w-4" /> Delete
        </Button>
      </div>

      <Tabs defaultValue="lectures">
        <TabsList className="mb-6">
          <TabsTrigger value="lectures">Lectures ({batch.lectures.length})</TabsTrigger>
          <TabsTrigger value="students">Students ({batch.enrollments.length})</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="lectures">
          <Card className="mb-6 border-border bg-card">
            <CardHeader><CardTitle className="text-base">Add Lecture</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={addLecture} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Title</Label>
                  <Input required value={lectureForm.title} onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input required value={lectureForm.subject} onChange={(e) => setLectureForm({ ...lectureForm, subject: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input required placeholder="45:00" value={lectureForm.duration} onChange={(e) => setLectureForm({ ...lectureForm, duration: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Video URL</Label>
                  <Input placeholder="https://..." value={lectureForm.videoUrl} onChange={(e) => setLectureForm({ ...lectureForm, videoUrl: e.target.value })} className="mt-1.5" />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" className="gap-2 bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4" /> Add Lecture
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            {batch.lectures.map((lecture, i) => (
              <Card key={lecture.id} className="border-border bg-card py-0">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{i + 1}. {lecture.title}</p>
                    <p className="text-xs text-muted-foreground">{lecture.subject} · {lecture.duration}{lecture.isFree ? " · Free" : ""}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students">
          <div className="grid gap-3">
            {batch.enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
            ) : (
              batch.enrollments.map((e) => (
                <Card key={e.id} className="border-border bg-card py-0">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{e.user.name}</p>
                      <p className="text-xs text-muted-foreground">{e.user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{e.progress}% complete</p>
                      <p className="text-xs text-muted-foreground">{new Date(e.enrolledAt).toLocaleDateString("en-IN")}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card className="border-border bg-card">
            <CardContent className="space-y-3 p-6 text-sm">
              <p><span className="font-medium text-foreground">Description:</span> {batch.description}</p>
              <p><span className="font-medium text-foreground">Price:</span> ₹{batch.discountedPrice.toLocaleString("en-IN")} <span className="text-muted-foreground line-through">₹{batch.price.toLocaleString("en-IN")}</span></p>
              <p><span className="font-medium text-foreground">Mode:</span> <span className="capitalize">{batch.mode}</span></p>
              <p><span className="font-medium text-foreground">Start:</span> {batch.startDate}</p>
              <div>
                <span className="font-medium text-foreground">Features:</span>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {batch.features.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
