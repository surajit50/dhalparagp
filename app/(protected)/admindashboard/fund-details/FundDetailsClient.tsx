"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus, Pencil, Trash2, Loader2, Search, Wallet, Calculator, Coins, Landmark, ArrowRightLeft, TrendingDown, Info, X, CheckCircle2, ShieldCheck, AlertCircle, PlusCircle, ShieldAlert, MinusCircle } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  availableBalanceTied: number;
  availableBalanceUntied: number;
  availableBalanceTotal: number;
  securityHeldTied: number;
  securityHeldUntied: number;
  securityHeldTotal: number;
}

export default function FundDetailsClient() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExpenditureDialogOpen, setIsExpenditureDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
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

  const [receiptData, setReceiptData] = useState({
    newTied: 0,
    newUntied: 0,
    isAuto: false,
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
      setIsReceiptDialogOpen(false);
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

  const handleReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFund) return;
    const updatedData = { ...editingFund };
    if (receiptData.isAuto) {
      updatedData.autoReceiptTied = editingFund.autoReceiptTied + receiptData.newTied;
      updatedData.autoReceiptUntied = editingFund.autoReceiptUntied + receiptData.newUntied;
    } else {
      updatedData.directReceiptTied = editingFund.directReceiptTied + receiptData.newTied;
      updatedData.directReceiptUntied = editingFund.directReceiptUntied + receiptData.newUntied;
    }
    updateMutation.mutate(updatedData);
  };

  const liveSummary = useMemo(() => {
    const grossTied = (formData.openingBalanceTied + formData.directReceiptTied + formData.autoReceiptTied) - formData.expenditureTied;
    const grossUntied = (formData.openingBalanceUntied + formData.directReceiptUntied + formData.autoReceiptUntied) - formData.expenditureUntied;
    
    // Deduct Security Money from editing record
    const secTied = editingFund?.securityHeldTied || 0;
    const secUntied = editingFund?.securityHeldUntied || 0;
    
    return {
      grossTied,
      grossUntied,
      grossTotal: grossTied + grossUntied,
      secTied,
      secUntied,
      secTotal: secTied + secUntied,
      netTied: grossTied - secTied,
      netUntied: grossUntied - secUntied,
      netTotal: (grossTied + grossUntied) - (secTied + secUntied)
    };
  }, [formData, editingFund]);

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

  const schemeOptions = useMemo(() => {
    const defaults = ["15th CFC", "5th SFC", "Own Fund", "MGNREGS", "HBM", "SBM", "PBSS", "ICDS", "BEUP", "MPLAD"];
    const existing = funds?.map(f => f.schemeName) || [];
    return Array.from(new Set([...defaults, ...existing])).sort();
  }, [funds]);

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#fafafa]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fund Registry</h1>
          <p className="text-slate-500 font-medium mt-1">Comprehensive tracking of GP financial resources and project liquidity.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-orange-100 flex gap-2 h-auto transition-all hover:scale-[1.02]">
              <Plus size={20} /> Add New Entry
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
                        {editingFund ? "Update Financial Record" : "New Financial Entry"}
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
                           <Select 
                              value={formData.schemeName} 
                              onValueChange={(val) => handleInputChange("schemeName", val)}
                           >
                              <SelectTrigger className="h-12 bg-white border-slate-200 rounded-lg font-semibold">
                                 <SelectValue placeholder="Select a scheme" />
                              </SelectTrigger>
                              <SelectContent>
                                 {schemeOptions.map((scheme) => (
                                    <SelectItem key={scheme} value={scheme} className="font-medium">
                                       {scheme}
                                    </SelectItem>
                                 ))}
                                 <SelectItem value="Other" className="text-orange-600 font-bold italic">
                                    + Add Other Scheme
                                 </SelectItem>
                              </SelectContent>
                           </Select>
                           {formData.schemeName === "Other" && (
                              <Input 
                                 placeholder="Enter scheme name..." 
                                 className="mt-2 h-10 border-orange-200 focus:ring-orange-500"
                                 onChange={(e) => handleInputChange("schemeName", e.target.value)}
                                 autoFocus
                              />
                           )}
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
                                    ₹{(formData.expenditureTied + formData.expenditureUntied).toLocaleString()}
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>

                     {/* Enhanced Live Summary Footer */}
                     <div className="bg-slate-900 rounded-2xl p-8 text-white space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-orange-600 rounded-xl shadow-lg">
                                 <Calculator size={24} />
                              </div>
                              <div>
                                 <p className="text-lg font-black tracking-tight">Net Liquidity Preview</p>
                                 <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Formula: [Unspent - Security Money]</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Gross Unspent</p>
                              <p className="text-xl font-bold tabular-nums">₹{liveSummary.grossTotal.toLocaleString()}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                           <div className="space-y-4">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tied Fund Breakdown</p>
                              <div className="space-y-2">
                                 <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Gross Unspent</span>
                                    <span className="font-bold">₹{liveSummary.grossTied.toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between text-xs text-red-400">
                                    <span className="flex items-center gap-1"><MinusCircle size={10} /> Security Deduction</span>
                                    <span className="font-bold">-₹{liveSummary.secTied.toLocaleString()}</span>
                                 </div>
                                 <div className="pt-2 border-t border-slate-800 flex justify-between">
                                    <span className="text-[10px] font-black uppercase text-orange-400">Net Tied</span>
                                    <span className={cn("text-lg font-black tabular-nums", liveSummary.netTied < 0 ? "text-red-500" : "text-white")}>
                                       ₹{liveSummary.netTied.toLocaleString()}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-4 border-l border-slate-800 pl-8">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Untied Fund Breakdown</p>
                              <div className="space-y-2">
                                 <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Gross Unspent</span>
                                    <span className="font-bold">₹{liveSummary.grossUntied.toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between text-xs text-red-400">
                                    <span className="flex items-center gap-1"><MinusCircle size={10} /> Security Deduction</span>
                                    <span className="font-bold">-₹{liveSummary.secUntied.toLocaleString()}</span>
                                 </div>
                                 <div className="pt-2 border-t border-slate-800 flex justify-between">
                                    <span className="text-[10px] font-black uppercase text-orange-400">Net Untied</span>
                                    <span className={cn("text-lg font-black tabular-nums", liveSummary.netUntied < 0 ? "text-red-500" : "text-white")}>
                                       ₹{liveSummary.netUntied.toLocaleString()}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="bg-orange-600/10 rounded-2xl p-6 border border-orange-600/20 flex flex-col justify-center items-center text-center">
                              <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2">Final Net Available</p>
                              <p className="text-3xl font-black text-white tabular-nums tracking-tighter">
                                 ₹{liveSummary.netTotal.toLocaleString()}
                              </p>
                              <div className="mt-3 px-3 py-1 bg-orange-600 rounded-full text-[9px] font-black uppercase">
                                 Spendable Liquidity
                              </div>
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
                     className="bg-orange-600 hover:bg-orange-700 text-white px-10 rounded-lg font-black h-11 shadow-lg shadow-orange-100 transition-all active:scale-95"
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

      {/* Add Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <div className="bg-white">
            <div className="p-6 border-b border-slate-100 bg-blue-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <PlusCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-800">Add New Fund/Receipt</DialogTitle>
                  <p className="text-xs text-slate-500 font-medium">{editingFund?.schemeName}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsReceiptDialogOpen(false)} className="rounded-full">
                <X size={20} />
              </Button>
            </div>
            <form onSubmit={handleReceiptSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                 <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg mb-4">
                    <Button 
                      type="button"
                      variant={!receiptData.isAuto ? "default" : "ghost"}
                      className={cn("flex-1 text-xs font-bold uppercase", !receiptData.isAuto && "bg-blue-600")}
                      onClick={() => setReceiptData(p => ({...p, isAuto: false}))}
                    >Direct Receipt</Button>
                    <Button 
                      type="button"
                      variant={receiptData.isAuto ? "default" : "ghost"}
                      className={cn("flex-1 text-xs font-bold uppercase", receiptData.isAuto && "bg-indigo-600")}
                      onClick={() => setReceiptData(p => ({...p, isAuto: true}))}
                    >Auto Receipt</Button>
                 </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase">Tied Amount</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    autoFocus
                    placeholder="0.00" 
                    onChange={(e) => setReceiptData(prev => ({ ...prev, newTied: parseFloat(e.target.value) || 0 }))}
                    className="h-12 font-bold text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase">Untied Amount</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    onChange={(e) => setReceiptData(prev => ({ ...prev, newUntied: parseFloat(e.target.value) || 0 }))}
                    className="h-12 font-bold text-lg"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  This will be added to the current {receiptData.isAuto ? "Auto" : "Direct"} receipts for this scheme.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setIsReceiptDialogOpen(false)} className="font-bold text-slate-400">Cancel</Button>
                <Button type="submit" className={cn("text-white font-black px-8 rounded-lg h-11 transition-all active:scale-95", receiptData.isAuto ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100")} disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Funds
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

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
                  <DialogTitle className="text-xl font-bold text-slate-800">Add New Expenditure</DialogTitle>
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
                  <Label className="text-xs font-bold text-slate-400 uppercase">Tied Exp. Amount</Label>
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
                  <Label className="text-xs font-bold text-slate-400 uppercase">Untied Exp. Amount</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    onChange={(e) => setExpenditureData(prev => ({ ...prev, newUntied: parseFloat(e.target.value) || 0 }))}
                    className="h-12 font-bold text-lg"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-red-500 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  This will be added to the current expenditure total for this scheme.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={() => setIsExpenditureDialogOpen(false)} className="font-bold text-slate-400">Cancel</Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-black px-8 rounded-lg h-11 transition-all active:scale-95 shadow-lg shadow-red-100" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Commit Expenditure
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Table */}
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="p-6 border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-orange-50 rounded-xl">
                  <Wallet className="w-6 h-6 text-orange-600" />
               </div>
               <div>
                  <CardTitle className="text-xl font-bold text-slate-800 tracking-tight">Scheme Financial Registry</CardTitle>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real-time Accounting Flow</p>
               </div>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <Input
                placeholder="Search by scheme or financial year..."
                className="pl-11 bg-slate-50 border-none rounded-xl font-medium h-11 focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">Syncing Registry...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[1200px]">
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-none">
                    <TableHead className="font-bold text-slate-500 text-[9px] uppercase tracking-widest px-6 h-14">Scheme / Year</TableHead>
                    <TableHead className="text-right font-bold text-slate-500 text-[9px] uppercase tracking-widest px-4 h-14">A: Opening</TableHead>
                    <TableHead className="text-right font-bold text-blue-500 text-[9px] uppercase tracking-widest px-4 h-14">B+C: Receipts</TableHead>
                    <TableHead className="text-right font-bold text-red-500 text-[9px] uppercase tracking-widest px-4 h-14">D: Exp.</TableHead>
                    <TableHead className="text-right font-bold text-slate-600 text-[9px] uppercase tracking-widest px-4 h-14 bg-slate-100/50">Gross Unspent</TableHead>
                    <TableHead className="text-right font-bold text-slate-400 text-[9px] uppercase tracking-widest px-4 h-14">Security Money</TableHead>
                    <TableHead className="text-right font-bold text-orange-600 text-[10px] uppercase tracking-widest px-8 h-14 bg-orange-50/50">Net Available</TableHead>
                    <TableHead className="text-center font-bold text-slate-500 text-[9px] uppercase tracking-widest px-6 h-14 w-[160px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFunds?.map((fund) => (
                    <TableRow key={fund.id} className="hover:bg-slate-50/50 group border-b border-slate-50 transition-colors">
                      <TableCell className="px-6 py-5">
                         <div className="font-black text-slate-800 tracking-tight">{fund.schemeName}</div>
                         <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{fund.year}</div>
                      </TableCell>
                      <TableCell className="text-right px-4">
                         <div className="font-bold text-slate-700">₹{fund.openingBalanceTotal.toLocaleString()}</div>
                         <div className="text-[8px] text-slate-400">T:₹{fund.openingBalanceTied.toLocaleString()} | U:₹{fund.openingBalanceUntied.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-right px-4">
                         <div className="font-bold text-blue-700">₹{(fund.directReceiptTotal + fund.autoReceiptTotal).toLocaleString()}</div>
                         <div className="text-[8px] text-blue-400">T:₹{(fund.directReceiptTied + fund.autoReceiptTied).toLocaleString()} | U:₹{(fund.directReceiptUntied + fund.autoReceiptUntied).toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-right px-4">
                         <div className="font-bold text-red-600">₹{fund.expenditureTotal.toLocaleString()}</div>
                         <div className="text-[8px] text-red-400">T:₹{fund.expenditureTied.toLocaleString()} | U:₹{fund.expenditureUntied.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-right px-4 bg-slate-100/20">
                         <div className="font-bold text-slate-800">₹{fund.unspentBalanceTotal.toLocaleString()}</div>
                         <div className="text-[8px] text-slate-400">Bank Balance</div>
                      </TableCell>
                      <TableCell className="text-right px-4">
                         <div className="font-bold text-slate-500">₹{fund.securityHeldTotal.toLocaleString()}</div>
                         <div className="text-[8px] text-slate-400">T:₹{fund.securityHeldTied.toLocaleString()} | U:₹{fund.securityHeldUntied.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="text-right px-8 bg-orange-50/30">
                         <div className="font-black text-orange-700 text-lg">₹{fund.availableBalanceTotal.toLocaleString()}</div>
                         <div className="text-[9px] text-orange-500 font-bold uppercase tracking-tighter">
                            T:₹{fund.availableBalanceTied.toLocaleString()} | U:₹{fund.availableBalanceUntied.toLocaleString()}
                         </div>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 origin-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Add Receipt / Fund"
                            className="h-9 w-9 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            onClick={() => {
                              setEditingFund(fund);
                              setReceiptData({ newTied: 0, newUntied: 0, isAuto: false });
                              setIsReceiptDialogOpen(true);
                            }}
                          >
                            <PlusCircle className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Add Expenditure"
                            className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            onClick={() => {
                              setEditingFund(fund);
                              setExpenditureData({ newTied: 0, newUntied: 0 });
                              setIsExpenditureDialogOpen(true);
                            }}
                          >
                            <TrendingDown className="w-5 h-5" />
                          </Button>
                          <div className="w-[1px] h-6 bg-slate-100 self-center mx-1" />
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Full Record"
                            className="h-9 w-9 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
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
                            title="Delete"
                            className="h-9 w-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            onClick={() => {
                              if (confirm("Permanently delete this financial record?")) deleteMutation.mutate(fund.id);
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
