"use client";

import { Button } from "@/components/ui/button";
import { Download, PrinterIcon as Print, Share } from "lucide-react";

interface ClientActionsProps {
  quotation: {
    nitNo: string;
    description?: string | null;
  };
}

export default function ClientActions({ quotation }: ClientActionsProps) {
  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  const handleDownload = () => {
    // You can implement PDF generation here
    alert("Downloading PDF...");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Quotation Notice - ${quotation.nitNo}`,
          text: quotation.description || "Check out this quotation notice.",
          url: window.location.href,
        })
        .catch(() => {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleShare}>
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button variant="outline" onClick={handleDownload}>
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>
      <Button onClick={handlePrint}>
        <Print className="h-4 w-4 mr-2" />
        Print
      </Button>
    </div>
  );
}
