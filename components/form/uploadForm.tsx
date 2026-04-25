"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { addForm } from "@/action/public-action";

const formSchema = z.object({
  name: z.string().min(1, "Form name is required"),
  category: z.string().min(1, "Category is required"),
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine((file) => file.type === "application/pdf", "File must be a PDF"),
});

export default function UploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("category", values.category);
    formData.append("file", values.file);

    try {
      console.log("Submitting form with data:", {
        name: values.name,
        category: values.category,
        fileName: values.file.name,
      });

      const result = await addForm(formData);

      if (result.success) {
        router.refresh();
        form.reset();
        toast({
          title: "Form Uploaded",
          description: "Your form has been successfully uploaded.",
          duration: 5000,
        });
      } else {
        setError(result.error || "Failed to upload form.");
        toast({
          title: "Upload Failed",
          description: result.error || "Failed to upload form.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Unexpected error during upload:", error);
      setError("An unexpected error occurred. Please try again.");
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Form Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter form name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Certificates">Certificates</SelectItem>
                  <SelectItem value="Taxes">Taxes</SelectItem>
                  <SelectItem value="Permissions">Permissions</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Welfare">Welfare</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>Form File (PDF)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                  {...rest}
                />
              </FormControl>
              <FormDescription>Upload a PDF file (max 5MB)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isUploading}>
          {isUploading ? (
            <>
              <span className="loading loading-spinner loading-xs mr-2"></span>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Upload Form
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
