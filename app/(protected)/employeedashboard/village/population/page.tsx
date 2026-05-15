"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  addPopulation,
  getPopulationList,
  updatePopulation,
  deletePopulation,
  getMouzaList,
} from "@/action/villagemanage";
import { Button } from "@/components/ui/button";
import { Users, Info, List, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PopulationForm } from "@/components/village-forms/PopulationForm";
import { VillagePageHeader } from "@/components/village/VillagePageHeader";
import { VillageDataTable } from "@/components/village/VillageDataTable";
import { motion } from "framer-motion";

export default function PopulationPage() {
  const [mouzas, setMouzas] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    const [mouzaData, populationData] = await Promise.all([
      getMouzaList(),
      getPopulationList(),
    ]);
    setMouzas(mouzaData);
    setRecords(populationData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    const result = await addPopulation(formData);
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
    formData.append("id", editingRecord.id);

    const result = await updatePopulation(formData);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      loadData();
      setIsEditDialogOpen(false);
      setEditingRecord(null);
    } else {
      toast.error(result.message);
    }
  };

  const handleEditClick = (record: any) => {
    setEditingRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    const form = new FormData();
    form.append("id", id);
    const res = await deletePopulation(form);
    if (res.success) {
      toast.success(res.message);
      loadData();
    } else {
      toast.error(res.message);
    }
  };

  const columns = [
    {
      header: "Mouza",
      accessor: (item: any) => (
        <div className="font-bold text-gray-900 pl-6">{item.mouza?.name}</div>
      ),
    },
    { header: "Male", accessor: "male" },
    { header: "Female", accessor: "female" },
    { header: "ST", accessor: "st" },
    { header: "SC", accessor: "sc" },
    { header: "OBC", accessor: "obc" },
    { header: "Hindu", accessor: "hindu" },
    { header: "Muslim", accessor: "muslim" },
    {
      header: "Action",
      accessor: (item: any) => (
        <div className="flex items-center justify-end space-x-2 pr-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(item)}
            className="hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
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
        title="Population Entry"
        description="Monitor demographic distributions and religious data across GP administrative areas."
        icon={Users}
        gradientFrom="from-emerald-600"
        gradientTo="to-orange-600"
      />

      <div className="space-y-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="shadow-2xl shadow-gray-200/50 border-none rounded-3xl bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white py-6 px-8">
              <div className="flex items-center space-x-3 text-emerald-600">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Info className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-gray-800">
                  Record Demographics
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <PopulationForm
                onSubmit={onSubmit}
                mouzas={mouzas}
                isSubmitting={isSubmitting}
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
              <span>{records.length} Records Found</span>
            </div>
          </div>

          <VillageDataTable
            columns={columns}
            data={records}
            emptyMessage="No population records found for any Mouza."
            emptyIcon={Users}
          />
        </motion.div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Pencil className="h-5 w-5 text-emerald-600" />
              </div>
              <span>Edit Demographic Record</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-6">
            <PopulationForm
              onSubmit={onUpdate}
              mouzas={mouzas}
              isSubmitting={isSubmitting}
              defaultValues={editingRecord}
              isEditing={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
