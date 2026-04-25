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
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
    return workOrders.filter(
      (wo) => String(wo.mistriId) === String(mistriId),
    );
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admindashboard/tubewell/bills">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Batch Generate Mustors (Bills)
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a mistri to see all completed orders and generate bills in
            one go.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SELECTION PANEL */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Select Mistri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="mistriId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Choose Mistri <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            disabled={isPending}
                            onChange={(e) => {
                              field.onChange(e);
                              form.setValue("orderIds", []); // Clear selection when mistri changes
                            }}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-primary" />
                      Available Work Orders
                    </CardTitle>
                    <CardDescription>
                      {mistriOrders.length} completed orders found for this
                      mistri.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-y-auto divide-y">
                      {mistriOrders.map((wo) => (
                        <div
                          key={wo.id}
                          className={`p-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-muted/50 ${selectedOrderIds.includes(wo.id) ? "bg-primary/5" : ""}`}
                          onClick={() => toggleOrder(wo.id)}
                        >
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selectedOrderIds.includes(wo.id)}
                            readOnly
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center gap-2">
                              <p className="font-semibold text-sm truncate">
                                {wo.orderNumber}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5"
                              >
                                {wo.completionDate
                                  ? format(
                                      new Date(wo.completionDate),
                                      "dd MMM yy",
                                    )
                                  : "N/A"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {wo.request?.citizenName} - {wo.request?.address}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[10px] font-bold text-primary">
                                ₹ {wo.mustiAmount.toFixed(2)} Labor
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {wo.materials.length} Items |{" "}
                                {wo.masterRollEntries?.length || 0} repairs
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  {mistriOrders.length > 0 && (
                    <div className="p-4 bg-muted/30 border-t flex justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
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
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    Batch Summary
                  </CardTitle>
                  <CardDescription>
                    {selectedOrderIds.length} orders selected for bill
                    generation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  {selectedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl opacity-50">
                      <Receipt className="h-10 w-10 mb-2" />
                      <p className="text-sm">
                        No orders selected.
                        <br />
                        Choose a mistri and select orders from the list.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* List of selected items */}
                      <div className="border rounded-xl overflow-hidden divide-y">
                        {selectedOrders.map((wo) => {
                          const matTotal = wo.materials.reduce(
                            (sum: number, m: any) => sum + m.quantity * m.rate,
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
                              className="p-4 bg-muted/10 flex justify-between items-center text-sm"
                            >
                              <div>
                                <p className="font-semibold">
                                  {wo.orderNumber}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {wo.request?.citizenName}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  ₹ {total.toFixed(2)}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  M: {matTotal.toFixed(0)} | L:{" "}
                                  {wo.mustiAmount.toFixed(0)} | R:{" "}
                                  {mrTotal.toFixed(0)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Totals */}
                      <div className="bg-primary/5 p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Fixed Labor (Musti):
                          </span>
                          <span className="font-medium">
                            ₹ {totalMusti.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Material Cost:
                          </span>
                          <span className="font-medium">
                            ₹ {totalMaterials.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Master Roll (Repair) Cost:
                          </span>
                          <span className="font-medium">
                            ₹ {totalMasterRoll.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-primary/20">
                          <span className="font-bold text-lg flex items-center gap-2">
                            <IndianRupee className="h-5 w-5 text-primary" /> Net
                            Total
                          </span>
                          <span className="font-bold text-2xl text-primary">
                            ₹ {grandTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <div className="p-6 border-t flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    disabled={isPending}
                  >
                    <Link href="/admindashboard/tubewell/bills">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={selectedOrders.length === 0 || isPending}
                    className="gap-2 min-w-[180px]"
                  >
                    <Save className="h-4 w-4" />
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
  );
}
