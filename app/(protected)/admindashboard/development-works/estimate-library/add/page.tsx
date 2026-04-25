"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EstimateType { id: string; name: string; code: string; }
interface SubItem { description: string; unit: string; rate: number; }

export default function AddEstimateItemPage() {
  const router = useRouter();
  const [types, setTypes] = useState<EstimateType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newItem, setNewItem] = useState({
    estimateTypeId: "",
    code: "",
    description: "",
    unit: "m",
    rate: "",
    category: "General",
    isPattern: false,
    pageReference: "",
    chapter: ""
  });

  const [subItems, setSubItems] = useState<SubItem[]>([]);

  useEffect(() => { fetchTypes(); }, []);

  const fetchTypes = async () => {
    setLoading(true);
    const res = await fetch("/api/development-works/estimate-types");
    if (res.ok) {
        const data = await res.json();
        setTypes(data);
        if(data.length > 0) setNewItem(prev => ({ ...prev, estimateTypeId: data[0].id }));
    }
    setLoading(false);
  };

  const addSubItem = () => {
    setSubItems([...subItems, { description: "", unit: "m", rate: 0 }]);
  };

  const removeSubItem = (index: number) => {
    setSubItems(subItems.filter((_, i) => i !== index));
  };

  const updateSubItem = (index: number, field: keyof SubItem, value: any) => {
    const updated = [...subItems];
    updated[index] = { ...updated[index], [field]: value };
    setSubItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.estimateTypeId || !newItem.code || !newItem.description) {
        toast.error("Please fill all required fields");
        return;
    }

    if (subItems.length === 0 && !newItem.rate) {
        toast.error("Please provide a rate or add sub-items");
        return;
    }

    setSubmitting(true);
    try {
        const payload = {
            ...newItem,
            rate: newItem.rate ? Number(newItem.rate) : 0,
            subItems: subItems.length > 0 ? subItems : undefined
        };

        const res = await fetch("/api/development-works/schedule-rates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            toast.success("Item added successfully");
            router.push("/admindashboard/development-works/estimate-library");
        } else {
            const error = await res.json();
            toast.error(error.error || "Failed to add item");
        }
    } catch (error) {
        toast.error("An error occurred");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
            <Link href="/admindashboard/development-works/estimate-library">
                <ArrowLeft className="h-4 w-4" />
            </Link>
        </Button>
        <h1 className="text-2xl font-bold">Add New Library Item</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Item Details</CardTitle></CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Estimate Type</Label>
                    <Select value={newItem.estimateTypeId} onValueChange={(val) => setNewItem({...newItem, estimateTypeId: val})}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                            {types.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Item No. / Code</Label>
                        <Input value={newItem.code} onChange={(e) => setNewItem({...newItem, code: e.target.value})} placeholder="e.g. 12.04" />
                    </div>
                    <div className="space-y-2">
                        <Label>Unit</Label>
                        <Select value={newItem.unit} onValueChange={(val) => setNewItem({...newItem, unit: val})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="m">m</SelectItem>
                                <SelectItem value="sqm">sqm</SelectItem>
                                <SelectItem value="cum">cum</SelectItem>
                                <SelectItem value="no">no</SelectItem>
                                <SelectItem value="each">each</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="ls">ls</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Page No.</Label>
                        <Input value={newItem.pageReference} onChange={(e) => setNewItem({...newItem, pageReference: e.target.value})} placeholder="e.g. 240 / P-12" />
                    </div>
                    <div className="space-y-2">
                        <Label>Chapter / Corrigenda</Label>
                        <Input value={newItem.chapter} onChange={(e) => setNewItem({...newItem, chapter: e.target.value})} placeholder="e.g. 1st Corrigenda" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} placeholder="Item description..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Rate (₹)</Label>
                        <Input type="number" step="0.01" value={newItem.rate} onChange={(e) => setNewItem({...newItem, rate: e.target.value})} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} placeholder="e.g. Earthwork" />
                </div>
            </div>

            <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label>Sub Items</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addSubItem}>
                            <Plus className="h-4 w-4 mr-2" /> Add Sub Item
                        </Button>
                    </div>
                    {subItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-end border p-2 rounded-md">
                            <div className="col-span-6 space-y-1">
                                <Label className="text-xs">Description</Label>
                                <Input value={item.description} onChange={(e) => updateSubItem(index, 'description', e.target.value)} placeholder="Sub item description" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label className="text-xs">Unit</Label>
                                <Input value={item.unit} onChange={(e) => updateSubItem(index, 'unit', e.target.value)} placeholder="Unit" />
                            </div>
                            <div className="col-span-3 space-y-1">
                                <Label className="text-xs">Rate</Label>
                                <Input type="number" step="0.01" value={item.rate} onChange={(e) => updateSubItem(index, 'rate', Number(e.target.value))} placeholder="0.00" />
                            </div>
                            <div className="col-span-1">
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeSubItem(index)} className="text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                <Checkbox 
                    id="isPattern" 
                    checked={newItem.isPattern} 
                    onCheckedChange={(checked) => setNewItem({...newItem, isPattern: checked as boolean})} 
                />
                <Label htmlFor="isPattern">Estimate Pattern Item</Label>
            </div>

            <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admindashboard/development-works/estimate-library">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Item
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
