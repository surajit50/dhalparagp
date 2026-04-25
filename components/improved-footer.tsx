"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Settings, User, ChevronUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export default function ImprovedFooter() {
  const { data: session } = useSession();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!session?.user) return null;

  const { name, email, image } = session.user;

  const handleLogout = () => {
    startTransition(async () => {
      await signOut({ redirect: false });
      router.push("/");
    });
  };

  const navigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <footer className="w-full lg:w-64 sticky bottom-0 z-20 border-t bg-background/80 backdrop-blur-md px-4 py-3">
      <div className="flex items-center justify-between">
        {/* User Popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted transition-all w-full justify-start"
            >
              <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                <AvatarImage src={image || undefined} alt={name || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                  {name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="hidden lg:flex flex-col text-left truncate">
                <span className="text-sm font-medium truncate">{name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {email}
                </span>
              </div>

              <ChevronUp
                className={`ml-auto h-4 w-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </PopoverTrigger>

          <AnimatePresence>
            {isOpen && (
              <PopoverContent
                align="start"
                className="w-60 p-2 rounded-2xl shadow-xl"
              >
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Profile */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-lg"
                    onClick={() => navigate("/admindashboard/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>

                  {/* Settings */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-lg"
                    onClick={() => navigate("/admindashboard/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>

                  <Separator className="my-2" />

                  {/* Logout */}
                  <Button
                    variant="ghost"
                    className="w-full justify-start rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={handleLogout}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Logout
                  </Button>
                </motion.div>
              </PopoverContent>
            )}
          </AnimatePresence>
        </Popover>

        {/* Mobile Quick Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isPending}
          className="lg:hidden text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </Button>
      </div>
    </footer>
  );
}
