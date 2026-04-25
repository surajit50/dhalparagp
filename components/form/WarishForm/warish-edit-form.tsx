"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  getWarishDetailsById,
  updateWarishDetails,
} from "@/action/warishApplicationActions";
import {
  warishFormSchemas,
  WarishFormValuesTypes,
} from "@/schema/warishSchema";
import { ApplicationInfo } from "./application-infos";
import { ClipboardList, SendHorizonal } from "lucide-react";

type WarishEditFormProps = {
  applicationId: string;
};

export default function WarishEditFormComponent({
  applicationId,
}: WarishEditFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<WarishFormValuesTypes>({
    resolver: zodResolver(warishFormSchemas),
    defaultValues: {
      reportingDate: new Date(),
      applicantName: "",
      applicantMobileNumber: "",
      nameOfDeceased: "",
      relationwithdeceased: "",
      dateOfDeath: new Date(),
      gender: "male",
      maritialStatus: "married",
      fatherName: "",
      spouseName: undefined,
      villageName: "",
      postOffice: "",
    },
  });

  // Fetch Warish Details by ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getWarishDetailsById(applicationId);
        if (data) {
          form.reset({
            ...data,
            reportingDate: data.reportingDate
              ? new Date(data.reportingDate)
              : new Date(),
            dateOfDeath: data.dateOfDeath
              ? new Date(data.dateOfDeath)
              : new Date(),
            spouseName: data.spouseName ?? undefined, // Handling null spouse name
          });
        }
      } catch (error) {
        console.error("Failed to fetch Warish details:", error);
        toast({
          title: "Error / ত্রুটি",
          description: "Failed to load Warish details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [applicationId, form, toast]);

  // Handle form submission
  const onSubmit = async (data: WarishFormValuesTypes) => {
    setIsSubmitting(true);
    try {
      const result = await updateWarishDetails(applicationId, data);
      if (!result?.success) {
        toast({
          title: "Error / ত্রুটি",
          description: result?.message || "Failed to update Warish details",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success / সফল",
          description: "Warish details updated successfully",
        });
        router.push("/admindashboard/home"); // Redirect after successful update
      }
    } catch (error) {
      console.error("Failed to update Warish details:", error);
      toast({
        title: "Error / ত্রুটি",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Application Header */}
        <div className="bg-gradient-to-br from-primary/95 to-primary/80 text-primary-foreground px-6 py-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6" />
            <h2 className="text-xl font-bold tracking-tight">
              Edit Warish Application / ওয়ারিশ আবেদন সম্পাদনা করুন
            </h2>
          </div>
        </div>

        {/* Application Form Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <ApplicationInfo form={form} />
        </div>

        <div className="flex justify-center">
          {/* Submit Button */}
          <Button
            type="submit"
            className=" h-12 text-sm font-semibold bg-green-600 hover:bg-green/90 transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2 animate-pulse">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Updating... </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SendHorizonal className="w-4 h-4" />
                <span>Update Warish Application </span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
