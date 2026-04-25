/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Save,
  FileText,
  Printer,
  Calculator,
  Loader2,
  Pencil,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import WorkSearchAndSelect from "@/components/WorkSearchAndSelect";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { generateBillAbstractPDF } from "@/lib/pdf-generators/bill-abstract-pdf";
import PreviewAbstract from "@/components/PreviewAbstract";
import {
  MBEntry,
  BillAbstractEntry,
  EstimateItem,
  DisplayItem,
  BillAbstractFormData,
} from "./types";
import {
  fetchWorks as fetchWorksApi,
  fetchEstimateItems as fetchEstimateItemsApi,
  fetchMBEntries as fetchMBEntriesApi,
  fetchBillAbstracts as fetchBillAbstractsApi,
  saveBillAbstract as saveBillAbstractApi,
  updateBillAbstract as updateBillAbstractApi,
} from "./api";
import { getDisplayItems, calculateItemwiseTotal } from "./helpers";

export default function BillAbstractClientPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [mbEntries, setMbEntries] = useState<MBEntry[]>([]);
  const [billEntries, setBillEntries] = useState<BillAbstractEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [existingAbstractId, setExistingAbstractId] = useState<string | null>(
    null,
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPdfData, setPreviewPdfData] = useState<any | null>(null);

  const [formData, setFormData] = useState<BillAbstractFormData>({
    billType: "1st & Final Bill",
    period: "",
    contractualPercentage: "0.150",
    cgstPercentage: "9.00",
    sgstPercentage: "9.00",
    labourCessPercentage: "1.00",
  });

  const getWorkLabel = (work: any) => {
    const title =
      work?.ApprovedActionPlanDetails?.activityDescription ||
      `Work ${work?.workslno || ""}`.trim();
    const code = work?.ApprovedActionPlanDetails?.activityCode;
    return code ? `${title} (Code: ${code})` : title;
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  useEffect(() => {
    if (selectedWorkId) {
      fetchEstimateItems(selectedWorkId);
      fetchMBEntries(selectedWorkId);
      fetchBillAbstract(selectedWorkId);
    } else {
      setEstimateItems([]);
      setMbEntries([]);
      setBillEntries([]);
    }
  }, [selectedWorkId]);

  const fetchWorks = async () => {
    try {
      const data = await fetchWorksApi();
      // Filter works that have MB entries
      const worksWithMB = data.filter((work: any) => 
        (work._count?.workMeasurementBooks || 0) > 0
      );
      setWorks(worksWithMB);
    } catch (error) {
      console.error("Error fetching works:", error);
    }
  };

  const fetchEstimateItems = async (workId: string) => {
    try {
      const validItems = await fetchEstimateItemsApi(workId);
      setEstimateItems(validItems);
    } catch (error) {
      console.error("Error fetching estimate items:", error);
    }
  };

  const fetchMBEntries = async (workId: string) => {
    try {
      const data = await fetchMBEntriesApi(workId);
      setMbEntries(data);
    } catch (error) {
      console.error("Error fetching MB entries:", error);
    }
  };

  const fetchBillAbstract = async (workId: string) => {
    try {
      const data = await fetchBillAbstractsApi(workId);

      const selectedWork = works.find((w) => w.id === workId);
      let calculatedPercentage = "0.150";

      if (selectedWork) {
        const estimateAmount = selectedWork.finalEstimateAmount || 0;
        const award = selectedWork.AwardofContract;
        const workOrder = award?.workorderdetails?.[0];
        const bidAgency = workOrder?.Bidagency;
        const bidAmount = bidAgency?.biddingAmount || 0;

        if (estimateAmount > 0 && bidAmount > 0) {
          const diff = estimateAmount - bidAmount;
          const percent = (diff / estimateAmount) * 100;
          calculatedPercentage = (Math.round(percent * 100) / 100).toFixed(2);
        }
      }

      if (data && data.length > 0) {
        const abstract = data[0];
        setBillEntries(abstract.entries || []);
        setExistingAbstractId(abstract.id);

        setFormData({
          billType: abstract.billType || "1st & Final Bill",
          period: abstract.period || "",
          contractualPercentage:
            abstract.contractualPercentage?.toString() || calculatedPercentage,
          cgstPercentage: "9.00",
          sgstPercentage: "9.00",
          labourCessPercentage: "1.00",
        });
      } else {
        setBillEntries([]);
        setExistingAbstractId(null);
        setFormData((prev) => ({
          ...prev,
          contractualPercentage: calculatedPercentage,
          period: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching bill abstract:", error);
    }
  };

  const generateBillFromMB = () => {
    const entries: BillAbstractEntry[] = mbEntries.map((mb) => ({
      mbEntryId: mb.id,
      estimateItemId: mb.estimateItemId,
      subItemId: mb.subItemId,
      mbNumber: mb.mbNumber,
      mbPageNumber: mb.mbPageNumber,
      workItemDescription: mb.workItemDescription,
      unit: mb.unit,
      quantityExecuted: Number(mb.quantityExecuted) || 0,
      rate: Number(mb.rate) || 0,
      amount: Number(mb.amount) || 0,
    }));

    setBillEntries(entries);
  };

  const updateEntryMbRef = (
    index: number,
    field: "mbNumber" | "mbPageNumber",
    value: string,
  ) => {
    setBillEntries((prev) =>
      prev.map((entry, i) =>
        i === index
          ? {
              ...entry,
              [field]: value,
            }
          : entry,
      ),
    );
  };

  const displayItems = getDisplayItems(billEntries, estimateItems);

  const calculateItemwiseTotalVal = () => {
    return calculateItemwiseTotal(billEntries);
  };

  const calculateContractualDeduction = () => {
    const total = calculateItemwiseTotalVal();
    const percentage = parseFloat(formData.contractualPercentage) || 0;
    return (total * percentage) / 100;
  };

  const calculateActualValue = () => {
    return calculateItemwiseTotalVal() - calculateContractualDeduction();
  };

  const buildPdfPayload = () => {
    const work = works.find((w) => w.id === selectedWorkId);
    const workName =
      work?.ApprovedActionPlanDetails?.activityDescription ||
      `Work ${work?.workslno}`;
    const location = work?.ApprovedActionPlanDetails?.locationofAsset || "";

    const itemwiseTotal = calculateItemwiseTotalVal();
    const contractualDeduction = calculateContractualDeduction();
    const actualValue = calculateActualValue();
    const sayAmount = Math.round(actualValue);

    const cgstPercent = parseFloat(formData.cgstPercentage) || 0;
    const sgstPercent = parseFloat(formData.sgstPercentage) || 0;
    const lwcPercent = parseFloat(formData.labourCessPercentage) || 0;

    const cgstAmount = Math.round((sayAmount * cgstPercent) / 100);
    const sgstAmount = Math.round((sayAmount * sgstPercent) / 100);
    const subTotal = sayAmount + cgstAmount + sgstAmount;

    const lwcAmount = Math.round((subTotal * lwcPercent) / 100);
    const grossBillAmount = subTotal + lwcAmount;

    // Get all MB numbers and pages
    const allMbNumbers = displayItems.map((e) => e.mbNumber).filter(Boolean);
    const allMbPages = displayItems.map((e) => e.mbPageNumber).filter(Boolean);

    // Extract unique MB numbers
    const uniqueMbNumbers = Array.from(new Set(allMbNumbers));

    // For pages: Always use "1 to last page" format
    const pageNumbers = allMbPages
      .map((p) => parseInt(p, 10))
      .filter((p) => !isNaN(p) && p > 0);

    let mbPages = "";
    if (pageNumbers.length > 0) {
      const lastPage = Math.max(...pageNumbers);
      if (lastPage === 1) {
        mbPages = "1";
      } else {
        mbPages = `1 to ${lastPage}`;
      }
    } else {
      mbPages = "1";
    }

    // For MB numbers
    let mbNumber = "";
    if (uniqueMbNumbers.length === 1) {
      mbNumber = uniqueMbNumbers[0];
    } else if (uniqueMbNumbers.length > 1) {
      mbNumber = uniqueMbNumbers[0];
    }

    const pdfData = {
      billType: formData.billType,
      projectName: workName,
      projectLocation: location,
      entries: displayItems.map((entry) => ({
        workItemDescription: entry.description || "",
        mbNumber: entry.mbNumber,
        mbPageNumber: entry.mbPageNumber,
        quantityExecuted: Number(entry.quantity) || 0,
        unit: entry.unit || "",
        rate: Number(entry.rate) || 0,
        amount: Number(entry.amount) || 0,
        remarks: entry.originalEntry?.remarks || "",
        isHeader: entry.isHeader,
        isSubItem: entry.isSubItem,
        slNo: entry.slNo,
      })),
      itemwiseTotal,
      contractualPercent: formData.contractualPercentage,
      contractualDeduction,
      actualValue,
      sayAmount,
      cgstPercent: formData.cgstPercentage,
      cgstAmount,
      sgstPercent: formData.sgstPercentage,
      sgstAmount,
      lwcPercent: formData.labourCessPercentage,
      lwcAmount,
      subTotal,
      grossBillAmount,
      mbNumber: mbNumber,
      mbPages: mbPages,
    };

    return { pdfData, workName };
  };

  const handleGeneratePDF = async () => {
    if (billEntries.length === 0) {
      toast.error("No bill entries to print");
      return;
    }

    setGeneratingPDF(true);
    try {
      const { pdfData, workName } = buildPdfPayload();
      const pdfBytes = await generateBillAbstractPDF(pdfData);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Bill_Abstract_${workName.substring(0, 20).replace(/[^a-z0-9]/gi, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handlePreviewPDF = async () => {
    if (billEntries.length === 0) {
      toast.error("No bill entries to preview");
      return;
    }

    const { pdfData } = buildPdfPayload();
    setPreviewPdfData(pdfData);
    setPreviewOpen(true);
  };

  const handleSave = async () => {
    if (!selectedWorkId) {
      toast.error("Please select a work");
      return;
    }

    if (billEntries.length === 0) {
      toast.error("Please generate bill entries from MB");
      return;
    }

    setLoading(true);
    try {
      const itemwiseTotal = calculateItemwiseTotalVal();
      const contractualDeduction = calculateContractualDeduction();
      const actualValue = calculateActualValue();

      const grossBillAmount =
        Math.round(actualValue) *
        (1 +
          (parseFloat(formData.cgstPercentage) +
            parseFloat(formData.sgstPercentage)) /
            100);
      const grossWithCess = grossBillAmount * 1.01;

      const payload = {
        billType: formData.billType,
        period: formData.period,
        contractualPercentage: parseFloat(formData.contractualPercentage),
        itemwiseTotal,
        contractualDeduction,
        actualValue,
        grossBillAmount: Math.round(grossWithCess),
        entries: billEntries,
      };

      const isUpdate = !!existingAbstractId;
      const response = isUpdate
        ? await updateBillAbstractApi({ id: existingAbstractId, ...payload })
        : await saveBillAbstractApi({ workId: selectedWorkId, ...payload });

      if (response) {
        toast.success(
          isUpdate
            ? "Bill Abstract updated successfully"
            : "Bill Abstract saved successfully",
        );
        fetchBillAbstract(selectedWorkId);
      }
    } catch (error) {
      console.error("Error saving Bill Abstract:", error);
      toast.error("Error saving Bill Abstract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wb-bg container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-wb-primary">
            Bill Abstract
          </h1>
          <p className="text-gray-600 mt-2">
            Generate and manage bill abstracts
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={generateBillFromMB}
            disabled={!selectedWorkId || mbEntries.length === 0}
            className="gap-2 border-wb-border hover:bg-wb-primary/5 hover:border-wb-primary transition-colors"
          >
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Generate from MB</span>
          </Button>
          <Button
            variant="outline"
            onClick={handlePreviewPDF}
            disabled={billEntries.length === 0 || generatingPDF}
            className="gap-2 border-wb-border hover:bg-wb-info/10 hover:border-wb-primary transition-colors"
          >
            {generatingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Preview &amp; Print</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleGeneratePDF}
            disabled={billEntries.length === 0 || generatingPDF}
            className="gap-2 border-wb-border hover:bg-wb-success/10 hover:border-wb-success transition-colors"
          >
            {generatingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || billEntries.length === 0}
            className="gap-2 bg-wb-primary hover:bg-wb-primary/90 shadow-md hover:shadow-lg transition-all text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : existingAbstractId ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {existingAbstractId ? "Update Abstract" : "Save Abstract"}
            </span>
          </Button>
        </div>
      </div>

      <Card className="border-t-4 border-t-wb-primary bg-white border border-wb-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-wb-primary">
            Work Details & Configuration
          </CardTitle>
          <CardDescription>
            Select a work and configure bill parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="work" className="font-semibold">
                Select Work
              </Label>
              <WorkSearchAndSelect
                works={works}
                selectedWorkId={selectedWorkId}
                onSelect={setSelectedWorkId}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="billType" className="font-semibold">
                  Bill Type
                </Label>
                <Select
                  value={formData.billType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, billType: value })
                  }
                >
                  <SelectTrigger id="billType">
                    <SelectValue placeholder="Select Bill Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st & Final Bill">
                      1st & Final Bill
                    </SelectItem>
                    <SelectItem value="1st RA Bill">1st RA Bill</SelectItem>
                    <SelectItem value="2nd RA Bill">2nd RA Bill</SelectItem>
                    <SelectItem value="Final Bill">Final Bill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period" className="font-semibold">
                  Bill Period
                </Label>
                <Input
                  id="period"
                  placeholder="e.g. Jan 2024 - Feb 2024"
                  value={formData.period}
                  onChange={(e) =>
                    setFormData({ ...formData, period: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="contractualPercentage"
                  className="font-semibold"
                >
                  Contractual Percentage
                </Label>
                <div className="relative">
                  <Input
                    id="contractualPercentage"
                    type="number"
                    step="0.01"
                    className="pr-8"
                    value={formData.contractualPercentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractualPercentage: e.target.value,
                      })
                    }
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card className="h-full bg-white border border-wb-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-wb-primary">Bill Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-lg border border-wb-border m-4 overflow-hidden">
              <Table>
                <TableHeader className="bg-wb-primary/5">
                  <TableRow>
                    <TableHead className="w-[50px]">Sl No</TableHead>
                    <TableHead className="w-[40%]">Items Name</TableHead>
                    <TableHead className="w-[120px]">
                      MB No. & Page No.
                    </TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="w-[80px]">Unit</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-muted-foreground"
                      >
                        {selectedWorkId
                          ? "No entries generated yet. Click 'Generate from MB'."
                          : "Select a work to begin."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayItems.map((item, dIndex) => {
                      if (item.isHeader) {
                        return (
                          <TableRow
                            key={`header-${dIndex}`}
                            className="bg-wb-primary/10 hover:bg-wb-primary/15 font-semibold border-b-2 border-wb-primary/20"
                          >
                            <TableCell className="font-bold text-center align-middle">
                              {item.slNo}
                            </TableCell>
                            <TableCell
                              colSpan={5}
                              className="align-middle text-wb-primary"
                            >
                              {item.description}
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold align-middle">
                              {typeof item.amount === "number"
                                ? item.amount.toFixed(2)
                                : item.amount}
                            </TableCell>
                          </TableRow>
                        );
                      } else {
                        return (
                          <TableRow
                            key={`item-${dIndex}`}
                            className="hover:bg-muted/5"
                          >
                            <TableCell className="font-medium text-center align-top">
                              {item.slNo}
                            </TableCell>
                            <TableCell className="max-w-[300px] border-r border-wb-border/40">
                              <span
                                className={`font-medium text-sm text-foreground/90 whitespace-pre-wrap block ${item.isSubItem ? "pl-4 border-l-2 border-wb-primary/30 ml-2 text-slate-600" : ""}`}
                              >
                                {item.description}
                              </span>
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-muted-foreground w-6">
                                    MB:
                                  </span>
                                  <Input
                                    className="h-6 text-xs font-mono"
                                    placeholder="MB No"
                                    value={item.mbNumber}
                                    onChange={(e) =>
                                      item.entryIndex !== undefined &&
                                      updateEntryMbRef(
                                        item.entryIndex,
                                        "mbNumber",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-muted-foreground w-6">
                                    Pg:
                                  </span>
                                  <Input
                                    className="h-6 text-xs font-mono"
                                    placeholder="Page"
                                    value={item.mbPageNumber}
                                    onChange={(e) =>
                                      item.entryIndex !== undefined &&
                                      updateEntryMbRef(
                                        item.entryIndex,
                                        "mbPageNumber",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm align-top">
                              {typeof item.quantity === "number"
                                ? item.quantity.toFixed(3)
                                : item.quantity}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm align-top">
                              {item.unit}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm align-top">
                              {typeof item.rate === "number"
                                ? item.rate.toFixed(2)
                                : item.rate}
                            </TableCell>
                            <TableCell className="text-right font-mono font-medium text-sm align-top">
                              {typeof item.amount === "number"
                                ? item.amount.toFixed(2)
                                : item.amount}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    })
                  )}
                  {billEntries.length > 0 && (
                    <TableRow className="bg-wb-primary/5 font-medium">
                      <TableCell colSpan={6} className="text-right pr-4 py-3">
                        Itemwise Total =
                      </TableCell>
                      <TableCell className="text-right font-mono py-3">
                        {calculateItemwiseTotalVal().toFixed(2)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-slate-50/80 w-full max-w-3xl ml-auto border-t-4 border-t-emerald-500 border-x border-b border-wb-border shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-7 space-y-3">
            {(() => {
              const itemwiseTotal = calculateItemwiseTotalVal();

              const contractualPercentage =
                parseFloat(formData.contractualPercentage) || 0;
              const contractualDeduction =
                (itemwiseTotal * contractualPercentage) / 100;

              const actualValue = itemwiseTotal - contractualDeduction;
              const sayAmount = Math.round(actualValue);

              const cgstPercent = parseFloat(formData.cgstPercentage) || 0;
              const sgstPercent = parseFloat(formData.sgstPercentage) || 0;

              const cgstAmount = Math.round((sayAmount * cgstPercent) / 100);
              const sgstAmount = Math.round((sayAmount * sgstPercent) / 100);

              const subTotal = sayAmount + cgstAmount + sgstAmount;

              const lwcPercent = 1.0;
              const lwcAmount = Math.round((subTotal * lwcPercent) / 100);

              const grossBillAmount = subTotal + lwcAmount;

              return (
                <>
                  <div className="flex justify-between items-center py-2 group transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                        Less Contractual Percentage @
                      </span>
                      <div className="relative w-24">
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8 text-right pr-7 bg-transparent border-slate-200 shadow-none font-medium focus-visible:ring-emerald-500/30 transition-all placeholder:text-slate-300 hover:bg-white"
                          value={formData.contractualPercentage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contractualPercentage: e.target.value,
                            })
                          }
                        />
                        <span className="absolute right-3 top-[7px] text-xs font-semibold text-slate-400">
                          %
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-base font-semibold text-red-500/90 tracking-tight">
                      - {contractualDeduction.toFixed(2)}
                    </span>
                  </div>
                  <Separator />

                  <div className="flex justify-between items-center py-2 font-semibold text-slate-700">
                    <span>Actual Value of Work done</span>
                    <span className="font-mono tracking-tight text-lg">{actualValue.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-slate-200" />

                  <div className="flex justify-between items-center py-3 font-bold text-xl text-emerald-700 bg-emerald-50/50 -mx-7 px-7 border-y border-emerald-100">
                    <span>Say Amount</span>
                    <span className="font-mono tracking-wider">₹{sayAmount.toFixed(2)}</span>
                  </div>

                  <div className="pt-4 space-y-3 px-1">
                    <div className="flex justify-between text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                      <span>Add CGST ({formData.cgstPercentage}%)</span>
                      <span className="font-mono text-slate-600">+{cgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                      <span>Add SGST ({formData.sgstPercentage}%)</span>
                      <span className="font-mono text-slate-600">+{sgstAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-slate-200 pt-3 text-slate-700">
                      <span>Sub Total</span>
                      <span className="font-mono text-lg">{subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
                      <span>Add Labour Welfare Cess (1%)</span>
                      <span className="font-mono text-slate-600">+{lwcAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-2xl text-emerald-800 bg-gradient-to-r from-emerald-100/50 to-emerald-50 -mx-8 px-8 py-4 border-t border-emerald-200 mt-4 shadow-inner">
                      <span>Gross Bill Amount</span>
                      <span className="font-mono tracking-wider text-emerald-700">
                        ₹{grossBillAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </CardContent>
          <CardFooter className="bg-slate-50/80 p-4 shrink-0 flex items-center justify-center border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-px bg-slate-300"></span>
              Amounts bounded to nearest rupee
              <span className="w-8 h-px bg-slate-300"></span>
            </p>
          </CardFooter>
        </Card>
      </div>

      <PreviewAbstract
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pdfData={previewPdfData}
      />
    </div>
  );
}
