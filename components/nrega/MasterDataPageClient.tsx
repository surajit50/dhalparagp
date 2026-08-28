"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { createMasterData, updateMasterData, deleteMasterData } from "@/action/nrega/master-data-actions";
import { NregaMasterData } from "@prisma/client";

interface MasterDataPageClientProps {
  initialData: Record<string, NregaMasterData[]>;
}

const MASTER_DATA_TYPES = [
  { value: "FINANCIAL_YEAR", label: "Financial Year" },
  { value: "CATEGORY", label: "Master Category" },
  { value: "SUB_CATEGORY", label: "Sub Category" },
  { value: "NATURE_OF_WORK", label: "Nature of Work" },
  { value: "BENEFICIARY_CATEGORY", label: "Beneficiary Category" },
  { value: "CONVERGENCE_DEPT", label: "Convergence Department" },
  { value: "WORKSITE_TYPE", label: "Worksite Type" },
];

export default function MasterDataPageClient({ initialData }: MasterDataPageClientProps) {
  const [activeTab, setActiveTab] = useState("FINANCIAL_YEAR");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: "FINANCIAL_YEAR",
    value: "",
    label: "",
    sortOrder: 0,
    active: true,
  });

  const activeDataList = initialData[activeTab] || [];

  const handleOpenForm = (item?: NregaMasterData) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        type: item.type,
        value: item.value,
        label: item.label,
        sortOrder: item.sortOrder,
        active: item.active,
      });
    } else {
      setEditingId(null);
      setFormData({
        type: activeTab,
        value: "",
        label: "",
        sortOrder: (activeDataList[activeDataList.length - 1]?.sortOrder || 0) + 1,
        active: true,
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.value || !formData.label) {
      toast.error("Value and Label are required");
      return;
    }

    startTransition(async () => {
      try {
        const result = editingId
          ? await updateMasterData(editingId, formData)
          : await createMasterData(formData);

        if (result.success) {
          toast.success(result.message);
          setIsFormOpen(false);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("An error occurred");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    startTransition(async () => {
      try {
        const result = await deleteMasterData(id);
        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("An error occurred");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Master Data Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage dropdown options for works and certificates.
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New {MASTER_DATA_TYPES.find(t => t.value === activeTab)?.label}
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit" : "Add"} Master Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Input value={MASTER_DATA_TYPES.find(t => t.value === formData.type)?.label || formData.type} disabled />
              </div>
              <div>
                <Label>Label (Display Name) *</Label>
                <Input 
                  value={formData.label} 
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  placeholder="e.g. 2024-2025"
                />
              </div>
              <div>
                <Label>Value (Internal Key) *</Label>
                <Input 
                  value={formData.value} 
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="e.g. 2024-2025"
                />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input 
                  type="number" 
                  value={formData.sortOrder} 
                  onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {MASTER_DATA_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setActiveTab(type.value);
                setIsFormOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === type.value
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              {type.label}
              <span className="bg-muted-foreground/20 text-foreground text-xs py-0.5 px-2 rounded-full">
                {initialData[type.value]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="flex-1">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-base">
                {MASTER_DATA_TYPES.find(t => t.value === activeTab)?.label} List
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Order</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeDataList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No data found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeDataList.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-center">{item.sortOrder}</TableCell>
                        <TableCell className="font-medium">{item.label}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{item.value}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0" 
                              onClick={() => handleOpenForm(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
