"use client";

import React, { useCallback, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { incrementDownloadCount } from "@/action/public-action";
import { toast } from "@/components/ui/use-toast";

interface Form {
  id: string;
  name: string;
  category: string;
  downloadUrl: string;
  downloadCount: number;
}

interface FormListProps {
  forms: Form[];
}

const Spinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
);

export default function FormList({ forms }: FormListProps) {
  const [downloadCounts, setDownloadCounts] = useState<{ [key: string]: number }>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleDownload = useCallback(async (form: Form) => {
    try {
      setLoadingIds(prev => new Set(prev).add(form.id));

      // Increment download count
      await incrementDownloadCount(form.id);
      setDownloadCounts(prev => ({ 
        ...prev, 
        [form.id]: (prev[form.id] || form.downloadCount) + 1 
      }));

      // Handle URL creation
      let downloadUrl;
      try {
        downloadUrl = new URL(form.downloadUrl);
      } catch {
        downloadUrl = new URL(form.downloadUrl, window.location.origin);
      }
      downloadUrl.searchParams.set("fl_attachment", "true");

      // Create hidden anchor for download
      const link = document.createElement('a');
      link.href = downloadUrl.toString();
      link.download = form.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      // Revert count on error
      setDownloadCounts(prev => ({ 
        ...prev, 
        [form.id]: (prev[form.id] || form.downloadCount) - 1 
      }));
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(form.id);
        return next;
      });
    }
  }, []);

  return (
    <ul className="grid gap-4">
      {forms.map((form) => {
        const currentCount = downloadCounts[form.id] ?? form.downloadCount;
        const isLoading = loadingIds.has(form.id);

        return (
          <li 
            key={form.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-lg shadow"
          >
            {/* Form Details */}
            <div className="mb-2 sm:mb-0">
              <h3 className="text-lg font-medium">{form.name}</h3>
              <span className="text-sm text-gray-500 block sm:inline sm:ml-2">
                ({form.category})
              </span>
            </div>

            {/* Download Section */}
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                Downloads: {currentCount}
              </span>
              <Button
                onClick={() => handleDownload(form)}
                disabled={isLoading}
                aria-label={`Download ${form.name}`}
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
