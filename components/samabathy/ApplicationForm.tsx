"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema } from "@/lib/validation";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SAMABYATHI_VILLAGES,
  SAMABYATHI_RELATIONS,
} from "@/constants/samabyathi";
import { villagenameOption } from "@/constants";
import {
  User,
  Phone,
  MapPin,
  UserMinus,
  HeartHandshake,
  CalendarDays,
  SendHorizontal,
  Info,
  CreditCard,
  Fingerprint,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

type FormData = z.infer<typeof applicationSchema>;

export default function ApplicationForm({
  onSuccess,
}: {
  onSuccess?: (app: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applicantName: "",
      mobileNumber: "",
      villageName: "",
      deceasedName: "",
      relation: "",
      dateOfDeath: "",
      voterId: "",
      aadhaarNumber: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/samabathy/application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmittedApp(result.data);
        toast.success(
          `Application submitted! ID: ${result.data.applicationNumber}`,
        );
        form.reset();
        if (onSuccess) onSuccess(result.data);
      } else {
        const errData = await response.json();
        toast.error(errData.error || "Failed to submit application");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (submittedApp) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SendHorizontal className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-900 mb-2">
            Application Submitted!
          </h3>
          <p className="text-green-700 mb-6">
            Your application has been received and is pending approval.
          </p>

          <div className="bg-white border border-green-100 rounded-md p-4 max-w-sm mx-auto shadow-sm">
            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">
              Your Application Number
            </p>
            <p className="text-2xl font-mono font-bold text-primary">
              {submittedApp.applicationNumber}
            </p>
          </div>

          <p className="text-sm text-green-600 mt-6 italic">
            Please keep this number for future reference to check your status.
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setSubmittedApp(null)}
        >
          Submit Another Application
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="shadow-md border-none ring-1 ring-border/50 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Info className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Application Form
              </span>
            </div>
            <CardTitle className="text-2xl font-bold">
              Applicant Information
            </CardTitle>
            <CardDescription>
              Enter the details of the person applying for the assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <FormField
              control={form.control}
              name="applicantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Applicant Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter full name"
                      {...field}
                      className="bg-background/50 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    Voter ID Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Voter ID"
                      {...field}
                      className="bg-background/50 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aadhaarNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-muted-foreground" />
                    Aadhaar Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12-digit Aadhaar"
                      {...field}
                      maxLength={12}
                      className="bg-background/50 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Mobile Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="10-digit mobile number"
                      {...field}
                      maxLength={10}
                      className="bg-background/50 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="villageName"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Village / Locality
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background/50 focus:bg-background transition-colors">
                        <SelectValue placeholder="Select the village name" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {villagenameOption.map((village) => (
                        <SelectItem key={village.value} value={village.value}>
                          {village.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <Separator className="bg-border/50" />

          <CardHeader className="bg-muted/10">
            <CardTitle className="text-2xl font-bold">
              Deceased Information
            </CardTitle>
            <CardDescription>
              Provide details about the deceased person.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 pb-8">
            <FormField
              control={form.control}
              name="deceasedName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <UserMinus className="h-4 w-4 text-muted-foreground" />
                    Name of Deceased
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name of deceased"
                      {...field}
                      className="bg-background/50 focus:bg-background transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                    Relationship
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background/50 focus:bg-background transition-colors">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SAMABYATHI_RELATIONS.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
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
              name="dateOfDeath"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    Date of Death
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      className="bg-background/50 focus:bg-background transition-colors block"
                    />
                  </FormControl>
                  <FormDescription>
                    Select the exact date as mentioned in the death certificate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="bg-muted/30 border-t p-6">
            <Button
              type="submit"
              className="w-full md:w-auto md:min-w-[200px] ml-auto gap-2 shadow-lg shadow-primary/20"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <SendHorizontal className="h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
