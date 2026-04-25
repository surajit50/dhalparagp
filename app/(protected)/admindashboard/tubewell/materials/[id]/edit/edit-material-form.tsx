"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTubewellMaterial } from "@/action/tubewell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Edit, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
    name: z.string().min(1, "Material name is required"),
    bengaliName: z.string().optional(),
    unit: z.string().min(1, "Unit of measure is required"),
    rate: z.coerce.number().min(0, "Rate must be a positive number"),
    isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface EditMaterialFormProps {
    material: {
        id: string;
        name: string;
        bengaliName?: string | null;
        unit: string;
        rate: number;
        isActive: boolean;
    };
}

export function EditMaterialForm({ material }: EditMaterialFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: material.name,
            bengaliName: material.bengaliName || "",
            unit: material.unit,
            rate: material.rate,
            isActive: material.isActive,
        },
    });

    const onSubmit = (data: FormValues) => {
        startTransition(async () => {
            try {
                await updateTubewellMaterial(material.id, data);
                toast.success("Material updated successfully!");
                router.push("/admindashboard/tubewell/materials");
                router.refresh();
            } catch (error) {
                toast.error("Failed to update material.");
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admindashboard/tubewell/materials">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Material</h1>
                    <p className="text-sm text-muted-foreground">Modify details for an existing tubewell material.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-primary" />
                        Update Material Details
                    </CardTitle>
                    <CardDescription>Update material name, units, rates, or status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Material Name (English) <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="E.g., PVC Pipe 1 inch" disabled={isPending} {...field} />
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
                                                <Input placeholder="উদা: পাইপ" disabled={isPending} {...field} />
                                            </FormControl>
                                            <FormDescription>Optional: Used for matching in print forms.</FormDescription>
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
                                                <FormLabel>Unit of Measure <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="E.g., pcs, ft, kg" disabled={isPending} {...field} />
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
                                                <FormLabel>Rate (₹) <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" min="0" placeholder="0.00" disabled={isPending} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Active Status</FormLabel>
                                                <FormDescription>
                                                    Whether this material is currently available for use in work orders.
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isPending}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" asChild disabled={isPending}>
                                    <Link href="/admindashboard/tubewell/materials">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isPending} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {isPending ? "Updating..." : "Update Material"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
