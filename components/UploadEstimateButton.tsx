"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { useToast } from "./ui/use-toast";

interface UploadEstimateButtonProps {
  workId: string;
  initialEstimateDocument?: string | null;
}

export function UploadEstimateButton({
  workId,
  initialEstimateDocument,
}: UploadEstimateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentDocument, setCurrentDocument] = useState<string | null>(
    initialEstimateDocument || null
  );
  const router = useRouter();
const { toast } = useToast();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast({ title: "Error", description: "Please upload a PDF document.", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Error", description: "File size should not exceed 5MB.", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    setUploadProgress(20);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    setUploadProgress(80);

    if (!response.ok) {
      throw new Error("File upload failed");
    }

    const data = await response.json();
    return data.url;
  };

  const onSubmit = async () => {
    if (!selectedFile) {
      toast({ title: "Error", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      setUploadProgress(10);

      // Upload file to storage
      const documentUrl = await uploadFileToStorage(selectedFile);
      setUploadProgress(90);

      // Save document URL to database
      const response = await fetch(`/api/works/${workId}/estimate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estimateDocument: documentUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to save document reference.");
      }

      setUploadProgress(100);
      setCurrentDocument(documentUrl);
      toast({ title: "Success", description: "Estimate document uploaded successfully!" });
      setIsOpen(false);
      setSelectedFile(null);
      setUploadProgress(0);
      router.refresh();
    } catch (error) {
      console.error("Upload Error:", error);
      toast({ title: "Error", description: "Something went wrong while uploading.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={currentDocument ? "outline" : "default"}
          size="sm"
          className={currentDocument ? "text-green-600 border-green-200 hover:bg-green-50" : ""}
        >
          {currentDocument ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Estimate Uploaded
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Estimate
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Estimate Document</DialogTitle>
          <DialogDescription>
            Upload the approved estimate document in PDF format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {currentDocument && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
              <div className="flex items-center text-green-700">
                <FileText className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Document Uploaded</span>
              </div>
              <Button size="sm" variant="outline" asChild>
                <a href={currentDocument} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 mr-2" /> View
                </a>
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="estimate-doc">
              {currentDocument ? "Replace Document (PDF only)" : "Select Document (PDF only)"}
            </Label>
            <Input
              id="estimate-doc"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </div>

          {isLoading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center text-gray-500">Uploading... {uploadProgress}%</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isLoading || !selectedFile}>
            {isLoading ? "Uploading..." : currentDocument ? "Replace Document" : "Upload Document"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
