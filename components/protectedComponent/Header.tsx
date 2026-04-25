import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserButtonProfile from "../auth/userButton";
import NotificationBell from "../NotificationBell";
import NotificationMessage from "../NotificationMessage";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SafeUser } from "@/types/safe-user";

export default async function Header() {
  const cuser = await currentUser();

  let userInfo: SafeUser | null = null;

  if (cuser?.id) {
    const user = await db.user.findUnique({
      where: { id: cuser.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    userInfo = user;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl shadow-sm">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* LEFT — Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Search projects, users..."
              className="pl-10 h-9 bg-muted/40 border-border/40 focus:bg-background focus:border-primary/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Admin Notifications */}
          {userInfo?.role === "admin" && (
            <div className="hidden sm:flex items-center gap-2">
              <NotificationBell />
              <NotificationMessage />
            </div>
          )}

          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* User Profile */}
          <UserButtonProfile user={userInfo} />
        </div>
      </div>
    </header>
  );
}
