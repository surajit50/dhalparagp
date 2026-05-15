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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Upload,
  X,
  Camera,
  FileText,
  Trash2,
  Calendar,
  Building2,
  Briefcase,
  Info,
  CheckCircle2,
} from "lucide-react";
import { createStartWorkNotice } from "@/action/notice";
import { WorkPhotoStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  workId: z.string().min(1, "Please select a work"),
  description: z.string().min(1, "Description is required"),
  commencementDate: z.string().min(1, "Commencement date is required"),
  completionDate: z.string().optional(),
  paperCount: z.number().min(0).default(0),
});

interface StartWorkFormProps {
  works: {
    id: string;
    workslno: number;
    nitDetails: {
      memoNumber: number;
      memoDate: Date;
    };
    ApprovedActionPlanDetails: {
      activityDescription: string;
      activityCode: string;
      schemeName: string;
    };
    AwardofContract: {
      workorderdetails: {
        Bidagency?: {
          agencydetails: {
            id: string;
            name: string;
          };
        } | null;
      }[];
    } | null;
  }[];
}

interface WorkPhotoFile {
  id: string;
  file: File;
  preview: string;
  status: WorkPhotoStatus;
  caption: string;
}

interface PaperFile {
  id: string;
  file: File;
  name: string;
  description: string;
}

