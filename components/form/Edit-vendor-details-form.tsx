"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { vendorSchema } from "@/schema/venderschema";
import { updateAgencyDetails } from "@/action/agency-details";
import { useRouter } from "next/navigation";

export default function Editvendorform({
  defaultValues = {},
  id,
}: {
  defaultValues?: Partial<z.infer<typeof vendorSchema>>;
  id: string;
}) {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof vendorSchema>>({
    resolver: zodResolver(vendorSchema),
    defaultValues: defaultValues,
  });

  const agencyType = form.watch("agencyType");

  async function onSubmit(values: z.infer<typeof vendorSchema>) {
    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      updateAgencyDetails(values, id).then((data) => {
        if (data?.error) {
          setError(data.error);
        }
        if (data?.success) {
          setSuccess(data.success);
          setTimeout(() => router.back(), 1500); // Redirect after 1.5 seconds
        }
      });
    });
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent text-center">
          Edit Vendor Details
        </CardTitle>
        <CardDescription className="text-center text-sm sm:text-base text-gray-600">
          Update the vendor&apos;s information below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 sm:space-y-8"
          >
            {/* Personal Information Section */}
            <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 p-2 rounded-lg">
                    {/*  <User className="h-5 w-5" />*/}
                  </span>
                  Personal Information
                </h3>
                <p className="text-sm text-gray-500">
                  Update the vendor&apos;s contact details.
                </p>
              </div>
              {/* Agency Type Field */}
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="agencyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-1">
                        Agency Type <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300 h-12">
                            <SelectValue placeholder="Select agency type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                          <SelectItem value="FARM">Farm</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-1">
                        {agencyType === "FARM" ? "Farm Name" : "Full Name"} <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={agencyType === "FARM" ? "Farm Name" : "Enter full name"}
                          {...field}
                          className="focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Proprietor Name - shown for farm */}
                {agencyType === "FARM" && (
                  <FormField
                    control={form.control}
                    name="proprietorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 flex items-center gap-1">
                          Proprietor Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Proprietor's Full Name"
                            {...field}
                            className="focus:ring-2 focus:ring-blue-500 border-gray-300 h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-1">
                        Mobile <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter mobile number"
                          {...field}
                          className="border-gray-300 h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-gray-700 flex items-center gap-1">
                        Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                          className="border-gray-300 h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tax Information Section */}
            <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 p-2 rounded-lg">
                    {/*<FileText className="h-5 w-5" />*/}
                  </span>
                  Tax Information
                </h3>
                <p className="text-sm text-gray-500">
                  Update the vendor&apos;s tax details.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="pan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-1">
                        PAN <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter PAN"
                          {...field}
                          className="border-gray-300 h-12 font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">TIN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter TIN"
                          {...field}
                          className="border-gray-300 h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">GST</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter GST number"
                          {...field}
                          className="border-gray-300 h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-800 p-2 rounded-lg">
                    {/* <MapPin className="h-5 w-5" />*/}
                  </span>
                  Postal Address
                </h3>
              </div>
              <FormField
                control={form.control}
                name="postalAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center gap-1">
                      Address <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter postal address"
                        className="min-h-[120px] resize-y border-gray-300 focus:ring-2 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs sm:text-sm text-gray-500">
                      Provide the complete postal address for the vendor.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold h-14 rounded-xl shadow-lg transition-all transform hover:scale-[1.01]"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Update Vendor</span>
                </div>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        {error && (
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="bg-green-50 border-green-500 w-full">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-700">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
}
