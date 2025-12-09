"use client"

import { useNotifications } from "@/lib/notifications-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, CheckCheck, Trash2 } from "lucide-react"
import { useState } from "react"

export function NotificationsPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new_chapter":
        return "bg-accent/10 text-accent"
      case "favorite":
        return "bg-secondary/10 text-secondary"
      case "donation":
        return "bg-primary/10 text-primary"
      case "update":
        return "bg-blue-500/10 text-blue-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_chapter":
        return "📖"
      case "favorite":
        return "❤️"
      case "donation":
        return "🎁"
      case "update":
        return "✨"
      default:
        return "ℹ️"
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 hover:bg-muted rounded-lg transition-colors">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {unreadCount}
          </Badge>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <>
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-1 text-xs">
                    <CheckCheck className="w-3 h-3" />
                    Mark all
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1 text-xs">
                    <Trash2 className="w-3 h-3" />
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? "bg-muted/30" : ""}`}
                  >
                    <div className="flex gap-3">
                      <div className="text-2xl flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                          </div>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-muted-foreground hover:text-foreground flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleTimeString()}
                          </span>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs h-auto p-0 text-primary hover:bg-transparent"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Close on outside click */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
