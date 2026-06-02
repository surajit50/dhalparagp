"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { searchWarishApplications } from "@/action/warishApplicationAction";
import { saveEnquiryReport, getEnquiryReport, getEnquiryReportById } from "@/action/enquiryReportAction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Printer, FileText, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { villagenameOption } from "@/constants";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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
      // Escape special characters like '(' and ')' for MongoDB regex search
      const escapedRefNo = searchRefNo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const results = await searchWarishApplications({ certificateNo: escapedRefNo });
      if (results && results.length > 0) {
        setApplicationData(results[0]);
        setPersonName(results[0].nameOfDeceased || "");
        setFatherName(results[0].fatherName || results[0].spouseName || "");
        setVillageName(results[0].villageName || "");
        setPostOffice(results[0].postOffice || "");
        // Also fetch any saved report for this application
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
      // Create a specific async IIFE to avoid using stale state in handleSearch
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
      // Auto-load standalone report
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


  const handlePrint = () => {
    window.print();
  };

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
        compress: true // Enable jsPDF compression
      });
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();

      // Temporarily ensure it's visible for canvas
      const originalDisplay = printRef.current.style.display;
      printRef.current.style.display = "block";

      const canvas = await html2canvas(printRef.current, {
        scale: 1.5, // Slightly lower scale to reduce memory and size, while keeping text sharp
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      printRef.current.style.display = originalDisplay;

      // Use JPEG with 0.8 quality instead of PNG to shrink file size significantly
      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      const pdfHeight = height;
      const pdfWidth = height * ratio;

      // Add image as JPEG and use the FAST compression alias
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
    <div className="container mx-auto p-6 space-y-8">
      {/* NO-PRINT SECTION: Controls and Form */}
      <div className="print:hidden space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              Generate Enquiry Report
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate a Permanent Residence Enquiry Report or a Combined Report with Legal Heirs.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Type & Search</CardTitle>
            <CardDescription>Select report type and optionally search for a Warish Reference Number to auto-fill details (Combined only).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <RadioGroup 
                value={reportType} 
                onValueChange={handleReportTypeChange}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="combined" id="r-combined" />
                  <Label htmlFor="r-combined">Combined (Residence & Warish)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="residence" id="r-residence" />
                  <Label htmlFor="r-residence">Permanent Residence Only</Label>
                </div>
              </RadioGroup>
            </div>

            {reportType === 'combined' && (
              <div className="space-y-2">
                <Label>Enter Warish Reference Number</Label>
                <div className="flex gap-4 max-w-md">
                  <Input 
                    placeholder="e.g. 095/DGP/(LH)/2025" 
                    value={searchRefNo} 
                    onChange={(e) => setSearchRefNo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={loading || !searchRefNo}>
                    {loading ? "Searching..." : <><Search className="w-4 h-4 mr-2" /> Search</>}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {(reportType === 'residence' || (reportType === 'combined' && applicationData)) && (
          <Card className="border-blue-200 shadow-md">
            <CardHeader className="bg-blue-50/50 border-b">
              <CardTitle className="text-lg">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              
              {/* SECTION: Subject Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider border-b border-blue-100 pb-2">Applicant / Subject Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-blue-50/30 p-4 rounded-lg">
                  <div className="space-y-2">
                    <Label>Person Name</Label>
                    <Input value={personName} onChange={(e) => setPersonName(e.target.value)} className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label>Father/Husband Name</Label>
                    <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label>Village</Label>
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
                      <SelectTrigger className="bg-white">
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
                    <Label>Post Office</Label>
                    <Input value={postOffice} onChange={(e) => setPostOffice(e.target.value)} className="bg-white" />
                  </div>
                </div>
              </div>

              {/* SECTION: Memo Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider border-b border-blue-100 pb-2">Memo & Reference Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Memo No</Label>
                    <Input value={memoNo} onChange={(e) => setMemoNo(e.target.value)} placeholder="Leave blank for handwriting" />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={memoDate} onChange={(e) => setMemoDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Reference Memo No</Label>
                    <Input value={refMemoNo} onChange={(e) => setRefMemoNo(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Reference Memo Date</Label>
                    <Input type="date" value={refMemoDate} onChange={(e) => setRefMemoDate(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* SECTION: Office Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider border-b border-blue-100 pb-2">Office Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>To (Title)</Label>
                    <Input value={bdoTitle} onChange={(e) => setBdoTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Block Name</Label>
                    <Input value={blockName} onChange={(e) => setBlockName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>District</Label>
                    <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Police Station</Label>
                    <Input value={policeStation} onChange={(e) => setPoliceStation(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Gram Panchayat</Label>
                    <Input value={gramPanchayat} onChange={(e) => setGramPanchayat(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* SECTION: Documents */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider border-b border-blue-100 pb-2">Produced Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {docs.map((doc, i) => (
                    <div key={doc.id} className="flex items-center space-x-2 bg-muted/30 p-2 rounded-md">
                      <Checkbox 
                        id={doc.id} 
                        checked={doc.checked}
                        onCheckedChange={(checked) => {
                          const newDocs = [...docs];
                          newDocs[i].checked = checked as boolean;
                          setDocs(newDocs);
                        }}
                      />
                      <label htmlFor={doc.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1">
                        {doc.label}
                      </label>
                      {doc.checked && (
                        <Input 
                          className="h-7 text-xs max-w-[200px]" 
                          value={doc.details} 
                          onChange={(e) => {
                            const newDocs = [...docs];
                            newDocs[i].details = e.target.value;
                            setDocs(newDocs);
                          }} 
                          placeholder={doc.placeholder}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t flex flex-col sm:flex-row justify-end gap-4 items-end">
                <div className="flex-1">
                  {!applicationData && reportType === 'residence' && (
                    <p className="text-sm text-green-600">
                      Note: This manual report will be saved as a standalone Permanent Residence certificate.
                    </p>
                  )}
                </div>
                <div className="flex gap-4 flex-wrap justify-end">
                  <Button onClick={handleSaveReport} size="lg" variant="secondary" disabled={saving}>
                    {saving ? "Saving..." : "Save Details"}
                  </Button>
                  <Button onClick={handleDownloadPDF} size="lg" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    <Download className="w-5 h-5 mr-2" /> Download PDF
                  </Button>
                  <Button onClick={handlePrint} size="lg" className="bg-green-600 hover:bg-green-700">
                    <Printer className="w-5 h-5 mr-2" /> Print Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* PRINT ONLY SECTION: A4 Layout */}
      {(reportType === 'residence' || (reportType === 'combined' && applicationData)) && (
        <div 
          className="hidden print:block absolute left-[-9999px] top-0 print:static print:left-auto" 
          ref={printRef}
        >
          <div className="bg-white text-black w-[210mm] min-h-[297mm] p-8 mx-auto">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page { size: A4; margin: 20mm; }
              body { background: white; }
            }
          `}} />
          
          <div className="font-serif text-[15px] leading-relaxed max-w-4xl mx-auto space-y-6">
            
            {/* Office Heading */}
            <div className="text-center mb-4 border-b-2 pb-2" style={{ borderColor: "#1a4d8c" }}>
              <div className="text-xl font-bold italic leading-none" style={{ color: "#1a4d8c" }}>Office of The Pradhan</div>
              <div className="text-3xl font-bold leading-tight mt-1" style={{ color: "#1a4d8c" }}>No 3 Dhalpara Gram Panchayat</div>
              <div className="text-sm text-gray-600 leading-tight mt-1">Trimohini, Hili, Dakshin Dinajpur, West Bengal</div>
            </div>

            <div className="flex justify-between mb-8">
              <div>Memo No: {memoNo ? <span className="font-bold">{memoNo}</span> : "________________"}</div>
              <div>Date: {memoDate ? <span className="font-bold">{format(new Date(memoDate), "dd/MM/yyyy")}</span> : "________________"}</div>
            </div>

            <div className="space-y-1 mb-8">
              <div>To</div>
              <div className="font-semibold">{bdoTitle}</div>
              <div>{blockName}</div>
              <div>{district}</div>
            </div>

            <div className="mb-6">
              <span className="font-bold border-b border-black pb-0.5">Subject:</span>
              <span className="font-bold ml-2">
                {reportType === "combined" 
                  ? `Enquiry Report Regarding Permanent Residence and Legal Heirs of Late ${personName}`
                  : `Enquiry Report Regarding Permanent Residence of ${personName}`}
              </span>
            </div>

            <div className="mb-6">
              <span className="font-bold border-b border-black pb-0.5">Reference:</span>
              <span className="ml-2">Memo No. {refMemoNo} dated {refMemoDate ? format(new Date(refMemoDate), "dd/MM/yyyy") : "____________"}</span>
            </div>

            <div>Sir,</div>

            <p className="text-justify indent-8">
              With reference to the memo cited above, an enquiry was conducted regarding the permanent residential status {reportType === "combined" && "and legal heirs "}of {reportType === "combined" && "Late "}<span className="font-bold">{personName}</span>, son/wife of {reportType === "combined" && ""}<span className="font-bold">{fatherName || "________________"}</span>.
            </p>

            <p className="text-justify indent-8">
              Upon verification of the records available with this office, scrutiny of the documents produced, and local enquiry conducted in the locality, it has been found that {reportType === "combined" && "Late "}<span className="font-bold">{personName}</span> {reportType === "combined" ? "was" : "is"} a permanent resident of Village &ndash; {villageName || "________________"}, Gram Panchayat &ndash; {gramPanchayat}, Post Office &ndash; {postOffice || "________________"}, Police Station &ndash; {policeStation}, District &ndash; {district}.
            </p>

            <p className="text-justify">
              The following documents were produced and verified during the enquiry:
            </p>

            <ol className="list-decimal pl-12 space-y-1">
              {docs.filter(d => d.checked).map((doc, idx) => (
                <li key={doc.id}>
                  {doc.label} {doc.details ? `(${doc.details})` : ""}
                </li>
              ))}
            </ol>

            {reportType === "combined" && (
              <>
                <p className="text-justify">
                  As per the documents produced, records available, and local enquiry conducted, the following persons have been identified as the legal heirs of Late <span className="font-bold">{applicationData.nameOfDeceased}</span>:
                </p>

                <ol className="list-decimal pl-12 space-y-1 mb-6">
                  {applicationData.warishDetails?.map((heir: any, idx: number) => (
                    <li key={heir.id || idx}>
                      Shri/Smt. <span className="font-bold">{heir.name}</span> &ndash; {heir.relation}
                    </li>
                  ))}
                </ol>
              </>
            )}

            <p className="text-justify indent-8">
              Based on the enquiry conducted and the records verified, this office is of the opinion that the above-mentioned particulars are found to be correct to the best of our knowledge and belief.
            </p>

            <p className="text-justify">
              This report is submitted for your kind information and necessary action.
            </p>

            <div className="flex justify-end mt-16">
              <div className="text-center">
                <div className="mb-12">Yours faithfully,</div>
                <div>(Signature)</div>
              </div>
            </div>

          </div>
          </div>
        </div>
      )}
    </div>
  );
}
