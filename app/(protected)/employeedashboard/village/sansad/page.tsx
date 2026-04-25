"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  addSansad,
  getSansadList,
  updateSansad,
  deleteSansad,
} from "@/action/villagemanage";
import { Button } from "@/components/ui/button";
import { Users, Plus, List, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SansadForm } from "@/components/village-forms/SansadForm";
import { VillagePageHeader } from "@/components/village/VillagePageHeader";
import { VillageDataTable } from "@/components/village/VillageDataTable";
import { motion } from "framer-motion";

export default function SansadPage() {
  const [sansads, setSansads] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSansad, setEditingSansad] = useState<any | null>(null);

  const loadSansads = useCallback(async () => {
    const data = await getSansadList();
    setSansads(data);
  }, []);

  useEffect(() => {
    loadSansads();
  }, [loadSansads]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));

    const result = await addSansad(formData);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      loadSansads();
    } else {
      toast.error(result.message);
    }
  };

  const onUpdate = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    formData.append("id", editingSansad.id);

    const result = await updateSansad(formData);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      loadSansads();
      setIsEditDialogOpen(false);
      setEditingSansad(null);
    } else {
      toast.error(result.message);
    }
  };

  const handleEditClick = (sansad: any) => {
    setEditingSansad(sansad);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Sansad?")) return;
    const form = new FormData();
    form.append("id", id);
    const res = await deleteSansad(form);
    if (res.success) {
      toast.success(res.message);
      loadSansads();
    } else {
      toast.error(res.message);
    }
  };

  const columns = [
    {
      header: "Sansad Name",
      accessor: "sansadname",
      className: "font-semibold text-gray-900 pl-6",
    },
    {
      header: "Sansad Number",
      accessor: "sansadnumber",
    },
    {
      header: "Created At",
      accessor: (item: any) => new Date(item.createdAt).toLocaleDateString(),
    },
    {
      header: "Updated At",
      accessor: (item: any) => item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "N/A",
    },
    {
      header: "Action",
      accessor: (item: any) => (
        <div className="flex items-center justify-end space-x-2 pr-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(item)}
            className="hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
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
        title="Sansad Management"
        description="Oversee and manage sansad constituencies, numbers, and administrative records."
        icon={Users}
        gradientFrom="from-indigo-600"
        gradientTo="to-blue-600"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          
        >
          <Card className="shadow-2xl shadow-gray-200/50 border-none rounded-3xl bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white py-6">
              <div className="flex items-center space-x-3 text-indigo-600">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Plus className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-gray-800">
                  New Sansad Record
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <SansadForm
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <List className="h-4 w-4" />
              <span>{sansads.length} Total Constituencies</span>
            </div>
          </div>
          
          <VillageDataTable
            columns={columns}
            data={sansads}
            emptyMessage="No sansads found. Start by adding a new record."
            emptyIcon={Users}
          />
        </motion.div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Pencil className="h-5 w-5 text-indigo-600" />
              </div>
              <span>Edit Sansad Details</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-6">
            <SansadForm
              onSubmit={onUpdate}
              isSubmitting={isSubmitting}
              defaultValues={editingSansad}
              isEditing={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
