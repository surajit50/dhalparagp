 "use client";
 
 import { useState, useTransition } from "react";
 import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
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
   FileText,
   CheckCircle,
   Clock,
   PlusCircle,
   Trash2,
   Upload,
   File,
 } from "lucide-react";
 import { createLandConversionApplication } from "@/action/land-conversion-actions";
 import type { LandEntry } from "@/schema/land-conversion";
 
 const emptyLand: LandEntry = {
   khatianNo: "",
   plotNo: "",
   mouza: "",
   jlNo: "",
 
   landAreaDec: "",
   presentLandUse: "",
   proposedLandUse: "",
 };
 
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
 
   const [form, setForm] = useState({
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
   });
 
   const [additionalLands, setAdditionalLands] = useState<LandEntry[]>([]);
 
   const addLand = () => setAdditionalLands((p) => [...p, { ...emptyLand }]);
   const removeLand = (idx: number) =>
     setAdditionalLands((p) => p.filter((_, i) => i !== idx));
   const updateAdditionalLand = (idx: number, field: keyof LandEntry, value: string) => {
     setAdditionalLands((p) => p.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
   };
 
   const handleSubmit = async (action: "draft" | "submit") => {
     setIsSubmitting(true);
     startTransition(async () => {
       try {
         const result = await createLandConversionApplication(
           {
             ...form,
             additionalLands,
           },
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
           setForm({
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
           });
           setAdditionalLands([]);
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
           <div className="max-w-5xl space-y-6">
             <Card>
               <CardHeader>
                 <CardTitle>Applicant Information</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <Label htmlFor="applicantName">Full Name *</Label>
                     <Input
                       id="applicantName"
                       value={form.applicantName}
                       onChange={(e) =>
                         setForm((p) => ({
                           ...p,
                           applicantName: e.target.value,
                         }))
                       }
                     />
                   </div>
                   <div>
                     <Label htmlFor="applicantPhone">Phone *</Label>
                     <Input
                       id="applicantPhone"
                       value={form.applicantPhone}
                       onChange={(e) =>
                         setForm((p) => ({
                           ...p,
                           applicantPhone: e.target.value,
                         }))
                       }
                     />
                   </div>
                   <div>
                     <Label htmlFor="applicantEmail">Email</Label>
                     <Input
                       id="applicantEmail"
                       type="email"
                       value={form.applicantEmail}
                       onChange={(e) =>
                         setForm((p) => ({
                           ...p,
                           applicantEmail: e.target.value,
                         }))
                       }
                     />
                   </div>
                 </div>
                 <div>
                   <Label htmlFor="address">Address *</Label>
                   <Textarea
                     id="address"
                     rows={3}
                     value={form.address}
                     onChange={(e) =>
                       setForm((p) => ({
                         ...p,
                         address: e.target.value,
                       }))
                     }
                   />
                 </div>
               </CardContent>
             </Card>
 
             <Card>
               <CardHeader>
                 <CardTitle>Land Details</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <Label htmlFor="khatianNo">Khatian No *</Label>
                     <Input
                       id="khatianNo"
                       value={form.khatianNo}
                       onChange={(e) =>
                         setForm((p) => ({
                           ...p,
                           khatianNo: e.target.value,
                         }))
                       }
                     />
                   </div>
                   <div>
                     <Label htmlFor="plotNo">Plot No *</Label>
                     <Input
                       id="plotNo"
                       value={form.plotNo}
                       onChange={(e) =>
                         setForm((p) => ({
                           ...p,
                           plotNo: e.target.value,
                         }))
                       }
                     />
                   </div>
                   <div>
                     <Label htmlFor="mouza">Mouza *</Label>
                     <Input
                       id="mouza"
                       value={form.mouza}
                       onChange={(e) =>
                         setForm((p) => ({
                           ...p,
                           mouza: e.target.value,
                         }))
                       }
                     />
                   </div>
                   <div>
                     <Label htmlFor="jlNo">JL No *</Label>
                     <Input
                       id="jlNo"
                       value={form.jlNo}
                       onChange={(e) =>
                         setForm((p) => ({
                           ...p,
                           jlNo: e.target.value,
                         }))
                       }
                     />
                   </div>
 
                   <div>
                     <Label htmlFor="landAreaDec">Land Area (Decimal) *</Label>
                     <Input
                       id="landAreaDec"
                       value={form.landAreaDec}
                       onChange={(e) =>
                         setForm((p) => ({
                           ...p,
                           landAreaDec: e.target.value,
                         }))
                       }
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <Label>Present Land Use *</Label>
                     <Select
                       value={form.presentLandUse}
                       onValueChange={(v) =>
                         setForm((p) => ({
                           ...p,
                           presentLandUse: v,
                         }))
                       }
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select present land use" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="agriculture">Agriculture</SelectItem>
                         <SelectItem value="residential">Residential</SelectItem>
                         <SelectItem value="commercial">Commercial</SelectItem>
                         <SelectItem value="industrial">Industrial</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <Label>Proposed Land Use *</Label>
                     <Select
                       value={form.proposedLandUse}
                       onValueChange={(v) =>
                         setForm((p) => ({
                           ...p,
                           proposedLandUse: v,
                         }))
                       }
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Select proposed land use" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="residential">Residential</SelectItem>
                         <SelectItem value="commercial">Commercial</SelectItem>
                         <SelectItem value="industrial">Industrial</SelectItem>
                         <SelectItem value="institutional">Institutional</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
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
                     key={idx}
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
                         onClick={() => removeLand(idx)}
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
                         <div key={field}>
                           <Label className="text-xs">
                             {field === "landAreaDec"
                               ? "Land area (dec)"
                               : field.replace(/([A-Z])/g, " $1").trim()}
                           </Label>
                           <Input
                             value={land[field]}
                             onChange={(e) => updateAdditionalLand(idx, field, e.target.value)}
                             placeholder={field === "landAreaDec" ? "e.g. 5" : ""}
                             className="mt-1"
                           />
                         </div>
                       ))}
                       <div>
                         <Label className="text-xs">Present land use</Label>
                         <Select
                           value={land.presentLandUse}
                           onValueChange={(v) => updateAdditionalLand(idx, "presentLandUse", v)}
                         >
                           <SelectTrigger className="mt-1">
                             <SelectValue placeholder="Select" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="agriculture">Agriculture</SelectItem>
                             <SelectItem value="residential">Residential</SelectItem>
                             <SelectItem value="commercial">Commercial</SelectItem>
                             <SelectItem value="industrial">Industrial</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                       <div>
                         <Label className="text-xs">Proposed land use</Label>
                         <Select
                           value={land.proposedLandUse}
                           onValueChange={(v) => updateAdditionalLand(idx, "proposedLandUse", v)}
                         >
                           <SelectTrigger className="mt-1">
                             <SelectValue placeholder="Select" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="residential">Residential</SelectItem>
                             <SelectItem value="commercial">Commercial</SelectItem>
                             <SelectItem value="industrial">Industrial</SelectItem>
                             <SelectItem value="institutional">Institutional</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>
                     </div>
                   </div>
                 ))}
                 <Button type="button" variant="outline" size="sm" onClick={addLand}>
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
                       <Label>ID proof (PDF or image)</Label>
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
                       <Label>Land document (PDF or image)</Label>
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
                     variant="outline"
                     onClick={() => handleSubmit("draft")}
                     disabled={isSubmitting || isPending}
                     className="flex-1"
                   >
                     <FileText className="h-4 w-4 mr-2" />
                     Save as Draft
                   </Button>
                   <Button
                     onClick={() => handleSubmit("submit")}
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
           </div>
         </div>
       </div>
     </div>
   );
 }
