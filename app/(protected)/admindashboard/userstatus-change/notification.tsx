"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast, Toaster } from "sonner";

export const NotificationHandler = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      toast.success(success, {
        duration: 3000,
      });
    }
    if (error) {
      toast.error(error, {
        duration: 3000,
      });
    }
  }, [searchParams]);

  return <Toaster position="top-right" expand={true} richColors />;
};
