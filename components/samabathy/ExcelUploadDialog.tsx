"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileUp,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ExcelUploadDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const router = useRouter();

  const downloadTemplate = () => {
    const template = [
      {
        applicantName: "John Doe",
        mobileNumber: "9876543210",
        villageName: "Dhalpara",
        deceasedName: "Jane Doe",
        relation: "Son",
        dateOfDeath: "2024-04-25",
        voterId: "ABC1234567",
        aadhaarNumber: "123456789012",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "samabyathi_template.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResults(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            toast.error("The Excel file is empty");
            setIsUploading(false);
            return;
          }

          // Send to API
          const response = await fetch("/api/samabathy/application/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ applications: jsonData }),
          });

          const result = await response.json();

          if (response.ok) {
            setResults({
              success: result.successCount,
              failed: result.failedCount,
              errors: result.errors || [],
            });
            toast.success(
              `Successfully uploaded ${result.successCount} applications`,
            );
            router.refresh();
          } else {
            toast.error(result.error || "Failed to upload applications");
          }
        } catch (error) {
          console.error("Error parsing Excel:", error);
          toast.error("Error parsing Excel file");
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Error reading file");
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FileUp className="h-4 w-4" />
          Upload Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Applications</DialogTitle>
          <DialogDescription>
            Upload multiple Samabyathi applications using an Excel file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <p className="text-sm font-medium">Download Template</p>
                <p className="text-xs text-muted-foreground">
                  Use our template to ensure correct formatting.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>

            <div className="relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors hover:bg-muted/50">
              <input
                type="file"
                accept=".xlsx, .xls"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              ) : (
                <FileUp className="h-10 w-10 text-muted-foreground" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isUploading ? "Processing..." : "Click or drag to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Only .xlsx and .xls files are supported
                </p>
              </div>
            </div>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Successful</p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-400">
                      {results.success}
                    </p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-400">
                      {results.failed}
                    </p>
                  </div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upload Issues</AlertTitle>
                  <AlertDescription className="max-h-[200px] overflow-y-auto mt-2">
                    <ul className="list-disc list-inside text-xs space-y-1">
                      {results.errors.slice(0, 10).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {results.errors.length > 10 && (
                        <li>...and {results.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
