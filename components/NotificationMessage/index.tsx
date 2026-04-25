"use client"

import { useState } from "react"
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const notificationsjson = [
  {
    title: "Your call has been confirmed",
    description: "1 hour ago",
    type: "success"
  },
  {
    title: "New message received",
    description: "2 hours ago",
    type: "info"
  },
  {
    title: "Subscription expiring soon",
    description: "3 hours ago",
    type: "warning"
  },
]

export default function NotificationMessage() {
  const [notifications, setNotifications] = useState(
    notificationsjson.map(notification => ({ 
      ...notification, 
      read: false,
      id: Math.random().toString(36).substr(2, 9)
    }))
  )

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const handleDismiss = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-transparent group transition-all"
        >
          <Bell className="h-5 w-5 transition-transform group-hover:-rotate-12" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center animate-pulse"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-0 shadow-xl">
        <Card className="border-0 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b p-4 bg-gradient-to-r from-primary/5 to-muted/5">
            <CardTitle className="text-lg font-bold text-primary">Notifications</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="text-primary hover:bg-primary/10"
              >
                Mark all read
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            {notifications.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-muted-foreground space-y-3">
                <CheckCircle className="h-10 w-10 text-green-500 opacity-75" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-3 transition-all",
                      !item.read ? "bg-accent/30 border-l-4 border-primary" : "opacity-75",
                      "hover:bg-accent/40 cursor-pointer group"
                    )}
                  >
                    <div className="shrink-0 pt-1">
                      {item.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {item.type === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                      {item.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleDismiss(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded-full"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
