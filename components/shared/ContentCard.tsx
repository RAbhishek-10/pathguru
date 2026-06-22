"use client"

import Link from "next/link"
import { Star, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Batch } from "@/lib/types"

interface ContentCardProps {
  batch: Batch
  compact?: boolean
}

export default function ContentCard({ batch, compact = false }: ContentCardProps) {
  return (
    <div className="pg-card group flex flex-col overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-[#EEF5FF]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A4DBF]/15 to-[#1E88FF]/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold text-[#072A63]/80">{batch.examSlug.toUpperCase()}</p>
            <p className="text-xs capitalize text-muted-foreground">{batch.mode}</p>
          </div>
        </div>
        {batch.tags[0] && (
          <Badge className="absolute left-3 top-3 border-0 bg-[#FF7A1A] text-xs text-white shadow-sm">{batch.tags[0]}</Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#1E88FF]">{batch.examSlug}</p>
        <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-[#0A4DBF]">{batch.title}</h3>

        {!compact && (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{batch.description}</p>
        )}

        <div className="mb-4 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-[#FF7A1A] text-[#FF7A1A]" />
            <span className="text-xs font-semibold text-foreground">{batch.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({batch.reviewCount.toLocaleString()})</span>
          <span className="text-xs text-muted-foreground">|</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {batch.enrolledCount.toLocaleString()}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">{"₹"}{batch.discountedPrice.toLocaleString()}</span>
            {batch.price !== batch.discountedPrice && (
              <span className="text-xs text-muted-foreground line-through">{"₹"}{batch.price.toLocaleString()}</span>
            )}
          </div>
          <Button size="sm" asChild>
            <Link href={`/batch/${batch.id}`}>View</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
