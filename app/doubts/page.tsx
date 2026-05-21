"use client"

import { useState } from "react"
import { Send, Bot, User, CheckCircle2, Clock, ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Doubt } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"
import { toast } from "sonner"

const statusConfig = {
  "ai-answered": { label: "AI Answered", icon: Bot, class: "bg-primary/10 text-primary" },
  "pending-human": { label: "Pending Review", icon: Clock, class: "bg-warning/10 text-warning-foreground" },
  "resolved": { label: "Resolved", icon: CheckCircle2, class: "bg-success/10 text-success" },
}

function DoubtCard({ doubt }: { doubt: Doubt }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = statusConfig[doubt.status]

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">{doubt.subject}</Badge>
            <Badge variant="secondary" className="text-xs">{doubt.topic}</Badge>
          </div>
          <Badge className={`text-xs ${cfg.class}`}>
            <cfg.icon className="mr-1 h-3 w-3" /> {cfg.label}
          </Badge>
        </div>
        <p className="mb-2 text-sm font-medium text-foreground">{doubt.question}</p>
        <p className="mb-3 text-xs text-muted-foreground">{new Date(doubt.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>

        {(doubt.aiResponse || doubt.facultyResponse) && (
          <button onClick={() => setExpanded(!expanded)} className="mb-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            {expanded ? "Hide" : "View"} Responses <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}

        {expanded && (
          <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-4">
            {doubt.aiResponse && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-xs font-semibold text-foreground">AI Assistant</p>
                    {doubt.aiConfidence && (
                      <Badge variant="outline" className="text-[10px]">{Math.round(doubt.aiConfidence * 100)}% confident</Badge>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{doubt.aiResponse}</p>
                </div>
              </div>
            )}
            {doubt.facultyResponse && (
              <div className="flex gap-3 border-t border-border pt-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/10">
                  <User className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-foreground">Faculty Response</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{doubt.facultyResponse}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DoubtsPage() {
  const { data: doubts, refetch } = useFetch<Doubt[]>("/api/doubts", [])
  const [newQ, setNewQ] = useState("")
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")

  const handleSubmit = async () => {
    if (!newQ.trim() || !subject || !topic.trim()) {
      toast.error("Please fill subject, topic, and question")
      return
    }
    const res = await fetch("/api/doubts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, topic, question: newQ }),
    })
    if (res.ok) {
      toast.success("Doubt submitted! AI response is ready.")
      setNewQ("")
      setSubject("")
      setTopic("")
      refetch()
    } else {
      toast.error("Please log in to submit doubts")
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Doubt Resolution</h1>
        <p className="text-muted-foreground">Ask your doubts and get instant AI answers or faculty responses</p>
      </div>

      {/* Ask new doubt */}
      <Card className="mb-8 border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> Ask a New Doubt
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1 text-xs text-foreground">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 text-xs text-foreground">Topic</Label>
              <Input placeholder="e.g., Thermodynamics" className="bg-background text-foreground" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="mb-1 text-xs text-foreground">Your Question</Label>
            <Textarea placeholder="Type your doubt here..." className="min-h-[100px] bg-background text-foreground" value={newQ} onChange={(e) => setNewQ(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">AI will respond instantly. Faculty review within 24 hours if needed.</p>
            <Button onClick={handleSubmit} className="gap-1 bg-primary text-primary-foreground" disabled={!newQ.trim()}>
              <Send className="h-4 w-4" /> Submit Doubt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Doubt list */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Your Doubts ({doubts.length})</h2>
      </div>
      <div className="flex flex-col gap-4">
        {doubts.map((d) => <DoubtCard key={d.id} doubt={d} />)}
      </div>
    </div>
  )
}
