"use client"
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, PlusIcon, TrashIcon } from 'lucide-react';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Added RadioGroup

// Zod schema for validation
const inspectionSchema = z.object({
  grant: z.string().min(1, "Grant is required"),
  district: z.string().min(1, "District is required"),
  panchayat: z.string().optional(),
  block: z.string().min(1, "Block is required"),
  dateOfVisit: z.date(),
  schemeName: z.string().min(1, "Scheme name is required"),
  activityCode: z.string().min(1, "Activity code is required"),
  schemeId: z.string().min(1, "Scheme ID is required"),
  fundName: z.string().min(1, "Fund name is required"),
  workOrderAmount: z.coerce.number().positive("Amount must be positive"),
  billAmount: z.coerce.number().positive("Amount must be positive"),
  
  // Inspection parameters
  planStatus: z.enum(["EXIST", "NOT_EXIST"]),
  nitPublication: z.enum(["EXIST", "NOT_EXIST"]),
  bidderDocuments: z.enum(["EXIST", "NOT_EXIST"]),
  comparativeStatement: z.enum(["EXIST", "NOT_EXIST"]),
  awardOfContract: z.enum(["EXIST", "NOT_EXIST"]),
  agreementPaper: z.enum(["EXIST", "NOT_EXIST"]),
  workOrder: z.enum(["EXIST", "NOT_EXIST"]),
  nprEstimate: z.enum(["EXIST", "NOT_EXIST"]),
  drawing: z.enum(["EXIST", "NOT_EXIST"]),
  lfeVetting: z.enum(["OK", "NOT_OK"]),
  landRecord: z.enum(["EXIST", "NOT_EXIST", "N/A"]),
  materialTesting: z.enum(["EXIST", "NOT_EXIST"]),
  assetStrength: z.enum(["OK", "NOT_OK"]),
  measurementVerification: z.enum(["OK", "NOT_OK"]),
  isCertificate: z.enum(["EXIST", "NOT_EXIST", "N/A"]),
  warrantyDocument: z.enum(["EXIST", "NOT_EXIST", "N/A"]),
  mbStatus: z.enum(["COMPLETED", "INCOMPLETE"]),
  workDocumentation: z.enum(["OK", "NOT_OK"]),
  
  // Overall observation
  planRelated: z.enum(["Satisfactory", "Not satisfactory"]),
  procurementRelated: z.enum(["Satisfactory", "Not satisfactory"]),
  technicalAspect: z.enum(["Satisfactory", "Not satisfactory"]),
  
  measuresSuggested: z.string().optional(),
  
  // Personnel
  personnel: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    designation: z.string().min(1, "Designation is required"),
    signature: z.string().optional()
  })).min(1, "At least one personnel is required")
});

type InspectionFormData = z.infer<typeof inspectionSchema>;

