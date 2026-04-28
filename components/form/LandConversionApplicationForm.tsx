 "use client";
 
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
 import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Button } from "@/components/ui/button";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
 import {
   FileText,
   CheckCircle,
   Clock,
   PlusCircle,
   Trash2,
   Upload,
   File,
 } from "lucide-react";
 import { createLandConversionApplication } from "@/action/land-conversion-actions";
import {
  landConversionApplicationSchema,
  type LandConversionApplicationInput,
} from "@/schema/land-conversion";
 
const emptyLand: LandConversionApplicationInput["additionalLands"][number] = {
   khatianNo: "",
   plotNo: "",
   mouza: "",
   jlNo: "",
 
   landAreaDec: "",
   presentLandUse: "",
   proposedLandUse: "",
 };
 
const defaultValues: LandConversionApplicationInput = {
  applicantName: "",
  applicantPhone: "",
  applicantEmail: "",
  address: "",
  khatianNo: "",
  plotNo: "",
  mouza: "",
  jlNo: "",
  landAreaDec: "",
  presentLandUse: "",
  proposedLandUse: "",
  additionalLands: [],
};

const presentLandUseOptions = [
  { value: "agriculture", label: "Agriculture" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
] as const;

const proposedLandUseOptions = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "institutional", label: "Institutional" },
] as const;

 export default function LandConversionApplicationForm() {
   const { toast } = useToast();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isPending, startTransition] = useTransition();
   const [createdApplicationId, setCreatedApplicationId] = useState<string | null>(
     null,
   );
   const [uploadingDoc, setUploadingDoc] = useState<"ID_PROOF" | "LAND_DOCUMENT" | null>(
     null,
   );
 
  const form = useForm<LandConversionApplicationInput>({
    resolver: zodResolver(landConversionApplicationSchema),
    defaultValues,
    mode: "onBlur",
   });
 
  const { control, handleSubmit, reset } = form;
  const { fields: additionalLands, append, remove } = useFieldArray({
    control,
    name: "additionalLands",
  });
 
  const submitForm = async (
    values: LandConversionApplicationInput,
    action: "draft" | "submit",
  ) => {
    setIsSubmitting(true);
    startTransition(async () => {
      try {
        const result = await createLandConversionApplication(
          values,
          action === "draft" ? "DRAFT" : "SUBMIT",
        );

        if (!result.success) {
          toast({
            title: "Error saving application",
            description: result.error ?? "Please check the form and try again.",
            variant: "destructive",
          });
          return;
        }

        setCreatedApplicationId(result.data?.application.id ?? null);

        toast({
          title: action === "draft" ? "Draft saved" : "Application submitted",
          description:
            action === "draft"
              ? "Your draft has been saved in the system."
              : `Application submitted. Application No: ${result.data?.application.applicationNo}. You can upload documents below.`,
        });

        if (action === "submit") {
          reset(defaultValues);
        }
      } catch (error) {
        console.error("Failed to submit land conversion application:", error);
        toast({
          title: "Error saving application",
          description: "Unexpected error. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    });
   };
 
   const handleDocumentUpload = async (type: "ID_PROOF" | "LAND_DOCUMENT", file: File) => {
     if (!createdApplicationId) return;
     setUploadingDoc(type);
     try {
       const formData = new FormData();
       formData.set("file", file);
       formData.set("documentType", type);
       formData.set("applicationId", createdApplicationId);
       const res = await fetch("/api/land-conversion/upload", {
         method: "POST",
         body: formData,
       });
       const data = await res.json();
       if (!res.ok) {
         toast({
           title: "Upload failed",
           description: data.error ?? "Please try again.",
           variant: "destructive",
         });
         return;
       }
       toast({
         title: "Document uploaded",
         description: `${type === "ID_PROOF" ? "ID proof" : "Land document"} uploaded successfully.`,
       });
     } catch (e) {
       toast({
         title: "Upload failed",
         description: "Network error. Please try again.",
         variant: "destructive",
       });
     } finally {
       setUploadingDoc(null);
     }
   };
 
   return (
     <div className="max-w-7xl mx-auto p-6">
       <div className="bg-white border border-gray-300 shadow-sm">
         <div className="bg-[#e2e8f0] px-4 py-3 border-b">
           <h2 className="text-gray-700 font-semibold">Land Conversion NOC - New Application</h2>
         </div>
         <div className="p-4">
          <Form {...form}>
            <form className="max-w-5xl space-y-6">
             <Card>
               <CardHeader>
                 <CardTitle>Applicant Information</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="applicantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="applicantPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="applicantEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 </div>
                <FormField
                  control={control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader>
                 <CardTitle>Land Details</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["khatianNo", "plotNo", "mouza", "jlNo", "landAreaDec"] as const).map(
                    (name) => (
                      <FormField
                        key={name}
                        control={control}
                        name={name}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {name === "landAreaDec"
                                ? "Land Area (Decimal) *"
                                : `${name.replace(/([A-Z])/g, " $1").trim()} *`}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                inputMode={name === "landAreaDec" ? "decimal" : undefined}
                                placeholder={name === "landAreaDec" ? "e.g. 5.5" : undefined}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ),
                  )}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="presentLandUse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Present Land Use *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select present land use" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {presentLandUseOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="proposedLandUse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposed Land Use *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select proposed land use" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {proposedLandUseOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 </div>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-base">Additional land parcels (optional)</CardTitle>
                 <p className="text-sm text-muted-foreground">
                   One certificate can cover multiple lands. Add more parcels below.
                 </p>
               </CardHeader>
               <CardContent className="space-y-4">
                 {additionalLands.map((land, idx) => (
                   <div
                    key={land.id}
                     className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3"
                   >
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-700">
                         Land parcel {idx + 2}
                       </span>
                       <Button
                         type="button"
                         variant="ghost"
                         size="sm"
                        onClick={() => remove(idx)}
                         className="text-red-600 hover:text-red-700"
                       >
                         <Trash2 className="h-4 w-4 mr-1" />
                         Remove
                       </Button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                       {(
                         ["khatianNo", "plotNo", "mouza", "jlNo", "landAreaDec"] as const
                       ).map((field) => (
                        <FormField
                          key={field}
                          control={control}
                          name={`additionalLands.${idx}.${field}`}
                          render={({ field: nestedField }) => (
                            <FormItem>
                              <FormLabel className="text-xs">
                                {field === "landAreaDec"
                                  ? "Land area (dec)"
                                  : field.replace(/([A-Z])/g, " $1").trim()}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...nestedField}
                                  placeholder={field === "landAreaDec" ? "e.g. 5" : ""}
                                  inputMode={field === "landAreaDec" ? "decimal" : undefined}
                                  className="mt-1"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                       ))}
                      <FormField
                        control={control}
                        name={`additionalLands.${idx}.presentLandUse`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Present land use</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {presentLandUseOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`additionalLands.${idx}.proposedLandUse`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Proposed land use</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {proposedLandUseOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                     </div>
                   </div>
                 ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ ...emptyLand })}
                >
                   <PlusCircle className="h-4 w-4 mr-2" />
                   Add another land parcel
                 </Button>
               </CardContent>
             </Card>
 
             {createdApplicationId && (
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Upload className="h-5 w-5" />
                     Upload documents
                   </CardTitle>
                   <p className="text-sm text-muted-foreground">
                     Upload ID proof and land documents for this application.
                   </p>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                      <div className="text-sm font-medium leading-none">ID proof (PDF or image)</div>
                       <div className="mt-2 flex items-center gap-2">
                         <Input
                           type="file"
                           accept=".pdf,image/*"
                           onChange={(e) => {
                             const f = e.target.files?.[0];
                             if (f) handleDocumentUpload("ID_PROOF", f);
                             e.target.value = "";
                           }}
                           disabled={!!uploadingDoc}
                           className="max-w-xs"
                         />
                         {uploadingDoc === "ID_PROOF" && (
                           <span className="text-sm text-muted-foreground">Uploading...</span>
                         )}
                       </div>
                     </div>
                     <div>
                      <div className="text-sm font-medium leading-none">Land document (PDF or image)</div>
                       <div className="mt-2 flex items-center gap-2">
                         <Input
                           type="file"
                           accept=".pdf,image/*"
                           onChange={(e) => {
                             const f = e.target.files?.[0];
                             if (f) handleDocumentUpload("LAND_DOCUMENT", f);
                             e.target.value = "";
                           }}
                           disabled={!!uploadingDoc}
                           className="max-w-xs"
                         />
                         {uploadingDoc === "LAND_DOCUMENT" && (
                           <span className="text-sm text-muted-foreground">Uploading...</span>
                         )}
                       </div>
                     </div>
                   </div>
                   <p className="text-xs text-muted-foreground flex items-center gap-1">
                     <File className="h-3 w-3" />
                     Max 5MB per file. PDF, JPEG, PNG or WebP.
                   </p>
                 </CardContent>
               </Card>
             )}
 
             <Card>
               <CardContent className="pt-6">
                 <div className="flex flex-col sm:flex-row gap-4">
                   <Button
                    type="button"
                     variant="outline"
                    onClick={handleSubmit((values) => submitForm(values, "draft"))}
                     disabled={isSubmitting || isPending}
                     className="flex-1"
                   >
                     <FileText className="h-4 w-4 mr-2" />
                     Save as Draft
                   </Button>
                   <Button
                    type="button"
                    onClick={handleSubmit((values) => submitForm(values, "submit"))}
                     disabled={isSubmitting || isPending}
                     className="flex-1"
                   >
                     {isSubmitting || isPending ? (
                       <Clock className="h-4 w-4 mr-2 animate-spin" />
                     ) : (
                       <CheckCircle className="h-4 w-4 mr-2" />
                     )}
                     Submit Application
                   </Button>
                 </div>
               </CardContent>
             </Card>
            </form>
          </Form>
         </div>
       </div>
     </div>
   );
 }
