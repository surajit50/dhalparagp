
"use client";

import { useState, useTransition } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { PondSchema, PondFormValues } from "./schema";
import { createPond, updatePond } from "./actions";

interface PondDialogProps {
  initialData?: any;
}

export function PondDialog({ initialData }: PondDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PondFormValues>({
    resolver: zodResolver(PondSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          location: initialData.location,
          area: initialData.area || "",
          status: initialData.status,
        }
      : {
          name: "",
          location: "",
          area: "",
          status: "AVAILABLE",
        },
  });

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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit2 className="h-4 w-4 text-blue-600" />
          </Button>
        ) : (
          <Button className="bg-blue-700 hover:bg-blue-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add New Pond
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Pond Details" : "Register New Pond"}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Update the details for this pond." 
              : "Enter the details to register a new pond for lease."}
          </DialogDescription>
        </DialogHeader>

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

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location / Landmark</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Near GP Office, Block-A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pond Area (Acres/Bigha)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1.5 Acres" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                        <SelectItem value="LEASED">LEASED</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-blue-700 hover:bg-blue-800 text-white min-w-[100px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  initialData ? "Update Pond" : "Register Pond"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
