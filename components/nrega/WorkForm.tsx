"use client";

import React, { useState, useTransition } from "react";
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
import { Loader2, Save, ChevronLeft, ChevronRight } from "lucide-react";

interface WorkFormProps {
  initialData?: NregaWorkFormValues & { id?: string };
  masterData?: Record<string, Array<{ value: string; label: string }>>;
  mode?: "create" | "edit";
}

const STEPS = [
  "Basic Information",
  "Location",
  "Financial Details",
  "Beneficiary",
  "Administrative",
  "Convergence",
];

export default function WorkForm({ initialData, masterData = {}, mode = "create" }: WorkFormProps) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<NregaWorkFormValues>({
    resolver: zodResolver(nregaWorkSchema),
    defaultValues: initialData || {
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
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = form;

  // Auto-calculate financial fields
  const wageComponent = watch("wageComponent");
  const materialComponent = watch("materialComponent");
  const estimatedCost = watch("estimatedCost");
  const vbGramgShare = watch("vbGramgShare");
  const convergenceDeptShare = watch("convergenceDeptShare");

  React.useEffect(() => {
    const total = (wageComponent || 0) + (materialComponent || 0);
    if (total > 0) {
      setValue("estimatedCost", total);
      const wagePercent = Math.round(((wageComponent || 0) / total) * 100);
      const matPercent = 100 - wagePercent;
      setValue("wageMaterialRatio", `${wagePercent}:${matPercent}`);
    }
  }, [wageComponent, materialComponent, setValue]);

  React.useEffect(() => {
    const total = (vbGramgShare || 0) + (convergenceDeptShare || 0);
    if (total > 0) {
      setValue("totalEstimatedCost", total);
    } else {
      setValue("totalEstimatedCost", estimatedCost || 0);
    }
  }, [vbGramgShare, convergenceDeptShare, estimatedCost, setValue]);

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
    const fieldsToValidate = getStepFields(step);
    const valid = await trigger(fieldsToValidate as Array<keyof NregaWorkFormValues>);
    if (valid && step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const getMasterOptions = (type: string) => masterData[type] || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              i === step
                ? "bg-primary text-primary-foreground"
                : i < step
                ? "bg-green-100 text-green-800"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border">
              {i < step ? "✓" : i + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{STEPS[step]}</CardTitle>
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Gram Panchayat *</Label>
                  <Input {...register("gramPanchayat")} placeholder="e.g. Dhalpara" />
                  {errors.gramPanchayat && (
                    <p className="text-xs text-red-500 mt-1">{errors.gramPanchayat.message}</p>
                  )}
                </div>
                <div>
                  <Label>Gram Sansad Name</Label>
                  <Input {...register("gramSansadName")} placeholder="e.g. Laldighi" />
                </div>
                <div>
                  <Label>Gram Sansad Number</Label>
                  <Input {...register("gramSansadNumber")} placeholder="e.g. 3" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Block *</Label>
                  <Input {...register("block")} placeholder="e.g. Dinhata-II" />
                  {errors.block && (
                    <p className="text-xs text-red-500 mt-1">{errors.block.message}</p>
                  )}
                </div>
                <div>
                  <Label>District *</Label>
                  <Input {...register("district")} placeholder="e.g. Cooch Behar" />
                  {errors.district && (
                    <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Mouza</Label>
                  <Input {...register("mouza")} />
                </div>
                <div>
                  <Label>JL Number</Label>
                  <Input {...register("jlNumber")} />
                </div>
                <div>
                  <Label>Plot Number</Label>
                  <Input {...register("plotNumber")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <Input {...register("latitude")} type="number" step="any" />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input {...register("longitude")} type="number" step="any" />
                </div>
                <div>
                  <Label>Land Area</Label>
                  <Input {...register("landArea")} placeholder="e.g. 0.5 Acre" />
                </div>
              </div>
              <div>
                <Label>Worksite Type</Label>
                <Select
                  value={watch("worksiteType") || ""}
                  onValueChange={(v) => setValue("worksiteType", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {(getMasterOptions("WORKSITE_TYPE").length > 0
                      ? getMasterOptions("WORKSITE_TYPE")
                      : [
                          { value: "Public Land", label: "Public Land" },
                          { value: "Private Land (IBS)", label: "Private Land (IBS)" },
                          { value: "Community Land", label: "Community Land" },
                        ]
                    ).map((opt) => (
                      <SelectItem key={opt.value} value={opt.label}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Step 2: Financial Details */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Wage Component (₹)</Label>
                  <Input {...register("wageComponent")} type="number" step="0.01" />
                </div>
                <div>
                  <Label>Material Component (₹)</Label>
                  <Input {...register("materialComponent")} type="number" step="0.01" />
                </div>
              </div>
              {/* Auto-calculated summary */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Financial Summary (Auto-calculated)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Estimated Cost:</span>
                      <span className="ml-1 font-semibold">₹{(watch("estimatedCost") || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Wage-Material Ratio:</span>
                      <span className="ml-1 font-semibold">{watch("wageMaterialRatio") || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Est. Cost:</span>
                      <span className="ml-1 font-semibold">₹{(watch("totalEstimatedCost") || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>VB-GRAMG Share (₹)</Label>
                  <Input {...register("vbGramgShare")} type="number" step="0.01" />
                </div>
                <div>
                  <Label>Convergence Departmental Share (₹)</Label>
                  <Input {...register("convergenceDeptShare")} type="number" step="0.01" />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Beneficiary */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Beneficiary Type</Label>
                  <Select
                    value={watch("beneficiaryType") || ""}
                    onValueChange={(v) => setValue("beneficiaryType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Community">Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Beneficiary Category</Label>
                  <Select
                    value={watch("beneficiaryCategory") || ""}
                    onValueChange={(v) => setValue("beneficiaryCategory", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {(getMasterOptions("BENEFICIARY_CATEGORY").length > 0
                        ? getMasterOptions("BENEFICIARY_CATEGORY")
                        : [
                            { value: "SC", label: "Scheduled Caste (SC)" },
                            { value: "ST", label: "Scheduled Tribe (ST)" },
                            { value: "OBC", label: "Other Backward Class (OBC)" },
                            { value: "GENERAL", label: "General" },
                          ]
                      ).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {watch("beneficiaryType") === "Individual" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Beneficiary Name</Label>
                    <Input {...register("beneficiaryName")} />
                  </div>
                  <div>
                    <Label>Job Card Number</Label>
                    <Input {...register("jobCardNumber")} placeholder="e.g. WB-19-005-001-001/25" />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 4: Administrative */}
          {step === 4 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Gram Sabha Approval Date</Label>
                  <Input {...register("gramSabhaApprovalDate")} type="date" />
                </div>
                <div>
                  <Label>Admin Approval Number</Label>
                  <Input {...register("adminApprovalNumber")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Admin Approval Date</Label>
                  <Input {...register("adminApprovalDate")} type="date" />
                </div>
                <div>
                  <Label>Technical Sanction Number</Label>
                  <Input {...register("technicalSanctionNumber")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Technical Sanction Date</Label>
                  <Input {...register("technicalSanctionDate")} type="date" />
                </div>
                <div>
                  <Label>DPR Number</Label>
                  <Input {...register("dprNumber")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>DPR Date</Label>
                  <Input {...register("dprDate")} type="date" />
                </div>
                <div>
                  <Label>Remarks</Label>
                  <Textarea {...register("remarks")} rows={2} />
                </div>
              </div>
            </>
          )}

          {/* Step 5: Convergence */}
          {step === 5 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Converging Department</Label>
                  <Select
                    value={watch("convergingDepartment") || "none"}
                    onValueChange={(v) => setValue("convergingDepartment", v === "none" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select (if applicable)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {(getMasterOptions("CONVERGENCE_DEPT").length > 0
                        ? getMasterOptions("CONVERGENCE_DEPT")
                        : [
                            { value: "Agriculture", label: "Department of Agriculture" },
                            { value: "Irrigation", label: "Irrigation Department" },
                            { value: "Forest", label: "Forest Department" },
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
                  <Label>Converging Scheme</Label>
                  <Input {...register("convergingScheme")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Convergence Category</Label>
                  <Input {...register("convergenceCategory")} />
                </div>
                <div>
                  <Label>Technical Knowledge Provided</Label>
                  <Input {...register("technicalKnowledgeProvided")} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>NOC Received</Label>
                  <Select
                    value={watch("nocReceived") || ""}
                    onValueChange={(v) => setValue("nocReceived", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>NOC/Memo Number</Label>
                  <Input {...register("nocMemoNumber")} />
                </div>
                <div>
                  <Label>NOC Date</Label>
                  <Input {...register("nocDate")} type="date" />
                </div>
              </div>
              <div>
                <Label>Work Status</Label>
                <Select
                  value={watch("workStatus")}
                  onValueChange={(v) => setValue("workStatus", v as NregaWorkFormValues["workStatus"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={step === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isPending} className="gap-2">
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

// Helper: which fields belong to which step (for partial validation)
function getStepFields(step: number): string[] {
  switch (step) {
    case 0:
      return ["financialYear", "workName"];
    case 1:
      return ["gramPanchayat", "block", "district"];
    case 2:
      return ["wageComponent", "materialComponent"];
    case 3:
      return [];
    case 4:
      return [];
    case 5:
      return [];
    default:
      return [];
  }
}
