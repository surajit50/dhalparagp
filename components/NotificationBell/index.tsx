"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Loader2,
  Inbox,
  RefreshCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Notification } from "@prisma/client";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);
      setError(null);
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAll = async () => {
    try {
      setMarking(true);
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      setNotifications((p) => p.map((n) => ({ ...n, read: true })));
    } finally {
      setMarking(false);
    }
  };

  const icon = (type: Notification["type"]) => {
    switch (type) {
      case "WARNING":
        return <Clock3 className="h-4 w-4 text-amber-500" />;
      case "ERROR":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-muted transition"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />

          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white shadow">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[420px] p-0 rounded-xl shadow-xl border"
      >
        <Card className="border-0 shadow-none">

          {/* HEADER */}
          <CardHeader className="sticky top-0 z-10 bg-white border-b px-4 py-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-base">
                Notifications
              </h3>

              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={load}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  disabled={unread === 0}
                  onClick={markAll}
                >
                  {marking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* BODY */}
          <CardContent className="p-0">
            <ul className="max-h-[420px] overflow-y-auto">

              {loading && (
                Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex gap-3 px-4 py-3">
                    <div className="h-4 w-4 rounded-full bg-muted animate-pulse mt-1"/>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 bg-muted animate-pulse rounded"/>
                      <div className="h-2 w-1/2 bg-muted animate-pulse rounded"/>
                    </div>
                  </li>
                ))
              )}

              {error && (
                <div className="p-6 text-center text-red-500 text-sm">
                  {error}
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="flex flex-col items-center p-8 text-muted-foreground">
                  <Inbox className="h-10 w-10 mb-3"/>
                  <p>No new notifications</p>
                </div>
              )}

              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 border-l-4 transition cursor-pointer",
                    !n.read
                      ? "bg-orange-50 border-orange-600"
                      : "border-transparent hover:bg-muted"
                  )}
                >
                  {icon(n.type)}

                  <div className="flex-1">
                    <p className={cn(
                      "text-sm",
                      !n.read && "font-semibold text-orange-700"
                    )}>
                      {n.message}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>

          {/* FOOTER */}
          <CardFooter className="border-t bg-muted/30 px-4 py-2">
            <Button
              variant="link"
              className="ml-auto text-sm"
            >
              View all notifications
            </Button>
          </CardFooter>

        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
