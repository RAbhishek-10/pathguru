"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Star, Users, ShoppingCart, Play, Heart, Share2, Check, Lock, FileText, Clock, Video, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { useRouter } from "next/navigation"
import type { Note, TestSeries } from "@/lib/types"
import type { Batch, Lecture } from "@/lib/types"
import { toast } from "sonner"

export default function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { addItem } = useCart()
  const [batch, setBatch] = useState<(Batch & { lectures?: Lecture[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [wishlisted, setWishlisted] = useState(false)
  const [ratingInput, setRatingInput] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [reviewsList, setReviewsList] = useState([
    { name: "Ankit Kumar", rating: 5, text: "Excellent batch! The faculty explains concepts so clearly. Test series is very close to actual exam pattern.", date: "2 weeks ago" },
    { name: "Priya Singh", rating: 4, text: "Good study material and regular tests. Could improve the DPP difficulty level a bit.", date: "1 month ago" },
    { name: "Rahul Verma", rating: 5, text: "AI doubt resolution is a game changer. No more waiting for hours to get your doubts cleared.", date: "1 month ago" },
  ])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const list = localStorage.getItem("wishlist") ? JSON.parse(localStorage.getItem("wishlist")!) : []
      setWishlisted(list.includes(id))
    }
  }, [id])

  useEffect(() => {
    fetch(`/api/batches/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setBatch)
      .finally(() => setLoading(false))
  }, [id])

  const isEnrolled = user?.enrolledBatches.includes(id) ?? false
  const batchLectures = batch?.lectures ?? []
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [testSeriesList, setTestSeriesList] = useState<TestSeries[]>([])

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

  const handleAddToCart = () => {
    if (!batch) return
    addItem({ id: batch.id, type: "batch", title: batch.title, price: batch.price, discountedPrice: batch.discountedPrice, thumbnail: batch.thumbnail, examSlug: batch.examSlug })
    toast.success("Added to cart!")
  }

  const handleEnroll = async () => {
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batchId: id }),
    })
    if (res.ok) {
      toast.success("Enrolled successfully!")
      await refreshUser()
      router.push(`/batch/${id}/learn`)
    } else {
      const err = await res.json()
      toast.error(err.error ?? "Enrollment failed")
    }
  }

  const handleWishlist = () => {
    if (typeof window !== "undefined") {
      const list = localStorage.getItem("wishlist") ? JSON.parse(localStorage.getItem("wishlist")!) : []
      if (list.includes(id)) {
        const updated = list.filter((x: string) => x !== id)
        localStorage.setItem("wishlist", JSON.stringify(updated))
        setWishlisted(false)
        toast.success("Removed from wishlist")
      } else {
        list.push(id)
        localStorage.setItem("wishlist", JSON.stringify(list))
        setWishlisted(true)
        toast.success("Added to wishlist")
      }
    }
  }

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: batch?.title || "Batch on PathGuru",
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("URL copied to clipboard!")
    }
  }

  const handleReviewSubmit = () => {
    if (!reviewText.trim()) {
      toast.error("Please enter a review message")
      return
    }
    const newReview = {
      name: user?.name || "Anonymous Student",
      rating: ratingInput,
      text: reviewText,
      date: "Just now"
    }
    setReviewsList([newReview, ...reviewsList])
    setReviewText("")
    toast.success("Thank you for your review!")
  }

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading batch...</div>
  if (!batch) return <div className="p-12 text-center text-destructive">Batch not found</div>

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-primary/[0.04] to-background py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <Link href={`/exam/${batch.examSlug}`} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {batch.examSlug.toUpperCase()} Batches
          </Link>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap gap-2">
                {batch.tags.map((tag) => (
                  <Badge key={tag} className="bg-primary/10 text-primary" variant="secondary">{tag}</Badge>
                ))}
              </div>
              <h1 className="mb-3 text-2xl font-bold text-foreground md:text-3xl">{batch.title}</h1>
              <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{batch.description}</p>
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-foreground">{batch.rating}</span>
                  <span className="text-sm text-muted-foreground">({batch.reviewCount.toLocaleString()} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" /> {batch.enrolledCount.toLocaleString()} enrolled
                </div>
                <Badge variant="outline" className="capitalize">{batch.mode}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Faculty: {batch.faculty.map((f) => f.name).join(", ")}
              </p>
            </div>

            {/* Price card */}
            <Card className="w-full max-w-sm border-border bg-card py-0 lg:sticky lg:top-20">
              <CardContent className="p-6">
                <div className="mb-4 flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-foreground">{"₹"}{batch.discountedPrice.toLocaleString()}</span>
                  {batch.price !== batch.discountedPrice && (
                    <span className="text-lg text-muted-foreground line-through">{"₹"}{batch.price.toLocaleString()}</span>
                  )}
                  {batch.price !== batch.discountedPrice && (
                    <Badge className="bg-success text-success-foreground">{Math.round(((batch.price - batch.discountedPrice) / batch.price) * 100)}% off</Badge>
                  )}
                </div>

                {isEnrolled ? (
                  <Link href={`/batch/${batch.id}/learn`} className="block">
                    <Button className="w-full gap-2 bg-success text-success-foreground hover:bg-success/90" size="lg">
                      <Play className="h-4 w-4" /> Continue Learning
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button onClick={handleEnroll} className="w-full gap-2 bg-primary text-primary-foreground" size="lg">
                      <Play className="h-4 w-4" /> Enroll Now
                    </Button>
                    <Button onClick={handleAddToCart} variant="outline" className="w-full gap-2" size="lg">
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </Button>
                  </div>
                )}

                 <div className="mt-4 flex gap-2">
                  <Button onClick={handleWishlist} variant="ghost" size="sm" className="flex-1 gap-1 text-muted-foreground">
                    <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} /> Wishlist
                  </Button>
                  <Button onClick={handleShare} variant="ghost" size="sm" className="flex-1 gap-1 text-muted-foreground">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>

                <div className="mt-5 border-t border-border pt-5">
                  <h4 className="mb-3 text-sm font-semibold text-foreground">{"What's included:"}</h4>
                  <ul className="flex flex-col gap-2">
                    {batch.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-success" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
            <TabsTrigger value="lectures">Lectures</TabsTrigger>
            <TabsTrigger value="notes">Notes & DPPs</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="max-w-3xl">
              <h2 className="mb-4 text-lg font-semibold text-foreground">About this Batch</h2>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{batch.description} This comprehensive batch covers the entire syllabus with daily live classes, weekly tests, and dedicated doubt-clearing sessions. Our proven methodology has helped thousands of students achieve top ranks.</p>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Schedule</h3>
              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                <Card className="border-border bg-card py-0"><CardContent className="flex items-center gap-3 p-4"><Clock className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Start Date</p><p className="text-sm font-medium text-foreground">{new Date(batch.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div></CardContent></Card>
                <Card className="border-border bg-card py-0"><CardContent className="flex items-center gap-3 p-4"><Video className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Mode</p><p className="text-sm font-medium capitalize text-foreground">{batch.mode}</p></div></CardContent></Card>
              </div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">Rating Breakdown</h3>
              <div className="flex flex-col gap-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = star === 5 ? 65 : star === 4 ? 22 : star === 3 ? 8 : star === 2 ? 3 : 2
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-8 text-right text-xs text-muted-foreground">{star} star</span>
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="w-8 text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="syllabus">
            <SyllabusTree isEnrolled={isEnrolled} />
          </TabsContent>

          <TabsContent value="lectures">
            <div className="flex flex-col gap-3">
              {batchLectures.map((lec) => (
                <Card key={lec.id} className="border-border bg-card py-0">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg bg-muted">
                      {isEnrolled || lec.isFree ? <Play className="h-5 w-5 text-primary" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">{lec.title}</h4>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{lec.duration}</span>
                        <Badge variant="outline" className="text-xs">{lec.subject}</Badge>
                        {lec.isFree && <Badge className="bg-success/10 text-success text-xs" variant="secondary">Free</Badge>}
                      </div>
                    </div>
                    {lec.isCompleted && <Check className="h-5 w-5 text-success" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allNotes.slice(0, 4).map((note) => (
                <Card key={note.id} className="border-border bg-card py-0">
                  <CardContent className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="mb-1 text-sm font-semibold text-foreground">{note.title}</h4>
                    <p className="mb-3 text-xs text-muted-foreground">{note.pages} pages | {note.subject}</p>
                    <Button size="sm" variant={isEnrolled || note.isFree ? "default" : "outline"} className={isEnrolled || note.isFree ? "bg-primary text-primary-foreground" : ""}>
                      {isEnrolled || note.isFree ? "Download" : `₹${note.price}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tests">
            <div className="flex flex-col gap-3">
              {testSeriesList.slice(0, 3).map((test) => (
                <Card key={test.id} className="border-border bg-card py-0">
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{test.title}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <span className="text-xs text-muted-foreground">{test.totalQuestions} questions</span>
                        <span className="text-xs text-muted-foreground">{test.duration} min</span>
                        <span className="text-xs text-muted-foreground">{test.totalMarks} marks</span>
                        <Badge variant="outline" className="capitalize text-xs">{test.mode}</Badge>
                      </div>
                    </div>
                    <Button size="sm" className={isEnrolled || test.isFree ? "bg-primary text-primary-foreground" : ""} variant={isEnrolled || test.isFree ? "default" : "outline"}>
                      {isEnrolled || test.isFree ? "Attempt" : `₹${test.price}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faculty">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {batch.faculty.map((f) => (
                <Card key={f.id} className="border-border bg-card py-0">
                  <CardContent className="p-5">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">{f.name.charAt(0)}</div>
                    <h4 className="text-sm font-semibold text-foreground">{f.name}</h4>
                    <p className="text-xs font-medium text-primary">{f.subject}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{f.bio}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{f.experience}+ years of experience</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="flex flex-col gap-4">
              {isEnrolled && (
                <Card className="border-border bg-card py-0">
                  <CardContent className="p-5">
                    <h4 className="mb-3 text-sm font-semibold text-foreground">Write a Review</h4>
                    <div className="mb-3 flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          onClick={() => setRatingInput(s)}
                          className={`h-6 w-6 cursor-pointer transition-colors ${
                            s <= ratingInput ? "fill-amber-400 text-amber-400" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground"
                      rows={3}
                      placeholder="Share your experience..."
                    />
                    <Button onClick={handleReviewSubmit} size="sm" className="mt-3 bg-primary text-primary-foreground">
                      Submit Review
                    </Button>
                  </CardContent>
                </Card>
              )}
              {reviewsList.map((r, i) => (
                <Card key={i} className="border-border bg-card py-0">
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{r.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.date}</p>
                      </div>
                    </div>
                    <div className="mb-2 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}

function SyllabusTree({ isEnrolled }: { isEnrolled: boolean }) {
  const syllabus = [
    {
      unit: "Unit 1: Mechanics",
      topics: [
        { name: "Laws of Motion", items: [{ type: "lecture", name: "Introduction to Mechanics" }, { type: "note", name: "Newton's Laws Summary" }, { type: "test", name: "Mechanics Quiz 1" }] },
        { name: "Work, Energy & Power", items: [{ type: "lecture", name: "Work-Energy Theorem" }, { type: "note", name: "WEP Formula Sheet" }] },
      ],
    },
    {
      unit: "Unit 2: Thermodynamics",
      topics: [
        { name: "Heat & Temperature", items: [{ type: "lecture", name: "Thermodynamic Laws" }, { type: "note", name: "Heat Transfer Notes" }] },
        { name: "Kinetic Theory", items: [{ type: "lecture", name: "Ideal Gas Laws" }, { type: "test", name: "Thermo Quiz" }] },
      ],
    },
    {
      unit: "Unit 3: Electrodynamics",
      topics: [
        { name: "Current Electricity", items: [{ type: "lecture", name: "Ohm's Law & Circuits" }, { type: "note", name: "Circuit Analysis" }] },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      {syllabus.map((unit, ui) => (
        <Collapsible key={ui} defaultOpen={ui === 0}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted">
            <span className="text-sm font-semibold text-foreground">{unit.unit}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1">
            {unit.topics.map((topic, ti) => (
              <div key={ti} className="ml-4 mt-2 rounded-lg border border-border bg-card p-3">
                <p className="mb-2 text-sm font-medium text-foreground">{topic.name}</p>
                <div className="flex flex-col gap-1.5">
                  {topic.items.map((item, ii) => (
                    <div key={ii} className="flex items-center gap-2 text-xs text-muted-foreground">
                      {item.type === "lecture" ? <Video className="h-3.5 w-3.5 text-blue-500" /> : item.type === "note" ? <FileText className="h-3.5 w-3.5 text-emerald-500" /> : <Clock className="h-3.5 w-3.5 text-orange-500" />}
                      <span>{item.name}</span>
                      {!isEnrolled && <Lock className="ml-auto h-3 w-3" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
