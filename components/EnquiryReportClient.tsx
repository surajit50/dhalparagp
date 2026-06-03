"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { searchWarishApplications } from "@/action/warishApplicationAction";
import { saveEnquiryReport, getEnquiryReport, getEnquiryReportById } from "@/action/enquiryReportAction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Printer, FileText, Download, Home, User, MapPin, Building, Calendar, FileCheck, CheckCircle2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { villagenameOption } from "@/constants";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import EnquiryReportPrintTemplate from "./EnquiryReportPrintTemplate";

// Document item schema
const docItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  checked: z.boolean(),
  details: z.string().optional(),
  placeholder: z.string(),
});

// Main form schema
const enquiryReportSchema = z.object({
  personName: z.string().min(1, "Name is required"),
  fatherName: z.string().min(1, "Father/Husband name is required"),
  villageName: z.string().min(1, "Village is required"),
  postOffice: z.string().min(1, "Post Office is required"),
  memoNo: z.string().min(1, "Memo No. is required"),
  memoDate: z.string().min(1, "Memo date is required"),
  refMemoNo: z.string().optional(),
  refMemoDate: z.string().optional(),
  bdoTitle: z.string().min(1, "Title is required"),
  blockName: z.string().min(1, "Block name is required"),
  district: z.string().min(1, "District is required"),
  policeStation: z.string().min(1, "Police Station is required"),
  gramPanchayat: z.string().min(1, "Gram Panchayat is required"),
  documents: z.array(docItemSchema),
});

type EnquiryReportFormValues = z.infer<typeof enquiryReportSchema>;

const getDefaultDocs = (type: "combined" | "residence"): z.infer<typeof docItemSchema>[] => [
  { id: "aadhaar", label: "Aadhaar Card", checked: true, details: "", placeholder: "Aadhaar No..." },
  { id: "voter_card", label: "Voter ID Card", checked: false, details: "", placeholder: "EPIC No..." },
  ...(type === "combined" ? [{ id: "death_cert", label: "Death Certificate", checked: true, details: "", placeholder: "Certificate No..." }] : []),
  { id: "birth_cert", label: "Birth Certificate", checked: false, details: "", placeholder: "Certificate No..." },
  { id: "education_cert", label: "Educational Certificate", checked: false, details: "", placeholder: "Details..." },
  { id: "land_records", label: "Relevant Land Records", checked: true, details: "", placeholder: "Khatian Nos..." },
  { id: "others", label: "Other supporting documents and local enquiry reports", checked: true, details: "", placeholder: "Specify other documents..." },
];

const getDefaultFormValues = (type: "combined" | "residence"): EnquiryReportFormValues => ({
  personName: "",
  fatherName: "",
  villageName: "",
  postOffice: "",
  memoNo: "",
  memoDate: format(new Date(), "yyyy-MM-dd"),
  refMemoNo: "",
  refMemoDate: "",
  bdoTitle: "The Block Development Officer",
  blockName: "Hili Development Block",
  district: "Dakshin Dinajpur",
  policeStation: "Hili",
  gramPanchayat: "Dhalpara",
  documents: getDefaultDocs(type),
});