// Mock database data
const mockDatabase: Record<string, InspectionFormData> = {
  "88922790": {
    grant: "NO.3 DHALPARA",
    district: "DAKSHIN DINAPUR",
    panchayat: "",
    block: "HILI",
    dateOfVisit: new Date("2025-06-09"),
    schemeName: "Construction of CC Road from house of Abdul Salam Mandal to Ras Mandir at Mahishnota Sansad",
    activityCode: "890926811",
    schemeId: "88922790",
    fundName: "15TH CFC",
    workOrderAmount: 299700,
    billAmount: 298333,
    planStatus: "EXIST",
    nitPublication: "EXIST",
    bidderDocuments: "EXIST",
    comparativeStatement: "EXIST",
    awardOfContract: "EXIST",
    agreementPaper: "EXIST",
    workOrder: "EXIST",
    nprEstimate: "EXIST",
    drawing: "EXIST",
    lfeVetting: "OK",
    landRecord: "N/A",
    materialTesting: "EXIST",
    assetStrength: "OK",
    measurementVerification: "OK",
    isCertificate: "N/A",
    warrantyDocument: "N/A",
    mbStatus: "COMPLETED",
    workDocumentation: "OK",
    planRelated: "Satisfactory",
    procurementRelated: "Satisfactory",
    technicalAspect: "Satisfactory",
    measuresSuggested: "",
    personnel: [
      { name: "BAPPA LAHA", designation: "NIRMAN SAHAYAK", signature: "" },
      { name: "SANDIP CHAUHAN", designation: "REM,ISGPP CELL", signature: "" },
      { name: "AMIT HALDER", designation: "FMPM,ISGPP CELL", signature: "" }
    ]
  },
  "89093178": {
    grant: "NO.3 DHALPARA",
    district: "DAKSHIN DINAPUR",
    panchayat: "",
    block: "HILI",
    dateOfVisit: new Date("2025-06-09"),
    schemeName: "Construction of CC Road from house of Silash Hasda Mandal towards house of Abar Ali at Dhalpara Sansad",
    activityCode: "89093178",
    schemeId: "89093178",
    fundName: "15TH CFC",
    workOrderAmount: 249725,
    billAmount: 249712,
    planStatus: "EXIST",
    nitPublication: "EXIST",
    bidderDocuments: "EXIST",
    comparativeStatement: "EXIST",
    awardOfContract: "EXIST",
    agreementPaper: "EXIST",
    workOrder: "EXIST",
    nprEstimate: "EXIST",
    drawing: "EXIST",
    lfeVetting: "OK",
    landRecord: "N/A",
    materialTesting: "EXIST",
    assetStrength: "OK",
    measurementVerification: "OK",
    isCertificate: "N/A",
    warrantyDocument: "N/A",
    mbStatus: "COMPLETED",
    workDocumentation: "OK",
    planRelated: "Satisfactory",
    procurementRelated: "Satisfactory",
    technicalAspect: "Satisfactory",
    measuresSuggested: "",
    personnel: [
      { name: "BAPPA LAHA", designation: "NIRMAN SAHAYAK", signature: "" },
      { name: "SANDIP CHAUHAN", designation: "REM,ISGPP CELL", signature: "" },
      { name: "AMIT HALDER", designation: "FMPM,ISGPP CELL", signature: "" }
    ]
  }
};

