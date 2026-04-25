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
  FileDown,
  Loader2,
  Printer,
  CheckCircle,
  Search,
  Building2,
  Calendar,
  DollarSign,
  Users,
  FileText,
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

      // Generate combined inputs for all selected works
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
          //agency is coparative then emd 0
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

      // Generate single combined PDF
      const pdf = await generatePDF(TEMPLATE_PATH, combinedInputs);

      // Handle different buffer types properly
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

      // Cleanup
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bulk Scrutiny Sheet Generation
          </h1>
          <p className="text-muted-foreground">
            Generate multiple scrutiny sheets by NIT memo number
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search by NIT Number
          </CardTitle>
          <CardDescription>
            Select the NIT memo number to find all related works
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="nitSelect">NIT Memo Number</Label>
              <Select
                value={selectedNitNumber}
                onValueChange={setSelectedNitNumber}
                disabled={isLoadingNits}
              >
                <SelectTrigger className="w-full">
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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Results Section */}
      {works.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Found Works ({works.length})
              </CardTitle>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedWorks.length === works.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <Button
                  onClick={handleBulkGeneratePDF}
                  disabled={isGenerating || selectedWorks.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Printer className="mr-2 h-4 w-4" />
                      Generate Combined PDF ({selectedWorks.length} sheets)
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {works.map((work) => (
                <div
                  key={work.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedWorks.includes(work.id)}
                    onCheckedChange={() => handleSelectWork(work.id)}
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        Work Serial: {work.workslno}
                      </h3>
                      <Badge
                        variant={
                          work.tenderStatus === "AOC" ? "default" : "secondary"
                        }
                      >
                        {work.tenderStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Activity:</span>
                        <span className="font-medium truncate">
                          {work.ApprovedActionPlanDetails.activityDescription ||
                            "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">NIT Date:</span>
                        <span className="font-medium">
                          {formatDate(work.nitDetails.memoDate)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Estimate:</span>
                        <span className="font-medium">
                          ₹{work.finalEstimateAmount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Bidders:</span>
                        <span className="font-medium">
                          {work.biddingAgencies.length}
                        </span>
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
  );
}
