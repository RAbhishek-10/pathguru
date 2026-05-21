"use client"

import { useState } from "react"
import { FileText, Download, Filter, BookOpen, FlaskConical, Calculator, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Note } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"

const typeIcons: Record<string, React.ReactNode> = {
  notes: <BookOpen className="h-4 w-4" />,
  dpp: <Calculator className="h-4 w-4" />,
  formula: <FlaskConical className="h-4 w-4" />,
  pyq: <FileText className="h-4 w-4" />,
}

export default function NotesPage() {
  const { data: notes } = useFetch<Note[]>("/api/notes", [])
  const [search, setSearch] = useState("")
  const [examFilter, setExamFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filtered = notes.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase())
    const matchExam = examFilter === "all" || n.examSlug === examFilter
    const matchType = typeFilter === "all" || n.type === typeFilter
    return matchSearch && matchExam && matchType
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Study Notes & Materials</h1>
        <p className="text-muted-foreground">Download notes, DPPs, formula sheets, and previous year papers</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search notes..." className="bg-card pl-9 text-foreground" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={examFilter} onValueChange={setExamFilter}>
          <SelectTrigger className="w-full bg-card sm:w-40"><SelectValue placeholder="Exam" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            <SelectItem value="neet">NEET</SelectItem>
            <SelectItem value="jee">JEE</SelectItem>
            <SelectItem value="gate">GATE</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full bg-card sm:w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="notes">Notes</SelectItem>
            <SelectItem value="dpp">DPP</SelectItem>
            <SelectItem value="formula">Formula Sheet</SelectItem>
            <SelectItem value="pyq">PYQ Papers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((note) => (
          <Card key={note.id} className="group border-border bg-card transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {typeIcons[note.type]}
                </div>
                <div className="flex gap-1.5">
                  <Badge variant="outline" className="text-xs capitalize">{note.examSlug}</Badge>
                  <Badge variant="secondary" className="text-xs capitalize">{note.type}</Badge>
                </div>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-foreground">{note.title}</h3>
              <p className="mb-3 text-xs text-muted-foreground">{note.subject} | {note.pages} pages</p>
              <div className="flex items-center justify-between">
                {note.isFree ? (
                  <Badge className="bg-success/10 text-success text-xs">Free</Badge>
                ) : (
                  <span className="text-sm font-bold text-foreground">{"₹"}{note.price}</span>
                )}
                <Button size="sm" variant={note.isFree ? "default" : "outline"} className={note.isFree ? "gap-1 bg-primary text-primary-foreground" : "gap-1"}>
                  <Download className="h-3.5 w-3.5" /> {note.isFree ? "Download" : "Buy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Filter className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No notes found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}
