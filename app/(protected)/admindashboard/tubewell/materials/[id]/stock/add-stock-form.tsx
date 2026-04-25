"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addStockToMaterial } from "@/action/tubewell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PlusCircle, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const formSchema = z.object({
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    rate: z.coerce.number().min(0, "Rate must be a positive number"),
    remarks: z.string().min(1, "Remarks are required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddStockFormProps {
    material: {
        id: string;
        name: string;
        unit: string;
        rate: number;
        stock: number;
    };
}

export function AddStockForm({ material }: AddStockFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: 0,
            rate: material.rate,
            remarks: "New stock arrival",
        },
    });

    const onSubmit = (data: FormValues) => {
        startTransition(async () => {
            try {
                await addStockToMaterial(material.id, data.quantity, data.rate, data.remarks);
                toast.success(`Successfully added ${data.quantity} ${material.unit} to ${material.name}`);
                router.push("/admindashboard/tubewell/materials");
                router.refresh();
            } catch (error) {
                toast.error("Failed to add stock.");
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
                    <h1 className="text-2xl font-semibold tracking-tight">Add Stock</h1>
                    <p className="text-sm text-muted-foreground">Increase inventory for {material.name}.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="h-5 w-5 text-primary" />
                        Stock Update Details
                    </CardTitle>
                    <CardDescription>
                        Current Stock: <span className="font-bold text-foreground">{material.stock} {material.unit}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantity to Add ({material.unit}) <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="1" disabled={isPending} {...field} />
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
                                                <FormLabel>Purchase Rate (₹) <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" min="0" disabled={isPending} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="remarks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Remarks <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="E.g., Purchased from vendor X, Bill #123" 
                                                    className="resize-none"
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
                                <Button type="button" variant="outline" asChild disabled={isPending}>
                                    <Link href="/admindashboard/tubewell/materials">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isPending} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {isPending ? "Adding..." : "Add Stock"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
