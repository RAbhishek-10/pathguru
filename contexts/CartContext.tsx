"use client"

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { CartItem } from "@/lib/types"

interface CartContextType {
  items: CartItem[]
  total: number
  count: number
  couponCode: string | null
  discount: number
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [discount, setDiscount] = useState(0)

  const total = items.reduce((sum, item) => sum + (item.discountedPrice ?? item.price), 0) - discount
  const count = items.length

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setCouponCode(null)
    setDiscount(0)
  }, [])

  const applyCoupon = useCallback((code: string) => {
    if (code.toUpperCase() === "SAVE20") {
      setCouponCode(code.toUpperCase())
      setDiscount(items.reduce((sum, item) => sum + (item.discountedPrice ?? item.price), 0) * 0.2)
      return true
    }
    return false
  }, [items])

  const removeCoupon = useCallback(() => {
    setCouponCode(null)
    setDiscount(0)
  }, [])

  return (
    <CartContext.Provider value={{ items, total, count, couponCode, discount, addItem, removeItem, clearCart, applyCoupon, removeCoupon }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}
