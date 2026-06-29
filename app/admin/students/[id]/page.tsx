"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Wallet,
  BookOpen,
  Award,
  CreditCard,
  Plus,
  RefreshCw,
  Edit,
  Power,
  ShieldAlert,
  ClipboardList,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface StudentDetail {
  id: string
  name: string
  email: string
  phone: string | null
  status: string
  examTarget: string | null
  walletBalance: number
  referralCode: string
  createdAt: string
  enrollments: {
    id: string
    progress: number
    enrolledAt: string
    batch: { id: string; title: string; slug: string; examSlug: string; price: number }
  }[]
  purchases: {
    id: string
    itemId: string
    itemType: string
    purchasedAt: string
  }[]
  testResults: {
    id: string
    testId: string
    testName: string
    score: number
    totalMarks: number
    rank: number
    percentile: number
    completedAt: string
  }[]
}

export default function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // Master lists for manual assignments
  const [batchesList, setBatchesList] = useState<any[]>([])
  const [testsList, setTestsList] = useState<any[]>([])
  const [notesList, setNotesList] = useState<any[]>([])
  const [booksList, setBooksList] = useState<any[]>([])

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editExam, setEditExam] = useState("neet")
  const [updatingProfile, setUpdatingProfile] = useState(false)

  const [showWalletModal, setShowWalletModal] = useState(false)
  const [walletAmount, setWalletAmount] = useState("")
  const [walletAction, setWalletAction] = useState<"credit" | "debit">("credit")
  const [walletNote, setWalletNote] = useState("Manual adjustment")
  const [adjustingWallet, setAdjustingWallet] = useState(false)

  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState("")
  const [enrolling, setEnrolling] = useState(false)

  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [selectedItemType, setSelectedItemType] = useState<"test" | "note" | "book">("test")
  const [selectedItemId, setSelectedItemId] = useState("")
  const [grantingPurchase, setGrantingPurchase] = useState(false)

  const fetchStudentDetails = async () => {
    try {
      const res = await fetch(`/api/admin/students/${id}`)
      if (!res.ok) throw new Error("Student not found")
      const data = await res.json()
      setStudent(data)
      // Populate edit fields
      setEditName(data.name)
      setEditPhone(data.phone || "")
      setEditExam(data.examTarget || "neet")
    } catch (err) {
      toast.error("Failed to load student details")
      router.push("/admin/students")
    } finally {
      setLoading(false)
    }
  }

  const fetchMasterLists = async () => {
    try {
      // Fetch available batches
      const batchesRes = await fetch("/api/batches")
      if (batchesRes.ok) setBatchesList(await batchesRes.json())

      // Fetch test series
      const testsRes = await fetch("/api/tests")
      if (testsRes.ok) setTestsList(await testsRes.json())

      // Fetch notes
      const notesRes = await fetch("/api/notes")
      if (notesRes.ok) setNotesList(await notesRes.json())

      // Fetch books
      const booksRes = await fetch("/api/books")
      if (booksRes.ok) setBooksList(await booksRes.json())
    } catch (err) {
      console.error("Failed to load catalog lists", err)
    }
  }

  useEffect(() => {
    fetchStudentDetails()
    fetchMasterLists()
  }, [id])

  const toggleStatus = async () => {
    if (!student) return
    const nextStatus = student.status === "active" ? "SUSPENDED" : "ACTIVE"
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error("Failed to change status")
      toast.success(`Account ${nextStatus === "SUSPENDED" ? "suspended" : "activated"}!`)
      fetchStudentDetails()
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingProfile(true)
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone || null, examTarget: editExam }),
      })
      if (!res.ok) throw new Error("Update failed")
      toast.success("Profile details updated successfully")
      setShowEditModal(false)
      fetchStudentDetails()
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleAdjustWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(walletAmount)
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    setAdjustingWallet(true)
    try {
      const res = await fetch(`/api/admin/students/${id}/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, action: walletAction, note: walletNote }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to adjust balance")
      }
      toast.success(`Wallet successfully ${walletAction}ed with ₹${amt}!`)
      setWalletAmount("")
      setShowWalletModal(false)
      fetchStudentDetails()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to adjust balance")
    } finally {
      setAdjustingWallet(false)
    }
  }

  const handleEnrollBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBatch) {
      toast.error("Please select a batch")
      return
    }
    setEnrolling(true)
    try {
      const res = await fetch(`/api/admin/students/${id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId: selectedBatch }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to enroll")
      }
      toast.success("Student successfully enrolled in course!")
      setSelectedBatch("")
      setShowEnrollModal(false)
      fetchStudentDetails()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enrollment failed")
    } finally {
      setEnrolling(false)
    }
  }

  const handleGrantPurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemId) {
      toast.error("Please select an item")
      return
    }
    setGrantingPurchase(true)
    try {
      const res = await fetch(`/api/admin/students/${id}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selectedItemId, itemType: selectedItemType }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to add purchase")
      }
      toast.success(`Item manually awarded to student!`)
      setSelectedItemId("")
      setShowPurchaseModal(false)
      fetchStudentDetails()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Manual override failed")
    } finally {
      setGrantingPurchase(false)
    }
  }

  const getItemTitle = (itemId: string, type: string) => {
    if (type === "test") return testsList.find((t) => t.id === itemId)?.title ?? "Test Series"
    if (type === "note") return notesList.find((n) => n.id === itemId)?.title ?? "Study Note"
    if (type === "book") return booksList.find((b) => b.id === itemId)?.title ?? "Book"
    return "Assigned Item"
  }

  if (loading || !student) {
    return <p className="p-12 text-center text-muted-foreground animate-pulse">Loading student details dashboard...</p>
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link href="/admin/students" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Student Directory
        </Link>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Info card (Left) */}
        <Card className="w-full lg:w-80 border-border bg-card py-0 shrink-0">
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-2xl font-bold text-purple-700">
                {student.name.charAt(0)}
              </div>
              <h3 className="text-lg font-bold text-foreground">{student.name}</h3>
              <p className="text-xs text-muted-foreground">ID: {student.id}</p>
              <Badge className={`mt-2 border-none capitalize ${student.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-destructive/10 text-destructive"}`}>
                {student.status}
              </Badge>
            </div>

            <div className="space-y-3.5 border-t border-border pt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-purple-600" />
                <span className="truncate text-foreground" title={student.email}>{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-purple-600" />
                <span className="text-foreground">{student.phone ? `+91 ${student.phone}` : "No phone added"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0 text-purple-600" />
                <span className="text-foreground">Joined {new Date(student.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="h-4 w-4 shrink-0 text-purple-600" />
                <span className="text-foreground">Ref Code: <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold">{student.referralCode}</code></span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Button size="sm" variant="outline" onClick={() => setShowEditModal(true)} className="w-full gap-1.5 text-xs">
                <Edit className="h-3.5 w-3.5" /> Edit Profile
              </Button>
              <Button
                size="sm"
                variant={student.status === "active" ? "destructive" : "outline"}
                onClick={toggleStatus}
                className="w-full gap-1.5 text-xs"
              >
                <Power className="h-3.5 w-3.5" /> {student.status === "active" ? "Suspend Account" : "Activate Account"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard contents (Right) */}
        <div className="flex-1 space-y-6">
          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="border-border bg-card py-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">₹{student.walletBalance}</p>
                  <p className="text-xs text-muted-foreground">Wallet Balance</p>
                  <button onClick={() => setShowWalletModal(true)} className="mt-0.5 text-[10px] text-purple-600 hover:underline font-semibold block">Adjust Balance</button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card py-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{student.enrollments.length}</p>
                  <p className="text-xs text-muted-foreground">Enrolled Batches</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card py-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{student.purchases.length}</p>
                  <p className="text-xs text-muted-foreground">Purchased Items</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card py-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{student.testResults.length}</p>
                  <p className="text-xs text-muted-foreground">Test Attempts</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Lists tabs */}
          <Tabs defaultValue="batches" className="space-y-4">
            <TabsList className="bg-muted">
              <TabsTrigger value="batches">Enrolled Batches</TabsTrigger>
              <TabsTrigger value="purchases">Purchases Catalog</TabsTrigger>
              <TabsTrigger value="tests">Test Results</TabsTrigger>
            </TabsList>

            {/* Enrolled Batches tab */}
            <TabsContent value="batches">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold text-foreground">Enrolled Batches</CardTitle>
                  <Button size="sm" onClick={() => setShowEnrollModal(true)} className="gap-1 bg-purple-600 text-white hover:bg-purple-700">
                    <Plus className="h-3.5 w-3.5" /> Manual Enroll
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {student.enrollments.length === 0 ? (
                    <p className="p-8 text-center text-sm text-muted-foreground">Not enrolled in any batches yet.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {student.enrollments.map((e) => (
                        <div key={e.id} className="flex items-center justify-between p-4 text-sm hover:bg-slate-50/50">
                          <div>
                            <p className="font-semibold text-foreground">{e.batch.title}</p>
                            <p className="text-xs text-muted-foreground">Exam: {e.batch.examSlug.toUpperCase()} · Enrolled {new Date(e.enrolledAt).toLocaleDateString("en-IN")}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-foreground">{e.progress}%</span>
                            <p className="text-[10px] text-muted-foreground">Class progress</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Purchases catalog tab */}
            <TabsContent value="purchases">
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold text-foreground">Manual Purchases Override</CardTitle>
                  <Button size="sm" onClick={() => setShowPurchaseModal(true)} className="gap-1 bg-purple-600 text-white hover:bg-purple-700">
                    <Plus className="h-3.5 w-3.5" /> Award Item
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {student.purchases.length === 0 ? (
                    <p className="p-8 text-center text-sm text-muted-foreground">No custom purchases granted yet.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {student.purchases.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-4 text-sm hover:bg-slate-50/50">
                          <div>
                            <p className="font-semibold text-foreground">{getItemTitle(p.itemId, p.itemType)}</p>
                            <p className="text-xs text-muted-foreground capitalize">Type: {p.itemType} · Awarded {new Date(p.purchasedAt).toLocaleDateString("en-IN")}</p>
                          </div>
                          <Badge variant="outline" className="text-xs font-mono uppercase bg-slate-50 text-slate-700">{p.id.slice(0, 8)}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Test Results tab */}
            <TabsContent value="tests">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-foreground">Test Attempts Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {student.testResults.length === 0 ? (
                    <p className="p-8 text-center text-sm text-muted-foreground">Student has not attempted any mock tests yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-border bg-[#F8FAFC] text-[10px] font-semibold text-muted-foreground uppercase">
                            <th className="p-3">Test Name</th>
                            <th className="p-3">Score</th>
                            <th className="p-3">Percentile</th>
                            <th className="p-3">Rank</th>
                            <th className="p-3">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {student.testResults.map((tr) => (
                            <tr key={tr.id} className="border-b border-border text-sm hover:bg-slate-50/50">
                              <td className="p-3 font-medium text-foreground">{tr.testName}</td>
                              <td className="p-3 text-foreground">{tr.score}/{tr.totalMarks}</td>
                              <td className="p-3 text-foreground">{tr.percentile}%</td>
                              <td className="p-3 text-foreground">#{tr.rank}</td>
                              <td className="p-3 text-muted-foreground text-xs">{new Date(tr.completedAt).toLocaleDateString("en-IN")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Student Profile</DialogTitle>
            <DialogDescription>Modify student information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="editName">Full Name *</Label>
              <Input id="editName" required value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editPhone">Phone Number</Label>
              <Input id="editPhone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="9876543210" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editExam">Exam Target</Label>
              <Select value={editExam} onValueChange={setEditExam}>
                <SelectTrigger id="editExam"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="neet">NEET</SelectItem>
                  <SelectItem value="jee">JEE</SelectItem>
                  <SelectItem value="gate">GATE</SelectItem>
                  <SelectItem value="upsc">UPSC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} disabled={updatingProfile}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={updatingProfile}>
                {updatingProfile ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Wallet Balance adjustment modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Wallet className="h-5 w-5 text-amber-600" /> Adjust Wallet Balance
            </DialogTitle>
            <DialogDescription>Credit or debit funds directly on student account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustWallet} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Action Type</Label>
                <Select value={walletAction} onValueChange={(val: any) => setWalletAction(val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit (Add)</SelectItem>
                    <SelectItem value="debit">Debit (Deduct)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="walletAmount">Amount (₹) *</Label>
                <Input id="walletAmount" type="number" required placeholder="500" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="walletNote">Transaction Description</Label>
              <Input id="walletNote" value={walletNote} onChange={(e) => setWalletNote(e.target.value)} placeholder="Scholarship reward / Refund" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowWalletModal(false)} disabled={adjustingWallet}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={adjustingWallet}>
                {adjustingWallet ? "Adjusting..." : "Update Balance"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manual Enroll Modal */}
      <Dialog open={showEnrollModal} onOpenChange={setShowEnrollModal}>
        <DialogContent className="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Manual Batch Enrollment</DialogTitle>
            <DialogDescription>Enroll student in an active batch manually. Skip payment gate.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEnrollBatch} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Select Batch *</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger><SelectValue placeholder="Select course batch" /></SelectTrigger>
                <SelectContent>
                  {batchesList.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.title} ({b.examSlug.toUpperCase()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEnrollModal(false)} disabled={enrolling}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={enrolling}>
                {enrolling ? "Enrolling..." : "Enroll Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manual Purchase Override modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Manual Items Purchase Override</DialogTitle>
            <DialogDescription>Manually award custom items directly to student library.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGrantPurchase} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Item Type</Label>
                <Select value={selectedItemType} onValueChange={(val: any) => { setSelectedItemType(val); setSelectedItemId("") }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test Series</SelectItem>
                    <SelectItem value="note">Study Note</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Select Item *</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger><SelectValue placeholder="Select catalog item" /></SelectTrigger>
                  <SelectContent>
                    {selectedItemType === "test" &&
                      testsList.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                    {selectedItemType === "note" &&
                      notesList.map((n) => <SelectItem key={n.id} value={n.id}>{n.title}</SelectItem>)}
                    {selectedItemType === "book" &&
                      booksList.map((b) => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowPurchaseModal(false)} disabled={grantingPurchase}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={grantingPurchase}>
                {grantingPurchase ? "Granting..." : "Award Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
