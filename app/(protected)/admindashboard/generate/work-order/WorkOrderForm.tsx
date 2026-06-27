"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Loader2,
  CheckCircle2,
  Printer,
  Building2,
  CalendarDays,
  FileDigit,
  ListChecks,
} from "lucide-react";
import { generateFinancialYears, getCurrentFinancialYear } from "@/utils/financialYear";
import WorkorderCertificate from "@/components/PrintTemplet/Work-order-Certificate";
import SupplyOrder from "@/components/PrintTemplet/Supply-order";
import { AgrementCertificate } from "@/components/PrintTemplet/Agrement-certificate";
import CoverPagePrint from "@/components/PrintTemplet/CoverPage";
import Completationcertificate from "@/components/PrintTemplet/completation-certificate";
import PaymentCertificate from "@/components/PrintTemplet/payment-certificate";
import ScrutinySheet from "@/components/PrintTemplet/ScrutnisheetTemplete";
import ComparativeStatement from "@/components/PrintTemplet/comparative-statement";
import { Workorderdetails } from "@/types/tender-manage";
import { Agreement } from "@/types/agreement";
import { CompletationCertificate, PaymentDetilsType, workdetailsforprint } from "@/types";
import { workCoverPageType} from "@/types/worksdetails";
import { comparativeStatementProps } from "@/types";
import {
  getNitOptions,
  getWorkSlOptions,
  getWorkOrderDetails,
  type NitOption,
  type WorkSlOption,
} from "@/action/work-order-actions";

interface WorkOrderFormProps {
  initialFinancialYear?: string;
}

// Step indicator component
const StepIndicator = ({ step, currentStep, label }: { step: number; currentStep: number; label: string }) => {
  const isActive = currentStep >= step;
  const isCompleted = currentStep > step;

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
            isCompleted
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              : isActive
              ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20"
              : "bg-muted text-muted-foreground border border-border"
          }`}
        >
          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step}
        </div>
        <span className={`text-xs mt-1.5 font-medium ${
          isCompleted ? "text-emerald-600 dark:text-emerald-400" :
          isActive ? "text-primary" : "text-muted-foreground"
        }`}>
          {label}
        </span>
      </div>
      {step < 4 && (
        <div className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
          currentStep > step ? "bg-emerald-400" : isActive ? "bg-primary/30" : "bg-border"
        }`} />
      )}
    </div>
  );
};

