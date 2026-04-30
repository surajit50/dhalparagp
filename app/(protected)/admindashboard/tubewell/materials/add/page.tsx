"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTubewellMaterial } from "@/action/tubewell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { PackagePlus, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import FullPageLoader from "@/components/FullPageLoader";

const formSchema = z.object({
  name: z.string().min(1, "Material name is required"),
  bengaliName: z.string().optional(),
  unit: z.string().min(1, "Unit of measure is required"),
  rate: z.coerce.number().min(0, "Rate must be a positive number"),
  stock: z.coerce
    .number()
    .min(0, "Stock cannot be negative")
    .optional()
    .default(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddMaterialPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bengaliName: "",
      unit: "",
      rate: undefined,
      stock: 0,
    },
  });

  const onSubmit = (data: FormValues) => {
    setProgress(0);
    startTransition(async () => {
      try {
        setProgress(30);
        await createTubewellMaterial({
          name: data.name,
          bengaliName: data.bengaliName,
          unit: data.unit,
          rate: data.rate,
          stock: data.stock || 0,
        });
        setProgress(100);
        toast.success("Material added successfully!");
        router.push("/admindashboard/tubewell/materials");
      } catch (error) {
        toast.error("Failed to add material. Name might already exist.");
      } finally {
        setProgress(0);
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-10">
      <FullPageLoader
        isLoading={isPending}
        progress={progress}
        title="Adding Material"
        description="Please wait while we add the new material to inventory."
      />
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admindashboard/tubewell/materials">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Add Material
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new item in the tubewell inventory catalog.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-primary" />
              Material Details
            </CardTitle>
            <CardDescription>
              Enter the material name, stock unit, and pre-defined rate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Material Name (English){" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g., PVC Pipe 1 inch"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bengaliName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bengali Name (বাংলা নাম)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="উদা: পাইপ"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Used for matching in print forms.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Unit of Measure{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="E.g., pcs, ft, kg"
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Rate (₹) <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              disabled={isPending}
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Stock Quantity (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            disabled={isPending}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={isPending}
                  >
                    <Link href="/admindashboard/tubewell/materials">
                      Cancel
                    </Link>
                  </Button>
                  <Button type="submit" disabled={isPending} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isPending ? "Saving..." : "Save Material"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
