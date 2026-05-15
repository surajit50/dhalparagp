"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus, Pencil, Trash2, Loader2, Search, Wallet, Calculator, Coins, Landmark, ArrowRightLeft, TrendingDown, Info, X, CheckCircle2, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FundAvailability {
  id: string;
  year: string;
  schemeName: string;
  openingBalanceTied: number;
  openingBalanceUntied: number;
  openingBalanceTotal: number;
  directReceiptTied: number;
  directReceiptUntied: number;
  directReceiptTotal: number;
  autoReceiptTied: number;
  autoReceiptUntied: number;
  autoReceiptTotal: number;
  expenditureTied: number;
  expenditureUntied: number;
  expenditureTotal: number;
  unspentBalanceTied: number;
  unspentBalanceUntied: number;
  unspentBalanceTotal: number;
}

export default function FundDetailsClient() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExpenditureDialogOpen, setIsExpenditureDialogOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<FundAvailability | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    year: "",
    schemeName: "",
    openingBalanceTied: 0,
    openingBalanceUntied: 0,
    directReceiptTied: 0,
    directReceiptUntied: 0,
    autoReceiptTied: 0,
    autoReceiptUntied: 0,
    expenditureTied: 0,
    expenditureUntied: 0,
  });

  const [expenditureData, setExpenditureData] = useState({
    newTied: 0,
    newUntied: 0,
  });

  const { data: funds, isLoading, isError } = useQuery<FundAvailability[]>({
    queryKey: ["fund-details"],
    queryFn: async () => {
      const { data } = await axios.get("/api/fund-details");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (newFund: any) => axios.post("/api/fund-details", newFund),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fund-details"] });
      toast.success("Record saved successfully");
      setIsDialogOpen(false);
    },
    onError: () => toast.error("Failed to save record"),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedFund: any) => axios.put("/api/fund-details", updatedFund),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fund-details"] });
      toast.success("Record updated successfully");
      setIsDialogOpen(false);
      setIsExpenditureDialogOpen(false);
      setEditingFund(null);
    },
    onError: () => toast.error("Failed to update record"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/fund-details?id=${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fund-details"] });
      toast.success("Record deleted");
    },
    onError: () => toast.error("Failed to delete record"),
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === "year" || field === "schemeName" ? value : (parseFloat(value) || 0)
    }));
  };

  const handleExpenditureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFund) return;

    const updatedData = {
      ...editingFund,
      expenditureTied: editingFund.expenditureTied + expenditureData.newTied,
      expenditureUntied: editingFund.expenditureUntied + expenditureData.newUntied,
    };

    updateMutation.mutate(updatedData);
  };

  const totals = useMemo(() => {
    const unspentTied = (formData.openingBalanceTied + formData.directReceiptTied + formData.autoReceiptTied) - formData.expenditureTied;
    const unspentUntied = (formData.openingBalanceUntied + formData.directReceiptUntied + formData.autoReceiptUntied) - formData.expenditureUntied;
    return {
      unspentTied,
      unspentUntied,
      unspentTotal: unspentTied + unspentUntied,
      receiptsTotal: formData.directReceiptTied + formData.directReceiptUntied + formData.autoReceiptTied + formData.autoReceiptUntied,
      expenditureTotal: formData.expenditureTied + formData.expenditureUntied
    };
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFund) {
      updateMutation.mutate({ ...formData, id: editingFund.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetForm = (fund: FundAvailability | null) => {
    if (fund) {
      setFormData({
        year: fund.year,
        schemeName: fund.schemeName,
        openingBalanceTied: fund.openingBalanceTied,
        openingBalanceUntied: fund.openingBalanceUntied,
        directReceiptTied: fund.directReceiptTied,
        directReceiptUntied: fund.directReceiptUntied,
        autoReceiptTied: fund.autoReceiptTied,
        autoReceiptUntied: fund.autoReceiptUntied,
        expenditureTied: fund.expenditureTied,
        expenditureUntied: fund.expenditureUntied,
      });
    } else {
      setFormData({
        year: "",
        schemeName: "",
        openingBalanceTied: 0,
        openingBalanceUntied: 0,
        directReceiptTied: 0,
        directReceiptUntied: 0,
        autoReceiptTied: 0,
        autoReceiptUntied: 0,
        expenditureTied: 0,
        expenditureUntied: 0,
      });
    }
  };

  useEffect(() => {
    if (isDialogOpen) resetForm(editingFund);
  }, [isDialogOpen, editingFund]);

  const filteredFunds = funds?.filter((fund) =>
    fund.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fund.year.includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#fafafa]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fund Details</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and track project-wise financial availability.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-orange-100 flex gap-2 h-auto">
              <Plus size={20} /> Add New Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
            <div className="bg-white flex flex-col max-h-[90vh]">
               {/* Header */}
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-orange-600 rounded-lg">
                        <Calculator className="w-5 h-5 text-white" />
                     </div>
                     <DialogTitle className="text-xl font-bold text-slate-800">
                        {editingFund ? "Edit Financial Record" : "New Financial Entry"}
                     </DialogTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(false)} className="rounded-full">
                     <X size={20} />
                  </Button>
               </div>

               {/* Form Content */}
               <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
                  <div className="p-8 space-y-10">
                     {/* Basic Info */}
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial Year</Label>
                           <Input 
                              value={formData.year}
                              onChange={(e) => handleInputChange("year", e.target.value)}
                              placeholder="2024-2025" 
                              className="h-12 bg-white border-slate-200 rounded-lg font-semibold"
                              required 
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheme Name</Label>
                           <Input 
                              value={formData.schemeName}
                              onChange={(e) => handleInputChange("schemeName", e.target.value)}
                              placeholder="e.g. 15th CFC" 
                              className="h-12 bg-white border-slate-200 rounded-lg font-semibold"
                              required 
                           />
                        </div>
                     </div>

                     {/* Financial Table */}
                     <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                           <thead>
                              <tr className="bg-slate-50 border-b border-slate-100">
                                 <th className="text-left p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Category</th>
                                 <th className="text-left p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Tied Amount</th>
                                 <th className="text-left p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Untied Amount</th>
                                 <th className="text-right p-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Sub-Total</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {/* Opening Balance */}
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                 <td className="p-4 font-bold text-slate-700 flex items-center gap-2">
                                    <Landmark size={14} className="text-slate-400" /> Opening Balance
                                 </td>
                                 <td className="p-2">
                                    <Input type="number" step="0.01" value={formData.openingBalanceTied} onChange={(e) => handleInputChange("openingBalanceTied", e.target.value)} className="h-9 border-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-orange-500 font-bold" />
                                 </td>
                                 <td className="p-2">
                                    <Input type="number" step="0.01" value={formData.openingBalanceUntied} onChange={(e) => handleInputChange("openingBalanceUntied", e.target.value)} className="h-9 border-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-orange-500 font-bold" />
                                 </td>
                                 <td className="p-4 text-right font-black text-slate-900 tabular-nums">
                                    ₹{(formData.openingBalanceTied + formData.openingBalanceUntied).toLocaleString()}
                                 </td>
                              </tr>
                              {/* Direct Receipt */}
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                 <td className="p-4 font-bold text-slate-700 flex items-center gap-2">
                                    <ArrowRightLeft size={14} className="text-blue-400" /> Direct Receipt
                                 </td>
                                 <td className="p-2">
                                    <Input type="number" step="0.01" value={formData.directReceiptTied} onChange={(e) => handleInputChange("directReceiptTied", e.target.value)} className="h-9 border-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-orange-500 font-bold" />
                                 </td>
                                 <td className="p-2">
                                    <Input type="number" step="0.01" value={formData.directReceiptUntied} onChange={(e) => handleInputChange("directReceiptUntied", e.target.value)} className="h-9 border-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-orange-500 font-bold" />
                                 </td>
                                 <td className="p-4 text-right font-black text-slate-900 tabular-nums">
                                    ₹{(formData.directReceiptTied + formData.directReceiptUntied).toLocaleString()}
                                 </td>
                              </tr>
                              {/* Auto Receipt */}
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                 <td className="p-4 font-bold text-slate-700 flex items-center gap-2">
                                    <Coins size={14} className="text-indigo-400" /> Auto Receipt
                                 </td>
                                 <td className="p-2">
                                    <Input type="number" step="0.01" value={formData.autoReceiptTied} onChange={(e) => handleInputChange("autoReceiptTied", e.target.value)} className="h-9 border-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-orange-500 font-bold" />
                                 </td>
                                 <td className="p-2">
                                    <Input type="number" step="0.01" value={formData.autoReceiptUntied} onChange={(e) => handleInputChange("autoReceiptUntied", e.target.value)} className="h-9 border-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-orange-500 font-bold" />
                                 </td>
                                 <td className="p-4 text-right font-black text-slate-900 tabular-nums">
                                    ₹{(formData.autoReceiptTied + formData.autoReceiptUntied).toLocaleString()}
                                 </td>
                              </tr>
                              {/* Expenditure */}
                              <tr className="bg-red-50/30 hover:bg-red-50/50 transition-colors">
                                 <td className="p-4 font-bold text-red-700 flex items-center gap-2">
                                    <TrendingDown size={14} className="text-red-400" /> Expenditure
                                 </td>
                                 <td className="p-2">
                                    <Input type="number" step="0.01" value={formData.expenditureTied} onChange={(e) => handleInputChange("expenditureTied", e.target.value)} className="h-9 border-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-red-500 font-bold text-red-600" />
                                 </td>
                                 <td className="p-2">
                                    <Input type="number" step="0.01" value={formData.expenditureUntied} onChange={(e) => handleInputChange("expenditureUntied", e.target.value)} className="h-9 border-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-red-500 font-bold text-red-600" />
                                 </td>
                                 <td className="p-4 text-right font-black text-red-700 tabular-nums">
                                    ₹{totals.expenditureTotal.toLocaleString()}
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>

                     {/* Live Summary Footer */}
                     <div className="bg-slate-900 rounded-2xl p-6 text-white flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
                              <CheckCircle2 size={24} />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Unspent Balance</p>
                              <p className="text-sm text-slate-400 font-medium tracking-tight">Calculation: [A + (B+C)] - D</p>
                           </div>
                        </div>
                        <div className="flex gap-8">
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tied</p>
                              <p className={cn("text-xl font-bold tabular-nums", totals.unspentTied < 0 ? "text-red-400" : "text-white")}>₹{totals.unspentTied.toLocaleString()}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Untied</p>
                              <p className={cn("text-xl font-bold tabular-nums", totals.unspentUntied < 0 ? "text-red-400" : "text-white")}>₹{totals.unspentUntied.toLocaleString()}</p>
                           </div>
                           <div className="text-right border-l border-slate-700 pl-8">
                              <p className="text-[10px] font-bold text-orange-400 uppercase mb-1">Grand Total</p>
                              <p className="text-2xl font-black tabular-nums text-orange-500">₹{totals.unspentTotal.toLocaleString()}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </form>

               {/* Actions */}
               <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/30">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="px-8 rounded-lg font-bold border-slate-200">Cancel</Button>
                  <Button 
                     onClick={handleSubmit} 
                     className="bg-orange-600 hover:bg-orange-700 text-white px-10 rounded-lg font-black h-11"
                     disabled={createMutation.isPending || updateMutation.isPending}
                  >
                     {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                     {editingFund ? "Update Record" : "Save Record"}
                  </Button>
               </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Separate Expenditure Dialog */}
      <Dialog open={isExpenditureDialogOpen} onOpenChange={setIsExpenditureDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <div className="bg-white">
            <div className="p-6 border-b border-slate-100 bg-red-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-800">Add Expenditure</DialogTitle>
                  <p className="text-xs text-slate-500 font-medium">{editingFund?.schemeName}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsExpenditureDialogOpen(false)} className="rounded-full">
                <X size={20} />
              </Button>
            </div>
            <form onSubmit={handleExpenditureSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase">New Tied Expenditure</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    autoFocus
                    placeholder="0.00" 
                    onChange={(e) => setExpenditureData(prev => ({ ...prev, newTied: parseFloat(e.target.value) || 0 }))}
                    className="h-12 font-bold text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase">New Untied Expenditure</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    onChange={(e) => setExpenditureData(prev => ({ ...prev, newUntied: parseFloat(e.target.value) || 0 }))}
                    className="h-12 font-bold text-lg"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  This will be added to the existing expenditure of ₹{editingFund?.expenditureTotal.toLocaleString()}.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setIsExpenditureDialogOpen(false)} className="font-bold">Cancel</Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-black px-8 rounded-lg" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Expenditure
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Table */}
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="p-6 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-orange-50 rounded-xl">
                  <Wallet className="w-6 h-6 text-orange-600" />
               </div>
               <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">Financial Registry</CardTitle>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-slate-50 border-none rounded-lg font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-none">
                    <TableHead className="font-bold text-slate-500 text-[10px] uppercase tracking-widest px-6">Scheme / Year</TableHead>
                    <TableHead className="text-right font-bold text-slate-500 text-[10px] uppercase tracking-widest px-6">Opening (A)</TableHead>
                    <TableHead className="text-right font-bold text-slate-500 text-[10px] uppercase tracking-widest px-6">Receipts (B+C)</TableHead>
                    <TableHead className="text-right font-bold text-slate-500 text-[10px] uppercase tracking-widest px-6">Exp (D)</TableHead>
                    <TableHead className="text-right font-bold text-orange-600 text-[10px] uppercase tracking-widest px-6 bg-orange-50/30">Unspent Bal</TableHead>
                    <TableHead className="text-right font-bold text-slate-500 text-[10px] uppercase tracking-widest px-6 w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFunds?.map((fund) => (
                    <TableRow key={fund.id} className="hover:bg-slate-50/50 group border-b border-slate-50">
                      <TableCell className="px-6 py-4">
                         <div className="font-bold text-slate-800">{fund.schemeName}</div>
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{fund.year}</div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                         <div className="font-bold text-slate-700">₹{fund.openingBalanceTotal.toLocaleString()}</div>
                         <div className="text-[10px] text-slate-400">T:₹{fund.openingBalanceTied.toLocaleString()} | U:₹{fund.openingBalanceUntied.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                         <div className="font-bold text-blue-700">₹{(fund.directReceiptTotal + fund.autoReceiptTotal).toLocaleString()}</div>
                         <div className="text-[10px] text-blue-400">T:₹{(fund.directReceiptTied + fund.autoReceiptTied).toLocaleString()} | U:₹{(fund.directReceiptUntied + fund.autoReceiptUntied).toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-right px-6">
                         <div className="font-bold text-red-600">₹{fund.expenditureTotal.toLocaleString()}</div>
                         <div className="text-[10px] text-red-400">T:₹{fund.expenditureTied.toLocaleString()} | U:₹{fund.expenditureUntied.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-right px-6 bg-orange-50/30">
                         <div className="font-black text-orange-700 text-lg">₹{fund.unspentBalanceTotal.toLocaleString()}</div>
                         <div className="text-[9px] text-orange-500 font-bold">T:₹{fund.unspentBalanceTied.toLocaleString()} | U:₹{fund.unspentBalanceUntied.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Add Expenditure"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setEditingFund(fund);
                              setExpenditureData({ newTied: 0, newUntied: 0 });
                              setIsExpenditureDialogOpen(true);
                            }}
                          >
                            <TrendingDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Record"
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              setEditingFund(fund);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Record"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (confirm("Delete this record?")) deleteMutation.mutate(fund.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