export default function StartWorkForm({ works }: StartWorkFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [workPhotos, setWorkPhotos] = useState<WorkPhotoFile[]>([]);
  const [workOrderFiles, setWorkOrderFiles] = useState<File[]>([]);
  const [officialLetterFiles, setOfficialLetterFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<PaperFile[]>([]);
  const [photoStatus, setPhotoStatus] = useState<WorkPhotoStatus>("onset");
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workId: "",
      description: "",
      commencementDate: new Date().toISOString().split("T")[0],
      completionDate: "",
      paperCount: 0,
    },
  });

  const selectedWorkId = form.watch("workId");
  const selectedWork = works.find((w) => w.id === selectedWorkId);
  const agencyName =
    selectedWork?.AwardofContract?.workorderdetails?.[0]?.Bidagency
      ?.agencydetails?.name || "Unknown Agency";

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        status: photoStatus as WorkPhotoStatus,
        caption: "",
      }));
      setWorkPhotos([...workPhotos, ...newPhotos]);
    }
  };

  const removePhoto = (id: string) => {
    setWorkPhotos(workPhotos.filter((p) => p.id !== id));
  };

  const updatePhotoCaption = (id: string, caption: string) => {
    setWorkPhotos(workPhotos.map((p) => (p.id === id ? { ...p, caption } : p)));
  };

  const handleWorkOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setWorkOrderFiles(Array.from(e.target.files));
    }
  };

  const handleOfficialLetterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files) {
      setOfficialLetterFiles(Array.from(e.target.files));
    }
  };

  const handleOtherFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPapers = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        description: "",
      }));
      setOtherFiles([...otherFiles, ...newPapers]);
    }
  };

  const removeOtherFile = (id: string) => {
    setOtherFiles(otherFiles.filter((p) => p.id !== id));
  };

  const updateOtherFileDescription = (id: string, description: string) => {
    setOtherFiles(
      otherFiles.map((p) => (p.id === id ? { ...p, description } : p)),
    );
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUploading(true);

      if (!selectedWork) {
        toast.error("Please select a work");
        return;
      }

      const agencyId =
        selectedWork.AwardofContract?.workorderdetails?.[0]?.Bidagency
          ?.agencydetails?.id;

      if (!agencyId) {
        toast.error("No agency found for this work");
        return;
      }

      const formData = new FormData();
      formData.append("workId", values.workId);
      formData.append("description", values.description);
      formData.append("commencementDate", values.commencementDate);
      if (values.completionDate) {
        formData.append("completionDate", values.completionDate);
      }
      formData.append("agencyId", agencyId);

      // Add Work Order Files
      workOrderFiles.forEach((file) => {
        formData.append("workOrderFiles", file);
      });

      // Add Official Letter Files
      officialLetterFiles.forEach((file) => {
        formData.append("officialLetterFiles", file);
      });

      // Add Other Files
      otherFiles.forEach((paper) => {
        formData.append("otherFiles", paper.file);
        formData.append(`otherFileDescriptions`, paper.description);
      });

      // Add Photos
      workPhotos.forEach((photo) => {
        formData.append("photos", photo.file);
        formData.append(`photoStatuses`, photo.status);
        formData.append(`photoCaptions`, photo.caption);
      });

      const result = await createStartWorkNotice(formData);

      if (result.success) {
        toast.success("Start Work Notice created successfully");
        router.push("/admindashboard/notice/view");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create Start Work Notice");
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Work Selection Section */}
        <Card className="border-t-4 border-t-orange-500 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-xl">Select Work Order</CardTitle>
            </div>
            <CardDescription>
              Choose the work order you want to start for notice creation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="workId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Work Activity
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 border-orange-100 focus:ring-orange-500 bg-orange-50/20">
                        <SelectValue placeholder="Select a work order from your list" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {works.map((work) => (
                        <SelectItem key={work.id} value={work.id}>
                          <div className="flex flex-col items-start py-1">
                            <span className="font-medium text-sm line-clamp-1">
                              {
                                work.ApprovedActionPlanDetails
                                  .activityDescription
                              }
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 h-4 bg-orange-50 text-orange-700 border-orange-100"
                              >
                                NIT/{work.nitDetails.memoNumber}
                              </Badge>
                              <span className="text-[11px] text-muted-foreground italic">
                                {work.AwardofContract?.workorderdetails?.[0]
                                  ?.Bidagency?.agencydetails?.name ||
                                  "No Agency Assigned"}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedWork && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-orange-50/40 rounded-xl border border-orange-100 shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Info className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-orange-400 font-bold uppercase tracking-wider">
                        Work Sl No
                      </p>
                      <p className="text-sm font-semibold text-orange-900">
                        {selectedWork.workslno}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-orange-400 font-bold uppercase tracking-wider">
                        Activity Code
                      </p>
                      <p className="text-sm font-semibold text-orange-900">
                        {selectedWork.ApprovedActionPlanDetails.activityCode}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Building2 className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-orange-400 font-bold uppercase tracking-wider">
                        Agency Name
                      </p>
                      <p className="text-sm font-semibold text-orange-900 line-clamp-1">
                        {agencyName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Briefcase className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-orange-400 font-bold uppercase tracking-wider">
                        Fund/Scheme
                      </p>
                      <Badge className="bg-orange-600 text-white hover:bg-orange-700">
                        {selectedWork.ApprovedActionPlanDetails.schemeName}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Details Section */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-xl">Work Start Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">
                    Notice/Work Start Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter detailed information about the work start notice..."
                      className="min-h-[120px] resize-none focus:ring-orange-500 border-slate-200"
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
                name="commencementDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Commencement Date
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          className="h-11 pl-10 focus:ring-orange-500 border-slate-200"
                          {...field}
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Target Completion Date
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          className="h-11 pl-10 focus:ring-orange-500 border-slate-200"
                          {...field}
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documentation Section */}
        <Card className="shadow-md">
          <CardHeader className="bg-slate-50/50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-xl">
                Work Documentation & Official Letters
              </CardTitle>
            </div>
            <CardDescription>
              Upload work orders, official correspondence, and other relevant
              files.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Work Order Upload */}
              <div className="group space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-500 rounded-full" />
                  Work Order (Final Copy)
                </label>
                <div className="relative flex flex-col gap-3">
                  <input
                    type="file"
                    multiple
                    onChange={handleWorkOrderChange}
                    className="hidden"
                    id="work-order-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="work-order-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-orange-200 rounded-xl bg-orange-50/30 hover:bg-orange-50/50 hover:border-orange-400 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-orange-400 group-hover:text-orange-600 mb-2 transition-colors" />
                      <p className="text-xs text-orange-600 font-semibold mb-1">
                        Click to upload Work Order
                      </p>
                      <p className="text-[10px] text-slate-400">
                        PDF, JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  </label>

                  {workOrderFiles.length > 0 && (
                    <div className="flex flex-col gap-2 animate-in fade-in duration-300">
                      {workOrderFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-orange-50/80 border border-orange-100 rounded-lg"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            <span className="text-[11px] font-medium text-orange-900 truncate">
                              {file.name}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[9px] bg-white border-orange-100"
                          >
                            {(file.size / 1024).toFixed(0)} KB
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Official Letter Upload */}
              <div className="group space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <div className="w-1 h-4 bg-amber-500 rounded-full" />
                  Official Communication Letter
                </label>
                <div className="relative flex flex-col gap-3">
                  <input
                    type="file"
                    multiple
                    onChange={handleOfficialLetterChange}
                    className="hidden"
                    id="official-letter-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="official-letter-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-amber-200 rounded-xl bg-amber-50/30 hover:bg-amber-50/50 hover:border-amber-400 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-amber-400 group-hover:text-amber-600 mb-2 transition-colors" />
                      <p className="text-xs text-amber-600 font-semibold mb-1">
                        Click to upload Official Letter
                      </p>
                      <p className="text-[10px] text-slate-400">
                        PDF, JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  </label>

                  {officialLetterFiles.length > 0 && (
                    <div className="flex flex-col gap-2 animate-in fade-in duration-300">
                      {officialLetterFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-amber-50/80 border border-amber-100 rounded-lg"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            <span className="text-[11px] font-medium text-amber-900 truncate">
                              {file.name}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[9px] bg-white border-amber-100"
                          >
                            {(file.size / 1024).toFixed(0)} KB
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Other Files Section */}
            <div className="space-y-5 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Info className="h-5 w-5 text-orange-500" />
                  Additional Documents & Attachments
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleOtherFilesChange}
                    className="hidden"
                    id="other-files-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="other-files-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Upload className="h-4 w-4" />
                    Add More Files
                  </label>
                </div>
              </div>

              {otherFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherFiles.map((paper) => (
                    <div
                      key={paper.id}
                      className="group flex flex-col p-4 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all animate-in zoom-in-95 duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="p-1.5 bg-orange-50 rounded">
                            <FileText className="h-4 w-4 text-orange-600" />
                          </div>
                          <span className="text-xs font-bold text-slate-700 truncate">
                            {paper.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                          onClick={() => removeOtherFile(paper.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Document label or description..."
                        value={paper.description}
                        onChange={(e) =>
                          updateOtherFileDescription(paper.id, e.target.value)
                        }
                        className="h-9 text-[11px] bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                  <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                    <FileText className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400 italic">
                    No additional documents attached
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photos Section */}
        <Card className="shadow-md overflow-hidden border-none ring-1 ring-slate-200">
          <CardHeader className="bg-slate-900 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-orange-400" />
                <CardTitle className="text-xl">Work Photos (Onset)</CardTitle>
              </div>
              <Badge className="bg-orange-500 hover:bg-orange-400 text-white border-none px-3">
                {workPhotos.length} Photos Added
              </Badge>
            </div>
            <CardDescription className="text-orange-200/70">
              Upload photos of the site before starting work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-orange-500" />
                  Select Stage
                </label>
                <Select
                  value={photoStatus}
                  onValueChange={(v) => setPhotoStatus(v as WorkPhotoStatus)}
                >
                  <SelectTrigger className="h-11 bg-white border-slate-200 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onset">Onset/Before Starting</SelectItem>
                    <SelectItem value="ongoing">Work in Progress</SelectItem>
                    <SelectItem value="complete">Work Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Camera className="h-3 w-3 text-orange-500" />
                  Select Photos
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center justify-center gap-2 h-11 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-md transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Camera className="h-4 w-4" />
                  Capture or Upload Photos
                </label>
              </div>
            </div>

            {workPhotos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {workPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 animate-in zoom-in-95"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={photo.preview}
                        alt="Site Preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/90 text-slate-900 hover:bg-white border-none shadow-sm backdrop-blur-sm py-1">
                          {photo.status === "onset"
                            ? "Before"
                            : photo.status === "ongoing"
                              ? "Ongoing"
                              : "After"}
                        </Badge>
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-3 right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100 shadow-lg"
                        onClick={() => removePhoto(photo.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="p-3">
                      <Input
                        placeholder="Add a caption for this photo..."
                        value={photo.caption}
                        onChange={(e) =>
                          updatePhotoCaption(photo.id, e.target.value)
                        }
                        className="h-9 text-[11px] border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                <div className="p-4 bg-white rounded-full shadow-md mb-4 ring-4 ring-orange-50">
                  <Camera className="h-8 w-8 text-orange-200" />
                </div>
                <h3 className="text-slate-800 font-bold mb-1">
                  No photos uploaded yet
                </h3>
                <p className="text-slate-400 text-xs text-center max-w-[200px]">
                  Add visual proof of the site before starting work.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-lg sticky bottom-4 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Ready to Submit
              </p>
              <p className="text-[11px] text-slate-500">
                Verify all details and attachments before creation.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isUploading || !selectedWork}
            className={cn(
              "w-full sm:w-[240px] h-14 rounded-xl text-base font-bold shadow-xl transition-all active:scale-[0.97]",
              isUploading
                ? "bg-slate-200 text-slate-500"
                : "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200",
            )}
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Notice...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Create Start Work Notice
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
