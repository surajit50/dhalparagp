"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { applyPujaNOC } from "@/action/puja-noc-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import ErrorForm from "@/components/ErrorForm";
import SuccessForm from "@/components/SuccessForm";
import { User, Calendar, Settings, Upload, FileText } from "lucide-react";

// ✅ FINAL SCHEMA WITH VALIDATION
const formSchema = z
  .object({
    applicantName: z.string().min(2),
    applicantPhone: z.string().min(10),
    applicantEmail: z.string().email().optional().or(z.literal("")),
    applicantAddress: z.string().min(5),

    organizerName: z.string().min(2),

    eventName: z.enum([
      "Durga Puja",
      "Kali Puja",
      "Saraswati Puja",
      "Jagaddhatri Puja",
      "Ganesh Puja",
      "Other",
    ]),

    customEventName: z.string().optional(),

    eventLocation: z.string().min(5),
    startDate: z.string().min(1),
    endDate: z.string().min(1),

    expectedAttendance: z.coerce.number().optional(),

    loudspeakerRequired: z.boolean().default(false),
    electricityRequired: z.boolean().default(false),
    roadClosureRequired: z.boolean().default(false),

    additionalRequirements: z.string().optional(),
  })
  .refine(
    (data) => data.eventName !== "Other" || !!data.customEventName?.trim(),
    {
      message: "Please enter event name",
      path: ["customEventName"],
    },
  );

export default function PujaNocForm({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicantEmail: "",
      loudspeakerRequired: false,
      electricityRequired: false,
      roadClosureRequired: false,
    },
  });

  async function uploadFileToCloudinary(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    return response.json();
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError("");
    setSuccess("");

    // ✅ SAFE (no TS error)
    const finalEventName =
      values.eventName === "Other" ? values.customEventName! : values.eventName;

    startTransition(async () => {
      try {
        setIsUploading(true);

        let fileUrl: string | null = null;
        let fileKey: string | null = null;

        if (uploadedFile) {
          const uploadResult = await uploadFileToCloudinary(uploadedFile);
          fileUrl = uploadResult.fileUrl;
          fileKey = uploadResult.publicId;
        }

        const result = await applyPujaNOC({
          ...values,
          eventName: finalEventName,
          userId,
          fileUrl,
          fileKey,
        });

        if (result.success) {
          setSuccess("Application submitted successfully!");
          toast.success("Application submitted successfully!");
          form.reset();
          setUploadedFile(null);
        } else {
          setError(result.message || "Something went wrong");
          toast.error(result.message || "Something went wrong");
        }
      } catch (err) {
        setError("Failed to upload file. Please try again.");
        toast.error("Failed to upload file. Please try again.");
      } finally {
        setIsUploading(false);
      }
    });
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Puja NOC Application</h1>
          <p className="text-muted-foreground text-sm">
            Submit your request for organizing a puja/event
          </p>
        </div>

        <ErrorForm message={error} />
        <SuccessForm message={success} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Applicant Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={18} /> Applicant Information
                </CardTitle>
                <CardDescription>Enter applicant details</CardDescription>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="applicantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input className="rounded-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input className="rounded-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input className="rounded-lg" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input className="rounded-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={18} /> Event Details
                </CardTitle>
                <CardDescription>Provide event information</CardDescription>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-4">
                {/* Event Select */}
                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Puja/Event</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Choose event" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          <SelectItem value="Durga Puja">Durga Puja</SelectItem>
                          <SelectItem value="Kali Puja">Kali Puja</SelectItem>
                          <SelectItem value="Saraswati Puja">
                            Saraswati Puja
                          </SelectItem>
                          <SelectItem value="Jagaddhatri Puja">
                            Jagaddhatri Puja
                          </SelectItem>
                          <SelectItem value="Ganesh Puja">
                            Ganesh Puja
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organizer</FormLabel>
                      <FormControl>
                        <Input className="rounded-lg" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Custom Event */}
                {form.watch("eventName") === "Other" && (
                  <FormField
                    control={form.control}
                    name="customEventName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Enter Event Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Type event name"
                            className="rounded-lg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="eventLocation"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input className="rounded-lg" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={18} /> Requirements
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { name: "loudspeakerRequired", label: "Loudspeaker" },
                    { name: "electricityRequired", label: "Electricity" },
                    { name: "roadClosureRequired", label: "Road Closure" },
                  ].map((item) => (
                    <FormField
                      key={item.name}
                      control={form.control}
                      name={item.name as any}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3 border rounded-xl p-4 hover:bg-muted transition">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>{item.label}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="additionalRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea className="rounded-lg" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={18} /> Application Document (Optional)
                </CardTitle>
                <CardDescription>
                  Upload your application document (PDF only, max 200KB)
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {!uploadedFile ? (
                    <div className="flex flex-col items-center gap-4">
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 200 * 1024) {
                              toast.error("File size must be less than 200KB");
                              return;
                            }
                            if (
                              !file.type.includes("pdf") &&
                              !file.name.toLowerCase().endsWith(".pdf")
                            ) {
                              toast.error("Only PDF files are allowed");
                              return;
                            }
                            setUploadedFile(file);
                          }
                        }}
                      />
                      <label htmlFor="file-upload">
                        <Button variant="secondary" className="gap-2">
                          <Upload className="h-4 w-4" />
                          Upload Document
                        </Button>
                      </label>
                      <div className="text-sm text-muted-foreground">
                        PDF only (max 200KB)
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <div className="font-medium">{uploadedFile.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setUploadedFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl"
              disabled={isPending || isUploading}
            >
              {isPending || isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading..." : "Submitting..."}
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}