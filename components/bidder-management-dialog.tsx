"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AddBidderTechnicalDetails from "@/components/form/AddBidder";

interface AddBidderDialogProps {
  workid: string;
  nitNumber: string | number;
  triggerText?: string;
  triggerClassName?: string;
  children?: React.ReactNode;
}

export default function AddBidderDialog({
  workid,
  nitNumber,
  triggerText = "Add Bidder Details",
  triggerClassName = "w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
  children,
}: AddBidderDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            className={triggerClassName}
            aria-label={`Add Bidder Details${
              nitNumber ? ` for NIT ${nitNumber}` : ""
            }`}
          >
            {triggerText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Bidder Details{nitNumber ? ` - ${nitNumber}` : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <AddBidderTechnicalDetails workid={workid} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
