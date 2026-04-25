"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ClipboardList, X, Plus, User } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

const schema = z.object({
  bdoReference: z.string().min(1, "BDO Reference is required"),
  reportDate: z.string().min(1, "Report date is required"),
  department: z.string().min(1, "Department is required"),
  applicantName: z.string().min(1, "Applicant name is required"),
  certificateNumber: z.string().min(1, "Certificate number is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  documents: z.array(
    z.object({
      type: z.string().min(1, "Type is required"),
      number: z.string().min(1, "Number is required"),
      authority: z.string().min(1, "Authority is required"),
    })
  ),
  addressVerification: z.string().min(1, "Address verification is required"),
  residencePeriod: z.string().min(1, "Residence period is required"),
  additionalFindings: z.string().optional(),
  verificationStatus: z.enum(["verified", "discrepancy", "pending"], {
    required_error: "Select a verification status"
  })
});

type FormData = z.infer<typeof schema>;

export function DomicileVerificationReport() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      documents: [{ type: "", number: "", authority: "" }],
    },
  });

  const { control, handleSubmit } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "documents",
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    alert("Verification report submitted successfully!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-t-4 border-blue-600">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-3 text-blue-800">
            <FileText className="h-6 w-6" />
            <div>
              <h1 className="text-xl font-bold">Domicile Certificate Verification Report</h1>
              <p className="text-sm font-normal text-blue-600 mt-1">
                Official Verification Report for Block Development Office
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="mt-6">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Office Reference Section */}
              <section className="border-b pb-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-gray-700">
                  <ClipboardList className="h-5 w-5" />
                  Office Reference Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="bdoReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BDO Reference Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter BDO reference number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="reportDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="department"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Issuing Department *</FormLabel>
                        <FormControl>
                          <Input placeholder="Block Development Office, District Administration" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Applicant Information */}
              <section className="border-b pb-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-gray-700">
                  <User className="h-5 w-5" />
                  Applicant Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="applicantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter applicant's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="certificateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certificate Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter certificate number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father&apos;s Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter father's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Document Verification */}
              <section className="border-b pb-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-gray-700">
                  <FileText className="h-5 w-5" /> Document Verification
                </h2>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end border p-4 rounded-lg">
                      <FormField
                        control={control}
                        name={`documents.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Type *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Aadhaar, Voter ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`documents.${index}.number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Document number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`documents.${index}.authority`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issuing Authority *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., UIDAI, Election Commission" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <X className="h-5 w-5 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => append({ type: "", number: "", authority: "" })}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Another Document
                  </Button>
                </div>
              </section>

              {/* Verification Findings */}
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-gray-700">
                  <FileText className="h-5 w-5" />
                  Verification Findings
                </h2>
                <FormField
                  control={control}
                  name="addressVerification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Verification *</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Permanent address verification findings" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="residencePeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residence Period Verified *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 15 years, Since birth" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="additionalFindings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Findings</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Any other relevant observations" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="verificationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Status *</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-4">
                          {["verified", "discrepancy", "pending"].map((status) => (
                            <label key={status} className="flex items-center gap-2">
                              <input
                                type="radio"
                                value={status}
                                checked={field.value === status}
                                onChange={field.onChange}
                              />
                              <span
                                className={
                                  status === "verified"
                                    ? "bg-green-100 text-green-800 px-3 py-1 rounded-full"
                                    : status === "discrepancy"
                                    ? "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full"
                                    : "bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                                }
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {/* Submission */}
              <div className="flex gap-4 pt-6 border-t">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  Submit Verification Report
                </Button>
                <Button type="reset" variant="outline" className="flex-1 border-blue-300 text-blue-700">
                  Clear Form
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

