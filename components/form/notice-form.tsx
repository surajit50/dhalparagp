"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createNotice, updateNotice } from "@/action/notice";
import { Upload, X } from "lucide-react";
import { NoticeTypes } from "@prisma/client";

const departments = [
  "BDO Office",
  "Health Department",
  "Agriculture Department",
  "PHE Department",
  "Education Department",
  "Other",
];

const noticeType = ["Tender", "Notice", "Circular", "Agency", "Other"];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  department: z.string().min(1, "Department is required"),
  type: z.enum(["Tender", "Notice", "Circular", "Agency", "Other"]),
  reference: z.string().min(1, "Reference number is required"),
  agencyId: z.string().optional(),
});

interface NoticeFormProps {
  agencies: { id: string; name: string }[];
  initialData?: {
    title: string;
    description: string;
    department: string;
    type: NoticeTypes;
    reference: string;
    agencyId?: string;
    files: {
      name: string;
      url: string;
      type: string;
      public_id: string;
    }[];
  };
  noticeId?: string;
}

export default function NoticeForm({
  agencies,
  initialData,
  noticeId,
}: NoticeFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      department: initialData?.department || "",
      type: initialData?.type || "Notice",
      reference: initialData?.reference || "",
      agencyId: initialData?.agencyId || "all",
    },
  });

  const selectedType = form.watch("type");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const removeExistingFile = (publicId: string) => {
    setRemovedFiles([...removedFiles, publicId]);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("department", values.department);
      formData.append("type", values.type);
      formData.append("reference", values.reference);

      if (
        values.type === "Agency" &&
        values.agencyId &&
        values.agencyId !== "all"
      ) {
        formData.append("agencyId", values.agencyId);
      }

      // Append files directly
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Append removed files for updates
      if (noticeId && removedFiles.length > 0) {
        formData.append("removedFiles", JSON.stringify(removedFiles));
      }

      let result;
      if (noticeId) {
        result = await updateNotice(noticeId, formData);
      } else {
        result = await createNotice(formData);
      }

      if (result.success) {
        toast.success(
          noticeId
            ? "Notice updated successfully"
            : "Notice created successfully",
        );
        router.push("/admindashboard/notice/view");
        router.refresh();
      } else {
        toast.error(
          result.error || `Failed to ${noticeId ? "update" : "create"} notice`,
        );
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Submission error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter notice title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter notice description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {noticeType.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedType === "Agency" && (
          <FormField
            control={form.control}
            name="agencyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Agency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specific agency (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Agencies</SelectItem>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter reference number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Files
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" />
                Upload Files
              </label>
              <span className="text-sm text-gray-500">
                {files.length > 0
                  ? `${files.length} file(s) selected`
                  : "No files selected"}
              </span>
            </div>
          </div>

          {initialData?.files && initialData.files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Existing Files:
              </h4>
              <div className="flex flex-wrap gap-2">
                {initialData.files
                  .filter((file) => !removedFiles.includes(file.public_id))
                  .map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExistingFile(file.public_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">New Files:</h4>
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isUploading}>
            {isUploading
              ? noticeId
                ? "Updating..."
                : "Creating..."
              : noticeId
                ? "Update Notice"
                : "Create Notice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
