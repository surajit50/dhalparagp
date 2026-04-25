"use client";

import React, { useEffect, useState } from "react";
import { formatDate } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

const formSchema = z.object({
	paymentMethod: z.enum(["CASH", "CHEQUE", "ONLINE"]),
	paymentDate: z.date(),
	chequeNumber: z.string().optional(),
	chequeDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ClientAddPaymentPage({ id }: { id: string }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [emd, setEmd] = useState<any>(null);

	useEffect(() => {
		const fetchEmd = async () => {
			try {
				const response = await fetch(`/api/earnest-money/${id}`);
				if (!response.ok) throw new Error("Failed to fetch EMD details");
				const data = await response.json();
				setEmd(data);
			} catch (error) {
				console.error("Error fetching EMD:", error);
				toast.error("Failed to load EMD details");
			}
		};

		fetchEmd();
	}, [id]);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			paymentMethod: "CASH",
			paymentDate: new Date(),
			chequeNumber: "",
			chequeDate: undefined,
		},
	});

	const paymentMethod = form.watch("paymentMethod");

	const onSubmit = async (values: FormValues) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/earnest-money/${id}/payment`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...values,
					paymentstatus: "paid",
				}),
			});

			if (!response.ok) throw new Error("Failed to add payment");

			toast.success("Payment added successfully");
			router.push(`/admindashboard/register/earnest-money/payment/${id}`);
		} catch (error) {
			console.error("Error adding payment:", error);
			toast.error("Failed to add payment");
		} finally {
			setIsLoading(false);
		}
	};

	if (!emd) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4">
			<div className="flex items-center space-x-4 mb-6">
				<Button variant="ghost" size="icon" asChild>
					<Link href={`/admindashboard/register/earnest-money/payment/${id}`}>
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<h1 className="text-2xl font-bold">Add Payment</h1>
			</div>

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Payment Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4 mb-6">
							<div>
								<p className="text-sm text-muted-foreground">Total EMD Amount</p>
								<p className="font-medium">₹{emd.earnestMoneyAmount}</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Current Status</p>
								<p className="font-medium">{emd.paymentstatus}</p>
							</div>
						</div>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
								<FormField
									control={form.control}
									name="paymentMethod"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Payment Method</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select payment method" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="CASH">Cash</SelectItem>
													<SelectItem value="CHEQUE">Cheque</SelectItem>
													<SelectItem value="ONLINE">Online</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="paymentDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Payment Date</FormLabel>
											<FormControl>
												<DatePicker date={field.value} setDate={(date) => field.onChange(date)} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{paymentMethod === "CHEQUE" && (
									<>
										<FormField
											control={form.control}
											name="chequeNumber"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Cheque Number</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="chequeDate"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Cheque Date</FormLabel>
													<FormControl>
														<DatePicker date={field.value} setDate={field.onChange} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</>
								)}

								<div className="flex justify-end space-x-4">
									<Button type="button" variant="outline" onClick={() => router.back()}>
										Cancel
									</Button>
									<Button type="submit" disabled={isLoading}>
										{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
										Add Payment
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

