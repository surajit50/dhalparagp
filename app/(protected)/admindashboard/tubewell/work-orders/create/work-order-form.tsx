"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createWorkOrder } from "@/action/tubewell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Mistri,
  TubewellRepairRequest,
  TubewellMaterial,
} from "@prisma/client";
import { ArrowLeft, Trash2, Settings2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "../../_components/page-header";

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
      prev.map((i) => (i.materialId === id ? { ...i, quantity: q } : i)),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.materialId !== id));
  };

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.rate * i.quantity, 0),
    [items],
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
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
        <PageHeader
          title="Issue Work Order"
          description="Assignment and material allocation for tubewell repairs."
          icon="Settings2"
        >
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild className="rounded-xl h-12 px-6">
              <Link href="/admindashboard/tubewell/work-orders">Cancel</Link>
            </Button>
            <Button
              onClick={submit}
              disabled={isPending}
              className="rounded-xl px-10 h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 gap-2"
            >
              {isPending ? "Issuing..." : "Issue Work Order"}
            </Button>
          </div>
        </PageHeader>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* ASSIGNMENT */}
            <Card className="rounded-3xl border shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                    Reference Request
                  </label>
                  <select
                    value={reqId}
                    onChange={(e) => setReqId(e.target.value)}
                    className="w-full border-slate-200 rounded-2xl h-14 px-5 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white shadow-sm font-medium text-slate-700"
                  >
                    <option value="">Direct Work Order (No Request)</option>
                    {requests.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.citizenName} - {r.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                    Assigned Mistri
                  </label>
                  <select
                    value={mistriId}
                    onChange={(e) => setMistriId(e.target.value)}
                    className="w-full border-slate-200 rounded-2xl h-14 px-5 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white shadow-sm font-medium text-slate-700"
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
            <Card className="rounded-3xl border shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-sky-500 rounded-full"></div>
                  Select Materials
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {materials.map((m) => {
                    const selected = items.some((i) => i.materialId === m.id);

                    return (
                      <div
                        key={m.id}
                        onClick={() => m.stock !== 0 && toggleMaterial(m)}
                        className={`group border rounded-2xl p-5 transition-all duration-300 relative overflow-hidden
                        ${
                          m.stock === 0
                            ? "bg-slate-50 border-slate-200 cursor-not-allowed opacity-60"
                            : selected
                              ? "bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-100/50"
                              : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 cursor-pointer hover:shadow-md"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <span
                            className={`font-bold text-lg tracking-tight ${selected ? "text-indigo-900" : "text-slate-800"}`}
                          >
                            {m.name}
                          </span>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${selected ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}
                          >
                            {selected && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 relative z-10">
                          <div className="flex flex-col">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-widest ${selected ? "text-indigo-600" : "text-slate-400"}`}
                            >
                              Stock
                            </span>
                            <span
                              className={`font-bold ${m.stock === 0 ? "text-rose-600" : "text-slate-700"}`}
                            >
                              {m.stock} {m.unit}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Rate
                            </span>
                            <span className="font-bold text-slate-700">
                              ₹{m.rate}
                            </span>
                          </div>
                        </div>

                        {selected && (
                          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-100/30 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
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
            <Card className="rounded-3xl border shadow-xl shadow-slate-200/50 overflow-hidden sticky top-8">
              <CardHeader className="bg-slate-900 px-8 py-6">
                <CardTitle className="text-white text-xl font-bold flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                    {items.length} items
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[450px] overflow-y-auto p-6 space-y-4">
                  {items.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 font-medium px-6 italic border-2 border-dashed border-slate-100 rounded-3xl">
                      No materials selected. <br />
                      Click cards to add.
                    </div>
                  ) : (
                    items.map((i) => (
                      <div
                        key={i.materialId}
                        className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all duration-200 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 truncate">
                            {i.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            ₹{i.rate} / {i.unit}
                          </div>
                        </div>

                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                          <input
                            type="number"
                            value={i.quantity}
                            onChange={(e) =>
                              updateQty(i.materialId, Number(e.target.value))
                            }
                            className="w-14 h-10 bg-transparent text-center font-bold text-slate-800 focus:outline-none"
                          />
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeItem(i.materialId)}
                          className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                      Total Estimated Cost
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <Button
                    onClick={submit}
                    disabled={isPending || items.length === 0}
                    className="w-full rounded-2xl h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none"
                  >
                    {isPending ? "Issuing..." : "Confirm & Issue Order"}
                  </Button>

                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Inventory will update automatically
                    </p>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
