"use client";

import React, { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  FileText,
  MapPin,
  User2,
  Store,
} from "lucide-react";
import { vendorSchema } from "@/schema/venderschema";
import { vendorSchemaAction } from "@/action/uploadwork";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VendorRegistrationForm() {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof vendorSchema>>({
    resolver: zodResolver(vendorSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      mobileNumber: "",
      email: "",
      pan: "",
      tin: "",
      gst: "",
      postalAddress: "",
      agencyType: "INDIVIDUAL",
      proprietorName: "",
    },
  });

  const agencyType = form.watch("agencyType");

  async function onSubmit(values: z.infer<typeof vendorSchema>) {
    setError(undefined);
    setSuccess(undefined);

    startTransition(async () => {
      try {
        const result = await vendorSchemaAction(values);

        if (result?.error) {
          setError(result.error);
        } else {
          setSuccess("Vendor registered successfully.");
          form.reset();
        }
      } catch (err) {
        setError("Unexpected server error. Please try again.");
      }
    });
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl rounded-2xl border bg-gradient-to-br from-white to-gray-50">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
          Vendor Registration
        </CardTitle>
        <p className="text-center text-muted-foreground text-sm">
          Register new vendor for work order & billing system
        </p>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* ========================= */}
            {/* Personal Information */}
            {/* ========================= */}
            <div className="p-6 rounded-xl border bg-white shadow-sm space-y-6">
              <h3 className="flex items-center gap-2 font-semibold text-lg">
                <User className="h-5 w-5 text-orange-600" />
                Personal Information
              </h3>

              {/* Agency Type */}
              <FormField
                control={form.control}
                name="agencyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INDIVIDUAL">
                          <div className="flex items-center gap-2">
                            <User2 className="h-4 w-4 text-orange-600" />
                            Individual
                          </div>
                        </SelectItem>
                        <SelectItem value="FARM">
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 text-green-600" />
                            Farm
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {agencyType === "FARM"
                          ? "Farm Name *"
                          : "Full Name *"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={
                            agencyType === "FARM"
                              ? "Green Valley Farm"
                              : "John Doe"
                          }
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Proprietor (Farm only) */}
                {agencyType === "FARM" && (
                  <FormField
                    control={form.control}
                    name="proprietorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proprietor Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Owner Name"
                            className="h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Mobile */}
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          maxLength={10}
                          inputMode="numeric"
                          placeholder="9876543210"
                          className="h-12"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="example@gmail.com"
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ========================= */}
            {/* Tax Section */}
            {/* ========================= */}
            <div className="p-6 rounded-xl border bg-white shadow-sm space-y-6">
              <h3 className="flex items-center gap-2 font-semibold text-lg">
                <FileText className="h-5 w-5 text-green-600" />
                Tax Information
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                {/* PAN */}
                <FormField
                  control={form.control}
                  name="pan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          maxLength={10}
                          className="h-12 uppercase font-mono"
                          placeholder="ABCDE1234F"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.toUpperCase()
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* TIN */}
                <FormField
                  control={form.control}
                  name="tin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TIN</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="h-12"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* GST */}
                <FormField
                  control={form.control}
                  name="gst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GSTIN</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          maxLength={15}
                          className="h-12 uppercase font-mono"
                          placeholder="22ABCDE1234F1Z5"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.toUpperCase()
                            )
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ========================= */}
            {/* Address */}
            {/* ========================= */}
            <div className="p-6 rounded-xl border bg-white shadow-sm space-y-4">
              <h3 className="flex items-center gap-2 font-semibold text-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
                Postal Address
              </h3>

              <FormField
                control={form.control}
                name="postalAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complete Address *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[120px]"
                        placeholder="Village, PO, Block, District, PIN"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ========================= */}
            {/* Submit */}
            {/* ========================= */}
            <Button
              type="submit"
              disabled={!form.formState.isValid || isPending}
              className="w-full h-14 text-lg rounded-xl"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Complete Registration
                </>
              )}
            </Button>

            {(error || success) && (
              <Alert
                className={`border-l-4 ${
                  error
                    ? "border-red-500 bg-red-50"
                    : "border-green-500 bg-green-50"
                }`}
              >
                <AlertDescription>
                  {error || success}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
