"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMistri } from "@/action/tubewell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { UserPlus, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const mistriSchema = z.object({
    name: z.string().min(1, "Full Name is required"),
    mobileNumber: z.string().optional(),
    address: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
});

type MistriFormValues = z.infer<typeof mistriSchema>;

export default function AddMistriPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<MistriFormValues>({
        resolver: zodResolver(mistriSchema),
        defaultValues: {
            name: "",
            mobileNumber: "",
            address: "",
            bankName: "",
            accountNumber: "",
            ifscCode: "",
        },
    });

    const onSubmit = (data: MistriFormValues) => {
        startTransition(async () => {
            try {
                await createMistri({
                    name: data.name,
                    mobileNumber: data.mobileNumber || undefined,
                    address: data.address || undefined,
                    bankName: data.bankName || undefined,
                    accountNumber: data.accountNumber || undefined,
                    ifscCode: data.ifscCode || undefined,
                });
                toast.success("Mistri added successfully!");
                router.push("/admindashboard/tubewell/mistri");
            } catch (error) {
                toast.error("Failed to add mistri.");
            }
        });
    };

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-10">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admindashboard/tubewell/mistri">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Add Mistri</h1>
                        <p className="text-sm text-muted-foreground">Register a new mechanic in the system.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-primary" />
                            Mistri Details
                        </CardTitle>
                        <CardDescription>Enter the personal and contact details of the mechanic.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="E.g., Ram Mistri" disabled={isPending} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="mobileNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mobile Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="10-digit mobile number" disabled={isPending} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address / Location</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Full address of the mistri" rows={3} disabled={isPending} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="md:col-span-2 border-t pt-4 mt-2">
                                        <h4 className="font-medium text-sm">Bank Details</h4>
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
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <Button type="button" variant="outline" asChild disabled={isPending}>
                                        <Link href="/admindashboard/tubewell/mistri">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={isPending} className="gap-2">
                                        <Save className="h-4 w-4" />
                                        {isPending ? "Saving..." : "Save Mistri"}
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

