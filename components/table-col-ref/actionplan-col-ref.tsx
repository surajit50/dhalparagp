"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Trash2, Save, X, Calculator, BookOpen, FileText } from "lucide-react";
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

// Update function - replace with your actual API call
async function updateActionPlan(id: string, data: Partial<ApprovedActionPlanDetails>) {
  const res = await fetch(`/api/actionplans/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

interface InlineEditTableProps {
  data: ActionPlanWithWorks[];
  onDataChange?: () => void; // callback to refresh data after update
}

export function InlineEditActionPlanTable({ data, onDataChange }: InlineEditTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ApprovedActionPlanDetails>>({});
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = (row: ActionPlanWithWorks) => {
    setEditingId(row.id);
    setEditFormData({
      activityCode: row.activityCode,
      activityName: row.activityName,
      activityDescription: row.activityDescription,
      financialYear: row.financialYear,
      themeName: row.themeName,
      activityFor: row.activityFor,
      sector: row.sector,
      locationofAsset: row.locationofAsset,
      estimatedCost: row.estimatedCost,
      generalFund: row.generalFund,
      scFund: row.scFund,
      stFund: row.stFund,
      fundType: row.fundType,
      totalduration: row.totalduration,
      schemeName: row.schemeName,
      upasamiti: row.upasamiti,
      focusArea: row.focusArea,
      workType: row.workType,
      componentType: row.componentType,
      gramSansad: row.gramSansad,
      sdgs: row.sdgs,
      beneficiariesSC: row.beneficiariesSC,
      beneficiariesST: row.beneficiariesST,
      beneficiariesGen: row.beneficiariesGen,
      unitType: row.unitType,
      totalUnit: row.totalUnit,
      implementedBy: row.implementedBy,
      remarks: row.remarks,
      isPublish: row.isPublish,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSave = async (id: string) => {
    setIsSaving(true);
    try {
      await updateActionPlan(id, editFormData);
      // Refresh data after successful update
      if (onDataChange) onDataChange();
      cancelEditing();
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof ApprovedActionPlanDetails, value: any) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Define columns with inline editing logic
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
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.activityCode || ""}
            onChange={(e) => handleInputChange("activityCode", e.target.value)}
            className="min-w-[150px]"
          />
        ) : (
          <div className="font-mono text-sm">{row.original.activityCode}</div>
        );
      },
    },
    {
      accessorKey: "activityName",
      header: "Activity Name",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.activityName || ""}
            onChange={(e) => handleInputChange("activityName", e.target.value)}
            className="min-w-[200px]"
          />
        ) : (
          <div className="font-medium min-w-[200px]">{row.original.activityName}</div>
        );
      },
    },
    {
      accessorKey: "activityDescription",
      header: "Description",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Textarea
            value={editFormData.activityDescription || ""}
            onChange={(e) => handleInputChange("activityDescription", e.target.value)}
            className="min-w-[300px]"
            rows={2}
          />
        ) : (
          <div className="max-w-[300px] text-sm text-muted-foreground line-clamp-2" title={row.original.activityDescription}>
            {row.original.activityDescription}
          </div>
        );
      },
    },
    {
      accessorKey: "financialYear",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
          Financial Year <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.financialYear || ""}
            onChange={(e) => handleInputChange("financialYear", e.target.value)}
          />
        ) : (
          <Badge variant="outline">{row.original.financialYear}</Badge>
        );
      },
    },
    {
      accessorKey: "themeName",
      header: "Theme Name",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.themeName || ""}
            onChange={(e) => handleInputChange("themeName", e.target.value)}
          />
        ) : (
          <div>{row.original.themeName || "-"}</div>
        );
      },
    },
    {
      accessorKey: "activityFor",
      header: "Activity For",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.activityFor || ""}
            onChange={(e) => handleInputChange("activityFor", e.target.value)}
          />
        ) : (
          <div>{row.original.activityFor || "-"}</div>
        );
      },
    },
    {
      accessorKey: "sector",
      header: "Sector",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.sector || ""}
            onChange={(e) => handleInputChange("sector", e.target.value)}
          />
        ) : (
          <div>{row.original.sector || "-"}</div>
        );
      },
    },
    {
      accessorKey: "locationofAsset",
      header: "Location of Asset",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.locationofAsset || ""}
            onChange={(e) => handleInputChange("locationofAsset", e.target.value)}
          />
        ) : (
          <div>{row.original.locationofAsset || "-"}</div>
        );
      },
    },
    {
      accessorKey: "estimatedCost",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
          Est. Cost (₹) <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            type="number"
            value={editFormData.estimatedCost || 0}
            onChange={(e) => handleInputChange("estimatedCost", parseInt(e.target.value) || 0)}
            className="text-right"
          />
        ) : (
          <div className="font-semibold text-right">₹{row.original.estimatedCost?.toLocaleString("en-IN") || 0}</div>
        );
      },
    },
    {
      accessorKey: "generalFund",
      header: "General Fund (₹)",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            type="number"
            value={editFormData.generalFund || 0}
            onChange={(e) => handleInputChange("generalFund", parseInt(e.target.value) || 0)}
            className="text-right"
          />
        ) : (
          <div className="text-right">₹{row.original.generalFund?.toLocaleString("en-IN") || 0}</div>
        );
      },
    },
    {
      accessorKey: "scFund",
      header: "SC Fund (₹)",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            type="number"
            value={editFormData.scFund || 0}
            onChange={(e) => handleInputChange("scFund", parseInt(e.target.value) || 0)}
            className="text-right"
          />
        ) : (
          <div className="text-right">₹{row.original.scFund?.toLocaleString("en-IN") || 0}</div>
        );
      },
    },
    {
      accessorKey: "stFund",
      header: "ST Fund (₹)",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            type="number"
            value={editFormData.stFund || 0}
            onChange={(e) => handleInputChange("stFund", parseInt(e.target.value) || 0)}
            className="text-right"
          />
        ) : (
          <div className="text-right">₹{row.original.stFund?.toLocaleString("en-IN") || 0}</div>
        );
      },
    },
    {
      accessorKey: "fundType",
      header: "Fund Type",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.fundType || ""}
            onChange={(e) => handleInputChange("fundType", e.target.value)}
          />
        ) : (
          <Badge variant="secondary">{row.original.fundType || "-"}</Badge>
        );
      },
    },
    {
      accessorKey: "totalduration",
      header: "Total Duration",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.totalduration || ""}
            onChange={(e) => handleInputChange("totalduration", e.target.value)}
          />
        ) : (
          <div>{row.original.totalduration || "-"}</div>
        );
      },
    },
    {
      accessorKey: "schemeName",
      header: "Scheme Name",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.schemeName || ""}
            onChange={(e) => handleInputChange("schemeName", e.target.value)}
          />
        ) : (
          <div>{row.original.schemeName || "-"}</div>
        );
      },
    },
    {
      accessorKey: "upasamiti",
      header: "Upasamiti",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Select
            value={editFormData.upasamiti || ""}
            onValueChange={(value) => handleInputChange("upasamiti", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Upasamiti" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(UpasamitiName).map((name) => (
                <SelectItem key={name} value={name}>{name.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div>{row.original.upasamiti?.replace(/_/g, " ") || "-"}</div>
        );
      },
    },
    {
      accessorKey: "focusArea",
      header: "Focus Area",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.focusArea || ""}
            onChange={(e) => handleInputChange("focusArea", e.target.value)}
          />
        ) : (
          <div>{row.original.focusArea || "-"}</div>
        );
      },
    },
    {
      accessorKey: "workType",
      header: "Work Type",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.workType || ""}
            onChange={(e) => handleInputChange("workType", e.target.value)}
          />
        ) : (
          <div>{row.original.workType || "-"}</div>
        );
      },
    },
    {
      accessorKey: "componentType",
      header: "Component Type",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.componentType || ""}
            onChange={(e) => handleInputChange("componentType", e.target.value)}
          />
        ) : (
          <div>{row.original.componentType || "-"}</div>
        );
      },
    },
    {
      accessorKey: "gramSansad",
      header: "Gram Sansad",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.gramSansad || ""}
            onChange={(e) => handleInputChange("gramSansad", e.target.value)}
          />
        ) : (
          <div>{row.original.gramSansad || "-"}</div>
        );
      },
    },
    {
      accessorKey: "sdgs",
      header: "SDGs",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.sdgs || ""}
            onChange={(e) => handleInputChange("sdgs", e.target.value)}
          />
        ) : (
          <div className="max-w-[150px] truncate" title={row.original.sdgs || ""}>
            {row.original.sdgs || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "beneficiariesSC",
      header: "Beneficiaries (SC)",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            type="number"
            value={editFormData.beneficiariesSC || 0}
            onChange={(e) => handleInputChange("beneficiariesSC", parseInt(e.target.value) || 0)}
            className="text-right"
          />
        ) : (
          <div className="text-right">{row.original.beneficiariesSC || 0}</div>
        );
      },
    },
    {
      accessorKey: "beneficiariesST",
      header: "Beneficiaries (ST)",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            type="number"
            value={editFormData.beneficiariesST || 0}
            onChange={(e) => handleInputChange("beneficiariesST", parseInt(e.target.value) || 0)}
            className="text-right"
          />
        ) : (
          <div className="text-right">{row.original.beneficiariesST || 0}</div>
        );
      },
    },
    {
      accessorKey: "beneficiariesGen",
      header: "Beneficiaries (Gen)",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            type="number"
            value={editFormData.beneficiariesGen || 0}
            onChange={(e) => handleInputChange("beneficiariesGen", parseInt(e.target.value) || 0)}
            className="text-right"
          />
        ) : (
          <div className="text-right">{row.original.beneficiariesGen || 0}</div>
        );
      },
    },
    {
      accessorKey: "unitType",
      header: "Unit Type",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.unitType || ""}
            onChange={(e) => handleInputChange("unitType", e.target.value)}
          />
        ) : (
          <div>{row.original.unitType || "-"}</div>
        );
      },
    },
    {
      accessorKey: "totalUnit",
      header: "Total Unit",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            type="number"
            value={editFormData.totalUnit || 0}
            onChange={(e) => handleInputChange("totalUnit", parseInt(e.target.value) || 0)}
            className="text-right"
          />
        ) : (
          <div className="text-right">{row.original.totalUnit || 0}</div>
        );
      },
    },
    {
      accessorKey: "implementedBy",
      header: "Implemented By",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Input
            value={editFormData.implementedBy || ""}
            onChange={(e) => handleInputChange("implementedBy", e.target.value)}
          />
        ) : (
          <div>{row.original.implementedBy || "-"}</div>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <Textarea
            value={editFormData.remarks || ""}
            onChange={(e) => handleInputChange("remarks", e.target.value)}
            className="max-w-[200px]"
            rows={2}
          />
        ) : (
          <div className="max-w-[200px] text-sm text-muted-foreground line-clamp-2" title={row.original.remarks || ""}>
            {row.original.remarks || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "isPublish",
      header: "Published",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <select
            value={editFormData.isPublish ? "true" : "false"}
            onChange={(e) => handleInputChange("isPublish", e.target.value === "true")}
            className="border rounded p-1"
          >
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        ) : row.original.isPublish ? (
          <Badge className="bg-green-100 text-green-700">Published</Badge>
        ) : (
          <Badge variant="outline" className="text-amber-600">Draft</Badge>
        );
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
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;
        return isEditing ? (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => handleSave(row.original.id)} disabled={isSaving} className="h-8 px-2">
              <Save className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEditing} className="h-8 px-2">
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => startEditing(row.original)} className="h-8 px-2">
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="destructive" className="h-8 px-2">
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  // You need to import DataTable from your project
  // For completeness, assume we have a DataTable component that accepts columns and data
  // If you don't have one, you can use @/components/data-table
  import { DataTable } from "@/components/data-table";

  return <DataTable columns={columns} data={data} />;
}
