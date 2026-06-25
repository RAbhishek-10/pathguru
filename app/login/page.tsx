"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { signIn } from "next-auth/react"
import BrandLogo from "@/components/brand/BrandLogo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { toast.error("Please fill all fields"); return }
    try {
      await login(email, password)
      toast.success("Welcome back!")
      const meRes = await fetch("/api/users/me")
      const me = meRes.ok ? await meRes.json() : null
      if (me?.role === "faculty" || me?.role === "admin") {
        router.push("/educator")
      } else {
        router.push("/dashboard")
      }
    } catch {
      toast.error("Invalid email or password")
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch {
      toast.error("Google sign-in failed. Please try again.")
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#EEF5FF]/50 px-4 py-12">
      <Card className="w-full max-w-md rounded-2xl border-border/60 bg-card py-0 shadow-[0_8px_40px_rgba(10,77,191,0.1)]">
        <CardContent className="p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <BrandLogo size="lg" href={undefined} className="mb-6" />
            <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Login to your PathGuru account</p>
          </div>

          {/* Google Sign-In */}
          <Button
            id="google-signin-btn"
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-3 border-border/70 font-medium hover:bg-muted/50"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || isLoading}
          >
            {googleLoading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </Button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-medium text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email or Phone</Label>
              <Input id="email" type="text" placeholder="Enter email or phone" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPw ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password visibility">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="rounded border-input" /> Remember me
              </label>
              <Link href="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" id="login-submit-btn" disabled={isLoading || googleLoading} className="w-full bg-primary text-primary-foreground" size="lg">
              {isLoading ? "Logging in…" : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {"Don't have an account? "}<Link href="/register" className="font-medium text-primary hover:underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
