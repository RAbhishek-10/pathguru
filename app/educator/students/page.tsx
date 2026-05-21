"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface StudentEnrollment {
  id: string
  progress: number
  enrolledAt: string
  user: { id: string; name: string; email: string; phone: string | null; status: string }
  batch: { id: string; title: string; examSlug: string }
}

export default function EducatorStudentsPage() {
  const [students, setStudents] = useState<StudentEnrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/educator/students")
      .then((r) => r.json())
      .then(setStudents)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Students</h2>
        <p className="text-sm text-muted-foreground">View enrolled students across your batches</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading students...</p>
      ) : students.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No students enrolled in your batches yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {students.map((s) => (
            <Card key={s.id} className="border-border bg-card py-0">
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.user.name}</p>
                    <p className="text-xs text-muted-foreground">{s.user.email}{s.user.phone ? ` · +91 ${s.user.phone}` : ""}</p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{s.user.status}</Badge>
                </div>
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{s.batch.title} ({s.batch.examSlug.toUpperCase()})</span>
                  <span>{s.progress}%</span>
                </div>
                <Progress value={s.progress} className="h-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Enrolled {new Date(s.enrolledAt).toLocaleDateString("en-IN")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
