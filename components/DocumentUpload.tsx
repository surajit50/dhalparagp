
"use client";

import { useState } from "react";
import { toast } from "./ui/use-toast";
import { Button } from "./ui/button";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  warishId: string;
  documentType: string;
  onUploadComplete: (url: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  children: React.ReactNode;
}

export const DocumentUpload = ({
  warishId,
  documentType,
  onUploadComplete,
  onUploadStart,
  onUploadEnd,
  children,
}: DocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getAcceptType = () => {
    switch (documentType) {
      case "death_certificate":
        return "application/pdf,image/*";
      case "application_form":
      case "affidavit":
      case "heir_proof":
        return "application/pdf";
      default:
        return "application/pdf";
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const acceptedTypes = getAcceptType().split(',');
    const fileType = file.type;
    const isValidType = acceptedTypes.some(type => 
      type === fileType || 
      (type === "image/*" && fileType.startsWith("image/")) ||
      (type === "application/pdf" && fileType === "application/pdf")
    );

    if (!isValidType) {
      toast({
        title: "Invalid File Type",
        description: `Please upload a ${getAcceptType().replace(',', ' or ')} file`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("warishId", warishId);
    formData.append("documentType", documentType);

    try {
      onUploadStart?.();

      const response = await fetch("/api/warish/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUploadComplete(data.url);
      setSelectedFile(null);

      toast({
        title: "Success",
        description: "Document uploaded successfully",
        duration: 3000,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Document upload failed. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      onUploadEnd?.();
      setUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <div>{children}</div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 min-w-0">
          {selectedFile ? (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate flex-1">
                {selectedFile.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={clearSelectedFile}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label
              htmlFor={`file-input-${documentType}`}
              className={cn(
                "flex items-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer",
                "hover:border-primary/50 transition-colors",
                "text-sm text-muted-foreground",
                uploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Upload className="h-4 w-4" />
              <span>Click to select or drag & drop</span>
            </label>
          )}

          <input
            type="file"
            id={`file-input-${documentType}`}
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
            accept={getAcceptType()}
          />
        </div>

        {selectedFile && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="min-w-[100px]"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
