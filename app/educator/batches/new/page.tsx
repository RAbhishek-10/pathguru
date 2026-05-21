"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

export default function NewBatchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: "",
    slug: "",
    examSlug: "",
    description: "",
    price: "",
    discountedPrice: "",
    mode: "online",
    startDate: "",
    status: "active",
    tags: "",
    features: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/educator/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          examSlug: form.examSlug,
          description: form.description,
          price: parseFloat(form.price),
          discountedPrice: parseFloat(form.discountedPrice),
          mode: form.mode,
          startDate: form.startDate,
          status: form.status,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to create batch")
      }
      const batch = await res.json()
      toast.success("Batch created successfully!")
      router.push(`/educator/batches/${batch.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create batch")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/educator/batches" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to batches
      </Link>
      <h2 className="mb-6 text-xl font-bold text-foreground">Create New Batch</h2>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="title">Batch Title</Label>
              <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" required pattern="[a-z0-9-]+" placeholder="neet-arjuna-2026" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} className="mt-1.5" />
            </div>
            <div>
              <Label>Exam Category</Label>
              <Select value={form.examSlug} onValueChange={(v) => setForm({ ...form, examSlug: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select exam" /></SelectTrigger>
                <SelectContent>
                  {["neet", "jee", "gate", "upsc", "ctet", "rrb"].map((e) => (
                    <SelectItem key={e} value={e}>{e.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" required min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="discountedPrice">Discounted Price (₹)</Label>
                <Input id="discountedPrice" type="number" required min="0" value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })} className="mt-1.5" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Mode</Label>
                <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" placeholder="Bestseller, NEET 2026" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea id="features" rows={3} placeholder="400+ live classes&#10;Full test series" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="mt-1.5" />
            </div>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
              {loading ? "Creating..." : "Create Batch"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
