"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { searchWarishApplications } from "@/action/warishApplicationAction";
import { saveEnquiryReport, getEnquiryReport, getEnquiryReportById } from "@/action/enquiryReportAction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Printer, FileText, Download, Home, User, MapPin, Building, Calendar, FileCheck, CheckCircle2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { villagenameOption } from "@/constants";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import EnquiryReportPrintTemplate from "./EnquiryReportPrintTemplate";

export default function EnquiryReportClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchRefNo, setSearchRefNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);

  // Form states
  const [reportType, setReportType] = useState<"combined" | "residence">("combined");
  const [personName, setPersonName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [villageName, setVillageName] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const [memoNo, setMemoNo] = useState("");
  const [memoDate, setMemoDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [refMemoNo, setRefMemoNo] = useState("");
  const [refMemoDate, setRefMemoDate] = useState("");
  const [bdoTitle, setBdoTitle] = useState("The Block Development Officer");
  const [blockName, setBlockName] = useState("Hili Development Block");
  const [district, setDistrict] = useState("Dakshin Dinajpur");
  const [policeStation, setPoliceStation] = useState("Hili");
  const [gramPanchayat, setGramPanchayat] = useState("Dhalpara");

  const getInitialDocs = (type: "combined" | "residence") => [
    { id: "aadhaar", label: "Aadhaar Card", checked: true, details: "", placeholder: "Aadhaar No..." },
    { id: "voter_card", label: "Voter ID Card", checked: false, details: "", placeholder: "EPIC No..." },
    ...(type === "combined" ? [{ id: "death_cert", label: "Death Certificate", checked: true, details: "", placeholder: "Certificate No..." }] : []),
    { id: "birth_cert", label: "Birth Certificate", checked: false, details: "", placeholder: "Certificate No..." },
    { id: "education_cert", label: "Educational Certificate", checked: false, details: "", placeholder: "Details..." },
    { id: "land_records", label: "Relevant Land Records", checked: true, details: "", placeholder: "Khatian Nos..." },
    { id: "others", label: "Other supporting documents and local enquiry reports", checked: true, details: "", placeholder: "Specify other documents..." }
  ];

  const [docs, setDocs] = useState(getInitialDocs("combined"));
  const printRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    if (!searchRefNo.trim()) return;
    setLoading(true);
    try {
      const escapedRefNo = searchRefNo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const results = await searchWarishApplications({ certificateNo: escapedRefNo });
      if (results && results.length > 0) {
        setApplicationData(results[0]);
        setPersonName(results[0].nameOfDeceased || "");
        setFatherName(results[0].fatherName || results[0].spouseName || "");
        setVillageName(results[0].villageName || "");
        setPostOffice(results[0].postOffice || "");
        try {
          const savedReport = await getEnquiryReport(results[0].id);
          if (savedReport) {
            if (savedReport.memoNo) setMemoNo(savedReport.memoNo);
            if (savedReport.memoDate) setMemoDate(format(new Date(savedReport.memoDate), "yyyy-MM-dd"));
            if (savedReport.refMemoNo) setRefMemoNo(savedReport.refMemoNo);
            if (savedReport.refMemoDate) setRefMemoDate(format(new Date(savedReport.refMemoDate), "yyyy-MM-dd"));
            if (savedReport.bdoTitle) setBdoTitle(savedReport.bdoTitle);
            if (savedReport.blockName) setBlockName(savedReport.blockName);
            if (savedReport.district) setDistrict(savedReport.district);
            if (savedReport.policeStation) setPoliceStation(savedReport.policeStation);
            if (savedReport.gramPanchayat) setGramPanchayat(savedReport.gramPanchayat);
            if (savedReport.docsDetails) {
              const savedDocs = savedReport.docsDetails as any[];
              setDocs(prevDocs => {
                const merged = prevDocs.map(defaultDoc => {
                  const found = savedDocs.find(sd => sd.id === defaultDoc.id);
                  return found ? { ...defaultDoc, ...found } : defaultDoc;
                });
                const extraDocs = savedDocs.filter(sd => !prevDocs.find(d => d.id === sd.id));
                return [...merged, ...extraDocs];
              });
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

  useEffect(() => {
    const refNoParam = searchParams.get("refNo");
    const reportIdParam = searchParams.get("reportId");

    if (refNoParam && !applicationData && !loading && !searchRefNo) {
      setSearchRefNo(refNoParam);
      const doSearch = async () => {
        setLoading(true);
        try {
          const escapedRefNo = refNoParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const results = await searchWarishApplications({ certificateNo: escapedRefNo });
          if (results && results.length > 0) {
            setApplicationData(results[0]);
            setPersonName(results[0].nameOfDeceased || "");
            setFatherName(results[0].fatherName || results[0].spouseName || "");
            setVillageName(results[0].villageName || "");
            setPostOffice(results[0].postOffice || "");
            try {
              const savedReport = await getEnquiryReport(results[0].id);
              if (savedReport) {
                if (savedReport.memoNo) setMemoNo(savedReport.memoNo);
                if (savedReport.memoDate) setMemoDate(format(new Date(savedReport.memoDate), "yyyy-MM-dd"));
                if (savedReport.refMemoNo) setRefMemoNo(savedReport.refMemoNo);
                if (savedReport.refMemoDate) setRefMemoDate(format(new Date(savedReport.refMemoDate), "yyyy-MM-dd"));
                if (savedReport.bdoTitle) setBdoTitle(savedReport.bdoTitle);
                if (savedReport.blockName) setBlockName(savedReport.blockName);
                if (savedReport.district) setDistrict(savedReport.district);
                if (savedReport.policeStation) setPoliceStation(savedReport.policeStation);
                if (savedReport.gramPanchayat) setGramPanchayat(savedReport.gramPanchayat);
                if (savedReport.docsDetails) {
                  const savedDocs = savedReport.docsDetails as any[];
                  setDocs(prevDocs => {
                    const merged = prevDocs.map(defaultDoc => {
                      const found = savedDocs.find(sd => sd.id === defaultDoc.id);
                      return found ? { ...defaultDoc, ...found } : defaultDoc;
                    });
                    const extraDocs = savedDocs.filter(sd => !prevDocs.find(d => d.id === sd.id));
                    return [...merged, ...extraDocs];
                  });
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
      doSearch();
    } else if (reportIdParam && !loading) {
      const doLoadStandalone = async () => {
        setLoading(true);
        try {
          const savedReport = await getEnquiryReportById(reportIdParam);
          if (savedReport) {
            setReportType(savedReport.reportType as "combined" | "residence" || "residence");
            if (savedReport.personName) setPersonName(savedReport.personName);
            if (savedReport.fatherName) setFatherName(savedReport.fatherName);
            if (savedReport.villageName) setVillageName(savedReport.villageName);
            if (savedReport.postOffice) setPostOffice(savedReport.postOffice);
            if (savedReport.memoNo) setMemoNo(savedReport.memoNo);
            if (savedReport.memoDate) setMemoDate(format(new Date(savedReport.memoDate), "yyyy-MM-dd"));
            if (savedReport.refMemoNo) setRefMemoNo(savedReport.refMemoNo);
            if (savedReport.refMemoDate) setRefMemoDate(format(new Date(savedReport.refMemoDate), "yyyy-MM-dd"));
            if (savedReport.bdoTitle) setBdoTitle(savedReport.bdoTitle);
            if (savedReport.blockName) setBlockName(savedReport.blockName);
            if (savedReport.district) setDistrict(savedReport.district);
            if (savedReport.policeStation) setPoliceStation(savedReport.policeStation);
            if (savedReport.gramPanchayat) setGramPanchayat(savedReport.gramPanchayat);
            if (savedReport.docsDetails) {
              const savedDocs = savedReport.docsDetails as any[];
              setDocs(prevDocs => {
                const merged = prevDocs.map(defaultDoc => {
                  const found = savedDocs.find(sd => sd.id === defaultDoc.id);
                  return found ? { ...defaultDoc, ...found } : defaultDoc;
                });
                const extraDocs = savedDocs.filter(sd => !prevDocs.find(d => d.id === sd.id));
                return [...merged, ...extraDocs];
              });
            }
          }
        } catch (error) {
          console.error("Error loading standalone report:", error);
        } finally {
          setLoading(false);
        }
      };
      doLoadStandalone();
    }
  }, [searchParams]);

  const handlePrint = () => window.print();

  const [saving, setSaving] = useState(false);

  const handleSaveReport = async () => {
    if (!applicationData && reportType !== 'residence') return;
    setSaving(true);
    try {
      await saveEnquiryReport({
        warishApplicationId: applicationData?.id,
        personName,
        fatherName,
        villageName,
        postOffice,
        reportType,
        memoNo,
        memoDate: new Date(memoDate),
        refMemoNo,
        refMemoDate: new Date(refMemoDate),
        bdoTitle,
        blockName,
        district,
        policeStation,
        gramPanchayat,
        docsDetails: docs,
      });
      alert("Report details saved successfully!");
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Failed to save report details.");
    } finally {
      setSaving(false);
    }
  };

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

  const handleReportTypeChange = (val: "combined" | "residence") => {
    setReportType(val);
    setSearchRefNo("");
    setApplicationData(null);
    setPersonName("");
    setFatherName("");
    setVillageName("");
    setPostOffice("");
    setMemoNo("");
    setMemoDate(format(new Date(), "yyyy-MM-dd"));
    setRefMemoNo("");
    setRefMemoDate("");
    setBdoTitle("The Block Development Officer");
    setBlockName("Hili Development Block");
    setDistrict("Dakshin Dinajpur");
    setPoliceStation("Hili");
    setGramPanchayat("Dhalpara");
    setDocs(getInitialDocs(val));
  };

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
                  reportType === 'combined' 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50/80 to-white shadow-md' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/10'
                }`}
                onClick={() => handleReportTypeChange('combined')}
              >
                {reportType === 'combined' && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${reportType === 'combined' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${reportType === 'combined' ? 'text-blue-900' : 'text-gray-800'}`}>Combined Report</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Includes both Residence &amp; Warish details. Requires a valid Warish Reference Number.
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-md ${
                  reportType === 'residence' 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50/80 to-white shadow-md' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/10'
                }`}
                onClick={() => handleReportTypeChange('residence')}
              >
                {reportType === 'residence' && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${reportType === 'residence' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                    <Home className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${reportType === 'residence' ? 'text-blue-900' : 'text-gray-800'}`}>Permanent Residence Only</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generate a standalone Permanent Residence Report without Warish data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {reportType === 'combined' && (
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
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

        {(reportType === 'residence' || (reportType === 'combined' && applicationData)) && (
          <Card className="border-0 shadow-lg overflow-hidden transition-all duration-500">
            <CardHeader className="bg-gradient-to-r from-blue-50/30 to-transparent border-b border-blue-100">
              <CardTitle className="text-xl text-gray-800">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              
              {/* SECTION: Subject Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Applicant / Subject Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm">Full Name</Label>
                    <Input 
                      value={personName} 
                      onChange={(e) => setPersonName(e.target.value)} 
                      placeholder="Enter full name"
                      className="border-gray-200 focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm">Father / Husband Name</Label>
                    <Input 
                      value={fatherName} 
                      onChange={(e) => setFatherName(e.target.value)} 
                      placeholder="Father's or husband's name"
                      className="border-gray-200 focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm">Village</Label>
                    <Select 
                      value={villageName} 
                      onValueChange={(val) => {
                        setVillageName(val);
                        if (val === "Purbba Gobindapur") {
                          setPostOffice("Fatepur");
                        } else {
                          setPostOffice("Trimohini");
                        }
                      }}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-400">
                        <SelectValue placeholder="Select Village" />
                      </SelectTrigger>
                      <SelectContent>
                        {villagenameOption.map((v) => (
                          <SelectItem key={v.value} value={v.value}>
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Post Office
                    </Label>
                    <Input 
                      value={postOffice} 
                      onChange={(e) => setPostOffice(e.target.value)} 
                      placeholder="Post office name"
                      className="border-gray-200 focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Memo Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Memo &amp; Reference Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm">Memo No.</Label>
                    <Input 
                      value={memoNo} 
                      onChange={(e) => setMemoNo(e.target.value)} 
                      placeholder="Leave blank for handwriting"
                      className="border-gray-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm">Memo Date</Label>
                    <Input 
                      type="date" 
                      value={memoDate} 
                      onChange={(e) => setMemoDate(e.target.value)} 
                      className="border-gray-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm">Reference Memo No.</Label>
                    <Input 
                      value={refMemoNo} 
                      onChange={(e) => setRefMemoNo(e.target.value)} 
                      placeholder="Reference memo number"
                      className="border-gray-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm">Reference Memo Date</Label>
                    <Input 
                      type="date" 
                      value={refMemoDate} 
                      onChange={(e) => setRefMemoDate(e.target.value)} 
                      className="border-gray-200 focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Office Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                    <Building className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Office Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm">To (Title)</Label>
                    <Input 
                      value={bdoTitle} 
                      onChange={(e) => setBdoTitle(e.target.value)} 
                      className="border-gray-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm">Block Name</Label>
                    <Input 
                      value={blockName} 
                      onChange={(e) => setBlockName(e.target.value)} 
                      className="border-gray-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm">District</Label>
                    <Input 
                      value={district} 
                      onChange={(e) => setDistrict(e.target.value)} 
                      className="border-gray-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm">Police Station</Label>
                    <Input 
                      value={policeStation} 
                      onChange={(e) => setPoliceStation(e.target.value)} 
                      className="border-gray-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600 text-sm">Gram Panchayat</Label>
                    <Input 
                      value={gramPanchayat} 
                      onChange={(e) => setGramPanchayat(e.target.value)} 
                      className="border-gray-200 focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Documents */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Produced Documents</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc, i) => (
                    <div 
                      key={doc.id} 
                      className={`relative group rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
                        doc.checked 
                          ? 'border-blue-400 bg-blue-50/40 shadow-sm' 
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                      }`}
                      onClick={() => {
                        const newDocs = [...docs];
                        newDocs[i].checked = !newDocs[i].checked;
                        setDocs(newDocs);
                      }}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1.5 rounded-lg transition-colors ${
                            doc.checked ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 pr-6">
                            <h4 className={`text-sm font-medium leading-tight ${doc.checked ? 'text-blue-900' : 'text-gray-800'}`}>
                              {doc.label}
                            </h4>
                            {doc.checked && (
                              <div className="mt-3 transition-all duration-200" onClick={(e) => e.stopPropagation()}>
                                <Input 
                                  className="h-9 text-sm bg-white border-blue-200 focus:border-blue-500 text-gray-700"
                                  value={doc.details} 
                                  onChange={(e) => {
                                    const newDocs = [...docs];
                                    newDocs[i].details = e.target.value;
                                    setDocs(newDocs);
                                  }} 
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
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  {!applicationData && reportType === 'residence' && (
                    <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full inline-block">
                      ℹ️ Standalone report will be saved as a Permanent Residence certificate.
                    </p>
                  )}
                </div>
                <div className="flex gap-3 flex-wrap justify-end">
                  <Button 
                    onClick={handleSaveReport} 
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
                    onClick={handleDownloadPDF} 
                    size="lg" 
                    variant="outline"
                    className="text-blue-700 border-blue-300 hover:bg-blue-50"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>
                  <Button 
                    onClick={handlePrint} 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    Print Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* PRINT ONLY SECTION: A4 Layout */}
      <EnquiryReportPrintTemplate
        reportType={reportType}
        applicationData={applicationData}
        printRef={printRef}
        memoNo={memoNo}
        memoDate={memoDate}
        refMemoNo={refMemoNo}
        refMemoDate={refMemoDate}
        bdoTitle={bdoTitle}
        blockName={blockName}
        district={district}
        policeStation={policeStation}
        gramPanchayat={gramPanchayat}
        personName={personName}
        fatherName={fatherName}
        villageName={villageName}
        postOffice={postOffice}
        docs={docs}
      />
    </div>
  );
}