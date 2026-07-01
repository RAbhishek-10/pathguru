"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Clock, Users, FileText, ArrowRight, Search, Filter, CheckCircle2, Lock, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TestSeries } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"
import { useCart } from "@/contexts/CartContext"
import { useRouter } from "next/navigation"

type TestSeriesWithPurchase = TestSeries & { isPurchased?: boolean }

export default function TestSeriesListPage() {
  const { data: testSeries, loading } = useFetch<TestSeriesWithPurchase[]>("/api/tests", [])
  const { data: examCategories } = useFetch<{ slug: string; name: string }[]>("/api/exams", [])
  const { addItem } = useCart()
  const router = useRouter()

  // Filter state
  const [search, setSearch] = useState("")
  const [examFilter, setExamFilter] = useState("all")
  const [accessFilter, setAccessFilter] = useState("all") // all | free | paid
  const [modeFilter, setModeFilter] = useState("all") // all | practice | scheduled
  const [activeTab, setActiveTab] = useState("all")

  const allTests = testSeries ?? []

  const filtered = useMemo(() => {
    return allTests.filter((t) => {
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
      const matchExam = examFilter === "all" || t.examSlug === examFilter
      const matchAccess = accessFilter === "all" || (accessFilter === "free" ? t.isFree : !t.isFree)
      const matchMode = modeFilter === "all" || t.mode === modeFilter
      return matchSearch && matchExam && matchAccess && matchMode
    })
  }, [allTests, search, examFilter, accessFilter, modeFilter])

  const myTests = allTests.filter((t) => t.isPurchased || t.isFree)
  const filteredMyTests = useMemo(() => {
    return myTests.filter((t) => {
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
      return matchSearch
    })
  }, [myTests, search])

  // Unique exam slugs for filter
  const examSlugs = useMemo(() => {
    const slugs = [...new Set(allTests.map((t) => t.examSlug.toLowerCase()))]
    return slugs
  }, [allTests])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="mb-8">
          <div className="h-8 w-48 rounded-lg bg-muted animate-pulse mb-2" />
          <div className="h-4 w-72 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Test Series</h1>
        <p className="text-muted-foreground">Practice with exam-pattern tests and track your progress</p>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search test series..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background text-foreground"
          />
        </div>
        <Select value={examFilter} onValueChange={setExamFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-background">
            <SelectValue placeholder="Exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            {examSlugs.map((slug) => (
              <SelectItem key={slug} value={slug} className="capitalize">{slug.toUpperCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={accessFilter} onValueChange={setAccessFilter}>
          <SelectTrigger className="w-full sm:w-36 bg-background">
            <SelectValue placeholder="Access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-background">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="practice">Practice</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-6 flex items-center justify-between">
          <TabsList className="bg-muted">
            <TabsTrigger value="all" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              All Tests
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 h-4">{filtered.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="mine" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              My Tests
              {myTests.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 h-4">{filteredMyTests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* All Tests */}
        <TabsContent value="all">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Filter className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No tests match your filters.</p>
              <Button variant="ghost" className="mt-3 text-primary" onClick={() => { setSearch(""); setExamFilter("all"); setAccessFilter("all"); setModeFilter("all") }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((test) => (
                <TestSeriesCard key={test.id} test={test} dispatch={addItem} router={router} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Tests */}
        <TabsContent value="mine">
          {filteredMyTests.length === 0 ? (
            <div className="py-16 text-center">
              <Lock className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="mb-2 text-sm font-medium text-foreground">No tests unlocked yet</p>
              <p className="mb-4 text-xs text-muted-foreground">Purchase a test series or attempt any free test to see it here.</p>
              <Button className="bg-primary text-primary-foreground" onClick={() => setActiveTab("all")}>
                Browse Tests
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredMyTests.map((test) => (
                <TestSeriesCard key={test.id} test={test} dispatch={addItem} router={router} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TestSeriesCard({
  test,
  dispatch: addItem,
  router,
}: {
  test: TestSeriesWithPurchase
  dispatch: any
  router: any
}) {
  const canAttempt = test.isFree || test.isPurchased

  return (
    <Card className="border-border bg-card py-0 transition-colors hover:border-primary/30">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{test.title}</h3>
            <Badge variant="outline" className="capitalize text-xs">{test.examSlug.toUpperCase()}</Badge>
            <Badge variant="secondary" className="capitalize text-xs">{test.mode}</Badge>
            {test.isFree && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs" variant="secondary">
                Free
              </Badge>
            )}
            {!test.isFree && test.isPurchased && (
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs" variant="secondary">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Purchased
              </Badge>
            )}
            {test.averageScore > 0 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                Avg: {test.averageScore.toFixed(0)} marks
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {test.totalQuestions} questions</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {test.duration} min</span>
            <span>{test.totalMarks} marks</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {test.attemptsCount.toLocaleString()} attempts</span>
            {test.scheduledDate && (
              <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-orange-600">
                📅 {new Date(test.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!test.isFree && !test.isPurchased && (
            <span className="text-lg font-bold text-foreground">{"₹"}{test.price}</span>
          )}
          {canAttempt ? (
            <Link href={`/test/${test.id}`}>
              <Button className="gap-2 bg-primary text-primary-foreground" size="sm">
                {test.isFree ? "Start Test" : "Attempt"} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <Button
              className="gap-2 bg-primary text-primary-foreground"
              size="sm"
              onClick={() => {
                addItem({ id: test.id, title: test.title, price: test.price ?? 0, type: "test" })
                router.push("/cart")
              }}
            >
              Buy Now <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
