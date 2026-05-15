"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  addWaterSummary,
  getWaterSummaryList,
  updateWaterSummary,
  deleteWaterSummary,
  getMouzaList,
  getWaterSummary,
} from "@/action/villagemanage";
import { Button } from "@/components/ui/button";
import {
  Droplets,
  List,
  Pencil,
  Plus,
  Landmark,
  Waves,
  Filter,
  LifeBuoy,
  Tent,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WaterSummaryForm } from "@/components/village-forms/WaterSummaryForm";
import { VillagePageHeader } from "@/components/village/VillagePageHeader";
import { VillageDataTable } from "@/components/village/VillageDataTable";
import { motion } from "framer-motion";

export default function WaterSummaryPage() {
  const [mouzas, setMouzas] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSummary, setEditingSummary] = useState<any | null>(null);
  const [previousYearData, setPreviousYearData] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    const [mouzaData, summaryData] = await Promise.all([
      getMouzaList(),
      getWaterSummaryList(),
    ]);
    setMouzas(mouzaData);
    setSummaries(summaryData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMouzaChange = async (mouzaId: string) => {
    if (!mouzaId) {
      setPreviousYearData(null);
      return;
    }
    const data = await getWaterSummary(mouzaId);
    setPreviousYearData(data);
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));

    const result = await addWaterSummary(formData);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      loadData();
    } else {
      toast.error(result.message);
    }
  };

  const onUpdate = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    formData.append("id", editingSummary.id);

    const result = await updateWaterSummary(formData);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      loadData();
      setIsEditDialogOpen(false);
      setEditingSummary(null);
    } else {
      toast.error(result.message);
    }
  };

  const handleEditClick = (summary: any) => {
    setEditingSummary(summary);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this water supply record?"))
      return;
    const form = new FormData();
    form.append("id", id);
    const res = await deleteWaterSummary(form);
    if (res.success) {
      toast.success(res.message);
      loadData();
    } else {
      toast.error(res.message);
    }
  };

  const columns = [
    {
      header: "Administrative Area",
      accessor: (item: any) => (
        <div className="font-bold text-gray-900 pl-6">{item.mouza?.name}</div>
      ),
    },
    {
      header: "Water Source Distribution",
      accessor: (item: any) => (
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center px-3 py-1 bg-orange-50 rounded-lg border border-orange-100">
            <span className="text-[10px] uppercase font-black text-orange-400">
              Tap
            </span>
            <span className="text-sm font-bold text-orange-700">
              {item.tapWater}
            </span>
          </div>
          <div className="flex flex-col items-center px-3 py-1 bg-orange-50 rounded-lg border border-orange-100">
            <span className="text-[10px] uppercase font-black text-orange-400">
              Pump
            </span>
            <span className="text-sm font-bold text-orange-700">
              {item.handPump}
            </span>
          </div>
          <div className="flex flex-col items-center px-3 py-1 bg-orange-50 rounded-lg border border-orange-100">
            <span className="text-[10px] uppercase font-black text-orange-400">
              Well
            </span>
            <span className="text-sm font-bold text-orange-700">
              {item.well}
            </span>
          </div>
          <div className="flex flex-col items-center px-3 py-1 bg-orange-50 rounded-lg border border-orange-100">
            <span className="text-[10px] uppercase font-black text-orange-400">
              Natural
            </span>
            <span className="text-sm font-bold text-orange-700">{item.pond}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Action",
      accessor: (item: any) => (
        <div className="flex items-center justify-end space-x-2 pr-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(item)}
            className="hover:bg-orange-100 hover:text-orange-600 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(item.id)}
            className="hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 space-y-10">
      <VillagePageHeader
        title="Hydraulic Audit"
        description="Monitor and record drinking water source availability and distribution across household clusters."
        icon={Waves}
        gradientFrom="from-orange-600"
        gradientTo="to-orange-600"
      />

      <div className="space-y-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="shadow-2xl shadow-gray-200/50 border-none rounded-3xl bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white py-6 px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-orange-600">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Plus className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight text-gray-800">
                    Hydraulic Infrastructure Audit
                  </CardTitle>
                </div>
                {previousYearData && (
                  <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full animate-pulse border border-orange-100">
                    Syncing Historical Data
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <WaterSummaryForm
                onSubmit={onSubmit}
                mouzas={mouzas}
                isSubmitting={isSubmitting}
                defaultValues={{ ...previousYearData }}
                onMouzaChange={handleMouzaChange}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <List className="h-4 w-4" />
              <span>{summaries.length} Infrastructure Profiles</span>
            </div>
          </div>

          <VillageDataTable
            columns={columns}
            data={summaries}
            emptyMessage="No hydraulic audit records found. Start mapping water sources."
            emptyIcon={Droplets}
          />
        </motion.div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Pencil className="h-5 w-5 text-orange-600" />
              </div>
              <span>Edit Hydraulic Support Profile</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-6">
            <WaterSummaryForm
              onSubmit={onUpdate}
              mouzas={mouzas}
              isSubmitting={isSubmitting}
              defaultValues={editingSummary}
              onMouzaChange={handleMouzaChange}
              isEditing={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
