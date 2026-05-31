"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Calculator, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/data-table";
import { ApprovedActionPlanDetails, WorksDetail, UpasamitiName } from "@prisma/client";

type ActionPlanWithWorks = ApprovedActionPlanDetails & {
  WorksDetail: (WorksDetail & {
    _count: {
      workEstimateItems: number;
      workMeasurementBooks: number;
      workBillAbstracts: number;
    };
  })[];
};

async function updateActionPlan(id: string, data: Partial<ApprovedActionPlanDetails>) {
  const res = await fetch(`/api/actionplans/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

// ----------------------------- CONSTANTS ---------------------------------
const FINANCIAL_YEARS = ["2023-24", "2024-25", "2025-26"];
const FUND_TYPES = ["General", "SCSP", "TSP", "15th FC", "5th SFC", "MGNREGS"];
const SECTORS = ["Education", "Health", "Roads", "Water", "Agriculture"];
const SCHEME_NAMES = ["PMGSY", "NRLM", "PMKSY", "PMAY"];
const WORK_TYPES = ["Construction", "Renovation", "Repair", "Supply"];
const COMPONENT_TYPES = ["Building", "Bridge", "Culvert", "Pipeline"];
const ACTIVITY_FOR_OPTIONS = ["Community", "Individual", "Group"];

// Themes with numbers (display and value)
const THEMES_WITH_NUMBERS = [
  { number: "Theme_1", name: "Poverty Free and Enhanced Livelihoods Village" },
  { number: "Theme_2", name: "Healthy Village" },
  { number: "Theme_3", name: "Child Friendly Village" },
  { number: "Theme_4", name: "Water Sufficient Village" },
  { number: "Theme_5", name: "Clean and Green Village" },
  { number: "Theme_6", name: "Self sufficient Infrastructure in Village" },
  { number: "Theme_7", name: "Socially Just and Socially Secured Village" },
  { number: "Theme_8", name: "Village with Good Governance" },
  { number: "Theme_9", name: "Women Friendly Village" },
];

// New options from your screenshots
const ASSET_SERVICE_VPRP_OPTIONS = ["Assets", "Service", "VPRP"];
const IMPLEMENTATION_STATUS_OPTIONS = [
  "New/Fresh",
  "Operational",
  "Maintenance, Upgradation",
  "Operational, Maintenance",
];

// ----------------------------- COMPONENT ---------------------------------
interface InlineEditActionPlanTableProps {
  data: ActionPlanWithWorks[];
}

export function InlineEditActionPlanTable({ data }: InlineEditActionPlanTableProps) {
  const router = useRouter();
  const [editingPlan, setEditingPlan] = useState<ActionPlanWithWorks | null>(null);
  const [formData, setFormData] = useState<Partial<ApprovedActionPlanDetails> & {
    assetServiceVprp?: string;
    implStatus?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const openEditSheet = (plan: ActionPlanWithWorks) => {
    setEditingPlan(plan);
    setFormData({
      activityCode: plan.activityCode,
      activityName: plan.activityName,
      activityDescription: plan.activityDescription,
      financialYear: plan.financialYear,
      themeName: plan.themeName,
      activityFor: plan.activityFor,
      sector: plan.sector,
      locationofAsset: plan.locationofAsset,
      estimatedCost: plan.estimatedCost,
      generalFund: plan.generalFund,
      scFund: plan.scFund,
      stFund: plan.stFund,
      fundType: plan.fundType,
      totalduration: plan.totalduration,
      schemeName: plan.schemeName,
      upasamiti: plan.upasamiti,
      focusArea: plan.focusArea,
      workType: plan.workType,
      componentType: plan.componentType,
      gramSansad: plan.gramSansad,
      sdgs: plan.sdgs,
      beneficiariesSC: plan.beneficiariesSC,
      beneficiariesST: plan.beneficiariesST,
      beneficiariesGen: plan.beneficiariesGen,
      unitType: plan.unitType,
      totalUnit: plan.totalUnit,
      implementedBy: plan.implementedBy,
      remarks: plan.remarks,
      isPublish: plan.isPublish,
      assetServiceVprp: (plan as any).assetServiceVprp || "",
      implStatus: (plan as any).implStatus || "",
    });
    setSheetOpen(true);
  };

  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    setIsSaving(true);
    try {
      await updateActionPlan(editingPlan.id, formData);
      router.refresh();
      setSheetOpen(false);
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to display theme with number in table
  const formatTheme = (themeName: string | null) => {
    if (!themeName) return "-";
    const found = THEMES_WITH_NUMBERS.find(t => t.name === themeName);
    return found ? `${found.number} – ${found.name}` : themeName;
  };

  // ----------------------------- COLUMNS ----------------------------------
  const columns: ColumnDef<ActionPlanWithWorks>[] = [
    {
      id: "slNo",
      header: "SL No.",
      cell: ({ row, table }) => {
        const pageIndex = table.getState().pagination?.pageIndex ?? 0;
        const pageSize = table.getState().pagination?.pageSize ?? 10;
        return <div className="text-muted-foreground font-medium text-center">{pageIndex * pageSize + row.index + 1}</div>;
      },
    },
    {
      accessorKey: "activityCode",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
          Activity Code <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-mono text-sm">{row.original.activityCode}</div>,
    },
    {
      accessorKey: "activityName",
      header: "Activity Name",
      cell: ({ row }) => <div className="font-medium min-w-[200px]">{row.original.activityName}</div>,
    },
    {
      accessorKey: "activityDescription",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[300px] text-sm text-muted-foreground line-clamp-2" title={row.original.activityDescription ?? ""}>
          {row.original.activityDescription}
        </div>
      ),
    },
    {
      accessorKey: "financialYear",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
          Financial Year <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <Badge variant="outline">{row.original.financialYear}</Badge>,
    },
    {
      accessorKey: "themeName",
      header: "Theme",
      cell: ({ row }) => <div>{formatTheme(row.original.themeName)}</div>,
    },
    {
      accessorKey: "activityFor",
      header: "Activity For",
      cell: ({ row }) => <div>{row.original.activityFor || "-"}</div>,
    },
    {
      accessorKey: "sector",
      header: "Sector",
      cell: ({ row }) => <div>{row.original.sector || "-"}</div>,
    },
    {
      accessorKey: "locationofAsset",
      header: "Location of Asset",
      cell: ({ row }) => <div>{row.original.locationofAsset || "-"}</div>,
    },
    {
      accessorKey: "estimatedCost",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
          Est. Cost (₹) <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-semibold text-right">₹{row.original.estimatedCost?.toLocaleString("en-IN") || 0}</div>,
    },
    {
      accessorKey: "generalFund",
      header: "General Fund (₹)",
      cell: ({ row }) => <div className="text-right">₹{row.original.generalFund?.toLocaleString("en-IN") || 0}</div>,
    },
    {
      accessorKey: "scFund",
      header: "SC Fund (₹)",
      cell: ({ row }) => <div className="text-right">₹{row.original.scFund?.toLocaleString("en-IN") || 0}</div>,
    },
    {
      accessorKey: "stFund",
      header: "ST Fund (₹)",
      cell: ({ row }) => <div className="text-right">₹{row.original.stFund?.toLocaleString("en-IN") || 0}</div>,
    },
    {
      accessorKey: "fundType",
      header: "Fund Type",
      cell: ({ row }) => <Badge variant="secondary">{row.original.fundType || "-"}</Badge>,
    },
    {
      accessorKey: "totalduration",
      header: "Total Duration",
      cell: ({ row }) => <div>{row.original.totalduration || "-"}</div>,
    },
    {
      accessorKey: "schemeName",
      header: "Scheme Name",
      cell: ({ row }) => <div>{row.original.schemeName || "-"}</div>,
    },
    {
      accessorKey: "upasamiti",
      header: "Upasamiti",
      cell: ({ row }) => <div>{row.original.upasamiti?.replace(/_/g, " ") || "-"}</div>,
    },
    {
      accessorKey: "focusArea",
      header: "Focus Area",
      cell: ({ row }) => <div>{row.original.focusArea || "-"}</div>,
    },
    {
      accessorKey: "workType",
      header: "Work Type",
      cell: ({ row }) => <div>{row.original.workType || "-"}</div>,
    },
    {
      accessorKey: "componentType",
      header: "Component Type",
      cell: ({ row }) => <div>{row.original.componentType || "-"}</div>,
    },
    {
      accessorKey: "gramSansad",
      header: "Gram Sansad",
      cell: ({ row }) => <div>{row.original.gramSansad || "-"}</div>,
    },
    {
      accessorKey: "sdgs",
      header: "SDGs",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate" title={row.original.sdgs ?? ""}>
          {row.original.sdgs || "-"}
        </div>
      ),
    },
    {
      accessorKey: "beneficiariesSC",
      header: "Beneficiaries (SC)",
      cell: ({ row }) => <div className="text-right">{row.original.beneficiariesSC || 0}</div>,
    },
    {
      accessorKey: "beneficiariesST",
      header: "Beneficiaries (ST)",
      cell: ({ row }) => <div className="text-right">{row.original.beneficiariesST || 0}</div>,
    },
    {
      accessorKey: "beneficiariesGen",
      header: "Beneficiaries (Gen)",
      cell: ({ row }) => <div className="text-right">{row.original.beneficiariesGen || 0}</div>,
    },
    {
      accessorKey: "unitType",
      header: "Unit Type",
      cell: ({ row }) => <div>{row.original.unitType || "-"}</div>,
    },
    {
      accessorKey: "totalUnit",
      header: "Total Unit",
      cell: ({ row }) => <div className="text-right">{row.original.totalUnit || 0}</div>,
    },
    {
      accessorKey: "implementedBy",
      header: "Implemented By",
      cell: ({ row }) => <div>{row.original.implementedBy || "-"}</div>,
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <div className="max-w-[200px] text-sm text-muted-foreground line-clamp-2" title={row.original.remarks ?? ""}>
          {row.original.remarks || "-"}
        </div>
      ),
    },
    {
      accessorKey: "isPublish",
      header: "Published",
      cell: ({ row }) =>
        row.original.isPublish ? (
          <Badge className="bg-green-100 text-green-700">Published</Badge>
        ) : (
          <Badge variant="outline" className="text-amber-600">Draft</Badge>
        ),
    },
    // New columns for Asset/Service/VPRP and Implementation Status
    {
      accessorKey: "assetServiceVprp",
      header: "Type",
      cell: ({ row }) => <div>{(row.original as any).assetServiceVprp || "-"}</div>,
    },
    {
      accessorKey: "implStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.original as any).implStatus;
        let variant: "default" | "secondary" | "outline" = "secondary";
        if (status === "New/Fresh") variant = "default";
        if (status === "Operational") variant = "default";
        if (status?.includes("Maintenance")) variant = "outline";
        return <Badge variant={variant}>{status || "-"}</Badge>;
      },
    },
    {
      id: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const plan = row.original;
        const firstWork = plan.WorksDetail?.[0];
        const hasEstimate = (firstWork?._count?.workEstimateItems || 0) > 0;
        const hasMB = (firstWork?._count?.workMeasurementBooks || 0) > 0;
        const hasBillAbstract = (firstWork?._count?.workBillAbstracts || 0) > 0;

        return (
          <div className="flex flex-col gap-1.5 min-w-[100px]">
            <Badge variant={hasEstimate ? "default" : "outline"} className={hasEstimate ? "bg-orange-500" : ""}>
              <Calculator className="h-3 w-3 mr-1" /> {hasEstimate ? "Estimate" : "No Est."}
            </Badge>
            <Badge variant={hasMB ? "default" : "outline"} className={hasMB ? "bg-purple-500" : ""}>
              <BookOpen className="h-3 w-3 mr-1" /> {hasMB ? "MB" : "No MB"}
            </Badge>
            <Badge variant={hasBillAbstract ? "default" : "outline"} className={hasBillAbstract ? "bg-green-500" : ""}>
              <FileText className="h-3 w-3 mr-1" /> {hasBillAbstract ? "Bill" : "No Bill"}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => openEditSheet(row.original)} className="h-8 px-2">
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Edit
        </Button>
      ),
    },
  ];

  // ----------------------------- EDIT SHEET ----------------------------------
  return (
    <>
      <DataTable columns={columns} data={data} />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Activity</SheetTitle>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Activity Name (full width) */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="activityName">Activity Name</Label>
              <Input
                id="activityName"
                value={formData.activityName || ""}
                onChange={(e) => handleFieldChange("activityName", e.target.value)}
              />
            </div>

            {/* Activity Code */}
            <div className="space-y-2">
              <Label htmlFor="activityCode">Activity Code</Label>
              <Input
                id="activityCode"
                value={formData.activityCode || ""}
                onChange={(e) => handleFieldChange("activityCode", e.target.value)}
              />
            </div>

            {/* Financial Year */}
            <div className="space-y-2">
              <Label htmlFor="financialYear">Financial Year</Label>
              <Select value={formData.financialYear || ""} onValueChange={(v) => handleFieldChange("financialYear", v)}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  {FINANCIAL_YEARS.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Theme Name with numbers */}
            <div className="space-y-2">
              <Label htmlFor="themeName">Theme Name</Label>
              <Select value={formData.themeName || ""} onValueChange={(v) => handleFieldChange("themeName", v)}>
                <SelectTrigger><SelectValue placeholder="Select theme" /></SelectTrigger>
                <SelectContent>
                  {THEMES_WITH_NUMBERS.map((theme) => (
                    <SelectItem key={theme.number} value={theme.name}>
                      {theme.number} – {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Activity For */}
            <div className="space-y-2">
              <Label htmlFor="activityFor">Activity For</Label>
              <Select value={formData.activityFor || ""} onValueChange={(v) => handleFieldChange("activityFor", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {ACTIVITY_FOR_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sector */}
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select value={formData.sector || ""} onValueChange={(v) => handleFieldChange("sector", v)}>
                <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scheme Name */}
            <div className="space-y-2">
              <Label htmlFor="schemeName">Scheme Name</Label>
              <Select value={formData.schemeName || ""} onValueChange={(v) => handleFieldChange("schemeName", v)}>
                <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
                <SelectContent>
                  {SCHEME_NAMES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fund Type */}
            <div className="space-y-2">
              <Label htmlFor="fundType">Fund Type</Label>
              <Select value={formData.fundType || ""} onValueChange={(v) => handleFieldChange("fundType", v)}>
                <SelectTrigger><SelectValue placeholder="Select fund" /></SelectTrigger>
                <SelectContent>
                  {FUND_TYPES.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upasamiti */}
            <div className="space-y-2">
              <Label htmlFor="upasamiti">Upasamiti</Label>
              <Select value={formData.upasamiti || ""} onValueChange={(v) => handleFieldChange("upasamiti", v)}>
                <SelectTrigger><SelectValue placeholder="Select Upasamiti" /></SelectTrigger>
                <SelectContent>
                  {Object.values(UpasamitiName).map((name) => (
                    <SelectItem key={name} value={name}>{name.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Work Type */}
            <div className="space-y-2">
              <Label htmlFor="workType">Work Type</Label>
              <Select value={formData.workType || ""} onValueChange={(v) => handleFieldChange("workType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {WORK_TYPES.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Component Type */}
            <div className="space-y-2">
              <Label htmlFor="componentType">Component Type</Label>
              <Select value={formData.componentType || ""} onValueChange={(v) => handleFieldChange("componentType", v)}>
                <SelectTrigger><SelectValue placeholder="Select component" /></SelectTrigger>
                <SelectContent>
                  {COMPONENT_TYPES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Asset / Service / VPRP (new) */}
            <div className="space-y-2">
              <Label htmlFor="assetServiceVprp">Asset / Service / VPRP</Label>
              <Select value={formData.assetServiceVprp || ""} onValueChange={(v) => handleFieldChange("assetServiceVprp", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {ASSET_SERVICE_VPRP_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Implementation Status (new) */}
            <div className="space-y-2">
              <Label htmlFor="implStatus">Implementation Status</Label>
              <Select value={formData.implStatus || ""} onValueChange={(v) => handleFieldChange("implStatus", v)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {IMPLEMENTATION_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Number fields */}
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Est. Cost (₹)</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={formData.estimatedCost || 0}
                onChange={(e) => handleFieldChange("estimatedCost", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generalFund">General Fund (₹)</Label>
              <Input
                id="generalFund"
                type="number"
                value={formData.generalFund || 0}
                onChange={(e) => handleFieldChange("generalFund", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scFund">SC Fund (₹)</Label>
              <Input
                id="scFund"
                type="number"
                value={formData.scFund || 0}
                onChange={(e) => handleFieldChange("scFund", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stFund">ST Fund (₹)</Label>
              <Input
                id="stFund"
                type="number"
                value={formData.stFund || 0}
                onChange={(e) => handleFieldChange("stFund", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiariesSC">Beneficiaries (SC)</Label>
              <Input
                id="beneficiariesSC"
                type="number"
                value={formData.beneficiariesSC || 0}
                onChange={(e) => handleFieldChange("beneficiariesSC", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiariesST">Beneficiaries (ST)</Label>
              <Input
                id="beneficiariesST"
                type="number"
                value={formData.beneficiariesST || 0}
                onChange={(e) => handleFieldChange("beneficiariesST", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiariesGen">Beneficiaries (Gen)</Label>
              <Input
                id="beneficiariesGen"
                type="number"
                value={formData.beneficiariesGen || 0}
                onChange={(e) => handleFieldChange("beneficiariesGen", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalUnit">Total Unit</Label>
              <Input
                id="totalUnit"
                type="number"
                value={formData.totalUnit || 0}
                onChange={(e) => handleFieldChange("totalUnit", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitType">Unit Type</Label>
              <Input
                id="unitType"
                value={formData.unitType || ""}
                onChange={(e) => handleFieldChange("unitType", e.target.value)}
              />
            </div>

            {/* Text fields */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="locationofAsset">Location of Asset</Label>
              <Input
                id="locationofAsset"
                value={formData.locationofAsset || ""}
                onChange={(e) => handleFieldChange("locationofAsset", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="activityDescription">Description</Label>
              <Textarea
                id="activityDescription"
                value={formData.activityDescription || ""}
                onChange={(e) => handleFieldChange("activityDescription", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="focusArea">Focus Area</Label>
              <Input
                id="focusArea"
                value={formData.focusArea || ""}
                onChange={(e) => handleFieldChange("focusArea", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gramSansad">Gram Sansad</Label>
              <Input
                id="gramSansad"
                value={formData.gramSansad || ""}
                onChange={(e) => handleFieldChange("gramSansad", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sdgs">SDGs</Label>
              <Input
                id="sdgs"
                value={formData.sdgs || ""}
                onChange={(e) => handleFieldChange("sdgs", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalduration">Total Duration</Label>
              <Input
                id="totalduration"
                value={formData.totalduration || ""}
                onChange={(e) => handleFieldChange("totalduration", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="implementedBy">Implemented By</Label>
              <Input
                id="implementedBy"
                value={formData.implementedBy || ""}
                onChange={(e) => handleFieldChange("implementedBy", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks || ""}
                onChange={(e) => handleFieldChange("remarks", e.target.value)}
                rows={2}
              />
            </div>

            {/* Published status */}
            <div className="space-y-2">
              <Label htmlFor="isPublish">Status</Label>
              <Select
                value={formData.isPublish ? "true" : "false"}
                onValueChange={(v) => handleFieldChange("isPublish", v === "true")}
              >
                <SelectTrigger><SelectValue placeholder="Published?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Published</SelectItem>
                  <SelectItem value="false">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="mt-4">
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