export default function SchemeInspectionForm() {
  const [schemeId, setSchemeId] = useState<string>("88922790");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      grant: "",
      district: "",
      panchayat: "",
      block: "",
      dateOfVisit: new Date(),
      schemeName: "",
      activityCode: "",
      schemeId: "",
      fundName: "",
      workOrderAmount: 0,
      billAmount: 0,
      planStatus: "EXIST",
      nitPublication: "EXIST",
      bidderDocuments: "EXIST",
      comparativeStatement: "EXIST",
      awardOfContract: "EXIST",
      agreementPaper: "EXIST",
      workOrder: "EXIST",
      nprEstimate: "EXIST",
      drawing: "EXIST",
      lfeVetting: "OK",
      landRecord: "N/A",
      materialTesting: "EXIST",
      assetStrength: "OK",
      measurementVerification: "OK",
      isCertificate: "N/A",
      warrantyDocument: "N/A",
      mbStatus: "COMPLETED",
      workDocumentation: "OK",
      planRelated: "Satisfactory",
      procurementRelated: "Satisfactory",
      technicalAspect: "Satisfactory",
      measuresSuggested: "",
      personnel: [{ name: "", designation: "", signature: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "personnel"
  });

  useEffect(() => {
    if (schemeId && mockDatabase[schemeId]) {
      form.reset(mockDatabase[schemeId]);
    }
  }, [schemeId, form]);

  const onSubmit = async (data: InspectionFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Form submitted:", data);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scheme Inspection Report</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Complete the inspection details for government schemes with accuracy and efficiency
        </p>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="mb-8 bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Scheme</label>
            <Select
              value={schemeId}
              onValueChange={(value) => setSchemeId(value)}
            >
              <SelectTrigger className="w-full bg-gray-50">
                <SelectValue placeholder="Select a scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="88922790">CC Road from Abdul Salam Mandal to Ras Mandir</SelectItem>
                <SelectItem value="89093178">CC Road from Silash Hasda Mandal to Abar Ali</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => form.reset()}
              className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              Reset Form
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigator.clipboard.writeText(JSON.stringify(form.getValues(), null, 2))}
              className="flex-1"
            >
              Copy Data
            </Button>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Select a scheme to auto-fill form data
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Scheme Details Card */}
          <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <CardTitle className="text-xl flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Scheme Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="grant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Grant</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter grant" 
                          {...field} 
                          className="bg-gray-50 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">District</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter district" 
                          {...field} 
                          className="bg-gray-50 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="block"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Block</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter block" 
                          {...field} 
                          className="bg-gray-50 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateOfVisit"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="font-medium text-gray-700">Date of Visit</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-gray-50 border-gray-300",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-70" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            className="bg-white rounded-md border"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="schemeName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="font-medium text-gray-700">Scheme Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter scheme name" 
                          {...field} 
                          className="bg-gray-50 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="activityCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Activity Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter activity code" 
                          {...field} 
                          className="bg-gray-50 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="schemeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Scheme ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter scheme ID" 
                          {...field} 
                          className="bg-gray-50 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fundName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Fund Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter fund name" 
                          {...field} 
                          className="bg-gray-50 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="workOrderAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Work Order Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter amount" 
                          {...field} 
                          className="bg-gray-50 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="billAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Bill Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter amount" 
                          {...field} 
                          className="bg-gray-50 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inspection Parameters Card */}
          <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <CardTitle className="text-xl flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Inspection Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Status */}
                <FormField
                  control={form.control}
                  name="planStatus"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Plan Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* NIT Publication */}
                <FormField
                  control={form.control}
                  name="nitPublication"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">NIT Publication</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Bidder Documents */}
                <FormField
                  control={form.control}
                  name="bidderDocuments"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Bidder Documents</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Comparative Statement */}
                <FormField
                  control={form.control}
                  name="comparativeStatement"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Comparative Statement</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Award of Contract */}
                <FormField
                  control={form.control}
                  name="awardOfContract"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Award of Contract</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Agreement Paper */}
                <FormField
                  control={form.control}
                  name="agreementPaper"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Agreement Paper</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Work Order */}
                <FormField
                  control={form.control}
                  name="workOrder"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Work Order</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* NPR Estimate */}
                <FormField
                  control={form.control}
                  name="nprEstimate"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">NPR Estimate</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Drawing */}
                <FormField
                  control={form.control}
                  name="drawing"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Drawing</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* LFE Vetting */}
                <FormField
                  control={form.control}
                  name="lfeVetting"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">LFE Vetting</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="OK" />
                            </FormControl>
                            <FormLabel className="font-normal">OK</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_OK" />
                            </FormControl>
                            <FormLabel className="font-normal">Not OK</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Land Record */}
                <FormField
                  control={form.control}
                  name="landRecord"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Land Record</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="N/A" />
                            </FormControl>
                            <FormLabel className="font-normal">N/A</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Material Testing */}
                <FormField
                  control={form.control}
                  name="materialTesting"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Material Testing</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Asset Strength */}
                <FormField
                  control={form.control}
                  name="assetStrength"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Asset Strength</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="OK" />
                            </FormControl>
                            <FormLabel className="font-normal">OK</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_OK" />
                            </FormControl>
                            <FormLabel className="font-normal">Not OK</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Measurement Verification */}
                <FormField
                  control={form.control}
                  name="measurementVerification"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Measurement Verification</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="OK" />
                            </FormControl>
                            <FormLabel className="font-normal">OK</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_OK" />
                            </FormControl>
                            <FormLabel className="font-normal">Not OK</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* IS Certificate */}
                <FormField
                  control={form.control}
                  name="isCertificate"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">IS Certificate</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="N/A" />
                            </FormControl>
                            <FormLabel className="font-normal">N/A</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Warranty Document */}
                <FormField
                  control={form.control}
                  name="warrantyDocument"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Warranty Document</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Exists</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_EXIST" />
                            </FormControl>
                            <FormLabel className="font-normal">Not Exist</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="N/A" />
                            </FormControl>
                            <FormLabel className="font-normal">N/A</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* MB Status */}
                <FormField
                  control={form.control}
                  name="mbStatus"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">MB Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="COMPLETED" />
                            </FormControl>
                            <FormLabel className="font-normal">Completed</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="INCOMPLETE" />
                            </FormControl>
                            <FormLabel className="font-normal">Incomplete</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Work Documentation */}
                <FormField
                  control={form.control}
                  name="workDocumentation"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Work Documentation</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="OK" />
                            </FormControl>
                            <FormLabel className="font-normal">OK</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="NOT_OK" />
                            </FormControl>
                            <FormLabel className="font-normal">Not OK</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Overall Observation Card */}
          <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <CardTitle className="text-xl flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.707 7.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L13 8.586V5a1 1 0 10-2 0v3.586l-1.293-1.293z" />
                  <path d="M5 12a1 1 0 011 1v2h8v-2a1 1 0 112 0v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a1 1 0 011-1z" />
                </svg>
                Overall Observation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Plan Related */}
                <FormField
                  control={form.control}
                  name="planRelated"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Plan Related</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Satisfactory" />
                            </FormControl>
                            <FormLabel className="font-normal">Satisfactory</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Not satisfactory" />
                            </FormControl>
                            <FormLabel className="font-normal">Not satisfactory</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Procurement Related */}
                <FormField
                  control={form.control}
                  name="procurementRelated"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Procurement Related</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Satisfactory" />
                            </FormControl>
                            <FormLabel className="font-normal">Satisfactory</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Not satisfactory" />
                            </FormControl>
                            <FormLabel className="font-normal">Not satisfactory</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                
                {/* Technical Aspect */}
                <FormField
                  control={form.control}
                  name="technicalAspect"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="font-medium text-gray-700">Technical Aspect</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Satisfactory" />
                            </FormControl>
                            <FormLabel className="font-normal">Satisfactory</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="Not satisfactory" />
                            </FormControl>
                            <FormLabel className="font-normal">Not satisfactory</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="measuresSuggested"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Measures Suggested</FormLabel>
                    <FormDescription className="text-gray-500 text-sm mb-2">
                      Provide any recommendations for improvement
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any suggested measures..."
                        className="min-h-[120px] bg-gray-50 border-gray-300"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Personnel Card */}
          <Card className="border border-gray-200 shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Inspecting Personnel
                </CardTitle>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => append({ name: "", designation: "", signature: "" })}
                  className="bg-white text-blue-700 hover:bg-blue-50"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Personnel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-b pb-6 last:border-0 last:pb-0">
                    <FormField
                      control={form.control}
                      name={`personnel.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Full name" 
                              {...field} 
                              className="bg-gray-50 border-gray-300"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`personnel.${index}.designation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium text-gray-700">Designation</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Position/Role" 
                              {...field} 
                              className="bg-gray-50 border-gray-300"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormItem>
                      <FormLabel className="font-medium text-gray-700">Signature</FormLabel>
                      <div className="h-10 flex items-center justify-center border-2 border-dashed rounded-md bg-gray-50 text-gray-400">
                        {field.signature ? "Signature uploaded" : "No signature"}
                      </div>
                    </FormItem>
                    
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Save Draft
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Final Report"
              )}
            </Button>
          </div>

          {isSuccess && (
            <div className="fixed top-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Report submitted successfully!
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
