"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMistri } from "@/action/tubewell";
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
    name: z.string().min(1, "Mistri name is required"),
    mobileNumber: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
    bankName: z.string().optional().or(z.literal("")),
    accountNumber: z.string().optional().or(z.literal("")),
    ifscCode: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface EditMistriFormProps {
    mistri: {
        id: string;
        name: string;
        mobileNumber: string | null;
        address: string | null;
        isActive: boolean;
        bankName?: string | null;
        accountNumber?: string | null;
        ifscCode?: string | null;
    };
}

export function EditMistriForm({ mistri }: EditMistriFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: mistri.name,
            mobileNumber: mistri.mobileNumber || "",
            address: mistri.address || "",
            isActive: mistri.isActive,
            bankName: mistri.bankName || "",
            accountNumber: mistri.accountNumber || "",
            ifscCode: mistri.ifscCode || "",
        },
    });

    const onSubmit = (data: FormValues) => {
        startTransition(async () => {
            try {
                await updateMistri(mistri.id, {
                    name: data.name,
                    mobileNumber: data.mobileNumber || undefined,
                    address: data.address || undefined,
                    isActive: data.isActive,
                    bankName: data.bankName || undefined,
                    accountNumber: data.accountNumber || undefined,
                    ifscCode: data.ifscCode || undefined,
                });
                toast.success("Mistri updated successfully!");
                router.push("/admindashboard/tubewell/mistri");
                router.refresh();
            } catch (error) {
                toast.error("Failed to update mistri.");
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admindashboard/tubewell/mistri">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Edit Mistri</h1>
                    <p className="text-sm text-muted-foreground">Modify details for an existing tubewell mistri.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5 text-primary" />
                        Update Mistri Details
                    </CardTitle>
                    <CardDescription>Update name, contact details, or status.</CardDescription>
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
                                            <FormLabel>Mistri Name <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="E.g., John Doe" disabled={isPending} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="mobileNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mobile Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="E.g., 9876543210" disabled={isPending} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="E.g., Village name" disabled={isPending} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="md:col-span-2 border-t pt-4 mt-2">
                                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Bank Details</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="bankName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bank Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="E.g. SBI, HDFC" disabled={isPending} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="accountNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Account Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter Account Number" disabled={isPending} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="ifscCode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>IFSC Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter IFSC Code" disabled={isPending} {...field} />
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
                                                    Whether this mistri is currently available for work order assignment.
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
                                    <Link href="/admindashboard/tubewell/mistri">Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isPending} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    {isPending ? "Updating..." : "Update Mistri"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
