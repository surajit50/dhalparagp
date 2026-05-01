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
import { User, Calendar, Settings } from "lucide-react";


// ✅ Updated Schema
const formSchema = z.object({
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
});

export default function PujaNocForm({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicantEmail: "",
      loudspeakerRequired: false,
      electricityRequired: false,
      roadClosureRequired: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError("");
    setSuccess("");

    // 👉 Handle "Other" case
    const finalEventName =
      values.eventName === "Other"
        ? values.customEventName
        : values.eventName;

    startTransition(async () => {
      const result = await applyPujaNOC({
        ...values,
        eventName: finalEventName,
        userId,
      });

      if (result.success) {
        setSuccess("Application submitted successfully!");
        toast.success("Application submitted successfully!");
        form.reset();
      } else {
        setError(result.message || "Something went wrong");
        toast.error(result.message || "Something went wrong");
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

                {/* ✅ Event Select */}
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

                {/* Organizer */}
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

                {/* Show when Other */}
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

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl"
              disabled={isPending}
            >
              {isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
