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

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createPond } from "../ponds/actions";
import { PondSchema, PondFormValues } from "../ponds/schema";
import { PondTypeFields } from "../ponds/pond-type-fields";
import {
  formatPondAreaAcre,
  parsePondAreaDecimal,
} from "@/lib/utils/pond-lease";

export function AddPondDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PondFormValues>({
    resolver: zodResolver(PondSchema),
    defaultValues: {
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
  const areaInAcre = formatPondAreaAcre(areaDecimal);

  const onSubmit = (values: PondFormValues) => {
    startTransition(async () => {
      try {
        await createPond(values);
        toast.success("Pond registered successfully");
        form.reset();
        setOpen(false);
      } catch {
        toast.error("Failed to register pond");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Register New Pond
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Pond</DialogTitle>
          <DialogDescription>
            Enter pond details and choose whether it is leasable or a public pond.
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

              <div className="grid md:grid-cols-2 gap-4">
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

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pond Area (Decimal / Satak)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 150" {...field} />
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

            <PondTypeFields form={form} isPending={isPending} />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register Pond
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
