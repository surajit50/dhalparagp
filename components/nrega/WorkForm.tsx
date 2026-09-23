"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nregaWorkSchema, type NregaWorkFormValues } from "@/schema/nrega";
import { createNregaWork, updateNregaWork } from "@/action/nrega/work-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Save, ChevronLeft, ChevronRight, IndianRupee } from "lucide-react";
import {
  WORK_FORM_STEPS,
  WORK_FORM_STEP_FIELDS,
  getMasterOptions,
  DEFAULT_FINANCIAL_YEAR_OPTIONS,
  DEFAULT_NATURE_OF_WORK_OPTIONS,
  DEFAULT_MASTER_CATEGORY_OPTIONS,
  DEFAULT_SUB_CATEGORY_OPTIONS,
  DEFAULT_WORKSITE_TYPE_OPTIONS,
  BENEFICIARY_TYPE_OPTIONS,
  DEFAULT_BENEFICIARY_CATEGORY_OPTIONS,
  DEFAULT_CONVERGENCE_DEPT_OPTIONS,
  NOC_RECEIVED_OPTIONS,
  WORK_STATUS_OPTIONS,
} from "@/lib/utils/nrega";
import { formatCurrency } from "@/lib/utils";

type FormDateFields = "gramSabhaApprovalDate" | "adminApprovalDate" | "technicalSanctionDate" | "dprDate" | "nocDate";

interface WorkFormProps {
  initialData?: Omit<NregaWorkFormValues, FormDateFields> & {
    id?: string;
    gramSabhaApprovalDate?: string | Date | null;
    adminApprovalDate?: string | Date | null;
    technicalSanctionDate?: string | Date | null;
    dprDate?: string | Date | null;
    nocDate?: string | Date | null;
  };
  masterData?: Record<string, Array<{ value: string; label: string }>>;
  mode?: "create" | "edit";
}

