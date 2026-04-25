"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createWorkOrder } from "@/action/tubewell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mistri, TubewellRepairRequest, TubewellMaterial } from "@prisma/client";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

type MaterialItem = {
  materialId: string;
  name: string;
  rate: number;
  quantity: number;
  unit: string;
};

export default function WorkOrderForm({
  requests,
  mistris,
  materials,
  initialReqId,
}: {
  requests: TubewellRepairRequest[];
  mistris: Mistri[];
  materials: TubewellMaterial[];
  initialReqId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [reqId, setReqId] = useState(initialReqId || "");
  const [mistriId, setMistriId] = useState("");
  const [items, setItems] = useState<MaterialItem[]>([]);

  // ✅ toggle material
  const toggleMaterial = (m: TubewellMaterial) => {
    if (m.stock === 0) {
      toast.error("Material out of stock");
      return;
    }

    setItems((prev) => {
      const exists = prev.find((i) => i.materialId === m.id);
      if (exists) return prev.filter((i) => i.materialId !== m.id);

      return [
        ...prev,
        {
          materialId: m.id,
          name: m.name,
          rate: m.rate,
          quantity: 1,
          unit: m.unit,
        },
      ];
    });
  };

  // ✅ qty update with stock control
  const updateQty = (id: string, q: number) => {
    const material = materials.find((m) => m.id === id);
    if (!material) return;
    if (q <= 0) return;

    if (q > material.stock) {
      toast.error(`Only ${material.stock} available`);
      q = material.stock;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.materialId === id ? { ...i, quantity: q } : i
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.materialId !== id));
  };

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.rate * i.quantity, 0),
    [items]
  );

  const submit = () => {
    if (!mistriId) return toast.error("Select mistri");
    if (items.length === 0) return toast.error("Select materials");

    startTransition(async () => {
      try {
        await createWorkOrder({
          requestId: reqId || undefined,
          mistriId,
          materials: items.map((i) => ({
            materialId: i.materialId,
            quantity: i.quantity,
            rate: i.rate,
          })),
        });

        toast.success("Work Order Issued Successfully");
        router.push("/admindashboard/tubewell/work-orders");
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 px-4 sm:px-6 lg:px-8 pt-8 bg-[#f8fafc] min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-4">
          <Button size="icon" variant="ghost" asChild className="rounded-full hover:bg-slate-100 transition-colors">
            <Link href="/admindashboard/tubewell/work-orders">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Issue Work Order</h1>
            <p className="text-slate-500 mt-1 font-medium italic">Assignment and material allocation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
           <Button
            onClick={submit}
            disabled={isPending}
            className="w-full md:w-auto rounded-xl px-10 h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 gap-2"
          >
            {isPending ? "Issuing..." : "Issue Work Order"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* ASSIGNMENT */}
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                Assignment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Reference Request</label>
                <select
                  value={reqId}
                  onChange={(e) => setReqId(e.target.value)}
                  className="w-full border-slate-200 rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white shadow-sm font-medium text-slate-700"
                >
                  <option value="">Direct Work Order (No Request)</option>
                  {requests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.citizenName} - {r.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Assigned Mistri</label>
                <select
                  value={mistriId}
                  onChange={(e) => setMistriId(e.target.value)}
                  className="w-full border-slate-200 rounded-xl h-12 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white shadow-sm font-medium text-slate-700"
                >
                  <option value="">-- Select Mistri / Mechanic --</option>
                  {mistris.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* MATERIAL GRID */}
          <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
              <CardTitle className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
                Select Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {materials.map((m) => {
                  const selected = items.some((i) => i.materialId === m.id);

                  return (
                    <div
                      key={m.id}
                      onClick={() => m.stock !== 0 && toggleMaterial(m)}
                      className={`group border rounded-2xl p-4 transition-all duration-200 relative overflow-hidden
                      ${
                        m.stock === 0
                          ? "bg-slate-50 border-slate-200 cursor-not-allowed opacity-60"
                          : selected
                            ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 shadow-md shadow-indigo-100"
                            : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 cursor-pointer"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className={`font-bold tracking-tight ${selected ? "text-indigo-900" : "text-slate-800"}`}>{m.name}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}>
                           {selected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 relative z-10">
                         <span className={`text-[11px] font-bold uppercase tracking-widest ${selected ? "text-indigo-600" : "text-slate-400"}`}>
                            Stock: <span className={m.stock === 0 ? "text-rose-600" : ""}>{m.stock} {m.unit}</span>
                         </span>
                         <span className="text-xs font-bold text-slate-700">₹{m.rate}</span>
                      </div>

                      {selected && (
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-indigo-100/50 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* SELECTED ITEMS / CART */}
          <Card className="rounded-2xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden sticky top-8">
            <CardHeader className="bg-slate-900 px-6 py-4">
              <CardTitle className="text-white text-lg font-bold flex items-center justify-between">
                <span>Work Order Summary</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono">{items.length} items</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium px-4 italic border-2 border-dashed border-slate-100 rounded-xl">
                    No materials selected. <br/>Click cards to add.
                  </div>
                ) : (
                  items.map((i) => (
                    <div key={i.materialId} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-sm truncate">{i.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">₹{i.rate} / {i.unit}</div>
                      </div>
                      
                      <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                        <input
                          type="number"
                          value={i.quantity}
                          onChange={(e) => updateQty(i.materialId, Number(e.target.value))}
                          className="w-12 h-8 bg-transparent text-center font-bold text-slate-700 focus:outline-none"
                        />
                      </div>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(i.materialId)}
                        className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total Material Value</span>
                  <span className="text-xl font-black text-slate-900">₹{total.toLocaleString("en-IN")}</span>
                </div>
                
                <Button
                  onClick={submit}
                  disabled={isPending || items.length === 0}
                  className="w-full rounded-xl h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isPending ? "Issuing..." : "Confirm & Issue Order"}
                </Button>
                
                <p className="text-[10px] text-center text-slate-400 font-medium italic">Stock will be automatically deducted upon confirmation.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
