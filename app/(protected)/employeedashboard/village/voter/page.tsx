"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  addVoterSummary,
  getVoterSummaryList,
  updateVoterSummary,
  deleteVoterSummary,
  getMouzaList,
  getVoterSummary,
} from "@/action/villagemanage";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  List,
  Pencil,
  Plus,
  Landmark,
  Users,
  Trash2,
  Fingerprint,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VoterSummaryForm } from "@/components/village-forms/VoterSummaryForm";
import { VillagePageHeader } from "@/components/village/VillagePageHeader";
import { VillageDataTable } from "@/components/village/VillageDataTable";
import { motion } from "framer-motion";
import { getPollingDetailsList } from "@/action/pollingdetailsAction";

export default function VoterSummaryPage() {
  const [mouzas, setMouzas] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSummary, setEditingSummary] = useState<any | null>(null);
  const [previousYearData, setPreviousYearData] = useState<any | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [pollingDetails, setPollingDetails] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    const [mouzaData, summaryData, pollingData] = await Promise.all([
      getMouzaList(),
      getVoterSummaryList(),
      getPollingDetailsList(),
    ]);
    setMouzas(mouzaData);
    setSummaries(summaryData);
    setPollingDetails(pollingData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMouzaChange = async (mouzaId: string) => {
    if (!mouzaId) {
      setPreviousYearData(null);
      return;
    }
    const data = await getVoterSummary(mouzaId);
    setPreviousYearData(data);
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key]))
        formData.append(key, JSON.stringify(data[key]));
      else formData.append(key, data[key]);
    });
    const result = await addVoterSummary(formData);
    setIsSubmitting(false);
    if (result.success) {
      toast.success(result.message);
      loadData();
      setIsCreateDialogOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  const onUpdate = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key]))
        formData.append(key, JSON.stringify(data[key]));
      else formData.append(key, data[key]);
    });
    formData.append("id", editingSummary.id);

    const result = await updateVoterSummary(formData);
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
    if (!confirm("Are you sure you want to delete this voter summary record?"))
      return;
    const form = new FormData();
    form.append("id", id);
    const res = await deleteVoterSummary(form);
    if (res.success) {
      toast.success(res.message);
      loadData();
    } else {
      toast.error(res.message);
    }
  };

  const columns = [
    {
      header: "Polling Station",
      accessor: (item: any) => (
        <div className="font-bold text-gray-900 pl-6 flex flex-col">
          <span>
            {item.pollingStationNo}: {item.pollingStationName}
          </span>
          <span
            className="text-[10px] text-gray-500 font-normal truncate max-w-[200px]"
            title={item.mouzas?.map((m: any) => m.name).join(", ")}
          >
            {item.mouzas?.map((m: any) => m.name).join(", ") ||
              "No Mouza selected"}
          </span>
        </div>
      ),
    },
    {
      header: "Aggregated Voters",
      accessor: (item: any) => (
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center px-4 py-1 bg-orange-50 rounded-lg border border-orange-100">
            <span className="text-[10px] uppercase font-black text-orange-400">
              Male
            </span>
            <span className="text-sm font-bold text-orange-700">
              {item.totalMaleVoter}
            </span>
          </div>
          <div className="flex flex-col items-center px-4 py-1 bg-pink-50 rounded-lg border border-pink-100">
            <span className="text-[10px] uppercase font-black text-pink-400">
              Female
            </span>
            <span className="text-sm font-bold text-pink-700">
              {item.totalFemaleVoter}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Demographic Breakdown",
      accessor: (item: any) => (
        <div className="flex items-center space-x-2">
          {[
            {
              label: "SC",
              val: item.scMaleVoter + item.scFemaleVoter,
              color: "orange",
            },
            {
              label: "ST",
              val: item.stMaleVoter + item.stFemaleVoter,
              color: "emerald",
            },
            {
              label: "OBC",
              val: item.obcMaleVoter + item.obcFemaleVoter,
              color: "indigo",
            },
            {
              label: "GEN",
              val: item.genMaleVoter + item.genFemaleVoter,
              color: "gray",
            },
          ].map((cat) => (
            <div
              key={cat.label}
              className={`flex items-center px-2 py-0.5 bg-${cat.color}-50 text-${cat.color}-700 border border-${cat.color}-100 rounded text-[10px] font-bold`}
            >
              {cat.label}: {cat.val}
            </div>
          ))}
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
        title="Electoral Audit"
        description="Monitor and record voter demographics and electoral statistics across village administrative areas."
        icon={Fingerprint}
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
                    Record New Electoral Audit
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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="text-sm text-gray-500 md:max-w-xl">
                  Launch the guided electoral audit form in a focused dialog to
                  capture voter demographics for a selected Mouza.
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="h-11 px-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-md shadow-orange-100 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Electoral Audit
                </Button>
              </div>
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
              <span>{summaries.length} Audit Profiles</span>
            </div>
          </div>

          <VillageDataTable
            columns={columns}
            data={summaries}
            emptyMessage="No electoral audit records found. Start mapping voter demographics."
            emptyIcon={UserCheck}
          />

          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Landmark className="h-4 w-4" />
              <span>{pollingDetails.length} Polling Stations (Reference)</span>
            </div>
            <VillageDataTable
              columns={[
                {
                  header: "Polling Station No.",
                  accessor: (item: any) => (
                    <span className="font-semibold text-gray-900 pl-6">
                      {item.pollingdetailsno}
                    </span>
                  ),
                },
                {
                  header: "Polling Station Name",
                  accessor: "pollingdetailsname",
                },
                {
                  header: "Male Voters (Roll)",
                  accessor: (item: any) => (
                    <span className="font-semibold text-orange-700">
                      {item.malevoter}
                    </span>
                  ),
                },
                {
                  header: "Female Voters (Roll)",
                  accessor: (item: any) => (
                    <span className="font-semibold text-pink-700">
                      {item.femalevoter}
                    </span>
                  ),
                },
                {
                  header: "Total",
                  accessor: (item: any) => (
                    <span className="font-semibold text-emerald-700">
                      {item.malevoter + item.femalevoter}
                    </span>
                  ),
                },
              ]}
              data={pollingDetails}
              emptyMessage="No polling station records found in the system."
              emptyIcon={Landmark}
            />
          </div>
        </motion.div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Plus className="h-5 w-5 text-orange-600" />
              </div>
              <span>New Electoral Audit Profile</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-6">
            <VoterSummaryForm
              onSubmit={onSubmit}
              mouzas={mouzas}
              isSubmitting={isSubmitting}
              defaultValues={{ ...previousYearData }}
              onMouzaChange={handleMouzaChange}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Pencil className="h-5 w-5 text-orange-600" />
              </div>
              <span>Edit Electoral Support Profile</span>
            </DialogTitle>
          </DialogHeader>
          <div className="pt-6">
            <VoterSummaryForm
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
