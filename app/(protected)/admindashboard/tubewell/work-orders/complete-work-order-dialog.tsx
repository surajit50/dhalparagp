"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkOrderStatus } from "@/action/tubewell";
import { getActiveTubewellLaborRates } from "@/action/tubewell-labor-rate";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { villagenameOption } from "@/constants";

const masterRollSchema = z.object({
  nameOfPlace: z.string().min(1, "Name of place is required"),
  villageSansad: z.string().min(1, "Village/Sansad is required"),
  items: z.array(z.object({
    workType: z.string(),
    quantity: z.number().default(0),
  })),
});

type MasterRollValues = z.infer<typeof masterRollSchema>;

interface CompleteWorkOrderDialogProps {
  orderId: string;
  orderNumber: string;
  location?: string;
  mouza?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CompleteWorkOrderDialog({
  orderId,
  orderNumber,
  location,
  mouza,
  isOpen,
  onClose,
}: CompleteWorkOrderDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);

  const form = useForm<MasterRollValues>({
    resolver: zodResolver(masterRollSchema),
    defaultValues: {
      nameOfPlace: location || "",
      villageSansad: mouza || location || "",
      items: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      setLoadingRates(true);
      // Reset form with current props when dialog opens
      form.reset({
        nameOfPlace: location || "",
        villageSansad: mouza || location || "",
        items: [],
      });

      getActiveTubewellLaborRates().then((rates) => {
        const itemsList = Object.keys(rates).map((workType) => ({
          workType,
          quantity: 0,
        }));
        form.setValue("items", itemsList);
      }).finally(() => {
        setLoadingRates(false);
      });
    } else {
      form.reset();
    }
  }, [isOpen, form, location, mouza]);

  const items = form.watch("items") || [];

  const onSubmit = async (data: MasterRollValues) => {
    try {
      setLoading(true);
      await updateWorkOrderStatus(orderId, "COMPLETED", data);
      toast.success("Work Order marked as completed with Master Roll details!");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Work Order: {orderNumber}</DialogTitle>
          <DialogDescription>
            Enter Master Roll (Labor/Repair) details to mark this work order as
            completed.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nameOfPlace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name of Place</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Near Primary School"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="villageSansad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Village/Sansad (Mouza) *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl border-slate-200 h-10 shadow-sm focus:ring-primary">
                          <SelectValue placeholder="Select village/mouza" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[200px]">
                        {villagenameOption.map((m) => (
                          <SelectItem
                            key={m.label}
                            value={m.label}
                            className="focus:bg-slate-50 rounded-lg m-1 py-2 cursor-pointer"
                          >
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h4 className="font-medium text-sm">
                  Repair Details (Quantities)
                </h4>
              </div>

              {loadingRates ? (
                <div className="md:col-span-2 flex justify-center py-4">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <div className="md:col-span-2 text-center text-sm text-muted-foreground py-2">
                  No active labor rates configured in database.
                </div>
              ) : (
                items.map((item: any, index: number) => (
                  <FormField
                    key={item.workType}
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{item.workType} Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))
              )}

            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Complete
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
