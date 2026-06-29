"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Search, Filter, Plus, Users, ShieldAlert, Sparkles, Wallet, RefreshCw, ChevronRight, UserMinus, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Student {
  id: string
  name: string
  email: string
  phone: string | null
  status: string // active | suspended
  examTarget: string | null
  walletBalance: number
  referralCode: string
  createdAt: string
  enrollmentsCount: number
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [examFilter, setExamFilter] = useState("all")

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("password123") // Default template password
  const [examTarget, setExamTarget] = useState("neet")
  const [creating, setCreating] = useState(false)

  const fetchStudents = async (showRefIndicator = false) => {
    if (showRefIndicator) setRefreshing(true)
    try {
      const res = await fetch("/api/admin/students")
      if (!res.ok) throw new Error("Failed to fetch students")
      const data = await res.json()
      setStudents(data)
    } catch (err) {
      toast.error("Failed to load students directory")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.phone && s.phone.includes(search))

      const matchStatus = statusFilter === "all" || s.status === statusFilter
      const matchExam = examFilter === "all" || s.examTarget === examFilter

      return matchSearch && matchStatus && matchExam
    })
  }, [students, search, statusFilter, examFilter])

  // Stats calculation
  const stats = useMemo(() => {
    let total = students.length
    let active = students.filter((s) => s.status === "active").length
    let suspended = students.filter((s) => s.status === "suspended").length
    let totalWallet = students.reduce((sum, s) => sum + s.walletBalance, 0)
    return { total, active, suspended, totalWallet }
  }, [students])

  // Create Student handler
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error("Please fill in all required fields")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phone || undefined, password, examTarget }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to create student")
      }
      toast.success("Student registered successfully!")
      setShowAddModal(false)
      // Reset form
      setName("")
      setEmail("")
      setPhone("")
      setPassword("password123")
      setExamTarget("neet")
      fetchStudents()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Creation failed")
    } finally {
      setCreating(false)
    }
  }

  // Toggle Suspend Status handler
  const toggleSuspend = async (studentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "SUSPENDED" : "ACTIVE"
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error("Failed to change status")
      toast.success(`Student ${nextStatus === "SUSPENDED" ? "suspended" : "activated"} successfully!`)
      fetchStudents()
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Student Management</h2>
          <p className="text-sm text-muted-foreground">Manage accounts, wallet balances, and batch overrides</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchStudents(true)} disabled={refreshing} className="gap-1.5">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Users, label: "Total Students", value: stats.total, color: "text-purple-600 bg-purple-50" },
          { icon: UserCheck, label: "Active Students", value: stats.active, color: "text-emerald-600 bg-emerald-50" },
          { icon: ShieldAlert, label: "Suspended Students", value: stats.suspended, color: "text-destructive bg-destructive/10" },
          { icon: Wallet, label: "Total Wallet Balances", value: `₹${stats.totalWallet.toLocaleString()}`, color: "text-amber-600 bg-amber-50" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card py-0">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-white p-4 rounded-xl border border-border/60">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background text-foreground"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={examFilter} onValueChange={setExamFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-background">
            <SelectValue placeholder="Exam Target" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Targets</SelectItem>
            <SelectItem value="neet">NEET</SelectItem>
            <SelectItem value="jee">JEE</SelectItem>
            <SelectItem value="gate">GATE</SelectItem>
            <SelectItem value="upsc">UPSC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Directory Table */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
        {loading ? (
          <p className="p-8 text-center text-sm text-muted-foreground animate-pulse">Loading directory...</p>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No students found matching filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-[#F8FAFC] text-xs font-semibold text-muted-foreground uppercase">
                  <th className="p-4">Name / Info</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Wallet</th>
                  <th className="p-4">Ref Code</th>
                  <th className="p-4">Batches</th>
                  <th className="p-4">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border transition-colors hover:bg-slate-50/50">
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                        {student.phone && <p className="text-[10px] text-muted-foreground">+91 {student.phone}</p>}
                      </div>
                    </td>
                    <td className="p-4">
                      {student.examTarget ? (
                        <Badge variant="outline" className="text-xs uppercase">{student.examTarget}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 text-sm font-bold text-foreground">
                      ₹{student.walletBalance}
                    </td>
                    <td className="p-4 text-xs font-mono font-medium text-muted-foreground">
                      {student.referralCode}
                    </td>
                    <td className="p-4 text-sm text-foreground">
                      {student.enrollmentsCount}
                    </td>
                    <td className="p-4">
                      <Badge className={`text-xs capitalize border-none ${student.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-destructive/10 text-destructive"}`}>
                        {student.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSuspend(student.id, student.status)}
                          className={`text-xs hover:bg-slate-100 ${student.status === "active" ? "text-destructive" : "text-emerald-600"}`}
                        >
                          {student.status === "active" ? "Suspend" : "Activate"}
                        </Button>
                        <Link href={`/admin/students/${student.id}`}>
                          <Button size="sm" variant="outline" className="gap-1 text-xs">
                            Manage <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register New Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-purple-600" /> Register Student
            </DialogTitle>
            <DialogDescription>
              Create a new student account. They can login using these details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStudent} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rahul@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">Login Password *</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="examTarget">Target Exam</Label>
                <Select value={examTarget} onValueChange={setExamTarget}>
                  <SelectTrigger id="examTarget"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neet">NEET</SelectItem>
                    <SelectItem value="jee">JEE</SelectItem>
                    <SelectItem value="gate">GATE</SelectItem>
                    <SelectItem value="upsc">UPSC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} disabled={creating}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={creating}>
                {creating ? "Creating..." : "Register"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
