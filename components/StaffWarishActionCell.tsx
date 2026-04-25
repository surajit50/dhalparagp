"use client";

import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getWarishFullDetails } from "@/action/warishApplicationAction";
import StaffWarishApplicationDetailsClient from "@/components/StaffWarishApplicationDetailsClient";

interface StaffWarishActionCellProps {
  applicationId: string;
}

export default function StaffWarishActionCell({ applicationId }: StaffWarishActionCellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const data = await getWarishFullDetails(applicationId);
      setDetails(data);
    } catch (error) {
      console.error("Failed to fetch details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setDetails(null);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hover:bg-indigo-50 hover:text-indigo-600 transition-all border-indigo-100"
        onClick={handleOpen}
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Warish Application Enquiry</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-muted-foreground animate-pulse">Loading application details...</p>
              </div>
            ) : details ? (
              <StaffWarishApplicationDetailsClient 
                application={details.application} 
                documents={details.application.WarishDocument || []}
                onClose={() => setOpen(false)}
              />
            ) : (
              <div className="text-center p-12 text-muted-foreground">
                <p>Failed to load application details. Please try again later.</p>
                <Button variant="outline" className="mt-4" onClick={handleOpen}>
                  Retry
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
