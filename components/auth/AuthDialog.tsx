// components/auth/AuthDialog.tsx
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthDialogProps {
  children: React.ReactNode;
}

export function AuthDialog({ children }: AuthDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    return () => {
      if (!isOpen) router.replace("/");
    };
  }, [isOpen, router]);

  const handleOpenChange = (open: boolean) => {
    if (!open) router.replace("/");
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="rounded-lg p-0 max-w-[95vw] sm:max-w-md mx-4 my-8" // Added horizontal margin
        onInteractOutside={(e) => e.preventDefault()}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}
