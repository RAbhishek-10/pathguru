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
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground/80">{batch.examSlug.toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">{batch.mode}</p>
          </div>
        </div>
        {batch.tags[0] && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground text-xs">{batch.tags[0]}</Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-xs font-medium text-primary">{batch.examSlug.toUpperCase()}</p>
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">{batch.title}</h3>
        
        {!compact && (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{batch.description}</p>
        )}

        {/* Rating */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-foreground">{batch.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({batch.reviewCount.toLocaleString()})</span>
          <span className="text-xs text-muted-foreground">|</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            {batch.enrolledCount.toLocaleString()}
          </div>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">{"₹"}{batch.discountedPrice.toLocaleString()}</span>
            {batch.price !== batch.discountedPrice && (
              <span className="text-xs text-muted-foreground line-through">{"₹"}{batch.price.toLocaleString()}</span>
            )}
          </div>
          <Link href={`/batch/${batch.id}`}>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">View</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
