"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Edit, Trash2, Database, Check, X } from "lucide-react";
import { createMasterData, updateMasterData, deleteMasterData } from "@/action/nrega/master-data-actions";
import { NregaMasterData } from "@prisma/client";
import { MASTER_DATA_TYPE_TABS } from "@/lib/utils/nrega";
import { cn } from "@/lib/utils";

interface MasterDataPageClientProps {
  initialData: Record<string, NregaMasterData[]>;
}

export default function MasterDataPageClient({ initialData }: MasterDataPageClientProps) {
  const [activeTab, setActiveTab] = useState<string>("FINANCIAL_YEAR");
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
  const activeTabLabel = MASTER_DATA_TYPE_TABS.find(t => t.value === activeTab)?.label || activeTab;

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
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Master Data Management</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage dropdown options used across Work forms and Certificates.
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenForm()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add {activeTabLabel}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-2 border-primary/20 bg-primary/5 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {editingId ? "Edit" : "Add New"} {activeTabLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Data Type</Label>
                <Input value={MASTER_DATA_TYPE_TABS.find(t => t.value === formData.type)?.label || formData.type} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input 
                  type="number" 
                  value={formData.sortOrder} 
                  onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Label (Display Name) <span className="text-red-500">*</span></Label>
                <Input 
                  value={formData.label} 
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  placeholder="e.g. 2024-2025"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Value (Internal Key) <span className="text-red-500">*</span></Label>
                <Input 
                  value={formData.value} 
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="e.g. 2024-2025"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t">
              <Switch
                id="active-switch"
                checked={formData.active}
                onCheckedChange={(v) => setFormData({...formData, active: v})}
              />
              <Label htmlFor="active-switch" className="cursor-pointer">
                Active (shown in dropdowns)
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isPending} className="gap-2 min-w-[100px]">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <Card className="w-full lg:w-64 shrink-0 overflow-hidden">
          <CardContent className="p-2 space-y-1">
            {MASTER_DATA_TYPE_TABS.map((type) => {
              const count = initialData[type.value]?.length || 0;
              return (
                <button
                  key={type.value}
                  onClick={() => {
                    setActiveTab(type.value);
                    setIsFormOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                    activeTab === type.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted/70 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{type.label}</span>
                  <Badge
                    variant={activeTab === type.value ? "secondary" : "outline"}
                    className={cn(
                      "h-5 min-w-[20px] px-1.5 text-[10px] rounded-full",
                      activeTab === type.value
                        ? "bg-primary-foreground/20 text-primary-foreground border-0"
                        : count === 0 ? "opacity-50" : ""
                    )}
                  >
                    {count}
                  </Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Data Table */}
        <div className="flex-1">
          <Card className="overflow-hidden">
            <CardHeader className="py-4 border-b bg-muted/20">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{activeTabLabel} List</span>
                <Badge variant="outline" className="text-xs font-normal">
                  {activeDataList.length} record{activeDataList.length !== 1 ? "s" : ""}
                </Badge>
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="w-16 text-center text-xs uppercase tracking-wide">Order</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Label</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">Value</TableHead>
                    <TableHead className="w-20 text-center text-xs uppercase tracking-wide">Active</TableHead>
                    <TableHead className="w-24 text-right text-xs uppercase tracking-wide">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeDataList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-1">
                          <Database className="h-8 w-8 opacity-30" />
                          <p>No {activeTabLabel.toLowerCase()} records yet.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeDataList.map((item) => (
                      <TableRow key={item.id} className="group hover:bg-muted/30">
                        <TableCell className="text-center tabular-nums text-muted-foreground">
                          {item.sortOrder}
                        </TableCell>
                        <TableCell className="font-medium">{item.label}</TableCell>
                        <TableCell className="text-muted-foreground text-sm font-mono">{item.value}</TableCell>
                        <TableCell className="text-center">
                          {item.active ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 border-0 h-6">
                              <Check className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-0 h-6">
                              <X className="h-3 w-3 mr-1" />
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-amber-100 hover:text-amber-700"
                              onClick={() => handleOpenForm(item)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDelete(item.id)}
                              title="Delete"
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
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
