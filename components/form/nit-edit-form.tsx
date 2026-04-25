"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CustomFormField, { FormFieldType } from "@/components/CustomFormField";
import { updateNitNumber } from "@/action/bookNitNuber";
import "react-datepicker/dist/react-datepicker.css";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Calendar,
  MapPin,
  Clock,
  Edit,
  ArrowLeft,
  BadgeCheck,
  FileEdit,
  CalendarCheck,
  Gavel,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const NitEditValidationSchema = z.object({
  id: z.string().nonempty("NIT ID is required"),
  tendermemonumber: z.string().nonempty("Tender Reference Number is required"),
  tendermemodate: z.coerce.date(),
  tender_pulishing_Date: z.coerce.date(),
  tender_document_Download_from: z.coerce.date(),
  tender_start_time_from: z.coerce.date(),
  tender_end_date_time_from: z.coerce.date(),
  tender_techinical_bid_opening_date: z.coerce.date(),
  tender_financial_bid_opening_date: z.coerce.date().optional(),
  tender_place_opening_bids: z
    .string()
    .nonempty("Place for Opening Bids is required"),
  tender_vilidity_bids: z.string().nonempty("Validity of Bids is required"),
  supplynit: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

type FormValues = z.infer<typeof NitEditValidationSchema>;

interface EditNitFormProps {
  initialData: FormValues;
  onCancel?: () => void;
}

// Helper function to convert date strings to Date objects
const transformInitialData = (data: FormValues): FormValues => {
  const dateFields = [
    "tendermemodate",
    "tender_pulishing_Date",
    "tender_document_Download_from",
    "tender_start_time_from",
    "tender_end_date_time_from",
    "tender_techinical_bid_opening_date",
    "tender_financial_bid_opening_date",
  ] as const;

  return {
    ...data,
    ...dateFields.reduce((acc, field) => {
      const value = data[field];
      return {
        ...acc,
        [field]: value && typeof value === "string" ? new Date(value) : value,
      };
    }, {}),
  };
};

export default function NitEditForm({
  initialData,
  onCancel,
}: EditNitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Transform initial data
  const transformedInitialData = transformInitialData(initialData);

  const form = useForm<FormValues>({
    resolver: zodResolver(NitEditValidationSchema),
    defaultValues: transformedInitialData,
  });

  // Reset form when initialData changes
  useEffect(() => {
    form.reset(transformInitialData(initialData));
  }, [initialData, form]);

  const onSubmit = (values: FormValues) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value instanceof Date) {
            formData.append(key, value.toISOString());
          } else if (typeof value === "boolean") {
            formData.append(key, value ? "on" : "off");
          } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });

        const data = await updateNitNumber(formData);
        if (data?.success) {
          setSuccess(data.success);
        }
        if (data?.error) {
          setError(data.error);
        }
      } catch (error) {
        console.error("Failed to update tender:", error);
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  const renderFormSection = (
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode
  ) => (
    <Card className="mb-6 border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 py-4 border-b">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="bg-blue-100 p-2 rounded-lg text-blue-600">
            {icon}
          </span>
          <span className="ml-3">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={onCancel ? onCancel : () => router.back()}
          className="text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to NIT List
        </Button>
      </div>

      <Card className="rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center">
              <FileEdit className="h-6 w-6 mr-3" />
              Edit NIT Details
            </CardTitle>
            <Badge
              variant={initialData.isPublished ? "default" : "secondary"}
              className="text-sm py-1 px-3 rounded-full"
            >
              {initialData.isPublished ? (
                <span className="flex items-center">
                  <BadgeCheck className="h-4 w-4 mr-1" />
                  Published
                </span>
              ) : (
                "Draft"
              )}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-6 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mt-0.5 mr-3" />
                <div>
                  <AlertTitle className="font-semibold">Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </div>
              </div>
            </Alert>
          )}
          
          {success && (
            <Alert variant="default" className="mb-6 bg-green-50 border-green-200 rounded-lg">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 mt-0.5 mr-3 text-green-600" />
                <div>
                  <AlertTitle className="font-semibold text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <input type="hidden" {...form.register("id")} />
              
              {renderFormSection(
                "Tender Details",
                <FileText className="h-5 w-5" />,
                <>
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="tendermemonumber"
                    placeholder="Enter NIT Memo Number"
                    label="Tender Reference Number *"
                    containerClass="col-span-2"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.DATE_PICKER}
                    control={form.control}
                    name="tendermemodate"
                    label="Tender Booking Date *"
                    dateFormat="dd/MM/yyyy"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.CHECKBOX}
                    control={form.control}
                    name="supplynit"
                    label="For Supply NIT"
                    containerClass="col-span-2"
                  />
                </>
              )}

              {renderFormSection(
                "Tender Timeline",
                <CalendarCheck className="h-5 w-5" />,
                <>
                  <CustomFormField
                    fieldType={FormFieldType.DATE_PICKER}
                    control={form.control}
                    name="tender_pulishing_Date"
                    label="Publishing Date *"
                    dateFormat="dd/MM/yyyy HH:mm"
                    showTimeSelect
                  />
                  <CustomFormField
                    fieldType={FormFieldType.DATE_PICKER}
                    control={form.control}
                    name="tender_document_Download_from"
                    label="Document Download From *"
                    dateFormat="dd/MM/yyyy HH:mm"
                    showTimeSelect
                  />
                  <CustomFormField
                    fieldType={FormFieldType.DATE_PICKER}
                    control={form.control}
                    name="tender_start_time_from"
                    label="Start Time From *"
                    dateFormat="dd/MM/yyyy HH:mm"
                    showTimeSelect
                  />
                  <CustomFormField
                    fieldType={FormFieldType.DATE_PICKER}
                    control={form.control}
                    name="tender_end_date_time_from"
                    label="End Date Time From *"
                    dateFormat="dd/MM/yyyy HH:mm"
                    showTimeSelect
                  />
                  <CustomFormField
                    fieldType={FormFieldType.DATE_PICKER}
                    control={form.control}
                    name="tender_techinical_bid_opening_date"
                    label="Technical Bid Opening Date *"
                    dateFormat="dd/MM/yyyy HH:mm"
                    showTimeSelect
                  />
                  <CustomFormField
                    fieldType={FormFieldType.DATE_PICKER}
                    control={form.control}
                    name="tender_financial_bid_opening_date"
                    label="Financial Bid Opening Date"
                    dateFormat="dd/MM/yyyy HH:mm"
                    showTimeSelect
                  />
                </>
              )}

              {renderFormSection(
                "Bid Information",
                <Gavel className="h-5 w-5" />,
                <>
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="tender_place_opening_bids"
                    placeholder="Enter place for opening bids"
                    label="Place for Opening Bids *"
                    containerClass="col-span-2"
                  />
                  <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="tender_vilidity_bids"
                    placeholder="Enter validity of bids"
                    label="Validity of Bids *"
                    containerClass="col-span-2"
                  />
                </>
              )}

              {!initialData.isPublished && (
                <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel ? onCancel : () => router.back()}
                    className="flex items-center justify-center px-6 py-3 border border-gray-300 hover:bg-gray-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> 
                    Cancel Changes
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md transition-all px-6 py-3"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Clock className="animate-spin mr-2 h-4 w-4" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Update Tender Details
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
