import { Button } from "@/components/ui/button";
import { Eye, Download, FileText, Save } from "lucide-react";

export interface ActionButtonsProps {
  items: any[];
  selectedWorkId: string;
  loading: boolean;
  showPreview: boolean;
  setShowPreview: (value: boolean) => void;
  onSave: () => Promise<void>;
  onGeneratePDF: () => Promise<void>;
  onGenerateAbstractPDF?: () => Promise<void>;
  handlePrint?: () => void;
  isEditing?: boolean;
  onSaveTemplate?: () => void;
  pdfMode?: "detailed" | "abstract";
  setPdfMode?: (mode: "detailed" | "abstract") => void;
}

export default function ActionButtons({
  items,
  selectedWorkId,
  loading,
  showPreview,
  setShowPreview,
  onGeneratePDF,
  handlePrint,
  onSave,
  isEditing,
  onSaveTemplate,
  pdfMode,
  setPdfMode,
  onGenerateAbstractPDF,
}: ActionButtonsProps) {
  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <>
          <div className="flex bg-slate-100 p-1 rounded-md mb-2">
            <button
              onClick={() => setPdfMode?.("detailed")}
              className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${pdfMode === "detailed"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setPdfMode?.("abstract")}
              className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${pdfMode === "abstract"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Abstract
            </button>
          </div>

          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
            size="lg"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? "Hide" : "Preview"}
          </Button>

          <Button
            onClick={onGeneratePDF}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {loading ? "Generating..." : "Download PDF"}
          </Button>

          {onGenerateAbstractPDF && (
            <Button
              onClick={onGenerateAbstractPDF}
              disabled={loading}
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              size="lg"
            >
              <FileText className="mr-2 h-4 w-4" />
              {loading ? "Generating..." : "Download Abstract PDF"}
            </Button>
          )}

          <Button
            onClick={handlePrint}
            disabled={loading}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            <FileText className="mr-2 h-4 w-4" />
            Print
          </Button>
        </>
      )}

      <div className="flex gap-2">
        <Button
          onClick={onSave}
          disabled={loading || items.length === 0 || !selectedWorkId}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? (
            "Saving..."
          ) : isEditing ? (
            "Update Estimate"
          ) : (
            "Save Estimate"
          )}
        </Button>
      </div>

      {onSaveTemplate && items.length > 0 && (
        <Button
          onClick={onSaveTemplate}
          variant="outline"
          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
          size="lg"
        >
          <Save className="mr-2 h-4 w-4" />
          Save as Template
        </Button>
      )}
    </div>
  );
}
