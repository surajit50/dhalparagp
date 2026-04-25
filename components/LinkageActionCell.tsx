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
import { getLinkageCertificateDetails } from "@/action/linkage-actions";
import LinkagePrintDetailsClient from "@/components/LinkagePrintDetailsClient";

interface LinkageActionCellProps {
  certificateId: string;
}

export default function LinkageActionCell({ certificateId }: LinkageActionCellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const result = await getLinkageCertificateDetails(certificateId);
      if (result.success) {
        setDetails(result.data);
      } else {
        console.error("Failed to fetch details:", result.error);
      }
    } catch (error) {
      console.error("An error occurred while fetching details:", error);
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
        size="sm"
        className="bg-blue-700 hover:bg-blue-800 text-white"
        onClick={handleOpen}
      >
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Linkage Certificate Review</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
                <p className="text-muted-foreground animate-pulse font-medium">Loading certificate details...</p>
              </div>
            ) : details ? (
              <LinkagePrintDetailsClient cert={details} />
            ) : (
              <div className="text-center p-12 text-muted-foreground bg-gray-50 rounded-xl border border-dashed">
                <p>Failed to load certificate details. Please try again later.</p>
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
