/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Calculator, Printer, Loader2, Pencil } from "lucide-react";
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
import { generateBillDeductionPDF } from "@/lib/pdf-generators/bill-deduction-pdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import WorkSearchAndSelect from "@/components/WorkSearchAndSelect";
import { numberToWords } from "@/lib/utils";
import { gpaddress, gpname } from "@/constants/gpinfor";
import {
  fetchWorks as fetchWorksApi,
  fetchBillAbstract as fetchBillAbstractApi,
  fetchMBEntries as fetchMBEntriesApi,
  fetchBillDeduction as fetchBillDeductionApi,
  saveBillDeduction as saveBillDeductionApi,
  updateBillDeduction as updateBillDeductionApi,
} from "./api";

interface BillAbstract {
  id: string;
  billType: string;
  period: string;
  itemwiseTotal: number;
  contractualDeduction: number;
  actualValue: number;
  grossBillAmount: number;
}

interface Deductions {
  incomeTaxPercentage: string;
  incomeTaxAmount: number;
  gstTdsPercentage: string;
  gstTdsAmount: number;
  labourWelfareCessPercentage: string;
  labourWelfareCessAmount: number;
  securityDepositPercentage: string;
  securityDepositAmount: number;
}

export default function BillDeductionClientPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [billAbstract, setBillAbstract] = useState<BillAbstract | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [existingDeductionId, setExistingDeductionId] = useState<string | null>(
    null,
  );

  const [deductions, setDeductions] = useState<Deductions>({
    incomeTaxPercentage: "1.00",
    incomeTaxAmount: 0,
    gstTdsPercentage: "0.00",
    gstTdsAmount: 0,
    labourWelfareCessPercentage: "1.00",
    labourWelfareCessAmount: 0,
    securityDepositPercentage: "10.00", // Default to 3? Image shows 3.00%. Changing default to match image.
    securityDepositAmount: 0,
  });

  const [formData, setFormData] = useState({
    billPaymentDate: "",
    eGramVoucher: "",
    eGramVoucherDate: "",
    gpmsVoucherNumber: "",
    gpmsVoucherDate: "",
  });

  // State for MB Date
  const [mbDate, setMbDate] = useState<string>("");

  useEffect(() => {
    fetchWorks();
  }, []);

  useEffect(() => {
    if (selectedWorkId) {
      fetchBillAbstract(selectedWorkId);
      fetchMBDate(selectedWorkId);
    } else {
      setBillAbstract(null);
      setMbDate("");
      setExistingDeductionId(null);
    }
  }, [selectedWorkId]);

  useEffect(() => {
    if (!billAbstract?.id) {
      setExistingDeductionId(null);
      return;
    }
    const fetchDeduction = async () => {
      try {
        const data = await fetchBillDeductionApi(billAbstract.id);
        if (data?.id) {
          setExistingDeductionId(data.id);
          setFormData({
            billPaymentDate: data.billPaymentDate
              ? new Date(data.billPaymentDate).toISOString().slice(0, 10)
              : "",
            eGramVoucher: data.eGramVoucher || "",
            eGramVoucherDate: data.eGramVoucherDate
              ? new Date(data.eGramVoucherDate).toISOString().slice(0, 10)
              : "",
            gpmsVoucherNumber: data.gpmsVoucherNumber || "",
            gpmsVoucherDate: data.gpmsVoucherDate
              ? new Date(data.gpmsVoucherDate).toISOString().slice(0, 10)
              : "",
          });
          setDeductions((prev) => ({
            ...prev,
            incomeTaxPercentage:
              data.lessIncomeTaxPercentage?.toString() ??
              prev.incomeTaxPercentage,
            incomeTaxAmount: data.lessIncomeTaxAmount ?? 0,
            gstTdsPercentage:
              data.lessGstTdsPercentage?.toString() ?? prev.gstTdsPercentage,
            gstTdsAmount: data.lessGstTdsAmount ?? 0,
            labourWelfareCessPercentage:
              data.lessLabourWelfareCessPercentage?.toString() ??
              prev.labourWelfareCessPercentage,
            labourWelfareCessAmount: data.lessLabourWelfareCessAmount ?? 0,
            securityDepositPercentage:
              data.lessSecurityDepositPercentage?.toString() ??
              prev.securityDepositPercentage,
            securityDepositAmount: data.lessSecurityDepositAmount ?? 0,
          }));
        } else {
          setExistingDeductionId(null);
        }
      } catch {
        setExistingDeductionId(null);
      }
    };
    fetchDeduction();
  }, [billAbstract?.id]);

  useEffect(() => {
    if (billAbstract) {
      calculateDeductions();
    }
  }, [
    deductions.incomeTaxPercentage,
    deductions.gstTdsPercentage,
    deductions.securityDepositPercentage,
    billAbstract,
  ]);

  const fetchWorks = async () => {
    try {
      const data = await fetchWorksApi();
      // Filter works that have Bill Abstracts
      const worksWithAbstracts = data.filter((work: any) => 
        (work._count?.workBillAbstracts || 0) > 0
      );
      setWorks(worksWithAbstracts);
    } catch (error) {
      console.error("Error fetching works:", error);
    }
  };

  const fetchBillAbstract = async (workId: string) => {
    try {
      const data = await fetchBillAbstractApi(workId);
      if (data) {
        setBillAbstract(data);
      }
    } catch (error) {
      console.error("Error fetching bill abstract:", error);
    }
  };

  const fetchMBDate = async (workId: string) => {
    try {
      const data = await fetchMBEntriesApi(workId);
      if (data && data.length > 0) {
        const sorted = data.sort(
          (a: any, b: any) =>
            new Date(b.measuredDate).getTime() -
            new Date(a.measuredDate).getTime(),
        );
        if (sorted[0]?.measuredDate) {
          setMbDate(new Date(sorted[0].measuredDate).toLocaleDateString());
        }
      }
    } catch (error) {
      console.error("Error fetching MB entries:", error);
    }
  };

  const getCalculatedGrossBillAmount = () => {
    if (!billAbstract) return 0;
    const actualValue = billAbstract.actualValue || 0;
    const sayAmount = Math.round(actualValue);
    const cgstAmount = Math.round((sayAmount * 9) / 100);
    const sgstAmount = Math.round((sayAmount * 9) / 100);
    const subTotal = Math.round(sayAmount + cgstAmount + sgstAmount);
    const labourCess = Math.round((subTotal * 1) / 100);
    return Math.round(subTotal + labourCess);
  };

  const calculateDeductions = () => {
    if (!billAbstract) return;

    const actualValue = billAbstract.actualValue || 0;
    const sayAmount = Math.round(actualValue);

    // Calculate Gross Bill Amount consistent with Abstract
    const grossBillAmount = getCalculatedGrossBillAmount();
    const labourCess = Math.round(
      (Math.round(
        sayAmount +
          Math.round((sayAmount * 9) / 100) +
          Math.round((sayAmount * 9) / 100),
      ) *
        1) /
        100,
    );

    const incomeTaxPct = parseFloat(deductions.incomeTaxPercentage) || 0;
    const gstTdsPct = parseFloat(deductions.gstTdsPercentage) || 0;
    const securityDepositPct =
      parseFloat(deductions.securityDepositPercentage) || 0;

    // Income Tax & GST TDS based on Actual Value (sayAmount)
    const incomeTax = Math.round((sayAmount * incomeTaxPct) / 100);
    const gstTds = Math.round((sayAmount * gstTdsPct) / 100);

    // Security Deposit based on Gross Bill Amount
    const securityDeposit = Math.round(
      (grossBillAmount * securityDepositPct) / 100,
    );

    setDeductions((prev) => ({
      ...prev,
      incomeTaxAmount: incomeTax,
      gstTdsAmount: gstTds,
      labourWelfareCessAmount: labourCess,
      securityDepositPercentage: prev.securityDepositPercentage,
      securityDepositAmount: securityDeposit,
    }));
  };

  const calculateTotalDeduction = () => {
    return Math.round(
      deductions.incomeTaxAmount +
        deductions.gstTdsAmount +
        deductions.labourWelfareCessAmount +
        deductions.securityDepositAmount,
    );
  };

  const calculateNetPayable = () => {
    if (!billAbstract) return 0;
    const grossBillAmount = getCalculatedGrossBillAmount();
    return Math.round(grossBillAmount - calculateTotalDeduction());
  };

  const handlePercentageChange = (field: keyof Deductions, value: string) => {
    setDeductions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!selectedWorkId || !billAbstract) {
      toast.error("Please select a work and ensure bill abstract exists");
      return;
    }

    setLoading(true);
    try {
      const netPayable = calculateNetPayable();
      const totalDeduction = calculateTotalDeduction();
      const grossBillAmount = getCalculatedGrossBillAmount();

      const payload = {
        grossBillAmount,
        deductions: {
          incomeTax: {
            percentage: parseFloat(deductions.incomeTaxPercentage),
            amount: deductions.incomeTaxAmount,
          },
          gstTds: {
            percentage: parseFloat(deductions.gstTdsPercentage),
            amount: deductions.gstTdsAmount,
          },
          labourWelfareCess: {
            percentage: 1.0,
            amount: deductions.labourWelfareCessAmount,
          },
          securityDeposit: {
            percentage: parseFloat(deductions.securityDepositPercentage),
            amount: deductions.securityDepositAmount,
          },
        },
        totalDeduction,
        netPayable,
        ...formData,
      };

      const isUpdate = !!existingDeductionId;
      const response = isUpdate
        ? await updateBillDeductionApi({ id: existingDeductionId, ...payload })
        : await saveBillDeductionApi({
            workId: selectedWorkId,
            billAbstractId: billAbstract.id,
            ...payload,
          });

      if (response) {
        toast.success(
          isUpdate
            ? "Bill deduction updated successfully"
            : "Bill deduction saved successfully",
        );
        if (response?.data?.id) setExistingDeductionId(response.data.id);
      }
    } catch (error) {
      console.error("Error saving bill deduction:", error);
      toast.error("Error saving bill deduction");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!selectedWorkId || !billAbstract) {
      toast.error("Please select a work and ensure bill abstract exists");
      return;
    }

    setGeneratingPDF(true);
    try {
      const work = works.find((w) => w.id === selectedWorkId);

      const workName =
        work?.ApprovedActionPlanDetails?.activityDescription ||
        `Work ${work?.workslno}`;
      const activityCode = work?.ApprovedActionPlanDetails?.activityCode || "";
      const fund = work?.ApprovedActionPlanDetails?.schemeName || "";
      const estimatedAmount = Math.round(
        work?.finalEstimateAmount || 0,
      ).toFixed(2); // Display as .00 even if rounded to int? User said "all amount will be rounded". Usually implies integer or .00. Let's send number, handle formatting in PDF or keep .00 here.
      // User: "all amount will be rounded" -> 1005.00 is rounded? or 1005?
      // In PDF image: "Rs. 1005.04". Wait.
      // User PREVIOUSLY said "all amount will be rounded".
      // Let's assume Integer for now based on "rounded".

      const nitNoRaw = work?.nitDetails?.memoNumber
        ? `${work?.nitDetails?.memoNumber}`
        : "";
      const nitDateObj = work?.nitDetails?.memoDate
        ? new Date(work.nitDetails.memoDate)
        : null;
      const nitDateYear = nitDateObj ? nitDateObj.getFullYear() : "";
      const nitNo =
        nitNoRaw && nitDateYear ? `${nitNoRaw}/DGP/${nitDateYear}` : nitNoRaw;
      const nitDate = nitDateObj ? nitDateObj.toLocaleDateString() : "";

      const workSlNo = work?.workslno?.toString() || "";

      const aoc = work?.AwardofContract;
      const woNoRaw = aoc?.workodermenonumber
        ? `${aoc.workodermenonumber}`
        : "";
      const woDateObj = aoc?.workordeermemodate
        ? new Date(aoc.workordeermemodate)
        : null;
      const woDateYear = woDateObj ? woDateObj.getFullYear() : "";
      const woMemoNo =
        woNoRaw && woDateYear ? `${woNoRaw}/DGP/${woDateYear}` : woNoRaw; // PREVIOUSLY WO-xxx. Now custom format.
      const woDate = woDateObj ? woDateObj.toLocaleDateString() : "";

      const agreementNo = "";
      const agreementDate = "";

      const commencementDate = work?.workCommencementDate
        ? new Date(work.workCommencementDate).toLocaleDateString()
        : "";
      const completionDate = work?.completionDate
        ? new Date(work.completionDate).toLocaleDateString()
        : "";
      const finalMeasurementDate = mbDate || "";

      const woDetails = aoc?.workorderdetails?.[0];
      const agencyName = woDetails?.Bidagency?.agencydetails?.name || "N/A";
      const agencyAddress =
        woDetails?.Bidagency?.agencydetails?.contactDetails ||
        "Address not available";

      // Calculate Gross again to be sure - ROUNDED
      const actualValue = billAbstract.actualValue || 0;
      const sayAmount = Math.round(actualValue);
      const cgstAmount = Math.round((sayAmount * 9) / 100);
      const sgstAmount = Math.round((sayAmount * 9) / 100);
      const subTotal = Math.round(sayAmount + cgstAmount + sgstAmount);
      const labourCess = Math.round((subTotal * 1) / 100);
      const grossBillAmount = Math.round(subTotal + labourCess);
      const estCost = work?.finalEstimateAmount || 0;
      const tendAmount = work?.tenderAmount || 0;
      let percentage = 0;
      let isLess = false;

      if (estCost > 0 && tendAmount > 0) {
        if (tendAmount < estCost) {
          percentage = ((estCost - tendAmount) / estCost) * 100;
          isLess = true;
        } else if (tendAmount > estCost) {
          percentage = ((tendAmount - estCost) / estCost) * 100;
          isLess = false;
        } else {
          percentage = 0;
        }
      }

      const pdfData = {
        gpName: gpname,
        blockName: gpaddress,
        workName: workName,
        activityCode: activityCode,
        fund: fund,
        estimatedAmount: estimatedAmount, // String in interface?
        nitNo: nitNo,
        nitDate: nitDate,
        workSlNo: workSlNo,
        woMemoNo: woMemoNo,
        woDate: woDate,
        agreementNo: agreementNo || "",
        agreementDate: agreementDate || "",
        commencementDate: commencementDate,
        completionDate: completionDate,
        measurementDate: finalMeasurementDate,
        agencyName: agencyName,
        agencyAddress: agencyAddress,
        grossBillAmount: grossBillAmount,
        deductions: {
          incomeTax: {
            percent: deductions.incomeTaxPercentage,
            amount: Math.round(deductions.incomeTaxAmount),
          },
          gstTds: {
            percent: deductions.gstTdsPercentage,
            amount: Math.round(deductions.gstTdsAmount),
          },
          labourCess: {
            percent: "1.00",
            amount: Math.round(deductions.labourWelfareCessAmount),
          },
          securityDeposit: {
            percent: deductions.securityDepositPercentage,
            amount: Math.round(deductions.securityDepositAmount),
          },
        },
        totalDeduction: calculateTotalDeduction(),
        netPayable: calculateNetPayable(),
        amountInWords: numberToWords(Math.round(calculateNetPayable())),
        voucherNo: formData.eGramVoucher,
        voucherDate: formData.eGramVoucherDate,
        paymentDate: formData.billPaymentDate,
      };

      const pdfBytes = await generateBillDeductionPDF(pdfData);
      // ... existing download code
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Bill_Deduction_${workName.substring(0, 20)}.pdf`;
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

  // ... (numberToWords)

  const formatNumberToWords = (num: number): string => {
    // Simple implementation - can be enhanced
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
      "Twenty",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero";
    if (num < 20) return ones[num];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
      );
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const remainder = num % 100;
      return (
        ones[hundred] +
        " Hundred" +
        (remainder ? " " + formatNumberToWords(remainder) : "")
      );
    }
    if (num < 100000) {
      const thousand = Math.floor(num / 1000);
      const remainder = num % 1000;
      return (
        formatNumberToWords(thousand) +
        " Thousand" +
        (remainder ? " " + formatNumberToWords(remainder) : "")
      );
    }
    if (num < 10000000) {
      const lakh = Math.floor(num / 100000);
      const remainder = num % 100000;
      return (
        formatNumberToWords(lakh) +
        " Lakh" +
        (remainder ? " " + formatNumberToWords(remainder) : "")
      );
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-wb-bg container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-wb-primary">
              Bill Deduction
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Apply deductions to bill abstract and calculate net payable amount
            </p>
          </div>
        </div>

        <Card className="bg-white border border-wb-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-wb-primary">Deduction Details</CardTitle>
            <CardDescription>
              Select a work and configure deduction percentages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="work">Select Work</Label>
              <WorkSearchAndSelect
                works={works}
                selectedWorkId={selectedWorkId}
                onSelect={setSelectedWorkId}
              />
            </div>

            {billAbstract && (
              <>
                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Bill Details (from Abstract)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-wb-primary/5 rounded-lg border border-wb-border/50">
                    <div>
                      <Label className="text-muted-foreground">Bill Type</Label>
                      <div className="text-sm font-medium mt-1">
                        {billAbstract.billType || ""}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Period</Label>
                      <div className="text-sm font-medium mt-1">
                        {billAbstract.period || ""}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Itemwise Total
                      </Label>
                      <div className="text-sm font-semibold mt-1">
                        {typeof billAbstract.itemwiseTotal === "number"
                          ? `₹ ${billAbstract.itemwiseTotal.toFixed(2)}`
                          : ""}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Contractual Deduction
                      </Label>
                      <div className="text-sm font-semibold mt-1">
                        {typeof billAbstract.contractualDeduction === "number"
                          ? `₹ ${billAbstract.contractualDeduction.toFixed(2)}`
                          : ""}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Actual Value
                      </Label>
                      <div className="text-lg font-semibold text-wb-primary mt-1">
                        {typeof billAbstract.actualValue === "number"
                          ? `₹ ${billAbstract.actualValue.toFixed(2)}`
                          : ""}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        Gross Bill Amount
                      </Label>
                      <div className="text-lg font-semibold mt-1">
                        {typeof billAbstract.grossBillAmount === "number"
                          ? `₹ ${billAbstract.grossBillAmount.toFixed(2)}`
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Deductions
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Income Tax */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border border-wb-border rounded-lg hover:bg-wb-primary/5 transition-colors">
                      <div className="md:col-span-4">
                        <Label htmlFor="incomeTax" className="font-medium">
                          Income Tax
                        </Label>
                      </div>
                      <div className="md:col-span-4 flex items-center gap-2">
                        <Input
                          id="incomeTax"
                          type="number"
                          step="0.01"
                          value={deductions.incomeTaxPercentage}
                          onChange={(e) =>
                            handlePercentageChange(
                              "incomeTaxPercentage",
                              e.target.value,
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <div className="md:col-span-4 text-right">
                        <div className="text-sm font-medium">
                          ₹ {deductions.incomeTaxAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* GST TDS */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border border-wb-border rounded-lg hover:bg-wb-primary/5 transition-colors">
                      <div className="md:col-span-4">
                        <Label htmlFor="gstTds" className="font-medium">
                          GST (TDS)
                        </Label>
                      </div>
                      <div className="md:col-span-4 flex items-center gap-2">
                        <Input
                          id="gstTds"
                          type="number"
                          step="0.01"
                          value={deductions.gstTdsPercentage}
                          onChange={(e) =>
                            handlePercentageChange(
                              "gstTdsPercentage",
                              e.target.value,
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <div className="md:col-span-4 text-right">
                        <div className="text-sm font-medium">
                          ₹ {deductions.gstTdsAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Labour Cess */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border border-wb-border rounded-lg hover:bg-wb-primary/5 transition-colors">
                      <div className="md:col-span-4">
                        <Label htmlFor="labourCess" className="font-medium">
                          Labour Welfare Cess
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Select 1% of Bill Amount
                        </p>
                      </div>
                      <div className="md:col-span-4 flex items-center gap-2">
                        <Select
                          value={deductions.labourWelfareCessPercentage}
                          onValueChange={(value) =>
                            handlePercentageChange(
                              "labourWelfareCessPercentage",
                              value,
                            )
                          }
                        >
                          <SelectTrigger id="labourCess" className="w-32">
                            <SelectValue placeholder="Select %" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1.00">1.00%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-4 text-right">
                        <div className="text-sm font-medium py-2">
                          ₹ {deductions.labourWelfareCessAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Security Deposit */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border border-wb-border rounded-lg hover:bg-wb-primary/5 transition-colors">
                      <div className="md:col-span-4">
                        <Label
                          htmlFor="securityDeposit"
                          className="font-medium"
                        >
                          Security Deposit
                        </Label>
                      </div>
                      <div className="md:col-span-4 flex items-center gap-2">
                        <Input
                          id="securityDeposit"
                          type="number"
                          step="0.01"
                          value={deductions.securityDepositPercentage}
                          onChange={(e) =>
                            handlePercentageChange(
                              "securityDepositPercentage",
                              e.target.value,
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <div className="md:col-span-4 text-right">
                        <div className="text-sm font-medium">
                          ₹ {deductions.securityDepositAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Details</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="billPaymentDate">
                          Bill Payment Date
                        </Label>
                        <Input
                          id="billPaymentDate"
                          type="date"
                          value={formData.billPaymentDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              billPaymentDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="eGramVoucher">eGram Voucher</Label>
                        <Input
                          id="eGramVoucher"
                          value={formData.eGramVoucher}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              eGramVoucher: e.target.value,
                            })
                          }
                          placeholder="Enter eGram Voucher No."
                        />
                      </div>
                      <div>
                        <Label htmlFor="eGramVoucherDate">
                          eGram Voucher Date
                        </Label>
                        <Input
                          id="eGramVoucherDate"
                          type="date"
                          value={formData.eGramVoucherDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              eGramVoucherDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="gpmsVoucherNumber">
                          GPMS Voucher Number
                        </Label>
                        <Input
                          id="gpmsVoucherNumber"
                          value={formData.gpmsVoucherNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gpmsVoucherNumber: e.target.value,
                            })
                          }
                          placeholder="Enter GPMS Voucher No."
                        />
                      </div>
                      <div>
                        <Label htmlFor="gpmsVoucherDate">
                          GPMS Voucher Date
                        </Label>
                        <Input
                          id="gpmsVoucherDate"
                          type="date"
                          value={formData.gpmsVoucherDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gpmsVoucherDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-wb-primary/5 border border-wb-border p-6 rounded-lg space-y-4 h-fit">
                    <h3 className="text-lg font-semibold">Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          Gross Bill Amount
                        </span>
                        <span className="font-medium">
                          ₹ {getCalculatedGrossBillAmount().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-destructive">
                          Total Deductions
                        </span>
                        <span className="font-medium text-destructive">
                          - ₹ {calculateTotalDeduction().toFixed(2)}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Net Payable</span>
                        <span className="text-2xl font-bold text-wb-primary">
                          ₹ {calculateNetPayable().toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right text-xs text-muted-foreground italic">
                        {formatNumberToWords(Math.round(calculateNetPayable()))}{" "}
                        Only
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedWorkId && !billAbstract && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="bg-wb-primary/10 p-4 rounded-full mb-4">
                  <Calculator className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  No Bill Abstract Found
                </h3>
                <p className="text-sm max-w-sm">
                  Please create a bill abstract for this work before adding
                  deductions.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t p-6">
            <Button
              variant="outline"
              onClick={handleGeneratePDF}
              disabled={generatingPDF || !billAbstract}
              className="gap-2 w-full sm:w-auto border-wb-border hover:bg-wb-success/10 hover:border-wb-success"
            >
              {generatingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              <span>Generate PDF</span>
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !billAbstract}
              className="gap-2 w-full sm:w-auto bg-wb-primary hover:bg-wb-primary/90 shadow-md hover:shadow-lg text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : existingDeductionId ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>
                {existingDeductionId ? "Update Deduction" : "Save Deduction"}
              </span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
