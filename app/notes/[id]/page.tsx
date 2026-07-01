"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Download, Lock, ShoppingCart, HelpCircle, Eye, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import type { Note } from "@/lib/types"
import { toast } from "sonner"

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { addItem } = useCart()

  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedNotes, setRelatedNotes] = useState<Note[]>([])

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setNote(data)
        if (data?.examSlug) {
          fetch(`/api/notes?examSlug=${data.examSlug}`)
            .then((r) => r.json())
            .then((list: Note[]) => {
              setRelatedNotes(list.filter((n) => n.id !== id).slice(0, 3))
            })
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading study material...</div>
  if (!note) return <div className="p-12 text-center text-destructive">Note details not found</div>

  const isPurchased = user?.purchasedNotes.includes(note.id) ?? false
  const hasAccess = note.isFree || isPurchased || user?.role === "admin" || user?.role === "faculty"

  const handleAddToCart = () => {
    addItem({
      id: note.id,
      title: note.title,
      price: note.price,
      type: "note",
      examSlug: note.examSlug,
      thumbnail: note.thumbnail
    })
    toast.success("Added to cart!")
    router.push("/cart")
  }

  const handleDownload = () => {
    toast.success("Downloading PDF file...")
    // Simulate downloading by opening a sample PDF in new tab
    window.open("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", "_blank")
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <Link href="/notes" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Notes List
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Note Details Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="capitalize text-xs">{note.examSlug.toUpperCase()}</Badge>
                <Badge variant="secondary" className="capitalize text-xs">{note.subject}</Badge>
                {note.isFree && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Free Access</Badge>}
                {isPurchased && <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">Unlocked</Badge>}
              </div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">{note.title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{note.pages} Pages of high-yield exam preparation notes compiled by expert educators.</p>
            </div>

            {/* Price section on desktop */}
            <div className="hidden md:flex flex-col items-end shrink-0 border border-border bg-card p-4 rounded-xl">
              {hasAccess ? (
                <div className="flex flex-col gap-2">
                  <Badge className="bg-success text-success-foreground w-fit ml-auto">UNLOCKED</Badge>
                  <Button onClick={handleDownload} className="gap-2 bg-primary text-primary-foreground">
                    <Download className="h-4 w-4" /> Download PDF
                  </Button>
                </div>
              ) : (
                <div className="text-right flex flex-col gap-2">
                  <span className="text-2xl font-bold text-foreground">{"₹"}{note.price}</span>
                  <Button onClick={handleAddToCart} className="gap-2 bg-primary text-primary-foreground">
                    <ShoppingCart className="h-4 w-4" /> Buy Study Material
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Container */}
          <div className="relative aspect-[3/4] w-full max-w-xl mx-auto overflow-hidden rounded-xl border border-border bg-muted shadow-lg">
            {hasAccess ? (
              <div className="flex h-full w-full flex-col">
                <div className="flex items-center justify-between border-b border-border bg-card p-3">
                  <span className="text-xs font-semibold text-muted-foreground">PDF PREVIEW • 1 of {note.pages} pages</span>
                  <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={handleDownload}>
                    <Download className="h-3.5 w-3.5" /> Full PDF
                  </Button>
                </div>
                {/* Simulated interactive note reader */}
                <div className="flex-1 bg-white p-8 flex flex-col gap-6 text-black select-none overflow-y-auto">
                  <h2 className="text-center font-bold text-lg border-b pb-4 text-indigo-900 uppercase tracking-wider">{note.title}</h2>
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm text-indigo-700">1. CORE CONCEPTS SUMMARY</h3>
                    <p className="text-xs leading-relaxed text-neutral-600">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras interdum risus vitae elit pretium elementum. Pellentesque sed dolor nec risus lobortis viverra imperdiet in dolor.
                    </p>
                    <ul className="list-disc list-inside text-[11px] space-y-1.5 text-neutral-600 pl-2">
                      <li>Key Equation: ΔE = q + w (First Law of Thermodynamics)</li>
                      <li>Standard constant value approximations are used throughout this manual.</li>
                      <li>Review past 5 years MCQ patterns detailed in section 4.</li>
                    </ul>
                  </div>
                  <div className="mt-auto border-t pt-4 text-center">
                    <Button onClick={handleDownload} variant="outline" size="sm" className="gap-1.5 border-dashed border-indigo-300 text-indigo-700">
                      <Eye className="h-3.5 w-3.5" /> Read remaining pages ({note.pages - 1} pages)
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-neutral-900 to-black text-white">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Paid Content Restricted</h3>
                <p className="max-w-xs mt-2 text-xs text-neutral-400">Unlock this note to view and download all {note.pages} pages of study material.</p>
                <div className="mt-6 flex flex-col gap-2 w-full max-w-[200px]">
                  <Button onClick={handleAddToCart} className="w-full bg-primary text-primary-foreground gap-2">
                    <ShoppingCart className="h-4 w-4" /> Add to Cart (₹{note.price})
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Pricing bar for mobile */}
          <div className="flex md:hidden flex-col gap-2 border border-border bg-card p-4 rounded-xl">
            {hasAccess ? (
              <Button onClick={handleDownload} className="w-full gap-2 bg-primary text-primary-foreground">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-foreground">{"₹"}{note.price}</span>
                <Button onClick={handleAddToCart} className="gap-2 bg-primary text-primary-foreground">
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Related Notes */}
        <div>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <h3 className="font-bold text-sm text-foreground mb-4">Related Study Material</h3>
              <div className="flex flex-col gap-4">
                {relatedNotes.map((rel) => (
                  <Link key={rel.id} href={`/notes/${rel.id}`} className="group flex items-start gap-3 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{rel.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{rel.subject} · {rel.pages} pages</p>
                      <span className="text-xs font-bold text-foreground mt-1 block">{rel.isFree ? "Free" : `₹${rel.price}`}</span>
                    </div>
                  </Link>
                ))}
                {relatedNotes.length === 0 && (
                  <p className="text-xs text-muted-foreground">No other notes found for this category.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
