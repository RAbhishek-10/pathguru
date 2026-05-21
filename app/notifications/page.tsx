"use client"

import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Notification } from "@/lib/types"
import { useFetch } from "@/lib/hooks/use-fetch"
import { toast } from "sonner"

const typeIcons = {
  info: { icon: Info, class: "bg-primary/10 text-primary" },
  success: { icon: CheckCircle2, class: "bg-success/10 text-success" },
  warning: { icon: AlertTriangle, class: "bg-warning/10 text-warning-foreground" },
}

export default function NotificationsPage() {
  const { data: notifications, loading, refetch } = useFetch<Notification[]>("/api/notifications", [])

  const markAllRead = async () => {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ readAll: true }),
    })
    if (res.ok) {
      toast.success("All notifications marked as read")
      refetch()
    }
  }

  if (loading) return <p className="p-12 text-center text-muted-foreground">Loading...</p>

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your learning activities</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1" onClick={markAllRead}>
          <CheckCheck className="h-4 w-4" /> Mark all read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <Bell className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const cfg = typeIcons[n.type]
            return (
              <Card key={n.id} className={`border-border bg-card ${!n.read ? "border-l-4 border-l-primary" : ""}`}>
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.class}`}>
                    <cfg.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
