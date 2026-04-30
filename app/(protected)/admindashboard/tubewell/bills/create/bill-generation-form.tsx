"use client";

import { useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { generateBill } from "@/action/tubewell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Receipt,
  Save,
  ArrowLeft,
  User,
  Wrench,
  IndianRupee,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PageHeader } from "../../_components/page-header";

const billSchema = z.object({
  mistriId: z.string().min(1, "Please select a mistri"),
  orderIds: z.array(z.string()).min(1, "Please select at least one work order"),
});

type BillFormValues = z.infer<typeof billSchema>;

export default function BillGenerationForm({
  mistris,
  workOrders,
  initialOrderId,
}: {
  mistris: any[];
  workOrders: any[];
  initialOrderId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialMistriId = useMemo(() => {
    if (!initialOrderId) return "";
    const order = workOrders.find((wo) => wo.id === initialOrderId);
    return order?.mistriId || "";
  }, [initialOrderId, workOrders]);

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      mistriId: initialMistriId,
      orderIds: initialOrderId ? [initialOrderId] : [],
    },
  });

  const mistriId = form.watch("mistriId");
  const selectedOrderIds = form.watch("orderIds");

  // Filter work orders for the selected mistri
  const mistriOrders = useMemo(() => {
    return workOrders.filter((wo) => String(wo.mistriId) === String(mistriId));
  }, [mistriId, workOrders]);

  const selectedOrders = useMemo(() => {
    return workOrders.filter((wo) => selectedOrderIds.includes(wo.id));
  }, [selectedOrderIds, workOrders]);

  const onSubmit = (data: BillFormValues) => {
    startTransition(async () => {
      try {
        await generateBill(data.orderIds);

        toast.success(
          `${data.orderIds.length} Work Order(s) billed successfully!`,
        );
        router.push("/admindashboard/tubewell/bills");
      } catch (error: any) {
        toast.error(error.message || "Failed to generate bill.");
      }
    });
  };

  const toggleOrder = (id: string) => {
    const current = form.getValues("orderIds");
    if (current.includes(id)) {
      form.setValue(
        "orderIds",
        current.filter((oid) => oid !== id),
      );
    } else {
      form.setValue("orderIds", [...current, id]);
    }
  };

  const totalMusti = selectedOrders.reduce(
    (sum, wo) => sum + wo.mustiAmount,
    0,
  );
  const totalMaterials = selectedOrders.reduce(
    (sum, wo) =>
      sum +
      wo.materials.reduce(
        (mSum: number, m: any) => mSum + m.quantity * m.rate,
        0,
      ),
    0,
  );
  const totalMasterRoll = selectedOrders.reduce(
    (sum, wo) =>
      sum +
      (wo.masterRollEntries?.reduce(
        (mrSum: number, mr: any) => mrSum + mr.total,
        0,
      ) || 0),
    0,
  );
  const grandTotal = totalMusti + totalMaterials + totalMasterRoll;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
        <PageHeader
          title="Batch Generate Bills"
          description="Select a mistri to see all completed orders and generate bills in one go."
          icon="Receipt"
        >
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild className="rounded-xl h-12 px-6">
              <Link href="/admindashboard/tubewell/bills">Cancel</Link>
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isPending || selectedOrderIds.length === 0}
              className="rounded-xl px-10 h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 gap-2"
            >
              <Save className="h-5 w-5" />
              {isPending ? "Generating..." : "Generate Bills"}
            </Button>
          </div>
        </PageHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* SELECTION PANEL */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="rounded-3xl border shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                    <CardTitle className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
                      Select Mistri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <FormField
                      control={form.control}
                      name="mistriId"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">
                            Choose Mistri{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              disabled={isPending}
                              onChange={(e) => {
                                field.onChange(e);
                                form.setValue("orderIds", []); // Clear selection when mistri changes
                              }}
                              className="w-full border-slate-200 rounded-2xl h-14 px-5 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white shadow-sm font-medium text-slate-700"
                            >
                              <option value="">-- Select Mistri --</option>
                              {mistris.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {mistriId && (
                  <Card className="rounded-3xl border shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                      <CardTitle className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-sky-500 rounded-full"></div>
                        Available Work Orders
                      </CardTitle>
                      <CardDescription className="font-medium text-slate-500">
                        {mistriOrders.length} completed orders found for this
                        mistri.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                        {mistriOrders.map((wo) => (
                          <div
                            key={wo.id}
                            className={`p-5 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${selectedOrderIds.includes(wo.id) ? "bg-indigo-50/50" : ""}`}
                            onClick={() => toggleOrder(wo.id)}
                          >
                            <div
                              className={`w-6 h-6 mt-1 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${selectedOrderIds.includes(wo.id) ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"}`}
                            >
                              {selectedOrderIds.includes(wo.id) && (
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center gap-2">
                                <p className="font-bold text-slate-800 truncate">
                                  {wo.orderNumber}
                                </p>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] h-5 bg-white border-slate-200 font-bold uppercase tracking-wider text-slate-500"
                                >
                                  {wo.completionDate
                                    ? format(
                                        new Date(wo.completionDate),
                                        "dd MMM yy",
                                      )
                                    : "N/A"}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 truncate font-medium">
                                {wo.request?.citizenName} -{" "}
                                {wo.request?.address}
                              </p>
                              <div className="flex justify-between items-center mt-3">
                                <span className="text-xs font-black text-indigo-600">
                                  ₹ {wo.mustiAmount.toFixed(2)} Labor
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {wo.materials.length} Items
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    {mistriOrders.length > 0 && (
                      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="font-bold text-xs uppercase tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl"
                          onClick={() =>
                            form.setValue(
                              "orderIds",
                              mistriOrders.map((o) => o.id),
                            )
                          }
                        >
                          Select All
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                          onClick={() => form.setValue("orderIds", [])}
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </Card>
                )}
              </div>

              {/* SUMMARY PANEL */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="rounded-3xl border shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
                  <CardHeader className="bg-slate-900 px-8 py-6">
                    <CardTitle className="text-white text-xl font-bold flex items-center justify-between">
                      <span>Batch Summary</span>
                      <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                        {selectedOrderIds.length} orders
                      </span>
                    </CardTitle>
                    <CardDescription className="text-slate-400 font-medium">
                      Selected orders for official bill generation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 p-8 space-y-8">
                    {selectedOrders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl opacity-50 bg-slate-50/30">
                        <Receipt className="h-12 w-12 mb-4 text-slate-300" />
                        <p className="text-slate-500 font-medium max-w-xs mx-auto">
                          No orders selected. Choose a mistri and select
                          completed assignments to continue.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* List of selected items */}
                        <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                          {selectedOrders.map((wo) => {
                            const matTotal = wo.materials.reduce(
                              (sum: number, m: any) =>
                                sum + m.quantity * m.rate,
                              0,
                            );
                            const mrTotal =
                              wo.masterRollEntries?.reduce(
                                (sum: number, mr: any) => sum + mr.total,
                                0,
                              ) || 0;
                            const total = wo.mustiAmount + matTotal + mrTotal;

                            return (
                              <div
                                key={wo.id}
                                className="p-5 bg-white flex justify-between items-center group hover:bg-slate-50 transition-colors"
                              >
                                <div>
                                  <p className="font-bold text-slate-800">
                                    {wo.orderNumber}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    {wo.request?.citizenName}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-slate-900">
                                    ₹ {total.toLocaleString("en-IN")}
                                  </p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                    Mat: {matTotal.toFixed(0)} | Lab:{" "}
                                    {wo.mustiAmount.toFixed(0)} | Rep:{" "}
                                    {mrTotal.toFixed(0)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Totals */}
                        <div className="bg-slate-50 p-8 rounded-3xl space-y-5 border border-slate-100">
                          <div className="flex justify-between text-sm font-bold">
                            <span className="text-slate-500 uppercase tracking-widest">
                              Fixed Labor (Musti):
                            </span>
                            <span className="text-slate-900">
                              ₹ {totalMusti.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-bold">
                            <span className="text-slate-500 uppercase tracking-widest">
                              Material Cost:
                            </span>
                            <span className="text-slate-900">
                              ₹ {totalMaterials.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-bold">
                            <span className="text-slate-500 uppercase tracking-widest">
                              Repair (Master Roll):
                            </span>
                            <span className="text-slate-900">
                              ₹ {totalMasterRoll.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                            <span className="font-black text-xl flex items-center gap-3 text-slate-900">
                              <div className="p-2 bg-indigo-600 rounded-lg">
                                <IndianRupee className="h-5 w-5 text-white" />
                              </div>
                              Net Total
                            </span>
                            <span className="font-black text-3xl text-indigo-600">
                              ₹ {grandTotal.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      asChild
                      className="rounded-xl h-12 px-8 font-bold"
                    >
                      <Link href="/admindashboard/tubewell/bills">Cancel</Link>
                    </Button>
                    <Button
                      type="submit"
                      disabled={selectedOrders.length === 0 || isPending}
                      className="rounded-xl h-12 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-300 disabled:shadow-none gap-2"
                    >
                      <Save className="h-5 w-5" />
                      {isPending
                        ? "Generating..."
                        : `Generate ${selectedOrders.length} Bills`}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
