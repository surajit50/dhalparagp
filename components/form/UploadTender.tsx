"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  nitDocumentSchema,
  NITDocumentSchema,
} from "@/schema/nitDocumentSchema";
import { useRouter } from "next/navigation";
import { Loader2, File, X } from "lucide-react";


interface UploadNITDocumentProps {
  nitId: string;
}

export default function UploadNITDocument({ nitId }: UploadNITDocumentProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const form = useForm<NITDocumentSchema>({
    resolver: zodResolver(nitDocumentSchema),
    mode: "onChange",
    defaultValues: {
      file: undefined,
    },
  });

  async function onSubmit(data: NITDocumentSchema) {
    if (!data.file) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file to upload",
      });
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("nitId", nitId);
      formData.append("fileName", data.file.name);
      formData.append("fileType", data.file.type);

      const uploadRes = await fetch("/api/upload-nit", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message ?? "File upload failed");
      }

      toast({
        title: "Success!",
        description: "NIT document uploaded successfully",
      });
      form.reset();
      setSelectedFile(null);
      router.back();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload document",
      });
    } finally {
      setIsUploading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "File size should not exceed 5MB",
        });
        return;
      }
      if (file.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Only PDF files are allowed",
        });
        return;
      }
      setSelectedFile(file);
      form.setValue("file", file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    // Use null instead of undefined for the file value
    form.setValue("file", null as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload NIT Document (PDF)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {!selectedFile ? (
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <File className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF (MAX. 5MB)
                          </p>
                        </div>
                        <Input
                          type="file"
                          className="hidden"
                          accept="application/pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <File className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium">
                          {selectedFile.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Choose a PDF file (max 5MB) to upload as the NIT document
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isUploading || !selectedFile}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
