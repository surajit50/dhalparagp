"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  addToiletSummary,
  getToiletSummaryList,
  updateToiletSummary,
  deleteToiletSummary,
  getMouzaList,
  getToiletSummary,
} from "@/action/villagemanage";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  List,
  Pencil,
  Plus,
  Landmark,
  Home,
  CheckCircle2,
  Search,
  Activity,
  ShieldCheck,
  MapPin,
  Waves
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToiletSummaryForm } from "@/components/village-forms/ToiletSummaryForm";
import { VillagePageHeader } from "@/components/village/VillagePageHeader";
import { VillageDataTable } from "@/components/village/VillageDataTable";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function ToiletSummaryPage() {
  const [mouzas, setMouzas] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSummary, setEditingSummary] = useState<any | null>(null);
  const [previousYearData, setPreviousYearData] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    const [mouzaData, summaryData] = await Promise.all([
      getMouzaList(),
      getToiletSummaryList(),
    ]);
    setMouzas(mouzaData);
    setSummaries(summaryData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredSummaries = useMemo(() => {
    return summaries.filter(s => 
      s.mouza?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [summaries, searchTerm]);

  const stats = useMemo(() => {
    const totalHH = summaries.reduce((acc, curr) => acc + (curr.totalHousehold || 0), 0);
    const totalAvail = summaries.reduce((acc, curr) => acc + (curr.toiletAvailable || 0), 0);
    const percentage = totalHH > 0 ? Math.round((totalAvail / totalHH) * 100) : 0;
    
    return [
      { label: "Total Households", value: totalHH.toLocaleString(), icon: Home, color: "text-blue-600", bg: "bg-blue-50" },
      { label: "IHHL Coverage", value: `${percentage}%`, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "Active Audits", value: summaries.length, icon: Activity, color: "text-rose-600", bg: "bg-rose-50" },
    ];
  }, [summaries]);

  const handleMouzaChange = async (mouzaId: string) => {
    if (!mouzaId) {
      setPreviousYearData(null);
      return;
    }
    const data = await getToiletSummary(mouzaId);
    if (data) {
      setPreviousYearData(data);
    } else {
      const selectedMouza = mouzas.find((m) => m.id === mouzaId);
      setPreviousYearData({
        mouzaId,
        totalHousehold: selectedMouza?.totalHouseholds || 0,
        toiletAvailable: 0,
        toiletNotAvailable: selectedMouza?.totalHouseholds || 0,
      });
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    const result = await addToiletSummary(formData);
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

    const result = await updateToiletSummary(formData);
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
    if (!confirm("Are you sure you want to delete this sanitation record?"))
      return;
    const form = new FormData();
    form.append("id", id);
    const res = await deleteToiletSummary(form);
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
        <div className="flex flex-col pl-6">
          <span className="font-bold text-gray-900">{item.mouza?.name}</span>
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Sanitation Audit</span>
        </div>
      ),
    },
    {
      header: "Total Households",
      accessor: (item: any) => (
        <div className="flex items-center space-x-2">
          <Home className="h-4 w-4 text-gray-400" />
          <span className="font-semibold">{item.totalHousehold || item.mouza?.totalHouseholds || 0}</span>
        </div>
      ),
    },
    {
      header: "Coverage Distribution",
      accessor: (item: any) => {
        const total = item.totalHousehold || item.mouza?.totalHouseholds || 0;
        const percentage =
          total > 0
            ? Math.round((item.toiletAvailable / total) * 100)
            : 0;
        return (
          <div className="flex flex-col space-y-1.5 min-w-[150px]">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
              <span className="text-emerald-600">
                Avail: {item.toiletAvailable}
              </span>
              <span className="text-rose-600">
                N/A: {item.toiletNotAvailable}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                
              />
            </div>
            <span className="text-[9px] font-bold text-gray-400 text-right">{percentage}% Complete</span>
          </div>
        );
      },
    },
    {
      header: "Action",
      accessor: (item: any) => (
        <div className="flex items-center justify-end space-x-2 pr-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(item)}
            className="hover:bg-rose-100 hover:text-rose-600 transition-all duration-200 rounded-xl"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(item.id)}
            className="hover:bg-red-100 hover:text-red-600 transition-all duration-200 rounded-xl"
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
        title="Sanitation Audit"
        description="Monitor IHHL (Individual Household Latrine) coverage and sanitation status across village administrative areas."
        icon={CheckCircle2}
        gradientFrom="from-rose-600"
        gradientTo="to-pink-600"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={cn("p-4 rounded-2xl", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
        {/* Entry Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          
        >
          <Card className="shadow-2xl shadow-gray-200/50 border-none rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white py-8 px-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-rose-600">
                  <div className="p-2.5 bg-rose-50 rounded-2xl shadow-inner">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight text-gray-800">
                      Audit Entry
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-gray-400">Record sanitation status</CardDescription>
                  </div>
                </div>
                {previousYearData && (
                  <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-none animate-pulse px-3 py-1 text-[9px] uppercase font-black">
                    Sync Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <ToiletSummaryForm
                onSubmit={onSubmit}
                mouzas={mouzas}
                isSubmitting={isSubmitting}
                defaultValues={{ ...previousYearData }}
                onMouzaChange={handleMouzaChange}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Directory List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by mouza name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-none bg-white shadow-lg shadow-gray-100/50 focus-visible:ring-rose-500 rounded-2xl"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 font-bold bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-gray-50 shrink-0">
              <Activity className="h-4 w-4 text-rose-500" />
              <span className="uppercase tracking-widest text-[10px]">{filteredSummaries.length} Audit Profiles</span>
            </div>
          </div>

          <VillageDataTable
            columns={columns}
            data={filteredSummaries}
            emptyMessage="No sanitation audit records found."
            emptyIcon={CheckCircle2}
          />
        </motion.div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-rose-900 p-10 text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black flex items-center">
                <div className="p-3 bg-white/10 rounded-2xl mr-4 backdrop-blur-md">
                  <Pencil className="h-6 w-6 text-rose-300" />
                </div>
                Edit Sanitation Profile
              </DialogTitle>
              <CardDescription className="text-rose-300 mt-2 text-lg font-medium">Update the official sanitation audit for this area.</CardDescription>
            </DialogHeader>
          </div>
          <div className="p-10">
            <ToiletSummaryForm
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
