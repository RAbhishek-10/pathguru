"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, ShoppingBag, ArrowRight, Tag, Shield, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

// Helper to load external scripts
const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, total, count, clearCart, couponCode, applyCoupon } = useCart()
  const { isAuthenticated, refreshUser, user } = useAuth()
  const [coupon, setCoupon] = useState("")
  const [checkingOut, setCheckingOut] = useState(false)

  // Simulation states
  const [showSimulatedGateway, setShowSimulatedGateway] = useState(false)
  const [simulatedOrderInfo, setSimulatedOrderInfo] = useState<{
    orderId: string
    amount: number
    currency: string
  } | null>(null)

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to checkout")
      router.push("/login")
      return
    }

    setCheckingOut(true)
    try {
      // 1. Initialize backend checkout order
      const initRes = await fetch("/api/orders/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            type: i.type,
            title: i.title,
            price: i.price,
            discountedPrice: i.discountedPrice,
          })),
          couponCode,
        }),
      })

      if (!initRes.ok) {
        const err = await initRes.json()
        throw new Error(err.error ?? "Checkout initialization failed")
      }

      const orderData = await initRes.json()

      // 2. Determine checkout path: Real Razorpay SDK vs. Mock Simulation
      if (orderData.isMock) {
        setSimulatedOrderInfo({
          orderId: orderData.orderId,
          amount: orderData.amount,
          currency: orderData.currency,
        })
        setShowSimulatedGateway(true)
      } else {
        const scriptLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js")
        if (!scriptLoaded) {
          throw new Error("Razorpay SDK failed to load. Are you offline?")
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount * 100,
          currency: orderData.currency,
          name: "TrueEducator",
          description: "Course and Test Prep Subscription",
          order_id: orderData.orderId,
          handler: async (response: any) => {
            await verifyPayment({
              orderId: orderData.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              isMock: false,
            })
          },
          prefill: {
            name: user?.name ?? "",
            email: user?.email ?? "",
          },
          theme: {
            color: "#6366f1",
          },
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed")
    } finally {
      setCheckingOut(false)
    }
  }

  const verifyPayment = async (verificationDetails: {
    orderId: string
    paymentId: string
    signature?: string
    isMock: boolean
  }) => {
    try {
      const verifyRes = await fetch("/api/orders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: verificationDetails.orderId,
          paymentId: verificationDetails.paymentId,
          signature: verificationDetails.signature,
          isMock: verificationDetails.isMock,
          items: items.map((i) => ({
            id: i.id,
            type: i.type,
            title: i.title,
            price: i.price,
            discountedPrice: i.discountedPrice,
          })),
          couponCode,
        }),
      })

      if (!verifyRes.ok) {
        const err = await verifyRes.json()
        throw new Error(err.error ?? "Payment verification failed")
      }

      clearCart()
      await refreshUser()
      toast.success("Payment successful! Course access unlocked.")
      router.push("/dashboard")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Payment verification failed")
    }
  }

  if (count === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center lg:px-6">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="mb-6 text-sm text-muted-foreground">Browse our courses, test series, and books to get started.</p>
        <Link href="/exam-categories">
          <Button className="gap-2 bg-primary text-primary-foreground">
            Browse Courses <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Shopping Cart ({count})</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <Card key={item.id} className="border-border bg-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/5">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                      {item.examSlug && <Badge variant="secondary" className="text-xs">{item.examSlug}</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{"₹"}{item.discountedPrice || item.price}</p>
                      {item.discountedPrice && (
                        <p className="text-xs text-muted-foreground line-through">{"₹"}{item.price}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div>
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Coupon code (SAVE20)" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="flex-1 bg-background text-foreground" />
                <Button variant="outline" size="sm" onClick={() => applyCoupon(coupon) ? toast.success("Coupon applied!") : toast.error("Invalid coupon")}>Apply</Button>
              </div>
              <Separator />
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({count} items)</span>
                  <span className="text-foreground">{"₹"}{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span className="text-success">-{"₹"}0</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST (18%)</span>
                  <span className="text-foreground">{"₹"}{Math.round(total * 0.18).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold text-foreground">
                  <span>Total</span>
                  <span>{"₹"}{Math.round(total * 1.18).toLocaleString()}</span>
                </div>
              </div>
              <Button className="w-full gap-2 bg-primary text-primary-foreground" onClick={handleCheckout} disabled={checkingOut}>
                {checkingOut ? "Processing..." : "Proceed to Checkout"} <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 text-center text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Secured by Razorpay. 7-day refund policy.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Simulated Payment Gateway Dialog */}
      <Dialog open={showSimulatedGateway} onOpenChange={setShowSimulatedGateway}>
        <DialogContent className="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-indigo-500" /> Razorpay Sandbox Gateway
            </DialogTitle>
            <DialogDescription>
              A sandbox checkout has been initiated. Since no active Razorpay key/secret environment variables are set, choose how to simulate the payment action:
            </DialogDescription>
          </DialogHeader>

          {simulatedOrderInfo && (
            <div className="my-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-foreground font-semibold">{simulatedOrderInfo.orderId}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Amount Due</span>
                <span className="font-bold text-foreground">{"₹"}{simulatedOrderInfo.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gateway Status</span>
                <Badge variant="outline" className="text-xs text-amber-500 border-amber-500 bg-amber-500/10">Testing Mode</Badge>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="gap-1.5 border-destructive hover:bg-destructive/10 text-destructive"
              onClick={() => {
                setShowSimulatedGateway(false)
                toast.error("Payment failed or cancelled by user.")
              }}
            >
              <XCircle className="h-4 w-4" /> Cancel Payment
            </Button>
            <Button
              className="gap-1.5 bg-success text-success-foreground hover:bg-success/90"
              onClick={() => {
                if (simulatedOrderInfo) {
                  setShowSimulatedGateway(false)
                  verifyPayment({
                    orderId: simulatedOrderInfo.orderId,
                    paymentId: `mock_pay_${Date.now()}`,
                    isMock: true,
                  })
                }
              }}
            >
              <CheckCircle className="h-4 w-4" /> Authorize Success
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

