"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Users, Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Batch } from "@/lib/types"

export default function EducatorBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/educator/batches")
      .then((r) => r.json())
      .then(setBatches)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">My Batches</h2>
          <p className="text-sm text-muted-foreground">Create and manage your course batches</p>
        </div>
        <Link href="/educator/batches/new">
          <Button className="gap-2 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" /> New Batch
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading batches...</p>
      ) : batches.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <p className="text-muted-foreground">You haven&apos;t created any batches yet.</p>
            <Link href="/educator/batches/new">
              <Button className="bg-primary text-primary-foreground">Create your first batch</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => (
            <Card key={batch.id} className="border-border bg-card py-0">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <Badge className="bg-primary/10 text-primary text-xs" variant="secondary">
                    {batch.examSlug.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">{batch.status}</Badge>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">{batch.title}</h3>
                <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {batch.enrolledCount} enrolled</span>
                  <span>₹{batch.discountedPrice.toLocaleString("en-IN")}</span>
                </div>
                <Link href={`/educator/batches/${batch.id}`}>
                  <Button size="sm" variant="outline" className="w-full gap-2">
                    <Pencil className="h-3.5 w-3.5" /> Manage
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
