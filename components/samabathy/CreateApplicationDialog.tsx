"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ApplicationForm from "./ApplicationForm";
import { useRouter } from "next/navigation";

export default function CreateApplicationDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <PlusCircle className="h-4 w-4" />
          New Application
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            New Application
          </DialogTitle>
          <DialogDescription>
            Create a new entry for the Samabyathi funeral assistance scheme.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ApplicationForm isDialog={true} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