export default function EnquiryReportClient() {
  const searchParams = useSearchParams();
  const printRef = useRef<HTMLDivElement>(null);

  const [reportType, setReportType] = useState<"combined" | "residence">("combined");
  const [searchRefNo, setSearchRefNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);

  const form = useForm<EnquiryReportFormValues>({
    resolver: zodResolver(enquiryReportSchema),
    defaultValues: getDefaultFormValues("combined"),
    mode: "onChange",
  });

  const { reset, setValue, watch, control } = form;
  const watchedDocuments = watch("documents");
  const watchVillageName = watch("villageName");

  // Auto-update post office based on village selection
  useEffect(() => {
    if (watchVillageName === "Purbba Gobindapur") {
      setValue("postOffice", "Fatepur");
    } else if (watchVillageName === "Uttar Dhalpara" || watchVillageName === "Dakshin Dhalpara") {
      setValue("postOffice", "Trimohini");
    }
  }, [watchVillageName, setValue]);

  // Handle report type change – reset form
  const handleReportTypeChange = (type: "combined" | "residence") => {
    setReportType(type);
    setSearchRefNo("");
    setApplicationData(null);
    reset(getDefaultFormValues(type));
  };

  // Search warish application by reference number
  const handleSearch = async () => {
    if (!searchRefNo.trim()) return;
    setLoading(true);
    try {
      const escapedRefNo = searchRefNo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const results = await searchWarishApplications({ certificateNo: escapedRefNo });
      if (results && results.length > 0) {
        const appData = results[0];
        setApplicationData(appData);
        setValue("personName", appData.nameOfDeceased || "");
        setValue("fatherName", appData.fatherName || appData.spouseName || "");
        setValue("villageName", appData.villageName || "");
        setValue("postOffice", appData.postOffice || "");
        
        // Load saved report if exists
        try {
          const savedReport = await getEnquiryReport(appData.id);
          if (savedReport) {
            if (savedReport.memoNo) setValue("memoNo", savedReport.memoNo);
            if (savedReport.memoDate) setValue("memoDate", format(new Date(savedReport.memoDate), "yyyy-MM-dd"));
            if (savedReport.refMemoNo) setValue("refMemoNo", savedReport.refMemoNo);
            if (savedReport.refMemoDate) setValue("refMemoDate", format(new Date(savedReport.refMemoDate), "yyyy-MM-dd"));
            if (savedReport.bdoTitle) setValue("bdoTitle", savedReport.bdoTitle);
            if (savedReport.blockName) setValue("blockName", savedReport.blockName);
            if (savedReport.district) setValue("district", savedReport.district);
            if (savedReport.policeStation) setValue("policeStation", savedReport.policeStation);
            if (savedReport.gramPanchayat) setValue("gramPanchayat", savedReport.gramPanchayat);
            if (savedReport.docsDetails) {
              const savedDocs = savedReport.docsDetails as any[];
              const currentDocs = getDefaultDocs(reportType);
              const mergedDocs = currentDocs.map(defaultDoc => {
                const found = savedDocs.find(sd => sd.id === defaultDoc.id);
                return found ? { ...defaultDoc, ...found } : defaultDoc;
              });
              const extraDocs = savedDocs.filter(sd => !currentDocs.find(d => d.id === sd.id));
              setValue("documents", [...mergedDocs, ...extraDocs]);
            }
          }
        } catch (fetchErr) {
          console.error("Error fetching saved report:", fetchErr);
        }
      } else {
        alert("No application found with this Reference Number");
        setApplicationData(null);
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      alert("Error fetching application details");
    } finally {
      setLoading(false);
    }
  };

  // Save report (validated by react-hook-form)
  const handleSaveReport = async (data: EnquiryReportFormValues) => {
    if (!applicationData && reportType !== 'residence') {
      alert("Please search for a Warish application first");
      return;
    }
    setSaving(true);
    try {
      await saveEnquiryReport({
        warishApplicationId: applicationData?.id,
        personName: data.personName,
        fatherName: data.fatherName,
        villageName: data.villageName,
        postOffice: data.postOffice,
        reportType,
        memoNo: data.memoNo,
        memoDate: new Date(data.memoDate),
        refMemoNo: data.refMemoNo || "",
        refMemoDate: data.refMemoDate ? new Date(data.refMemoDate) : new Date(),
        bdoTitle: data.bdoTitle,
        blockName: data.blockName,
        district: data.district,
        policeStation: data.policeStation,
        gramPanchayat: data.gramPanchayat,
        docsDetails: data.documents,
      });
      alert("Report details saved successfully!");
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Failed to save report details.");
    } finally {
      setSaving(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setLoading(true);
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();

      const originalDisplay = printRef.current.style.display;
      printRef.current.style.display = "block";

      const canvas = await html2canvas(printRef.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      printRef.current.style.display = originalDisplay;

      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      const pdfHeight = height;
      const pdfWidth = height * ratio;

      pdf.addImage(imgData, "JPEG", (width - pdfWidth) / 2, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`Enquiry_Report_${applicationData?.acknowledgementNo || 'Generated'}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  // Load data from URL parameters (refNo or reportId)
  useEffect(() => {
    const refNoParam = searchParams.get("refNo");
    const reportIdParam = searchParams.get("reportId");

    const loadFromRefNo = async (refNo: string) => {
      setLoading(true);
      try {
        const escapedRefNo = refNo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const results = await searchWarishApplications({ certificateNo: escapedRefNo });
        if (results && results.length > 0) {
          const appData = results[0];
          setApplicationData(appData);
          setValue("personName", appData.nameOfDeceased || "");
          setValue("fatherName", appData.fatherName || appData.spouseName || "");
          setValue("villageName", appData.villageName || "");
          setValue("postOffice", appData.postOffice || "");
          
          try {
            const savedReport = await getEnquiryReport(appData.id);
            if (savedReport) {
              if (savedReport.memoNo) setValue("memoNo", savedReport.memoNo);
              if (savedReport.memoDate) setValue("memoDate", format(new Date(savedReport.memoDate), "yyyy-MM-dd"));
              if (savedReport.refMemoNo) setValue("refMemoNo", savedReport.refMemoNo);
              if (savedReport.refMemoDate) setValue("refMemoDate", format(new Date(savedReport.refMemoDate), "yyyy-MM-dd"));
              if (savedReport.bdoTitle) setValue("bdoTitle", savedReport.bdoTitle);
              if (savedReport.blockName) setValue("blockName", savedReport.blockName);
              if (savedReport.district) setValue("district", savedReport.district);
              if (savedReport.policeStation) setValue("policeStation", savedReport.policeStation);
              if (savedReport.gramPanchayat) setValue("gramPanchayat", savedReport.gramPanchayat);
              if (savedReport.docsDetails) {
                const savedDocs = savedReport.docsDetails as any[];
                const currentDocs = getDefaultDocs(reportType);
                const mergedDocs = currentDocs.map(defaultDoc => {
                  const found = savedDocs.find(sd => sd.id === defaultDoc.id);
                  return found ? { ...defaultDoc, ...found } : defaultDoc;
                });
                const extraDocs = savedDocs.filter(sd => !currentDocs.find(d => d.id === sd.id));
                setValue("documents", [...mergedDocs, ...extraDocs]);
              }
            }
          } catch (fetchErr) {
            console.error("Error fetching saved report:", fetchErr);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const loadFromReportId = async (reportId: string) => {
      setLoading(true);
      try {
        const savedReport = await getEnquiryReportById(reportId);
        if (savedReport) {
          const type = savedReport.reportType as "combined" | "residence";
          setReportType(type);
          // Do NOT fetch warish application – not needed for standalone report
          reset({
            personName: savedReport.personName || "",
            fatherName: savedReport.fatherName || "",
            villageName: savedReport.villageName || "",
            postOffice: savedReport.postOffice || "",
            memoNo: savedReport.memoNo || "",
            memoDate: savedReport.memoDate ? format(new Date(savedReport.memoDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
            refMemoNo: savedReport.refMemoNo || "",
            refMemoDate: savedReport.refMemoDate ? format(new Date(savedReport.refMemoDate), "yyyy-MM-dd") : "",
            bdoTitle: savedReport.bdoTitle || "The Block Development Officer",
            blockName: savedReport.blockName || "Hili Development Block",
            district: savedReport.district || "Dakshin Dinajpur",
            policeStation: savedReport.policeStation || "Hili",
            gramPanchayat: savedReport.gramPanchayat || "Dhalpara",
            documents: savedReport.docsDetails as any[] || getDefaultDocs(type),
          });
          setApplicationData(null); // No linked warish application
        }
      } catch (error) {
        console.error("Error loading standalone report:", error);
      } finally {
        setLoading(false);
      }
    };

    if (refNoParam && !applicationData && !loading && !searchRefNo) {
      setSearchRefNo(refNoParam);
      loadFromRefNo(refNoParam);
    } else if (reportIdParam && !loading) {
      loadFromReportId(reportIdParam);
    }
  }, [searchParams, reportType, applicationData, loading, searchRefNo, setValue, reset]);

  // Document item component (inline to have access to form methods)
  const DocumentItem = ({ doc, index }: { doc: any; index: number }) => {
    const toggleChecked = () => {
      const newDocs = [...watchedDocuments];
      newDocs[index] = { ...newDocs[index], checked: !newDocs[index].checked };
      setValue("documents", newDocs);
    };

    const updateDetails = (details: string) => {
      const newDocs = [...watchedDocuments];
      newDocs[index] = { ...newDocs[index], details };
      setValue("documents", newDocs);
    };

    return (
      <div
        className={`relative group rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
          doc.checked
            ? "border-blue-400 bg-blue-50/40 shadow-sm"
            : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
        }`}
        onClick={toggleChecked}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 p-1.5 rounded-lg transition-colors ${
                doc.checked
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600"
              }`}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 pr-6">
              <h4 className={`text-sm font-medium leading-tight ${doc.checked ? "text-blue-900" : "text-gray-800"}`}>
                {doc.label}
              </h4>
              {doc.checked && (
                <div className="mt-3 transition-all duration-200" onClick={(e) => e.stopPropagation()}>
                  <Input
                    className="h-9 text-sm bg-white border-blue-200 focus:border-blue-500 text-gray-700"
                    value={doc.details || ""}
                    onChange={(e) => updateDetails(e.target.value)}
                    placeholder={doc.placeholder}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {doc.checked && (
          <div className="absolute top-2 right-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
        )}
      </div>
    );
  };

  const showReportForm = reportType === "residence" || (reportType === "combined" && applicationData);

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:py-10 space-y-8 print:space-y-0 print:p-0">
      {/* NO-PRINT SECTION: Controls and Form */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
              <FileText className="h-7 w-7 text-blue-600" />
              Generate Enquiry Report
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Create a Permanent Residence Report or a combined report with Legal Heirs information.
            </p>
          </div>
        </div>

        {/* Report Type Selection Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-30 pointer-events-none" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-xl">Report Type</CardTitle>
            <CardDescription>Select the type of report you need (Switching will reset the form)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div
                className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-md ${
                  reportType === "combined"
                    ? "border-blue-500 bg-gradient-to-br from-blue-50/80 to-white shadow-md"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/10"
                }`}
                onClick={() => handleReportTypeChange("combined")}
              >
                {reportType === "combined" && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl transition-colors ${
                      reportType === "combined"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                    }`}
                  >
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${reportType === "combined" ? "text-blue-900" : "text-gray-800"}`}>
                      Combined Report
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Includes both Residence &amp; Warish details. Requires a valid Warish Reference Number.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-md ${
                  reportType === "residence"
                    ? "border-blue-500 bg-gradient-to-br from-blue-50/80 to-white shadow-md"
                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/10"
                }`}
                onClick={() => handleReportTypeChange("residence")}
              >
                {reportType === "residence" && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl transition-colors ${
                      reportType === "residence"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                    }`}
                  >
                    <Home className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${reportType === "residence" ? "text-blue-900" : "text-gray-800"}`}>
                      Permanent Residence Only
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate a standalone Permanent Residence Report without Warish data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {reportType === "combined" && (
              <div className="pt-4 border-t border-gray-100 animate-in fade-in-50 duration-300">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-500" />
                      Warish Application Reference Number
                    </Label>
                    <Input
                      placeholder="e.g. 095/DGP/(LH)/2025"
                      value={searchRefNo}
                      onChange={(e) => setSearchRefNo(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-shadow"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={loading || !searchRefNo}
                    className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-sm min-w-[130px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {showReportForm && (
          <Card className="border-0 shadow-lg overflow-hidden transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-blue-50/30 to-transparent border-b border-blue-100">
              <CardTitle className="text-xl text-gray-800">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSaveReport)} className="space-y-8">
                  {/* SECTION: Subject Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                        <User className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">
                        Applicant / Subject Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      <FormField
                        control={control}
                        name="personName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-sm">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" className="border-gray-200 focus:border-blue-400" {...field} />
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
                            <FormLabel className="text-gray-600 text-sm">Father / Husband Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Father's or husband's name" className="border-gray-200 focus:border-blue-400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="villageName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-sm">Village</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-gray-200 focus:border-blue-400">
                                  <SelectValue placeholder="Select Village" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {villagenameOption.map((v) => (
                                  <SelectItem key={v.value} value={v.value}>
                                    {v.label}
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
                        name="postOffice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-sm flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> Post Office
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Post office name" className="border-gray-200 focus:border-blue-400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* SECTION: Memo Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">
                        Memo &amp; Reference Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      <FormField
                        control={control}
                        name="memoNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-sm">Memo No.</FormLabel>
                            <FormControl>
                              <Input placeholder="Leave blank for handwriting" className="border-gray-200 focus:border-blue-400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="memoDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-sm">Memo Date</FormLabel>
                            <FormControl>
                              <Input type="date" className="border-gray-200 focus:border-blue-400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="refMemoNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-sm">Reference Memo No.</FormLabel>
                            <FormControl>
                              <Input placeholder="Reference memo number" className="border-gray-200 focus:border-blue-400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="refMemoDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-sm">Reference Memo Date</FormLabel>
                            <FormControl>
                              <Input type="date" className="border-gray-200 focus:border-blue-400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* SECTION: Office Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                        <Building className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">
                        Office Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                      <FormField
                        control={control}
                        name="bdoTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-sm">To (Title)</FormLabel>
                            <FormControl>
                              <Input className="border-gray-200 focus:border-blue-400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="blockName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-sm">Block Name</FormLabel>
                            <FormControl>
                              <Input className="border-gray-200 focus:border-blue-400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-sm">District</FormLabel>
                            <FormControl>
                              <Input className="border-gray-200 focus:border-blue-400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="policeStation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-sm">Police Station</FormLabel>
                            <FormControl>
                              <Input className="border-gray-200 focus:border-blue-400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="gramPanchayat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 text-sm">Gram Panchayat</FormLabel>
                            <FormControl>
                              <Input className="border-gray-200 focus:border-blue-400" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* SECTION: Documents */}
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1 pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">
                          Produced Documents
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500">Provide all relevant documents which are needed</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {watchedDocuments.map((doc, index) => (
                        <DocumentItem key={doc.id} doc={doc} index={index} />
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      {!applicationData && reportType === "residence" && (
                        <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full inline-block">
                          ℹ️ Standalone report will be saved as a Permanent Residence certificate.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3 flex-wrap justify-end">
                      <Button
                        type="button"
                        onClick={form.handleSubmit(handleSaveReport)}
                        variant="outline"
                        size="lg"
                        disabled={saving}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                          </>
                        ) : (
                          "Save Details"
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleDownloadPDF}
                        size="lg"
                        variant="outline"
                        className="text-blue-700 border-blue-300 hover:bg-blue-50"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download PDF
                      </Button>
                      <Button
                        type="button"
                        onClick={handlePrint}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                      >
                        <Printer className="w-5 h-5 mr-2" />
                        Print Report
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* PRINT ONLY SECTION: A4 Layout */}
      <EnquiryReportPrintTemplate
        reportType={reportType}
        applicationData={applicationData}
        printRef={printRef}
        memoNo={watch("memoNo")}
        memoDate={watch("memoDate")}
        refMemoNo={watch("refMemoNo")}
        refMemoDate={watch("refMemoDate")}
        bdoTitle={watch("bdoTitle")}
        blockName={watch("blockName")}
        district={watch("district")}
        policeStation={watch("policeStation")}
        gramPanchayat={watch("gramPanchayat")}
        personName={watch("personName")}
        fatherName={watch("fatherName")}
        villageName={watch("villageName")}
        postOffice={watch("postOffice")}
        docs={watch("documents")}
      />
    </div>
  );
}
