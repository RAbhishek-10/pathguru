"use client"

import { useState } from "react"
import { Award, Trophy, ArrowRight, Sparkles, Clock, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const scholarshipTests = [
  { id: "st1", name: "NEST 2026 - National Eligibility Scholarship Test", exam: "NEET", discount: "Up to 90%", date: "15 Aug 2025", questions: 50, duration: 60, registered: 12500 },
  { id: "st2", name: "JEST 2026 - JEE Excellence Scholarship Test", exam: "JEE", discount: "Up to 80%", date: "20 Aug 2025", questions: 40, duration: 45, registered: 8900 },
  { id: "st3", name: "GATE Talent Hunt", exam: "GATE", discount: "Up to 75%", date: "25 Aug 2025", questions: 30, duration: 40, registered: 3400 },
]

const benefits = [
  { icon: Award, title: "Up to 90% Scholarship", desc: "Top performers get massive fee discounts on all batches" },
  { icon: Trophy, title: "Rank-based Rewards", desc: "Cash prizes and merchandise for top 100 rankers" },
  { icon: Sparkles, title: "Free Study Material", desc: "Free access to notes, DPPs, and formula sheets" },
  { icon: Users, title: "Mentorship Program", desc: "Personal mentorship from top faculty members" },
]

export default function ScholarshipPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", exam: "" })
  const [submitting, setSubmitting] = useState(false)

  const submitRegistration = async () => {
    if (!form.name || !form.phone || !form.email || !form.exam) {
      toast.error("Please fill all registration fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/scholarship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Registration failed")
      }
      setForm({ name: "", phone: "", email: "", exam: "" })
      toast.success("Scholarship registration submitted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      {/* Hero */}
      <div className="mb-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 text-center lg:p-12">
        <Award className="mx-auto mb-4 h-12 w-12 text-primary-foreground" />
        <h1 className="mb-3 text-3xl font-bold text-primary-foreground lg:text-4xl">Scholarship Program</h1>
        <p className="mx-auto max-w-xl text-sm text-primary-foreground/80">
          Take a free scholarship test and earn up to 90% discount on your batch fees. Over 50,000 students have already benefited from this program.
        </p>
      </div>

      {/* Benefits */}
      <div className="mb-12">
        <h2 className="mb-6 text-center text-2xl font-bold text-foreground">Why Apply?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <Card key={b.title} className="border-border bg-card text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">{b.title}</h3>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming tests */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-foreground">Upcoming Scholarship Tests</h2>
        <div className="flex flex-col gap-4">
          {scholarshipTests.map((test) => (
            <Card key={test.id} className="border-border bg-card">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{test.name}</h3>
                    <Badge variant="secondary" className="text-xs">{test.exam}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {test.duration} min</span>
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {test.questions} questions</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {test.registered.toLocaleString()} registered</span>
                    <span>Date: {test.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-success/10 text-success text-xs">{test.discount}</Badge>
                  <Button size="sm" className="gap-1 bg-primary text-primary-foreground">
                    Register Free <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Registration form */}
      <Card className="mx-auto max-w-lg border-border bg-card">
        <CardHeader>
          <CardTitle className="text-center text-lg font-bold text-foreground">Quick Registration</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1 text-sm text-foreground">Full Name</Label>
              <Input placeholder="Enter your name" className="bg-background text-foreground" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1 text-sm text-foreground">Phone</Label>
              <Input placeholder="10-digit mobile" className="bg-background text-foreground" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="mb-1 text-sm text-foreground">Email</Label>
            <Input type="email" placeholder="you@example.com" className="bg-background text-foreground" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1 text-sm text-foreground">Target Exam</Label>
            <Select value={form.exam} onValueChange={(exam) => setForm({ ...form, exam })}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Select exam" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="neet">NEET</SelectItem>
                <SelectItem value="jee">JEE</SelectItem>
                <SelectItem value="gate">GATE</SelectItem>
                <SelectItem value="upsc">UPSC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full bg-primary text-primary-foreground" onClick={submitRegistration} disabled={submitting}>
            {submitting ? "Registering..." : "Register for Scholarship Test"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            By registering, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
