"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { assignStaff } from "@/action/warishApplicationAction";
import { toast } from "sonner";

const formSchema = z.object({
  staffId: z.string().min(1, "Please select a staff member"),
});

interface Staff {
  id: string;
  name: string;
}

interface StaffAssignFormProps {
  applicationId: string;
  staff: Staff[];
}

export default function StaffAssignForm({
  applicationId,
  staff,
}: StaffAssignFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { staffId: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setIsSuccess(false);
    try {
      const formData = new FormData();
      formData.append("applicationId", applicationId);
      formData.append("staffId", values.staffId);
      await assignStaff(formData);
      setIsSuccess(true);
      toast.success("Case worker assigned successfully");
      router.refresh();
      form.reset();
    } catch (error) {
      console.error("Error assigning staff:", error);
      toast.error("Failed to assign case worker. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 p-6 bg-gray-50 rounded-lg border">
      <h3 className="text-lg font-semibold">Assign Case Worker</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="staffId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Select Case Worker
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting || isSuccess}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a case worker..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staff.map((staffMember) => (
                      <SelectItem
                        key={staffMember.id}
                        value={staffMember.id}
                        className="hover:bg-gray-100"
                      >
                        <span className="font-medium">{staffMember.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs text-red-600" />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Assigned
                </>
              ) : (
                "Assign Case Worker"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