export default function WorkForm({ initialData, masterData = {}, mode = "create" }: WorkFormProps) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<NregaWorkFormValues>({
    resolver: zodResolver(nregaWorkSchema),
    defaultValues: (initialData as any) || {
      financialYear: "",
      scheme: "VB-GRAMG",
      workName: "",
      gramPanchayat: "",
      block: "",
      district: "",
      estimatedCost: 0,
      wageComponent: 0,
      materialComponent: 0,
      totalEstimatedCost: 0,
      workStatus: "DRAFT",
      vbGramgShare: 0,
      convergenceDeptShare: 0,
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger, getValues, clearErrors } = form;

  // ---- Auto-calc helpers (INLINE, no useEffect anti-pattern) ----
  const recalcFinancials = () => {
    const vals = getValues();
    const wage = Number(vals.wageComponent) || 0;
    const mat = Number(vals.materialComponent) || 0;
    const total = wage + mat;
    if (total > 0) {
      setValue("estimatedCost", total, { shouldDirty: true });
      const wagePercent = Math.round((wage / total) * 100);
      const matPercent = 100 - wagePercent;
      setValue("wageMaterialRatio", `${wagePercent}:${matPercent}`, { shouldDirty: true });
    }
    const vb = Number(vals.vbGramgShare) || 0;
    const conv = Number(vals.convergenceDeptShare) || 0;
    const convTotal = vb + conv;
    setValue("totalEstimatedCost", convTotal > 0 ? convTotal : total, { shouldDirty: true });
  };

  // Keep live display in sync (only used for display, not state mutation loop)
  const liveEstimatedCost = watch("estimatedCost");
  const liveWageRatio = watch("wageMaterialRatio");
  const liveTotalCost = watch("totalEstimatedCost");

  // Sync totalEstimatedCost when convergence shares change via input blur
  const onFinancialBlur = () => recalcFinancials();

  // Cancelled-flag guard pattern for any future async useEffects
  useEffect(() => {
    let cancelled = false;
    // Future async operations here should check `cancelled` before setState
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = (data: NregaWorkFormValues) => {
    startTransition(async () => {
      try {
        const result =
          mode === "edit" && initialData?.id
            ? await updateNregaWork(initialData.id, data)
            : await createNregaWork(data);

        if (result.success) {
          toast.success(result.message);
          if (mode === "create" && "workId" in result && result.workId) {
            router.push(`/employeedashboard/nrega/works/${result.workId}`);
          } else {
            router.push("/employeedashboard/nrega/works");
          }
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("An error occurred");
      }
    });
  };

  const goNext = async () => {
    // Auto-recalc before step 2 -> step 3 transition
    if (step === 2) recalcFinancials();
    const fieldsToValidate = (WORK_FORM_STEP_FIELDS[step] || []) as (keyof NregaWorkFormValues)[];
    if (fieldsToValidate.length > 0) {
      const valid = await trigger(fieldsToValidate);
      if (!valid) {
        toast.error("Please fix the highlighted fields before continuing");
        // Scroll top of form to show errors
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    clearErrors();
    if (step < WORK_FORM_STEPS.length - 1) {
      setStep((s) => s + 1);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {WORK_FORM_STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
              i === step
                ? "bg-primary text-primary-foreground shadow-sm"
                : i < step
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
              i === step ? "border-primary-foreground/30" : ""
            }`}>
              {i < step ? "✓" : i + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card className="border-muted/50">
        <CardHeader className="pb-3 border-b bg-muted/20 rounded-t-lg">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {step + 1}
            </span>
            {WORK_FORM_STEPS[step]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 0: Basic Information */}
          {step === 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="financialYear">Financial Year *</Label>
                  <Select
                    value={watch("financialYear")}
                    onValueChange={(v) => setValue("financialYear", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select FY" />
                    </SelectTrigger>
                    <SelectContent>
                      {(getMasterOptions("FINANCIAL_YEAR").length > 0
                        ? getMasterOptions("FINANCIAL_YEAR")
                        : [
                            { value: "2024-2025", label: "2024-2025" },
                            { value: "2025-2026", label: "2025-2026" },
                            { value: "2026-2027", label: "2026-2027" },
                          ]
                      ).map((fy) => (
                        <SelectItem key={fy.value} value={fy.value}>
                          {fy.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.financialYear && (
                    <p className="text-xs text-red-500 mt-1">{errors.financialYear.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="scheme">Scheme</Label>
                  <Input {...register("scheme")} defaultValue="VB-GRAMG" />
                </div>
              </div>
              <div>
                <Label htmlFor="workName">Name of Proposed Work *</Label>
                <Input {...register("workName")} placeholder="e.g. Construction of Farm Pond at..." />
                {errors.workName && (
                  <p className="text-xs text-red-500 mt-1">{errors.workName.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nature of Work</Label>
                  <Select
                    value={watch("natureOfWork") || ""}
                    onValueChange={(v) => setValue("natureOfWork", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {(getMasterOptions("NATURE_OF_WORK").length > 0
                        ? getMasterOptions("NATURE_OF_WORK")
                        : [
                            { value: "New Construction", label: "New Construction" },
                            { value: "Renovation / Repair", label: "Renovation / Repair" },
                            { value: "Maintenance", label: "Maintenance" },
                          ]
                      ).map((opt) => (
                        <SelectItem key={opt.value} value={opt.label}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Master Category</Label>
                  <Select
                    value={watch("masterCategory") || ""}
                    onValueChange={(v) => setValue("masterCategory", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {(getMasterOptions("CATEGORY").length > 0
                        ? getMasterOptions("CATEGORY")
                        : [
                            { value: "Rural Connectivity", label: "Rural Connectivity" },
                            { value: "Water Conservation & Water Harvesting", label: "Water Conservation & Water Harvesting" },
                            { value: "Land Development", label: "Land Development" },
                            { value: "IBS - Agriculture & Allied", label: "IBS - Agriculture & Allied" },
                          ]
                      ).map((opt) => (
                        <SelectItem key={opt.value} value={opt.label}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Sub Category</Label>
                  <Select
                    value={watch("subCategory") || ""}
                    onValueChange={(v) => setValue("subCategory", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {(getMasterOptions("SUB_CATEGORY").length > 0
                        ? getMasterOptions("SUB_CATEGORY")
                        : [
                            { value: "Farm Pond", label: "Farm Pond" },
                            { value: "Road Construction", label: "Road Construction" },
                            { value: "Check Dam", label: "Check Dam" },
                          ]
                      ).map((opt) => (
                        <SelectItem key={opt.value} value={opt.label}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Permissible Work List Sl. No.</Label>
                  <Input {...register("permissibleWorkSlNo")} placeholder="e.g. 2.1" />
                </div>
              </div>
              <div>
                <Label>Permissible Work Description</Label>
                <Textarea
                  {...register("permissibleWorkDesc")}
                  placeholder="Description from permissible work list"
                  rows={2}
                />
              </div>
            </>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Gram Panchayat <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("gramPanchayat")}
                    placeholder="e.g. Dhalpara"
                    className={errors.gramPanchayat ? "border-red-400 focus:ring-red-400" : ""}
                  />
                  {errors.gramPanchayat && (
                    <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.gramPanchayat.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Gram Sansad Name</Label>
                  <Input {...register("gramSansadName")} placeholder="e.g. Laldighi" />
                </div>
                <div className="space-y-1.5">
                  <Label>Gram Sansad Number</Label>
                  <Input {...register("gramSansadNumber")} placeholder="e.g. 3" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Block <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("block")}
                    placeholder="e.g. Dinhata-II"
                    className={errors.block ? "border-red-400 focus:ring-red-400" : ""}
                  />
                  {errors.block && (
                    <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.block.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>District <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("district")}
                    placeholder="e.g. Cooch Behar"
                    className={errors.district ? "border-red-400 focus:ring-red-400" : ""}
                  />
                  {errors.district && (
                    <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.district.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Mouza</Label>
                  <Input {...register("mouza")} />
                </div>
                <div className="space-y-1.5">
                  <Label>JL Number</Label>
                  <Input {...register("jlNumber")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Plot Number</Label>
                  <Input {...register("plotNumber")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Latitude</Label>
                  <Input {...register("latitude")} type="number" step="any" placeholder="26.3214" />
                </div>
                <div className="space-y-1.5">
                  <Label>Longitude</Label>
                  <Input {...register("longitude")} type="number" step="any" placeholder="89.4567" />
                </div>
                <div className="space-y-1.5">
                  <Label>Land Area</Label>
                  <Input {...register("landArea")} placeholder="e.g. 0.5 Acre" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Worksite Type</Label>
                <Select
                  value={watch("worksiteType") || ""}
                  onValueChange={(v) => setValue("worksiteType", v, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select worksite type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getMasterOptions(masterData, "WORKSITE_TYPE", DEFAULT_WORKSITE_TYPE_OPTIONS).map((opt) => (
                      <SelectItem key={opt.value} value={opt.label}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Financial Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="wageComponent">Wage Component</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="wageComponent"
                      {...register("wageComponent", {
                        onChange: () => setTimeout(recalcFinancials, 0),
                      })}
                      onBlur={onFinancialBlur}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="materialComponent">Material Component</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="materialComponent"
                      {...register("materialComponent", {
                        onChange: () => setTimeout(recalcFinancials, 0),
                      })}
                      onBlur={onFinancialBlur}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9 font-mono"
                    />
                  </div>
                </div>
              </div>
              {/* Auto-calculated summary */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                      <IndianRupee className="h-3.5 w-3.5 text-white" />
                    </div>
                    <h4 className="text-sm font-semibold text-blue-900">Financial Summary (Auto-calculated)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-muted-foreground mb-0.5">Estimated Cost</p>
                      <p className="font-bold text-blue-900 text-lg">{formatCurrency(Number(liveEstimatedCost) || 0)}</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs text-muted-foreground mb-0.5">Wage : Material</p>
                      <p className="font-bold text-blue-900 text-lg">{liveWageRatio || "—"}</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-3 border border-primary/30 ring-1 ring-primary/10">
                      <p className="text-xs text-muted-foreground mb-0.5">Total Est. Cost</p>
                      <p className="font-bold text-primary text-lg">{formatCurrency(Number(liveTotalCost) || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="vbGramgShare">VB-GRAMG Share</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="vbGramgShare"
                      {...register("vbGramgShare", {
                        onChange: () => setTimeout(recalcFinancials, 0),
                      })}
                      onBlur={onFinancialBlur}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9 font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="convergenceDeptShare">Convergence Dept. Share</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="convergenceDeptShare"
                      {...register("convergenceDeptShare", {
                        onChange: () => setTimeout(recalcFinancials, 0),
                      })}
                      onBlur={onFinancialBlur}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Beneficiary */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Beneficiary Type</Label>
                  <Select
                    value={watch("beneficiaryType") || ""}
                    onValueChange={(v) => setValue("beneficiaryType", v, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select beneficiary type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BENEFICIARY_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Beneficiary Category</Label>
                  <Select
                    value={watch("beneficiaryCategory") || ""}
                    onValueChange={(v) => setValue("beneficiaryCategory", v, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getMasterOptions(masterData, "BENEFICIARY_CATEGORY", DEFAULT_BENEFICIARY_CATEGORY_OPTIONS).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {watch("beneficiaryType") === "Individual" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                  <div className="space-y-1.5">
                    <Label htmlFor="beneficiaryName">Beneficiary Name</Label>
                    <Input id="beneficiaryName" {...register("beneficiaryName")} placeholder="Full name of beneficiary" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jobCardNumber">Job Card Number</Label>
                    <Input id="jobCardNumber" {...register("jobCardNumber")} placeholder="e.g. WB-19-005-001-001/25" className="font-mono" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Administrative */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="gramSabhaApprovalDate">Gram Sabha Approval Date</Label>
                  <Input id="gramSabhaApprovalDate" {...register("gramSabhaApprovalDate")} type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adminApprovalNumber">Admin Approval Number</Label>
                  <Input id="adminApprovalNumber" {...register("adminApprovalNumber")} placeholder="Memo no." />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="adminApprovalDate">Admin Approval Date</Label>
                  <Input id="adminApprovalDate" {...register("adminApprovalDate")} type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="technicalSanctionNumber">Technical Sanction Number</Label>
                  <Input id="technicalSanctionNumber" {...register("technicalSanctionNumber")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="technicalSanctionDate">Technical Sanction Date</Label>
                  <Input id="technicalSanctionDate" {...register("technicalSanctionDate")} type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dprNumber">DPR Number</Label>
                  <Input id="dprNumber" {...register("dprNumber")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="dprDate">DPR Date</Label>
                  <Input id="dprDate" {...register("dprDate")} type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea id="remarks" {...register("remarks")} rows={2} placeholder="Any additional notes..." className="resize-y" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Convergence */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Converging Department</Label>
                  <Select
                    value={watch("convergingDepartment") || "none"}
                    onValueChange={(v) => setValue("convergingDepartment", v === "none" ? "" : v, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (if not applicable)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {getMasterOptions(masterData, "CONVERGENCE_DEPT", DEFAULT_CONVERGENCE_DEPT_OPTIONS).map((opt) => (
                        <SelectItem key={opt.value} value={opt.label}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="convergingScheme">Converging Scheme</Label>
                  <Input id="convergingScheme" {...register("convergingScheme")} placeholder="e.g. MIDH, RKVY" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="convergenceCategory">Convergence Category</Label>
                  <Input id="convergenceCategory" {...register("convergenceCategory")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="technicalKnowledgeProvided">Technical Knowledge Provided</Label>
                  <Input id="technicalKnowledgeProvided" {...register("technicalKnowledgeProvided")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>NOC Received</Label>
                  <Select
                    value={watch("nocReceived") || ""}
                    onValueChange={(v) => setValue("nocReceived", v, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOC_RECEIVED_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nocMemoNumber">NOC/Memo Number</Label>
                  <Input id="nocMemoNumber" {...register("nocMemoNumber")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nocDate">NOC Date</Label>
                  <Input id="nocDate" {...register("nocDate")} type="date" />
                </div>
              </div>
              <div className="space-y-1.5 pt-2 border-t">
                <Label>Work Status</Label>
                <Select
                  value={watch("workStatus")}
                  onValueChange={(v) => setValue("workStatus", v as NregaWorkFormValues["workStatus"], { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 sticky bottom-0 bg-background/95 backdrop-blur p-3 -mx-3 -mb-3 sm:bg-transparent sm:p-0 sm:m-0 sm:static border-t sm:border-0 z-10">
        <div className="text-xs text-muted-foreground sm:hidden text-center order-last sm:order-none">
          Step {step + 1} of {WORK_FORM_STEPS.length}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={step === 0}
          className="gap-2 justify-center"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2 justify-end">
          {step < WORK_FORM_STEPS.length - 1 ? (
            <Button type="button" onClick={goNext} className="gap-2 justify-center">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2 justify-center min-w-[160px]"
              onClick={() => recalcFinancials()}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {mode === "create" ? "Create Work" : "Update Work"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