export default function WorkOrderForm({ initialFinancialYear }: WorkOrderFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [financialYear, setFinancialYear] = useState<string>(
    initialFinancialYear || searchParams.get("financialYear") || getCurrentFinancialYear()
  );
  const [nitNo, setNitNo] = useState<string>(searchParams.get("nitNo") || "");
  const [workSlNo, setWorkSlNo] = useState<string>(searchParams.get("workSlNo") || "");
  const [agencyName, setAgencyName] = useState<string>("");
  const [workOrderDetails, setWorkOrderDetails] = useState<Workorderdetails | null>(null);
  const [isSupply, setIsSupply] = useState<boolean>(false);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [workDetailForCoverPage, setWorkDetailForCoverPage] = useState<workCoverPageType | null>(null);
  const [workDetailForCompletion, setWorkDetailForCompletion] = useState<CompletationCertificate | null>(null);
  const [workDetailForPayment, setWorkDetailForPayment] = useState<PaymentDetilsType | null>(null);
  const [workDetailForScrutiny, setWorkDetailForScrutiny] = useState<workdetailsforprint | null>(null);
  const [workDetailForComparative, setWorkDetailForComparative] = useState<comparativeStatementProps | null>(null);

  const [nitOptions, setNitOptions] = useState<NitOption[]>([]);
  const [workSlOptions, setWorkSlOptions] = useState<WorkSlOption[]>([]);
  const [loading, setLoading] = useState(false);

  const financialYears = generateFinancialYears();

  const fetchNitOptions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getNitOptions(financialYear);
      if (result.success) {
        setNitOptions(result.data);
      } else {
        console.error("Error fetching NIT options:", result.error);
        setNitOptions([]);
      }
    } catch (error) {
      console.error("Error fetching NIT options:", error);
      setNitOptions([]);
    } finally {
      setLoading(false);
    }
  }, [financialYear]);

  const fetchWorkSlOptions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getWorkSlOptions(financialYear, nitNo);
      if (result.success) {
        setWorkSlOptions(result.data);
      } else {
        console.error("Error fetching Work SL options:", result.error);
        setWorkSlOptions([]);
      }
    } catch (error) {
      console.error("Error fetching Work SL options:", error);
      setWorkSlOptions([]);
    } finally {
      setLoading(false);
    }
  }, [financialYear, nitNo]);

  const fetchWorkOrderDetails = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getWorkOrderDetails(financialYear, nitNo, workSlNo);
      if (result.success) {
        setAgencyName(result.data.agencyName);
        setWorkOrderDetails(result.data.workOrderDetails);
        setIsSupply(result.data.isSupply);
        setAgreement(result.data.agreement);
        setWorkDetailForCoverPage(result.data.workDetailForCoverPage);
        setWorkDetailForCompletion(result.data.workDetailForCompletion);
        setWorkDetailForPayment(result.data.workDetailForPayment);
        setWorkDetailForScrutiny(result.data.workDetailForScrutiny);
        setWorkDetailForComparative(result.data.workDetailForComparative);
      } else {
        console.error("Error fetching work order details:", result.error);
        setAgencyName("");
        setWorkOrderDetails(null);
        setIsSupply(false);
        setAgreement(null);
        setWorkDetailForCoverPage(null);
        setWorkDetailForCompletion(null);
        setWorkDetailForPayment(null);
        setWorkDetailForScrutiny(null);
        setWorkDetailForComparative(null);
      }
    } catch (error) {
      console.error("Error fetching work order details:", error);
      setAgencyName("");
      setWorkOrderDetails(null);
      setIsSupply(false);
      setAgreement(null);
      setWorkDetailForCoverPage(null);
      setWorkDetailForCompletion(null);
      setWorkDetailForPayment(null);
      setWorkDetailForScrutiny(null);
      setWorkDetailForComparative(null);
    } finally {
      setLoading(false);
    }
  }, [financialYear, nitNo, workSlNo]);

  // Initialize step and load data based on URL params on mount
  useEffect(() => {
    const urlNitNo = searchParams.get("nitNo") || "";
    const urlWorkSlNo = searchParams.get("workSlNo") || "";
    const urlFinancialYear = searchParams.get("financialYear") || getCurrentFinancialYear();

    if (urlFinancialYear) {
      setFinancialYear(urlFinancialYear);
    }
    if (urlNitNo) {
      setNitNo(urlNitNo);
    }
    if (urlWorkSlNo) {
      setWorkSlNo(urlWorkSlNo);
    }

    if (urlWorkSlNo) {
      setStep(4);
    } else if (urlNitNo) {
      setStep(3);
    } else if (urlFinancialYear) {
      setStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch NIT options when financial year is selected
  useEffect(() => {
    if (financialYear && step >= 2) {
      fetchNitOptions();
    }
  }, [financialYear, step, fetchNitOptions]);

  // Fetch Work SL options when NIT is selected
  useEffect(() => {
    if (nitNo && step >= 3) {
      fetchWorkSlOptions();
    }
  }, [nitNo, step, fetchWorkSlOptions]);

  // Fetch agency name and work order details when work SL is selected
  useEffect(() => {
    if (workSlNo && step >= 4) {
      fetchWorkOrderDetails();
    }
  }, [workSlNo, step, fetchWorkOrderDetails]);

  const handleFinancialYearChange = (value: string) => {
    setFinancialYear(value);
    setNitNo("");
    setWorkSlNo("");
    setAgencyName("");
    setWorkOrderDetails(null);
    setNitOptions([]);
    setWorkSlOptions([]);
    setStep(2);
    const params = new URLSearchParams(searchParams.toString());
    params.set("financialYear", value);
    params.delete("nitNo");
    params.delete("workSlNo");
    router.push(`?${params.toString()}`);
  };

  const handleNitChange = (value: string) => {
    setNitNo(value);
    setWorkSlNo("");
    setAgencyName("");
    setWorkOrderDetails(null);
    setWorkSlOptions([]);
    setStep(3);
    const params = new URLSearchParams(searchParams.toString());
    params.set("nitNo", value);
    params.delete("workSlNo");
    router.push(`?${params.toString()}`);
  };

  const handleWorkSlChange = (value: string) => {
    setWorkSlNo(value);
    setStep(4);
    const params = new URLSearchParams(searchParams.toString());
    params.set("workSlNo", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 rounded-3xl shadow-2xl">
          <div className="absolute -top-16 -right-16 h-64 w-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/20 ring-1 ring-primary/40">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Generate Work Order</h1>
              <p className="text-slate-400 mt-1">
                Follow the steps below to generate work order documents
              </p>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex justify-between items-center py-5 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
          <StepIndicator step={1} currentStep={step} label="Financial Year" />
          <StepIndicator step={2} currentStep={step} label="NIT Number" />
          <StepIndicator step={3} currentStep={step} label="Work SL" />
          <StepIndicator step={4} currentStep={step} label="Agency" />
        </div>

        <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-5">
            <CardTitle className="text-xl flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" />
              Selection Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Horizontal selection row */}
            <div className="flex flex-wrap items-end gap-4">
              {/* Financial Year */}
              <div className="flex-1 min-w-[200px]">
                <Label className="text-sm font-medium mb-1 block">Financial Year</Label>
                <Select value={financialYear} onValueChange={handleFinancialYearChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select FY" />
                  </SelectTrigger>
                  <SelectContent>
                    {financialYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* NIT Number (visible if step >= 2) */}
              {step >= 2 && financialYear && (
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-sm font-medium mb-1 block">NIT Number</Label>
                  {loading && step === 2 ? (
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <Select
                      value={nitNo}
                      onValueChange={handleNitChange}
                      disabled={nitOptions.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select NIT" />
                      </SelectTrigger>
                      <SelectContent>
                        {nitOptions.length === 0 ? (
                          <SelectItem value="no-options" disabled>
                            No NITs found
                          </SelectItem>
                        ) : (
                          nitOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Work SL Number (visible if step >= 3) */}
              {step >= 3 && nitNo && (
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-sm font-medium mb-1 block">Work SL Number</Label>
                  {loading && step === 3 ? (
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <Select
                      value={workSlNo}
                      onValueChange={handleWorkSlChange}
                      disabled={workSlOptions.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Work SL" />
                      </SelectTrigger>
                      <SelectContent>
                        {workSlOptions.length === 0 ? (
                          <SelectItem value="no-options" disabled>
                            No works found
                          </SelectItem>
                        ) : (
                          workSlOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}

              {/* Agency Name (visible if step >= 4) */}
              {step >= 4 && workSlNo && (
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-sm font-medium mb-1 block">Agency Name</Label>
                  {loading && step === 4 ? (
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <div className="h-10 px-3 border rounded-md bg-primary/5 flex items-center">
                      <span className="text-sm font-medium text-primary truncate">
                        {agencyName || "Not available"}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Print Options */}
        {step >= 4 && workOrderDetails && (
          <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-5">
              <CardTitle className="text-xl flex items-center gap-2">
                <Printer className="w-5 h-5 text-primary" />
                Available Documents to Print
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Work Order Print */}
                <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="bg-blue-500/15 p-3 rounded-full group-hover:bg-blue-500/25 transition-colors">
                      <Printer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Label className="font-semibold text-blue-800 dark:text-blue-300">Work Order</Label>
                    <WorkorderCertificate workOrderDetails={workOrderDetails} />
                  </div>
                </div>

                {/* Agreement Print */}
                {agreement && (
                  <div className="group relative bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="bg-teal-500/15 p-3 rounded-full group-hover:bg-teal-500/25 transition-colors">
                        <Printer className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <Label className="font-semibold text-teal-800 dark:text-teal-300">Agreement</Label>
                      <AgrementCertificate agrement={agreement} />
                    </div>
                  </div>
                )}

                {/* Cover Page */}
                {workDetailForCoverPage && (
                  <div className="group relative bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="bg-rose-500/15 p-3 rounded-full group-hover:bg-rose-500/25 transition-colors">
                        <Printer className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                      </div>
                      <Label className="font-semibold text-rose-800 dark:text-rose-300">Cover Page</Label>
                      <CoverPagePrint workCoverPageType={workDetailForCoverPage} />
                    </div>
                  </div>
                )}

                {/* Completion Certificate */}
                {workDetailForCompletion && (
                  <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="bg-green-500/15 p-3 rounded-full group-hover:bg-green-500/25 transition-colors">
                        <Printer className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <Label className="font-semibold text-green-800 dark:text-green-300">Completion Certificate</Label>
                      <Completationcertificate paymentdetails={workDetailForCompletion} />
                    </div>
                  </div>
                )}

                {/* Payment Certificate */}
                {workDetailForPayment && (
                  <div className="group relative bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="bg-violet-500/15 p-3 rounded-full group-hover:bg-violet-500/25 transition-colors">
                        <Printer className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <Label className="font-semibold text-violet-800 dark:text-violet-300">Payment Certificate</Label>
                      <PaymentCertificate paymentdetails={workDetailForPayment} />
                    </div>
                  </div>
                )}

                {/* Scrutiny Sheet */}
                {workDetailForScrutiny && (
                  <div className="group relative bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30 border border-sky-200 dark:border-sky-800 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="bg-sky-500/15 p-3 rounded-full group-hover:bg-sky-500/25 transition-colors">
                        <Printer className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                      </div>
                      <Label className="font-semibold text-sky-800 dark:text-sky-300">Scrutiny Sheet</Label>
                      <ScrutinySheet workdetails={workDetailForScrutiny} />
                    </div>
                  </div>
                )}

                {/* Comparative Statement */}
                {workDetailForComparative && (
                  <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="bg-purple-500/15 p-3 rounded-full group-hover:bg-purple-500/25 transition-colors">
                        <Printer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <Label className="font-semibold text-purple-800 dark:text-purple-300">Comparative Statement</Label>
                      <ComparativeStatement comparativeStatement={workDetailForComparative} />
                    </div>
                  </div>
                )}

                {/* Supply Order (only if isSupply is true) */}
                {isSupply && workOrderDetails && (
                  <div className="group relative bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="bg-orange-500/15 p-3 rounded-full group-hover:bg-orange-500/25 transition-colors">
                        <Printer className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <Label className="font-semibold text-orange-800 dark:text-orange-300">Supply Order</Label>
                      <SupplyOrder workOrderDetails={workOrderDetails} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
