/* Browser-based PDF preview for Bill Abstract */
import { useEffect, useState } from "react";
import { X, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateBillAbstractPDF } from "@/lib/pdf-generators/bill-abstract-pdf";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PreviewAbstractProps {
  open: boolean;
  onClose: () => void;
  pdfData: any | null;
}

export default function PreviewAbstract({
  open,
  onClose,
  pdfData,
}: PreviewAbstractProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let url: string | null = null;

    const generate = async () => {
      if (!open || !pdfData) return;
      setLoading(true);
      try {
        const bytes = await generateBillAbstractPDF(pdfData);
        const blob = new Blob([bytes], { type: "application/pdf" });
        url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (error) {
        console.error("Error generating preview PDF:", error);
        toast.error("Failed to generate preview");
      } finally {
        setLoading(false);
      }
    };

    generate();

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
      setPdfUrl(null);
    };
  }, [open, pdfData]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm md:text-base">
            Bill Abstract Preview (Browser PDF)
          </span>
          <span className="text-xs text-slate-300 hidden sm:inline">
            Use browser zoom / scale and print options to fit into 1–2 pages.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 gap-1"
            onClick={() => {
              if (pdfUrl) {
                const win = window.open(pdfUrl, "_blank");
                if (!win) {
                  toast.error("Please allow popups to print");
                }
              }
            }}
            disabled={loading || !pdfUrl}
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Open in New Tab</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-slate-800 flex items-center justify-center">
        {loading || !pdfUrl ? (
          <div className="flex flex-col items-center gap-3 text-slate-100">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Preparing preview…</p>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            title="Bill Abstract Preview"
            className="w-[95%] h-[95%] bg-white rounded-md shadow-2xl"
          />
        )}
      </div>
    </div>
  );
}

