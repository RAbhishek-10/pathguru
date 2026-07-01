"use client"

import { useEffect, useState } from "react"
import { User, Bell, Shield, Palette, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [examTarget, setExamTarget] = useState("neet")
  const [savingProfile, setSavingProfile] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteEmailInput, setDeleteEmailInput] = useState("")

  useEffect(() => {
    if (!user) return
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone)
    setExamTarget(user.examTarget ?? "neet")
  }, [user])

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      await updateProfile({ name, phone, examTarget })
      toast.success("Profile updated successfully!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Profile update failed")
    } finally {
      setSavingProfile(false)
    }
  }

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    setSavingPassword(true)
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Password update failed")
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password updated!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Password update failed")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Settings</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="profile" className="gap-1"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1"><Bell className="h-3.5 w-3.5" /> Notifications</TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1"><Palette className="h-3.5 w-3.5" /> Preferences</TabsTrigger>
          <TabsTrigger value="security" className="gap-1"><Shield className="h-3.5 w-3.5" /> Security</TabsTrigger>
        </TabsList>

        {/* Profile tab */}
        <TabsContent value="profile">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1 text-xs text-foreground">Full Name</Label>
                  <Input className="bg-background text-foreground" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 text-xs text-foreground">Email</Label>
                  <Input type="email" className="bg-background text-foreground" value={email} disabled />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1 text-xs text-foreground">Phone</Label>
                  <Input className="bg-background text-foreground" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 text-xs text-foreground">Target Exam</Label>
                  <Select value={examTarget} onValueChange={setExamTarget}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neet">NEET</SelectItem>
                      <SelectItem value="jee">JEE</SelectItem>
                      <SelectItem value="gate">GATE</SelectItem>
                      <SelectItem value="upsc">UPSC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-fit gap-2 bg-primary text-primary-foreground" onClick={saveProfile} disabled={savingProfile}>
                <Save className="h-4 w-4" /> {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications tab */}
        <TabsContent value="notifications">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {[
                { label: "Live class reminders", desc: "Get notified 30 minutes before live classes", default: true },
                { label: "Test result alerts", desc: "Receive notifications when test results are published", default: true },
                { label: "New content uploads", desc: "Get notified when new notes or lectures are uploaded", default: true },
                { label: "Promotional offers", desc: "Receive discount and offer notifications", default: false },
                { label: "Community updates", desc: "Get notified about peer discussions and forums", default: false },
                { label: "Email notifications", desc: "Receive notifications via email", default: true },
                { label: "SMS notifications", desc: "Receive important alerts via SMS", default: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.default} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences tab */}
        <TabsContent value="preferences">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">App Preferences</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Language</p>
                  <p className="text-xs text-muted-foreground">Select your preferred language</p>
                </div>
                <Select defaultValue="en">
                  <SelectTrigger className="w-40 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="hinglish">Hinglish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Video Quality</p>
                  <p className="text-xs text-muted-foreground">Default quality for live and recorded classes</p>
                </div>
                <Select defaultValue="auto">
                  <SelectTrigger className="w-40 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                    <SelectItem value="360p">360p</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Download over WiFi only</p>
                  <p className="text-xs text-muted-foreground">Restrict downloads to WiFi connections</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security tab */}
        <TabsContent value="security">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <Label className="mb-1 text-xs text-foreground">Current Password</Label>
                <Input type="password" className="max-w-md bg-background text-foreground" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-1 text-xs text-foreground">New Password</Label>
                  <Input type="password" className="bg-background text-foreground" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 text-xs text-foreground">Confirm Password</Label>
                  <Input type="password" className="bg-background text-foreground" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>
              <Button className="w-fit gap-2 bg-primary text-primary-foreground" onClick={updatePassword} disabled={savingPassword || !currentPassword || !newPassword}>
                <Shield className="h-4 w-4" /> {savingPassword ? "Updating..." : "Update Password"}
              </Button>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add extra security to your account</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div>
                <p className="mb-1 text-sm font-medium text-destructive">Delete Account</p>
                <p className="mb-3 text-xs text-muted-foreground">Permanently delete your account and all associated data.</p>
                <Button onClick={() => setShowDeleteDialog(true)} variant="destructive" size="sm">Delete My Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              Warning: Account Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs mt-1">
              Deleting your account is permanent and cannot be undone. You will lose access to all your enrolled courses, purchase history, and test results.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Please type your email <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-bold">{user?.email}</code> to confirm:
            </label>
            <Input
              value={deleteEmailInput}
              onChange={(e) => setDeleteEmailInput(e.target.value)}
              placeholder={user?.email || "Verify your email"}
              className="bg-background text-foreground text-sm mt-1"
            />
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => { setShowDeleteDialog(false); setDeleteEmailInput("") }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteEmailInput !== user?.email}
              onClick={() => {
                toast.error("Account deletion requested. (Simulated Sandbox)")
                setShowDeleteDialog(false)
                setDeleteEmailInput("")
              }}
            >
              Confirm Permanent Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
