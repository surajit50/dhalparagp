import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

import { createPond } from "./actions";

const PondSchema = z.object({
  name: z.string().trim().min(1, "Pond name is required"),
  location: z.string().trim().min(1, "Location is required"),
  area: z.string().trim().optional().or(z.literal("")),
});

export function AddPondDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof PondSchema>>({
    resolver: zodResolver(PondSchema),
    defaultValues: {
      name: "",
      location: "",
      area: "",
    },
  });

  const onSubmit = (values: z.infer<typeof PondSchema>) => {
    startTransition(async () => {
      try {
        await createPond({
          name: values.name,
          location: values.location,
          area: values.area ? parseFloat(values.area) : 0,
        });
        toast.success("Pond registered successfully");
        form.reset();
        setOpen(false);
      } catch (error) {
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

      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Register New Pond</DialogTitle>
          <DialogDescription>
            Enter the details of the new pond.
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
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Ward / Village" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pond Area</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 2.5 Acre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
