"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Loader2,
  Printer,
  CheckCircle,
  Search,
  Building2,
  Calendar,
  IndianRupee,
  Users,
  FileText,
  ChevronRight,
  ScanLine,
  CheckCheck,
} from "lucide-react";
import { generatePDF } from "@/components/pdfgenerator";
import { workdetailsforprint } from "@/types";
import { fetchworkdetailsbynitno, fetchNitNo } from "@/action/bookNitNuber";
import { formatDate } from "@/utils/utils";
import { gpcode } from "@/constants/gpinfor";
const TEMPLATE_PATH = "/templates/scrutnisheettemplete.json";

export default function BulkScrutinySheetPage() {
  const [nitNumbers, setNitNumbers] = useState<
    { memoNumber: string; memoDate: Date }[]
  >([]);
  const [selectedNitNumber, setSelectedNitNumber] = useState<string>("");
  const [works, setWorks] = useState<workdetailsforprint[]>([]);
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingNits, setIsLoadingNits] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load NIT numbers on component mount
  useEffect(() => {
    const loadNitNumbers = async () => {
      try {
        setIsLoadingNits(true);
        const data = await fetchNitNo();
        setNitNumbers(data);
      } catch (err) {
        console.error("Failed to load NIT numbers:", err);
        setError("Failed to load NIT numbers. Please try again.");
      } finally {
        setIsLoadingNits(false);
      }
    };

    loadNitNumbers();
  }, []);

  const formatDateTime = useCallback((dateString?: string | Date): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
  }, []);

  const handleSearch = useCallback(async () => {
    if (!selectedNitNumber) {
      setError("Please select a NIT number");
      return;
    }

    const numericNitNo = Number(selectedNitNumber);
    if (isNaN(numericNitNo)) {
      setError("Please select a valid NIT number");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSuccess(null);
    setSelectedWorks([]);

    try {
      const fetchedWorks = await fetchworkdetailsbynitno(numericNitNo);
      setWorks(fetchedWorks);

      if (fetchedWorks.length === 0) {
        setError(`No works found for NIT number ${selectedNitNumber}`);
      } else {
        setSuccess(
          `Found ${fetchedWorks.length} work(s) for NIT number ${selectedNitNumber}`,
        );
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to search works. Please try again.",
      );
    } finally {
      setIsSearching(false);
    }
  }, [selectedNitNumber]);

  const handleSelectAll = useCallback(() => {
    if (selectedWorks.length === works.length) {
      setSelectedWorks([]);
    } else {
      setSelectedWorks(works.map((work) => work.id));
    }
  }, [selectedWorks.length, works]);

  const handleSelectWork = useCallback((workId: string) => {
    setSelectedWorks((prev) =>
      prev.includes(workId)
        ? prev.filter((id) => id !== workId)
        : [...prev, workId],
    );
  }, []);

  const handleBulkGeneratePDF = useCallback(async () => {
    if (selectedWorks.length === 0) {
      setError("Please select at least one work to generate PDF");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedWorkDetails = works.filter((work) =>
        selectedWorks.includes(work.id),
      );

      const combinedInputs = selectedWorkDetails.map((workdetails) => ({
        field2: `Scrutiny Report of Tender Papers for NIT No. ${
          workdetails.nitDetails.memoNumber
        }/${gpcode}/${new Date(
          workdetails.nitDetails.memoDate,
        ).getFullYear()} Dated: ${formatDate(
          workdetails.nitDetails.memoDate,
        )} Sl No. ${workdetails.workslno}`,
        field4:
          workdetails.ApprovedActionPlanDetails.activityDescription || "N/A",
        field32: formatDateTime(workdetails.nitDetails.endTime),
        field33: formatDateTime(workdetails.nitDetails.technicalBidOpeningDate),
        field35: workdetails.ApprovedActionPlanDetails.schemeName || "N/A",
        field20: workdetails.finalEstimateAmount.toString(),
        emd: workdetails.earnestMoneyFee.toFixed(2),
        pcharge: workdetails.participationFee.toFixed(2),
        field31: workdetails.finalEstimateAmount.toFixed(2),
        agencytable: workdetails.biddingAgencies.map((agency, index) => [
          (index + 1).toString(),
          agency.agencydetails.agencyType === "FARM"
            ? `${agency.agencydetails.name}${
                agency.agencydetails.proprietorName
                  ? ` (${agency.agencydetails.proprietorName})`
                  : ""
              }`
            : agency.agencydetails.name,
          workdetails.participationFee.toFixed(2),
          agency.agencydetails.cooperative
            ? "0.00"
            : workdetails.earnestMoneyFee.toFixed(2),
          agency.technicalEvelution?.credencial?.sixtyperamtput ? "Yes" : "No",
          agency.technicalEvelution?.credencial?.workorder ? "Yes" : "No",
          agency.technicalEvelution?.credencial?.paymentcertificate
            ? "Yes"
            : "No",
          agency.technicalEvelution?.credencial?.comcertificat ? "Yes" : "No",
          agency.technicalEvelution?.validityofdocument?.itreturn
            ? "Yes"
            : "No",
          agency.technicalEvelution?.validityofdocument?.gst ? "Yes" : "No",
          agency.technicalEvelution?.validityofdocument?.tradelicence
            ? "Yes"
            : "No",
          agency.technicalEvelution?.validityofdocument?.ptax ? "Yes" : "No",
          agency.technicalEvelution?.byelow ? "Yes" : "No",
          agency.technicalEvelution?.qualify ? "Yes" : "No",
          agency.technicalEvelution?.remarks || "-",
        ]),
        field29: (() => {
          const qualifiedBidders = workdetails.biddingAgencies.filter(
            (agency) => agency.technicalEvelution?.qualify,
          ).length;
          const totalBidders = workdetails.biddingAgencies.length;
          const plural = totalBidders !== 1 ? "s" : "";
          const qualifiedPlural = qualifiedBidders !== 1 ? "s" : "";

          if (qualifiedBidders === 0) {
            return `${totalBidders} bidder${plural} participated but none satisfied the technical bid requirements.`;
          }

          return qualifiedBidders >= 3
            ? `${totalBidders} bidder${plural} participated, ${qualifiedBidders} satisfied technical requirements. Financial bids may be opened.`
            : `${totalBidders} bidder${plural} participated, ${qualifiedBidders} satisfied technical requirements. Financial bids cannot be opened (less than 3 qualified).`;
        })(),
      }));

      const pdf = await generatePDF(TEMPLATE_PATH, combinedInputs);

      const buffer =
        pdf.buffer instanceof ArrayBuffer
          ? new Uint8Array(pdf.buffer)
          : pdf.buffer instanceof Uint8Array
            ? pdf.buffer
            : new Uint8Array(pdf.buffer);

      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Bulk_Scrutiny_Sheets_NIT_${selectedNitNumber}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      setSuccess(
        `Successfully generated combined PDF with ${selectedWorks.length} scrutiny sheet(s)`,
      );
    } catch (err) {
      console.error("Combined PDF generation failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate combined PDF. Please try again later.",
      );
    } finally {
      setIsGenerating(false);
    }
  }, [selectedWorks, works, selectedNitNumber, formatDateTime]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 sm:px-12 rounded-b-[40px] shadow-2xl">
        <div className="absolute -top-32 -right-32 h-96 w-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 bg-yellow-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-amber-400">Bulk Scrutiny Sheet</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-500/20 ring-1 ring-amber-500/40 text-amber-400">
                  <ScanLine className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Bulk Scrutiny Sheet
                </h1>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed">
                Generate multiple scrutiny sheets by NIT memo number. Select
                works and download a combined PDF in one click.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-8 py-10 space-y-6">

        {/* Search Section */}
        <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-5 px-6">
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-500" />
              Search by NIT Number
            </CardTitle>
            <CardDescription>
              Select the NIT memo number to find all related works
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="nitSelect" className="text-sm font-medium mb-2 block">
                  NIT Memo Number
                </Label>
                <Select
                  value={selectedNitNumber}
                  onValueChange={setSelectedNitNumber}
                  disabled={isLoadingNits}
                >
                  <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700">
                    <SelectValue
                      placeholder={
                        isLoadingNits
                          ? "Loading NIT numbers..."
                          : "Select NIT memo number"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {nitNumbers.map((nit) => (
                      <SelectItem key={nit.memoNumber} value={nit.memoNumber}>
                        {`${
                          nit.memoNumber
                        }/${gpcode}/${nit.memoDate.getFullYear()}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !selectedNitNumber || isLoadingNits}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-none shadow-md"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
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
          </CardContent>
        </Card>

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="rounded-xl border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Results Section */}
        {works.length > 0 && (
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-5 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-500" />
                    Found Works
                  </CardTitle>
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                    {works.length} work{works.length !== 1 ? "s" : ""}
                  </Badge>
                  {selectedWorks.length > 0 && (
                    <Badge className="bg-green-500/15 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                      <CheckCheck className="w-3 h-3 mr-1" />
                      {selectedWorks.length} selected
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="rounded-xl"
                  >
                    {selectedWorks.length === works.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                  <Button
                    onClick={handleBulkGeneratePDF}
                    disabled={isGenerating || selectedWorks.length === 0}
                    className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-none shadow-md"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Printer className="mr-2 h-4 w-4" />
                        Generate PDF ({selectedWorks.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {works.map((work) => (
                  <div
                    key={work.id}
                    onClick={() => handleSelectWork(work.id)}
                    className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition-all duration-150 ${
                      selectedWorks.includes(work.id)
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 hover:border-amber-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedWorks.includes(work.id)}
                      onCheckedChange={() => handleSelectWork(work.id)}
                      className="mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                          Work Serial: {work.workslno}
                        </h3>
                        <Badge
                          variant={
                            work.tenderStatus === "AOC" ? "default" : "secondary"
                          }
                          className="rounded-lg"
                        >
                          {work.tenderStatus}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                            <Building2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Activity</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300 truncate">
                              {work.ApprovedActionPlanDetails.activityDescription || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                            <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">NIT Date</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                              {formatDate(work.nitDetails.memoDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                            <IndianRupee className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Estimate</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                              ₹{work.finalEstimateAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                            <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Bidders</p>
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                              {work.biddingAgencies.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
