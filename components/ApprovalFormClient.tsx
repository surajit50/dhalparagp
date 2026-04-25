"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  CheckCircle,
  XCircle,
  Loader2,
  CalendarIcon,
} from "lucide-react";

import { approvedSchema } from "@/schema/approveschema";
import { approvedWarishApplication } from "@/action/warishApplicationAction";
import { formatDate } from "@/utils/utils";

type ApprovalFormValues = z.infer<typeof approvedSchema>;

export default function ApprovalFormClient({
  id,
  initialMemoNumber,
  onClose,
}: {
  id: string;
  initialMemoNumber: string;
  onClose?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [memoNumber, setMemoNumber] = useState(initialMemoNumber);

  const form = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvedSchema),
    defaultValues: {
      status: undefined,
      memonumber: memoNumber,
      memodate: undefined,
      remarks: "",
    },
  });

  const watchStatus = form.watch("status");

  // Auto set date for approval
  useEffect(() => {
    if (watchStatus === "approved") {
      form.setValue("memodate", new Date());
    } else {
      form.setValue("memodate", undefined);
    }
  }, [watchStatus, form]);

  const onSubmit = useCallback(
    async (values: ApprovalFormValues) => {
      startTransition(async () => {
        try {
          const submissionValues = {
            ...values,
            memonumber: values.status === "approved" ? memoNumber : "",
            memodate:
              values.status === "approved" ? values.memodate : undefined,
          };

          await approvedWarishApplication(submissionValues, id);

          toast({
            title: "Success",
            description: `Application ${values.status}`,
          });

          router.refresh();
          if (onClose) {
            onClose();
          } else {
            router.push("/admindashboard/manage-warish/approve");
          }
        } catch (error) {
          toast({
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to update application",
            variant: "destructive",
          });
        }
      });
    },
    [id, memoNumber, router]
  );

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl rounded-3xl border bg-background overflow-hidden">
      
      {/* HEADER */}
      <CardHeader className="border-b bg-muted/30 px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Application Decision
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Approve or reject the application with proper remarks
            </p>
          </div>
        </div>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>

          <CardContent className="space-y-8 px-8 py-8">

            {/* DECISION SECTION */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Decision</h3>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid md:grid-cols-2 gap-6"
                      >
                        {/* APPROVE */}
                        <Label
                          htmlFor="status-approved"
                          className={cn(
                            "relative flex flex-col gap-4 p-6 rounded-2xl border transition-all cursor-pointer",
                            field.value === "approved"
                              ? "border-emerald-500 bg-emerald-50 shadow-md"
                              : "border-border hover:border-emerald-300"
                          )}
                        >
                          <RadioGroupItem
                            value="approved"
                            id="status-approved"
                            className="sr-only"
                          />

                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-100">
                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                            <span className="font-semibold">
                              Approve Application
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Generate official memo and approve this application.
                          </p>
                        </Label>

                        {/* REJECT */}
                        <Label
                          htmlFor="status-rejected"
                          className={cn(
                            "relative flex flex-col gap-4 p-6 rounded-2xl border transition-all cursor-pointer",
                            field.value === "rejected"
                              ? "border-red-500 bg-red-50 shadow-md"
                              : "border-border hover:border-red-300"
                          )}
                        >
                          <RadioGroupItem
                            value="rejected"
                            id="status-rejected"
                            className="sr-only"
                          />

                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-red-100">
                              <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <span className="font-semibold">
                              Reject Application
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Provide rejection reason and close this application.
                          </p>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* APPROVAL DETAILS */}
            {watchStatus === "approved" && (
              <div className="space-y-6 p-6 rounded-2xl border bg-muted/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-emerald-700">
                    Approval Information
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Memo Number */}
                  <FormField
                    control={form.control}
                    name="memonumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Memo Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={memoNumber}
                            onChange={(e) => {
                              setMemoNumber(e.target.value);
                              field.onChange(e);
                            }}
                            placeholder="Enter memo number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Memo Date */}
                  <FormField
                    control={form.control}
                    name="memodate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Memo Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled
                              >
                                {field.value
                                  ? formatDate(field.value)
                                  : "Select date"}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="text-sm text-muted-foreground bg-emerald-50 p-3 rounded-lg">
                  Memo date is automatically assigned as today&apos;s date.
                </div>
              </div>
            )}

            {/* REMARKS */}
            <div className="p-6 rounded-2xl border bg-muted/10">
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Remarks{" "}
                      {watchStatus === "rejected" && (
                        <span className="text-destructive">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={
                          watchStatus === "approved"
                            ? "Optional comments..."
                            : "Provide rejection reason..."
                        }
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          {/* FOOTER */}
          <CardFooter className="px-8 py-6 border-t bg-muted/20">
            <Button
              type="submit"
              size="lg"
              className={cn(
                "w-full h-14 text-base font-semibold rounded-xl transition-all",
                watchStatus === "rejected"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-primary hover:bg-primary/90"
              )}
              disabled={isPending || !watchStatus}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : watchStatus === "approved" ? (
                "Approve Application"
              ) : watchStatus === "rejected" ? (
                "Reject Application"
              ) : (
                "Submit Decision"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
