"use client"

import { useState } from "react"
import { ShoppingCart, Star, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/CartContext"
import type { Book } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"
import { toast } from "sonner"

export default function BooksStorePage() {
  const { data: books, loading } = useFetch<Book[]>("/api/books", [])
  const [search, setSearch] = useState("")
  const { addItem } = useCart()

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <p className="p-12 text-center text-muted-foreground">Loading...</p>

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Books Store</h1>
        <p className="text-muted-foreground">Get physical books delivered to your doorstep</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search books..." className="bg-card pl-9 text-foreground" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((book) => (
          <Card key={book.id} className="group overflow-hidden border-border bg-card transition-shadow hover:shadow-md">
            <div className="aspect-[3/4] bg-muted/30 p-6">
              <div className="flex h-full items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                <div className="text-center">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">TrueEducator</p>
                  <p className="text-sm font-bold text-foreground">{book.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{book.author}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3.5 w-3.5 fill-chart-5 text-chart-5" />
                  <span className="text-xs font-medium text-foreground">{book.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">{book.pages} pages</span>
              </div>
              <h3 className="mb-1 text-sm font-semibold text-foreground">{book.title}</h3>
              <p className="mb-3 text-xs text-muted-foreground">by {book.author}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {book.discountedPrice ? (
                    <>
                      <span className="text-lg font-bold text-foreground">{"₹"}{book.discountedPrice}</span>
                      <span className="text-xs text-muted-foreground line-through">{"₹"}{book.price}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-foreground">{"₹"}{book.price}</span>
                  )}
                </div>
                {book.inStock ? (
                  <Button size="sm" className="gap-1 bg-primary text-primary-foreground" onClick={() => {
                    addItem({ id: book.id, type: "book", title: book.title, price: book.discountedPrice || book.price })
                    toast.success("Added to cart")
                  }}>
                    <ShoppingCart className="h-3.5 w-3.5" /> Add
                  </Button>
                ) : (
                  <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Filter className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No books found</p>
          <p className="text-xs text-muted-foreground">Try a different search</p>
        </div>
      )}
    </div>
  )
}
