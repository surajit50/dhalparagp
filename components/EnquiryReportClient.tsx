"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
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

// Extracted DocumentItem component with memoization
const DocumentItem = memo(({ 
  doc, 
  index, 
  onToggleChecked, 
  onUpdateDetails 
}: { 
  doc: any; 
  index: number; 
  onToggleChecked: (index: number) => void;
  onUpdateDetails: (index: number, details: string) => void;
}) => {
  return (
    <div
      className={`relative group rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
        doc.checked
          ? "border-indigo-400 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-400/20"
          : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm"
      }`}
      onClick={() => onToggleChecked(index)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 p-2 rounded-lg transition-colors shadow-sm ${
              doc.checked
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
            }`}
          >
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex-1 pr-6">
            <h4 className={`text-sm font-semibold leading-tight ${doc.checked ? "text-indigo-900" : "text-gray-800"}`}>
              {doc.label}
            </h4>
            {doc.checked && (
              <div className="mt-3 transition-all duration-200 animate-in fade-in slide-in-from-top-1" onClick={(e) => e.stopPropagation()}>
                <Input
                  className="h-9 text-sm bg-white border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 placeholder:text-gray-400 shadow-sm"
                  value={doc.details || ""}
                  onChange={(e) => onUpdateDetails(index, e.target.value)}
                  placeholder={doc.placeholder}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {doc.checked && (
        <div className="absolute top-3 right-3 animate-in zoom-in-50 duration-200">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 drop-shadow-sm" />
        </div>
      )}
    </div>
  );
});

DocumentItem.displayName = 'DocumentItem';

export default function EnquiryReportClient() {
  const searchParams = useSearchParams();
  const printRef = useRef<HTMLDivElement>(null);

  const [reportType, setReportType] = useState<"combined" | "residence">("combined");
  const [searchRefNo, setSearchRefNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [loadedReportId, setLoadedReportId] = useState("");
  const [isReportSaved, setIsReportSaved] = useState(false);

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
    } else if (watchVillageName) {
      setValue("postOffice", "Trimohini");
    }
  }, [watchVillageName, setValue]);

  // Handle report type change – reset form
  const handleReportTypeChange = (type: "combined" | "residence") => {
    setReportType(type);
    setSearchRefNo("");
    setApplicationData(null);
    setIsReportSaved(false);
    reset(getDefaultFormValues(type));
  };

  // Document handlers with useCallback to avoid recreation
  const handleToggleDocument = useCallback((index: number) => {
    const newDocs = [...watchedDocuments];
    newDocs[index] = { ...newDocs[index], checked: !newDocs[index].checked };
    setValue("documents", newDocs);
  }, [watchedDocuments, setValue]);

  const handleUpdateDocumentDetails = useCallback((index: number, details: string) => {
    const newDocs = [...watchedDocuments];
    newDocs[index] = { ...newDocs[index], details };
    setValue("documents", newDocs);
  }, [watchedDocuments, setValue]);

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
            setIsReportSaved(true);
          } else {
            setIsReportSaved(false);
          }
        } catch (fetchErr) {
          console.error("Error fetching saved report:", fetchErr);
          setIsReportSaved(false);
        }
      } else {
        alert("No application found with this Reference Number");
        setApplicationData(null);
        setIsReportSaved(false);
      }
    } catch (error) {
      console.error("Error fetching application:", error);
      alert("Error fetching application details");
      setIsReportSaved(false);
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
      setIsReportSaved(true);
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
              setIsReportSaved(true);
            } else {
              setIsReportSaved(false);
            }
          } catch (fetchErr) {
            console.error("Error fetching saved report:", fetchErr);
            setIsReportSaved(false);
          }
        } else {
          setIsReportSaved(false);
        }
      } catch (error) {
        console.error(error);
        setIsReportSaved(false);
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
          setApplicationData(null);
          setIsReportSaved(true);
        } else {
          setIsReportSaved(false);
        }
      } catch (error) {
        console.error("Error loading standalone report:", error);
        setIsReportSaved(false);
      } finally {
        setLoading(false);
      }
    };

    if (refNoParam && !applicationData && !loading && !searchRefNo) {
      setSearchRefNo(refNoParam);
      loadFromRefNo(refNoParam);
    } else if (reportIdParam && !loading && loadedReportId !== reportIdParam) {
      setLoadedReportId(reportIdParam);
      loadFromReportId(reportIdParam);
    }
  }, [searchParams, reportType, applicationData, loading, searchRefNo, loadedReportId, setValue, reset]);

  const showReportForm = reportType === "residence" || (reportType === "combined" && applicationData);

  return (
    <div className="container mx-auto px-4 py-6 md:px-8 lg:py-12 space-y-8 print:space-y-0 print:p-0 relative">
      {/* Decorative Background Elements (No print) */}
      <div className="print:hidden absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white pointer-events-none" />
      
      {/* NO-PRINT SECTION: Controls and Form */}
      <div className="print:hidden space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-700 via-blue-700 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2.5 bg-blue-100/50 rounded-xl shadow-sm">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              Enquiry Report Generator
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl pl-[60px]">
              Create a sophisticated Permanent Residence Report or a combined report with Legal Heirs information.
            </p>
          </div>
        </div>

        {/* Report Type Selection Card */}
        <Card className="border-0 shadow-xl ring-1 ring-gray-900/5 bg-white overflow-hidden rounded-2xl">
          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">Select Report Type</h2>
              <p className="text-sm text-gray-500">Choose the appropriate report template. Switching will reset the current form data.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`group relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                  reportType === "combined"
                    ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30 shadow-md"
                    : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                }`}
                onClick={() => handleReportTypeChange("combined")}
              >
                {/* Background accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity ${reportType === "combined" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                
                {reportType === "combined" && (
                  <div className="absolute top-4 right-4 z-10">
                    <CheckCircle2 className="w-6 h-6 text-indigo-600 drop-shadow-sm" />
                  </div>
                )}
                <div className="flex items-start gap-5 relative z-10">
                  <div
                    className={`p-3.5 rounded-xl transition-colors shadow-sm ${
                      reportType === "combined"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                    }`}
                  >
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className={`font-semibold text-lg ${reportType === "combined" ? "text-indigo-900" : "text-gray-900"}`}>
                      Combined Report
                    </h3>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                      Includes both Residence &amp; Warish details. Requires a valid Warish Reference Number.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`group relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                  reportType === "residence"
                    ? "border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30 shadow-md"
                    : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                }`}
                onClick={() => handleReportTypeChange("residence")}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity ${reportType === "residence" ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                
                {reportType === "residence" && (
                  <div className="absolute top-4 right-4 z-10">
                    <CheckCircle2 className="w-6 h-6 text-indigo-600 drop-shadow-sm" />
                  </div>
                )}
                <div className="flex items-start gap-5 relative z-10">
                  <div
                    className={`p-3.5 rounded-xl transition-colors shadow-sm ${
                      reportType === "residence"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                    }`}
                  >
                    <Home className="h-6 w-6" />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className={`font-semibold text-lg ${reportType === "residence" ? "text-indigo-900" : "text-gray-900"}`}>
                      Permanent Residence
                    </h3>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                      Generate a standalone Permanent Residence Report without Warish data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {reportType === "combined" && (
              <div className="pt-6 border-t border-gray-100 animate-in fade-in-50 duration-300">
                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50 flex flex-col sm:flex-row gap-4 items-end shadow-sm">
                  <div className="flex-1 space-y-2.5 w-full">
                    <Label className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                      <Search className="w-4 h-4 text-indigo-600" />
                      Warish Application Reference Number
                    </Label>
                    <Input
                      placeholder="e.g. 095/DGP/(LH)/2025"
                      value={searchRefNo}
                      onChange={(e) => setSearchRefNo(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="h-11 bg-white border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={loading || !searchRefNo}
                    className="h-11 px-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto font-medium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Find Application
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {showReportForm && (
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveReport)} className="space-y-6">
              
                {/* Form Sections Grid Wrapper */}
                <div className="grid grid-cols-1 gap-6">
                
                  {/* SECTION: Subject Details */}
                  <Card className="border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                      <div className="p-2 bg-indigo-100/80 rounded-lg text-indigo-700 shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Applicant Details</h3>
                        <p className="text-xs text-gray-500 font-medium">Subject information for the report</p>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FormField control={control} name="personName" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium">Full Name</FormLabel><FormControl><Input placeholder="Enter full name" className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="fatherName" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium">Father/Husband Name</FormLabel><FormControl><Input placeholder="Father/Husband's name" className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="villageName" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium">Village</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30"><SelectValue placeholder="Select Village" /></SelectTrigger></FormControl><SelectContent>{villagenameOption.map((v) => (<SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="postOffice" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> Post Office</FormLabel><FormControl><Input placeholder="Post office name" className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* SECTION: Memo Details */}
                  <Card className="border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                      <div className="p-2 bg-blue-100/80 rounded-lg text-blue-700 shadow-sm">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Reference Information</h3>
                        <p className="text-xs text-gray-500 font-medium">Memo and reference tracking</p>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FormField control={control} name="memoNo" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium">Memo No.</FormLabel><FormControl><Input placeholder="Auto-generated or leave blank" className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="memoDate" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium">Memo Date</FormLabel><FormControl><Input type="date" className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="refMemoNo" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium">Reference Memo No.</FormLabel><FormControl><Input placeholder="Optional reference" className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="refMemoDate" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium">Reference Memo Date</FormLabel><FormControl><Input type="date" className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* SECTION: Office Details */}
                  <Card className="border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                      <div className="p-2 bg-emerald-100/80 rounded-lg text-emerald-700 shadow-sm">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Office Addressee</h3>
                        <p className="text-xs text-gray-500 font-medium">Destination office details</p>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <FormField control={control} name="bdoTitle" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium">To (Title)</FormLabel><FormControl><Input className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="blockName" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium">Block Name</FormLabel><FormControl><Input className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="district" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium">District</FormLabel><FormControl><Input className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="policeStation" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium">Police Station</FormLabel><FormControl><Input className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={control} name="gramPanchayat" render={({ field }) => (
                          <FormItem><FormLabel className="text-gray-700 font-medium">Gram Panchayat</FormLabel><FormControl><Input className="h-10 border-gray-200 focus:border-indigo-400 bg-gray-50/30" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* SECTION: Documents */}
                  <Card className="border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100/80 rounded-lg text-amber-700 shadow-sm">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">Produced Documents</h3>
                          <p className="text-xs text-gray-500 font-medium">Check and detail all relevant documents</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {watchedDocuments.map((doc, index) => (
                          <DocumentItem
                            key={doc.id}
                            doc={doc}
                            index={index}
                            onToggleChecked={handleToggleDocument}
                            onUpdateDetails={handleUpdateDocumentDetails}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="sticky bottom-4 z-20 mt-8">
                  <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex-1">
                      {!applicationData && reportType === "residence" && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Standalone Residence Report</span>
                        </div>
                      )}
                      {applicationData && reportType === "combined" && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Linked to Warish Application</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <Button
                        type="button"
                        onClick={form.handleSubmit(handleSaveReport)}
                        variant="outline"
                        size="lg"
                        disabled={saving}
                        className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50 h-12 px-6 rounded-xl font-semibold text-gray-700"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Details"
                        )}
                      </Button>
                      {isReportSaved && (
                        <Button
                          type="button"
                          onClick={handleDownloadPDF}
                          size="lg"
                          className="flex-1 sm:flex-none h-12 px-6 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Generate PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

              </form>
            </Form>
          </div>
        )}
      </div>

      {/* PRINT ONLY SECTION: A4 Layout */}
      <EnquiryReportPrintTemplate
        reportType={reportType}
        applicationData={applicationData}
        printRef={printRef}
        memoNo={watch("memoNo")}
        memoDate={watch("memoDate") ? new Date(watch("memoDate")) : new Date()}
        refMemoNo={watch("refMemoNo") || ""}
        refMemoDate={watch("refMemoDate") ? new Date(watch("refMemoDate") as string) : null}
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
