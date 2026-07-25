"use client";

import { useState, useTransition, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Plus, Loader2, Edit2, Waves } from "lucide-react";
import { toast } from "sonner";
import { PondSchema, PondFormValues } from "./schema";
import { createPond, updatePond } from "./actions";
import {
  formatPondAreaAcre,
  parsePondAreaDecimal,
} from "@/lib/utils/pond-lease";
import { PondTypeFields } from "./pond-type-fields";

interface PondDialogProps {
  initialData?: any;
  disabled?: boolean;
}

export function PondDialog({ initialData, disabled }: PondDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PondFormValues>({
    resolver: zodResolver(PondSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          mouzaName: initialData.mouzaName || "",
          jlNo: initialData.jlNo || "",
          plotNo: initialData.plotNo || "",
          area: initialData.area || "",
          pondType: initialData.pondType || "LEASEABLE",
          publicYearlyAmount: initialData.publicYearlyAmount ?? undefined,
          resolutionNo: initialData.resolutionNo || "",
          resolutionDate: initialData.resolutionDate
            ? new Date(initialData.resolutionDate)
            : undefined,
          status: initialData.status || "AVAILABLE",
        }
      : {
          name: "",
          mouzaName: "",
          jlNo: "",
          plotNo: "",
          area: "",
          pondType: "LEASEABLE",
          publicYearlyAmount: undefined,
          resolutionNo: "",
          resolutionDate: undefined,
          status: "AVAILABLE",
        },
  });

  const watchedArea = form.watch("area");
  const areaDecimal = parsePondAreaDecimal(watchedArea);
  const areaInAcre = useMemo(
    () => formatPondAreaAcre(areaDecimal),
    [areaDecimal],
  );

  const onSubmit = (values: PondFormValues) => {
    startTransition(async () => {
      try {
        if (initialData) {
          await updatePond(initialData.id, values);
          toast.success("Pond updated successfully");
        } else {
          await createPond(values);
          toast.success("Pond registered successfully");
          form.reset();
        }
        setOpen(false);
      } catch (error: any) {
        toast.error(error.message || "Failed to process request");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {initialData ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50" disabled={disabled}>
            <Edit2 className="h-4 w-4 text-blue-600" />
          </Button>
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Add New Pond
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-r from-blue-50 to-transparent p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-blue-900">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Waves className="h-5 w-5 text-blue-600" />
              </div>
              {initialData ? "Edit Pond Details" : "Register New Pond"}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {initialData 
                ? "Update the details for this pond record." 
                : "Enter the details to register a new pond into the inventory."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-2">
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pond Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Shanti Sagar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
              <p className="text-sm font-medium">Location of the Pond</p>
              
              <FormField
                control={form.control}
                name="mouzaName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mouza Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Dhalpara" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="jlNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>JL No</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 45" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plotNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plot No</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Pond Area (Decimal / Satak)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 150" {...field} className="bg-muted/50 focus-visible:bg-transparent" />
                    </FormControl>
                    {areaInAcre && (
                      <p className="text-xs font-medium text-blue-700">
                        Total land area: {areaInAcre}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-2">
                <PondTypeFields
                  form={form}
                  isPending={isPending}
                  isLeased={initialData?.status === "LEASED" || (initialData?.leases && initialData.leases.length > 0)}
                />
              </div>
            </div>

            <DialogFooter className="pt-6 border-t mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  initialData ? "Save Changes" : "Register Pond"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
