/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calculator,
  Trash2,
  Edit,
  Save,
  X,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type EstimateItemFormValues } from "@/app/(protected)/admindashboard/work-manage/(estimate_bii)/estimate-preparation/schema";
import {
  EstimateItem,
  SubItem,
  Measurement,
  type GlobalDimensions,
  type DrainParams,
  DRAIN_PARAM_KEYS,
  DRAIN_PARAM_LABELS,
  type DrainParamKey,
} from "@/app/(protected)/admindashboard/work-manage/(estimate_bii)/estimate-preparation/types";

// ========== IMPORTED CALCULATIONS ==========
import { calcQty, COMPACTION_OPTIONS } from "@/lib/calculations";

type CompactionKey = keyof typeof COMPACTION_OPTIONS;

const defaultGlobalDimensions: GlobalDimensions = {
  length: "",
  breadth: "",
  depth: "",
};

interface AddEstimateItemCardProps {
  form: UseFormReturn<EstimateItemFormValues>;
  addItem: (item: EstimateItem) => void;
  estimateExists: boolean;
  isEditing: boolean;
  setItems: (items: EstimateItem[]) => void;
  items: EstimateItem[];
  inDialog?: boolean;
  submitLabel?: string;
  globalDimensions?: GlobalDimensions;
  drainParams?: DrainParams;
}

type FormSubItem = Omit<SubItem, "id"> & {
  id?: string;
};

export default function AddEstimateItemCard({
  form,
  addItem,
  estimateExists,
  isEditing,
  setItems,
  items,
  inDialog = false,
  submitLabel,
  globalDimensions = defaultGlobalDimensions,
  drainParams,
}: AddEstimateItemCardProps) {
  const [meas, setMeas] = useState({
    id: "",
    description: "",
    nos: "1",
    length: "",
    breadth: "",
    depth: "",
  });

  const [subItemForm, setSubItemForm] = useState({
    id: "",
    description: "",
    quantity: "",
    unit: "m",
    rate: "",
    nos: "1",
    length: "0",
    breadth: "0",
    depth: "0",
  });

  const [showSubItemsSection, setShowSubItemsSection] = useState(false);
  const [editingSubItemId, setEditingSubItemId] = useState<string | null>(null);
  const [editingMeasurementId, setEditingMeasurementId] = useState<
    string | null
  >(null);

  const values = form.watch();

  const isCumOrSqm =
    (values.unit || "").toLowerCase() === "cum" ||
    (values.unit || "").toLowerCase() === "sqm";

  const showDrainParamLinks = isCumOrSqm && drainParams && inDialog;
  const measurements = values.measurements || [];
  const subItems = values.subItems || [];

  const hasSubItems = subItems && subItems.length > 0;

  const compactionFactorKey = values.compactionFactor as
    | CompactionKey
    | undefined;
  const compactionFactorValue = compactionFactorKey
    ? COMPACTION_OPTIONS[compactionFactorKey]
    : 1.0;

  useEffect(() => {
    if (hasSubItems) {
      setShowSubItemsSection(true);
    }
  }, [hasSubItems]);

  // ========== MEASUREMENT UTILITIES ==========
  const calculateMeasurementQty = (m: typeof meas, unit: string) => {
    const nos = Number(m.nos) || 0;
    const length = Number(m.length) || 0;
    const breadth = Number(m.breadth) || 0;
    const depth = Number(m.depth) || 0;

    return calcQty(unit, nos, length, breadth, depth, compactionFactorValue);
  };

  const addMeasurement = () => {
    if (!meas.description.trim()) {
      alert("Please enter a description for the measurement");
      return;
    }

    const qty = calculateMeasurementQty(meas, values.unit);

    if (editingMeasurementId) {
      const updatedMeasurements = measurements.map((m: Measurement) =>
        m.id === editingMeasurementId
          ? {
              ...m,
              description: meas.description,
              nos: Number(meas.nos) || 0,
              length: Number(meas.length) || 0,
              breadth: Number(meas.breadth) || 0,
              depth: Number(meas.depth) || 0,
              quantity: qty,
            }
          : m,
      );

      const totalQty = updatedMeasurements.reduce(
        (sum: number, m: Measurement) => sum + m.quantity,
        0,
      );

      form.setValue("measurements", updatedMeasurements);
      form.setValue("quantity", totalQty.toFixed(3));
      setEditingMeasurementId(null);
    } else {
      const newMeasurement: Measurement = {
        id: uuid(),
        description: meas.description,
        nos: Number(meas.nos) || 0,
        length: Number(meas.length) || 0,
        breadth: Number(meas.breadth) || 0,
        depth: Number(meas.depth) || 0,
        quantity: qty,
      };

      const updatedMeasurements = [...measurements, newMeasurement];
      const totalQty = updatedMeasurements.reduce(
        (sum: number, m: Measurement) => sum + m.quantity,
        0,
      );

      form.setValue("measurements", updatedMeasurements);
      form.setValue("quantity", totalQty.toFixed(3));
    }

    setMeas({
      id: "",
      description: "",
      nos: "1",
      length: "",
      breadth: "",
      depth: "",
    });
  };

  const editMeasurement = (id: string) => {
    const measurement = measurements.find((m: Measurement) => m.id === id);

    if (measurement) {
      setMeas({
        id: measurement.id || "",
        description: measurement.description,
        nos: measurement.nos.toString(),
        length: measurement.length.toString(),
        breadth: measurement.breadth.toString(),
        depth: measurement.depth.toString(),
      });

      setEditingMeasurementId(id);
    }
  };

  const removeMeasurement = (id: string) => {
    const updatedMeasurements = measurements.filter(
      (m: Measurement) => m.id !== id,
    );

    const totalQty = updatedMeasurements.reduce(
      (sum: number, m: Measurement) => sum + m.quantity,
      0,
    );

    form.setValue("measurements", updatedMeasurements);
    form.setValue("quantity", totalQty.toFixed(3));
    if (editingMeasurementId === id) {
      setEditingMeasurementId(null);

      setMeas({
        id: "",
        description: "",
        nos: "1",
        length: "",
        breadth: "",
        depth: "",
      });
    }
  };

  // ========== SUB-ITEM UTILITIES ==========
  const addSubItem = () => {
    const qty = Number(subItemForm.quantity) || 0;
    const rate = Number(subItemForm.rate) || 0;
    const nos = Number(subItemForm.nos) || 0;
    const length = Number(subItemForm.length) || 0;
    const breadth = Number(subItemForm.breadth) || 0;
    const depth = Number(subItemForm.depth) || 0;

    if (!subItemForm.description.trim()) {
      alert("Please enter a description for the sub-item");
      return;
    }
    if (qty <= 0) {
      alert("Please enter a valid quantity greater than 0");
      return;
    }
    if (rate <= 0) {
      alert("Please enter a valid rate greater than 0");
      return;
    }

    if (editingSubItemId) {
      const updatedSubItems = subItems.map((item: FormSubItem) =>
        item.id === editingSubItemId
          ? {
              ...item,
              description: subItemForm.description,
              quantity: qty,
              unit: subItemForm.unit,
              rate: rate,
              amount: qty * rate,
              nos,
              length,
              breadth,
              depth,
            }
          : item,
      );
      form.setValue("subItems", updatedSubItems);
      setEditingSubItemId(null);
    } else {
      const newSubItem: FormSubItem = {
        id: uuid(),
        description: subItemForm.description,
        quantity: qty,
        unit: subItemForm.unit,
        rate: rate,
        amount: qty * rate,
        nos,
        length,
        breadth,
        depth,
      };
      const updatedSubItems = [...subItems, newSubItem];
      form.setValue("subItems", updatedSubItems);
    }

    setSubItemForm({
      id: "",
      description: "",
      quantity: "",
      unit: "m",
      rate: "",
      nos: "1",
      length: "0",
      breadth: "0",
      depth: "0",
    });
  };

  const editSubItem = (id: string, idx: number) => {
    let item = id
      ? subItems.find((item: FormSubItem) => item.id === id)
      : subItems[idx];

    if (item && !item.id) {
      const newId = uuid();
      const updatedSubItems = [...subItems];

      updatedSubItems[idx] = { ...item, id: newId };
      form.setValue("subItems", updatedSubItems);
      item = updatedSubItems[idx];
    }

    if (item) {
      const typedItem = item as FormSubItem;

      setSubItemForm({
        id: typedItem.id || "",
        description: typedItem.description || "",
        quantity: (typedItem.quantity || 0).toString(),
        unit: typedItem.unit || "m",
        rate: (typedItem.rate || 0).toString(),
        nos: typedItem.nos !== undefined ? typedItem.nos.toString() : "1",
        length: (typedItem.length !== undefined
          ? typedItem.length
          : 0
        ).toString(),
        breadth: (typedItem.breadth !== undefined
          ? typedItem.breadth
          : 0
        ).toString(),
        depth: (typedItem.depth !== undefined ? typedItem.depth : 0).toString(),
      });

      setEditingSubItemId(typedItem.id || null);
    }
  };

  const removeSubItem = (id: string, idx: number) => {
    const updatedSubItems = id
      ? subItems.filter((item: FormSubItem) => item.id !== id)
      : subItems.filter((_: FormSubItem, index: number) => index !== idx);

    form.setValue("subItems", updatedSubItems);
    if (editingSubItemId === id) {
      setEditingSubItemId(null);

      setSubItemForm({
        id: "",
        description: "",
        quantity: "",
        unit: "m",
        rate: "",
        nos: "1",
        length: "0",
        breadth: "0",
        depth: "0",
      });
    }
  };

  const cancelEdit = () => {
    setEditingSubItemId(null);
    setEditingMeasurementId(null);

    setSubItemForm({
      id: "",
      description: "",
      quantity: "",
      unit: "m",
      rate: "",
      nos: "1",
      length: "0",
      breadth: "0",
      depth: "0",
    });

    setMeas({
      id: "",
      description: "",
      nos: "1",
      length: "",
      breadth: "",
      depth: "",
    });
  };

  // ========== MAIN QUANTITY CALCULATION (used for the main item) ==========
  const calculateQuantity = () => {
    if (measurements.length > 0) {
      return measurements.reduce(
        (sum: number, m: Measurement) => sum + m.quantity,
        0,
      );
    }

    const nos = Number(values.nos) || 1;
    const length = Number(values.length) || 0;

    const breadth = Number(values.breadth) || 0;
    const depth = Number(values.depth) || 0;

    return calcQty(
      values.unit,
      nos,
      length,
      breadth,
      depth,
      compactionFactorValue,
    );
  };

  // Auto‑update quantity when dimensions change (only if no measurements and no sub-items)
  useEffect(() => {
    if (measurements.length === 0 && !hasSubItems) {
      const calculatedQty = calculateQuantity();
      if (calculatedQty > 0 && calculatedQty.toFixed(3) !== values.quantity) {
        form.setValue("quantity", calculatedQty.toFixed(3));
      }
    }
  }, [
    values.nos,
    values.length,
    values.breadth,
    values.depth,
    values.unit,
    compactionFactorValue,
    measurements,
    hasSubItems,
  ]);

  // Auto‑update sub‑item quantity when its dimensions change
  useEffect(() => {
    const nos = Number(subItemForm.nos) || 0;
    const length = Number(subItemForm.length) || 0;
    const breadth = Number(subItemForm.breadth) || 0;
    const depth = Number(subItemForm.depth) || 0;
    const unit = subItemForm.unit;
    const qty = calcQty(
      unit,
      nos,
      length,
      breadth,
      depth,
      compactionFactorValue,
    );
    if (qty > 0 && qty.toFixed(3) !== subItemForm.quantity) {
      setSubItemForm((prev) => ({ ...prev, quantity: qty.toFixed(3) }));
    }
  }, [
    subItemForm.nos,
    subItemForm.length,
    subItemForm.breadth,
    subItemForm.depth,
    subItemForm.unit,
    compactionFactorValue,
  ]);

  // Sync drain params to main item fields
  useEffect(() => {
    if (!drainParams || !showDrainParamLinks) return;
    const lk = values.lengthParamKey as DrainParamKey | undefined;
    const bk = values.breadthParamKey as DrainParamKey | undefined;
    const dk = values.depthParamKey as DrainParamKey | undefined;
    if (lk && lk in drainParams)
      form.setValue("length", String(Number(drainParams[lk]) || 0));
    if (bk && bk in drainParams)
      form.setValue("breadth", String(Number(drainParams[bk]) || 0));
    if (dk && dk in drainParams)
      form.setValue("depth", String(Number(drainParams[dk]) || 0));
  }, [
    drainParams,
    values.lengthParamKey,
    values.breadthParamKey,
    values.depthParamKey,
    showDrainParamLinks,
  ]);

  // ========== ADD ITEM TO ESTIMATE ==========
  const handleAddItem = () => {
    if (!values.description?.trim()) {
      alert("Please enter description");
      return;
    }
    if (!values.schedulePageNo?.trim()) {
      alert("Please enter Schedule Page No.");
      return;
    }

    let quantityToUse = Number(values.quantity);
    let amountToUse = quantityToUse * Number(values.rate);

    // Sub‑item container logic: if sub‑items exist, treat main item as LS container
    if (hasSubItems) {
      amountToUse = subItems.reduce(
        (sum: number, item: FormSubItem) => sum + item.amount,
        0,
      );
      quantityToUse = 1;
    }

    // Validate main item if no sub‑items
    if (!hasSubItems && (!quantityToUse || !Number(values.rate))) {
      alert("Please enter quantity and rate, or add sub‑items");
      return;
    }

    if (hasSubItems) {
      const invalidSubItems = subItems.filter(
        (item: FormSubItem) => item.amount <= 0,
      );

      if (invalidSubItems.length > 0) {
        alert("All sub‑items must have a valid amount (quantity × rate)");
        return;
      }
    }

    // Prepare sub‑items with IDs
    const subItemsForEstimate: SubItem[] = subItems.map(
      (item: FormSubItem) => ({
        ...item,
        id: item.id || uuid(),
      }),
    );

    const toParamKey = (v: string | undefined): DrainParamKey | undefined =>
      v && v !== "none" && DRAIN_PARAM_KEYS.includes(v as DrainParamKey)
        ? (v as DrainParamKey)
        : undefined;
    const lKey = toParamKey(values.lengthParamKey);
    const bKey = toParamKey(values.breadthParamKey);

    const dKey = toParamKey(values.depthParamKey);
    const unitLower = (values.unit || "").toLowerCase();
    const depthForItem = unitLower === "sqm" ? 0 : Number(values.depth) || 0;

    const newItem: EstimateItem = {
      id: uuid(),
      slNo: items.length + 1,
      schedulePageNo: values.schedulePageNo || "---",
      description: values.description,
      measurements: measurements,
      subItems: subItemsForEstimate,
      nos: Number(values.nos) || 1,
      length: Number(values.length) || 0,
      breadth: Number(values.breadth) || 0,
      depth: depthForItem,
      quantity: hasSubItems ? 1 : quantityToUse,
      unit: hasSubItems ? "LS" : values.unit,
      rate: Number(values.rate) || 0,
      amount: amountToUse,
      compactionFactor:
        values.unit === "bags" ? compactionFactorKey : undefined,
      ...(isCumOrSqm && (lKey || bKey || dKey)
        ? {
            lengthParamKey: lKey,
            breadthParamKey: bKey,
            depthParamKey: dKey,
          }
        : {}),
    };

    addItem(newItem);

    // Reset form with fresh defaults
    const L = drainParams?.lengthOfDrain ?? globalDimensions?.length ?? "0";

    const B =
      drainParams?.widthEarthCutting ?? globalDimensions?.breadth ?? "0";

    const D =
      drainParams?.avgDepthEarthCutting ?? globalDimensions?.depth ?? "0";

    form.reset({
      schedulePageNo: "",
      description: "",
      nos: "1",
      length: L,
      breadth: B,
      depth: D,
      quantity: "0",
      unit: "cum",
      rate: "0",
      measurements: [],
      subItems: [],
      lengthParamKey: "",
      breadthParamKey: "",
      depthParamKey: "",
      compactionFactor: "",
    });

    // Reset local edit states
    setEditingSubItemId(null);
    setEditingMeasurementId(null);

    setSubItemForm({
      id: "",
      description: "",
      quantity: "",
      unit: "m",
      rate: "",
      nos: "1",
      length: "0",
      breadth: "0",
      depth: "0",
    });

    setMeas({
      id: "",
      description: "",
      nos: "1",
      length: "",
      breadth: "",
      depth: "",
    });
  };

  const hasMeasurements = measurements.length > 0;
  const totalSubItemsAmount = subItems.reduce(
    (sum: number, item: FormSubItem) => sum + item.amount,
    0,
  );

  const buttonLabel = submitLabel ?? "Add Item to Estimate";

  // ========== RENDER ==========
  return (
    <Card className={inDialog ? "border-0 shadow-none" : "border-0 shadow-lg"}>
      {!inDialog && (
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Estimate Item
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={inDialog ? "p-0 space-y-6" : "p-6 space-y-6"}>
        {/* Main Item Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormField
                control={form.control}
                name="schedulePageNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Page No.</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., P-49, P-50"
                        {...field}
                        className="border-slate-300"
                        disabled={estimateExists && !isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={estimateExists && !isEditing}
                    >
                      <FormControl>
                        <SelectTrigger className="border-slate-300">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* LINEAR */}
                        <SelectItem value="m">Meter (m)</SelectItem>
                        <SelectItem value="rm">Running Meter (rm)</SelectItem>
                        <SelectItem value="rft">Running Feet (rft)</SelectItem>
                        <SelectItem value="km">Kilometer (km)</SelectItem>

                        {/* AREA */}
                        <SelectItem value="sqm">Square Meter (sqm)</SelectItem>
                        <SelectItem value="sqft">Square Feet (sqft)</SelectItem>
                        <SelectItem value="ha">Hectare (ha)</SelectItem>

                        {/* VOLUME */}
                        <SelectItem value="cum">Cubic Meter (cum)</SelectItem>
                        <SelectItem value="cft">Cubic Feet (cft)</SelectItem>
                        <SelectItem value="l">Liter (l)</SelectItem>

                        {/* WEIGHT */}
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="q">Quintal (q)</SelectItem>
                        <SelectItem value="MT">Metric Ton (MT)</SelectItem>

                        {/* COUNT */}
                        <SelectItem value="no">Number (no)</SelectItem>
                        <SelectItem value="each">Each</SelectItem>
                        <SelectItem value="set">Set</SelectItem>
                        <SelectItem value="pair">Pair</SelectItem>

                        {/* LABOR / TIME */}
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="manday">Manday</SelectItem>
                        <SelectItem value="hr">Hour (hr)</SelectItem>
                        <SelectItem value="month">Month</SelectItem>

                        {/* LUMPSUM & SPECIAL */}
                        <SelectItem value="LS">Lumpsum (LS)</SelectItem>
                        <SelectItem value="job">Job</SelectItem>
                        <SelectItem value="bags">Bags</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Compaction factor selection for bags */}
          {values.unit === "bags" && (
            <div>
              <FormField
                control={form.control}
                name="compactionFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compaction Factor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={estimateExists && !isEditing}
                    >
                      <FormControl>
                        <SelectTrigger className="border-slate-300">
                          <SelectValue placeholder="Select compaction factor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">Normal (1.10)</SelectItem>
                        <SelectItem value="loose">Loose (1.15)</SelectItem>
                        <SelectItem value="river">River (1.12)</SelectItem>
                        <SelectItem value="machine">Machine (1.08)</SelectItem>
                        <SelectItem value="hand">Hand (1.12)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Drain param linking */}
          {showDrainParamLinks && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-3">
              <p className="text-sm font-medium text-slate-700">
                Link to drain parameters (change at top to auto-update this
                item)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="lengthParamKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Length from</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "none"}
                        disabled={estimateExists && !isEditing}
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-300 bg-white">
                            <SelectValue placeholder="Manual" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Manual</SelectItem>
                          {DRAIN_PARAM_KEYS.map((key) => (
                            <SelectItem key={key} value={key}>
                              {DRAIN_PARAM_LABELS[key]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="breadthParamKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Breadth from</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "none"}
                        disabled={estimateExists && !isEditing}
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-300 bg-white">
                            <SelectValue placeholder="Manual" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Manual</SelectItem>
                          {DRAIN_PARAM_KEYS.map((key) => (
                            <SelectItem key={key} value={key}>
                              {DRAIN_PARAM_LABELS[key]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depthParamKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Depth from</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "none"}
                        disabled={estimateExists && !isEditing}
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-300 bg-white">
                            <SelectValue placeholder="Manual" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Manual</SelectItem>
                          {DRAIN_PARAM_KEYS.map((key) => (
                            <SelectItem key={key} value={key}>
                              {DRAIN_PARAM_LABELS[key]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          <div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description of Work</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of work item"
                      {...field}
                      className="border-slate-300 min-h-[80px] resize-none"
                      disabled={estimateExists && !isEditing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <AnimatePresence>
          {!showSubItemsSection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="border rounded-2xl p-5 bg-white shadow-[0_2px_10px_-3px_rgba(6,182,212,0.1)] border-slate-200/60 mb-6 space-y-4 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 rounded-l-2xl"></div>
                <h4 className="font-semibold flex items-center gap-2 text-slate-700">
                  <Calculator className="h-4 w-4 text-slate-500" />
                  Measurement Details
                </h4>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800">
                    Measurements (for Quantity Calc)
                  </h3>
                  {editingMeasurementId && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-600 font-medium">
                        Editing Measurement
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelEdit}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {/* List of added measurements */}
                {measurements.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Desc</TableHead>
                        <TableHead className="w-16">Nos</TableHead>
                        <TableHead className="w-20">L</TableHead>
                        <TableHead className="w-20">B</TableHead>
                        <TableHead className="w-20">D</TableHead>
                        <TableHead className="w-24 text-right">Qty</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {measurements.map((m: Measurement, idx: number) => (
                        <TableRow key={m.id || idx}>
                          <TableCell className="text-xs">
                            {m.description || "-"}
                          </TableCell>
                          <TableCell>{m.nos}</TableCell>
                          <TableCell>{m.length}</TableCell>
                          <TableCell>{m.breadth}</TableCell>
                          <TableCell>{m.depth}</TableCell>
                          <TableCell className="text-right">
                            {Number(m.quantity || 0).toFixed(3)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => editMeasurement(m.id!)}
                                disabled={estimateExists && !isEditing}
                              >
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMeasurement(m.id!)}
                                disabled={estimateExists && !isEditing}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {/* Add New Measurement Input */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium">
                      Sub-Description *
                    </label>
                    <Input
                      value={meas.description}
                      onChange={(e) =>
                        setMeas({ ...meas, description: e.target.value })
                      }
                      placeholder="e.g. In Foundation"
                      className="h-8 text-xs"
                      disabled={estimateExists && !isEditing}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Nos</label>
                    <Input
                      type="number"
                      value={meas.nos}
                      onChange={(e) =>
                        setMeas({ ...meas, nos: e.target.value })
                      }
                      className="h-8 text-xs"
                      disabled={estimateExists && !isEditing}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">L</label>
                    <Input
                      type="number"
                      value={meas.length}
                      onChange={(e) =>
                        setMeas({ ...meas, length: e.target.value })
                      }
                      className="h-8 text-xs"
                      disabled={estimateExists && !isEditing}
                      min="0"
                      step="any"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">B</label>
                    <Input
                      type="number"
                      value={meas.breadth}
                      onChange={(e) =>
                        setMeas({ ...meas, breadth: e.target.value })
                      }
                      className="h-8 text-xs"
                      disabled={estimateExists && !isEditing}
                      min="0"
                      step="any"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">D</label>
                    <Input
                      type="number"
                      value={meas.depth}
                      onChange={(e) =>
                        setMeas({ ...meas, depth: e.target.value })
                      }
                      className="h-8 text-xs"
                      disabled={estimateExists && !isEditing}
                      min="0"
                      step="any"
                    />
                  </div>
                  <div className="flex items-end pb-0.5">
                    <Button
                      onClick={addMeasurement}
                      size="sm"
                      className="w-full h-8 text-xs"
                      disabled={estimateExists && !isEditing}
                    >
                      {editingMeasurementId ? (
                        <Save className="h-3 w-3 mr-1" />
                      ) : (
                        <Plus className="h-3 w-3 mr-1" />
                      )}
                      {editingMeasurementId ? "Update" : "Add"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Standard Calculation Fields - Only show if no measurements and no sub-items */}
        {!hasMeasurements && !showSubItemsSection && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <FormField
                control={form.control}
                name="nos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nos</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="border-slate-300"
                        disabled={estimateExists && !isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="border-slate-300"
                        disabled={estimateExists && !isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="breadth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breadth</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="border-slate-300"
                        disabled={estimateExists && !isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="depth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depth/Height</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="border-slate-300"
                        disabled={estimateExists && !isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-end pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const calculatedQty = calculateQuantity();
                  form.setValue("quantity", calculatedQty.toFixed(3));
                }}
                className="w-full"
                disabled={estimateExists && !isEditing}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calc Qty
              </Button>
            </div>
          </div>
        )}

        {/* Sub-items Section */}
        {!showSubItemsSection && (
          <div className="flex justify-center py-2">
            <Button
              variant="outline"
              onClick={() => setShowSubItemsSection(true)}
              className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              disabled={estimateExists && !isEditing}
            >
              <Sparkles className="h-4 w-4" />
              Add Sub-items / Materials
            </Button>
          </div>
        )}

        {showSubItemsSection && (
          <div className="border rounded-lg p-4 bg-emerald-50/50 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Sub-items / Materials
              </h3>
              <div className="flex items-center gap-2">
                {editingSubItemId && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 font-medium">
                      Editing Sub-item
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" /> Cancel
                    </Button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                  onClick={() => {
                    if (subItems.length > 0) {
                      if (
                        confirm("This will remove all sub-items. Continue?")
                      ) {
                        form.setValue("subItems", []);
                        setShowSubItemsSection(false);
                      }
                    } else {
                      setShowSubItemsSection(false);
                    }
                  }}
                  disabled={estimateExists && !isEditing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {hasSubItems && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Table>
                    <TableHeader className="bg-emerald-50/80 backdrop-blur-sm">
                      <TableRow className="border-b-emerald-100 font-semibold border-b">
                        <TableHead className="font-bold text-emerald-800">
                          Description
                        </TableHead>
                        <TableHead className="w-20 font-bold text-emerald-800">
                          Qty
                        </TableHead>
                        <TableHead className="w-16 font-bold text-emerald-800">
                          Unit
                        </TableHead>
                        <TableHead className="w-24 font-bold text-emerald-800">
                          Rate
                        </TableHead>
                        <TableHead className="w-24 text-right font-bold text-emerald-800">
                          Amount
                        </TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white">
                      {subItems.map((item: FormSubItem, idx: number) => (
                        <TableRow
                          key={item.id || idx}
                          className="hover:bg-emerald-50/30 transition-colors border-b-slate-100"
                        >
                          <TableCell className="text-sm font-medium text-slate-700">
                            {item.description}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.rate}</TableCell>
                          <TableCell className="text-right">
                            {(item.amount || 0).toFixed(3)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => editSubItem(item.id || "", idx)}
                                disabled={estimateExists && !isEditing}
                              >
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeSubItem(item.id || "", idx)
                                }
                                disabled={estimateExists && !isEditing}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-emerald-50/50 font-bold border-t border-emerald-200">
                        <TableCell
                          colSpan={4}
                          className="text-right text-emerald-900 py-4"
                        >
                          Total Amount:
                        </TableCell>
                        <TableCell className="text-right text-emerald-900 text-base py-4">
                          ₹{totalSubItemsAmount.toFixed(3)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4 mt-6">
              <h4 className="font-bold flex items-center gap-2 text-slate-800">
                <Plus className="h-5 w-5 p-1 rounded-md bg-emerald-100 text-emerald-600" />
                {editingSubItemId
                  ? "Edit Sub-item"
                  : "Add Sub-items / Materials"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="md:col-span-6">
                  <label className="text-xs font-medium">Description *</label>
                  <Input
                    value={subItemForm.description}
                    onChange={(e) =>
                      setSubItemForm({
                        ...subItemForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Item name"
                    className="h-8 text-xs"
                    disabled={estimateExists && !isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium">Unit</label>
                  <Select
                    value={subItemForm.unit}
                    onValueChange={(value) =>
                      setSubItemForm({ ...subItemForm, unit: value })
                    }
                    disabled={estimateExists && !isEditing}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* LINEAR */}
                      <SelectItem value="m">m</SelectItem>
                      <SelectItem value="rm">rm</SelectItem>
                      <SelectItem value="rft">rft</SelectItem>
                      <SelectItem value="km">km</SelectItem>

                      {/* AREA */}
                      <SelectItem value="sqm">sqm</SelectItem>
                      <SelectItem value="sqft">sqft</SelectItem>
                      <SelectItem value="ha">ha</SelectItem>

                      {/* VOLUME */}
                      <SelectItem value="cum">cum</SelectItem>
                      <SelectItem value="cft">cft</SelectItem>
                      <SelectItem value="l">l</SelectItem>

                      {/* WEIGHT */}
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="q">q</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>

                      {/* COUNT */}
                      <SelectItem value="no">no</SelectItem>
                      <SelectItem value="each">each</SelectItem>
                      <SelectItem value="set">set</SelectItem>
                      <SelectItem value="pair">pair</SelectItem>

                      {/* LABOR / TIME */}
                      <SelectItem value="day">day</SelectItem>
                      <SelectItem value="manday">manday</SelectItem>
                      <SelectItem value="hr">hr</SelectItem>
                      <SelectItem value="month">month</SelectItem>

                      {/* LUMPSUM & SPECIAL */}
                      <SelectItem value="LS">LS</SelectItem>
                      <SelectItem value="job">job</SelectItem>
                      <SelectItem value="bags">bags</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium">Rate</label>
                  <Input
                    type="number"
                    value={subItemForm.rate}
                    onChange={(e) =>
                      setSubItemForm({ ...subItemForm, rate: e.target.value })
                    }
                    className="h-8 text-xs"
                    disabled={estimateExists && !isEditing}
                    min="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium">Amount</label>
                  <div className="h-8 flex items-center px-3 bg-slate-50 border rounded text-xs">
                    {(
                      (Number(subItemForm.quantity) || 0) *
                      (Number(subItemForm.rate) || 0)
                    ).toFixed(3)}
                  </div>
                </div>
              </div>

              {/* Row 2: Dimensions and Qty */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end">
                <div>
                  <label className="text-xs font-medium">Nos</label>
                  <Input
                    type="number"
                    value={subItemForm.nos}
                    onChange={(e) =>
                      setSubItemForm({ ...subItemForm, nos: e.target.value })
                    }
                    className="h-8 text-xs"
                    disabled={estimateExists && !isEditing}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Length</label>
                  <Input
                    type="number"
                    value={subItemForm.length}
                    onChange={(e) =>
                      setSubItemForm({ ...subItemForm, length: e.target.value })
                    }
                    className="h-8 text-xs"
                    disabled={estimateExists && !isEditing}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Breadth</label>
                  <Input
                    type="number"
                    value={subItemForm.breadth}
                    onChange={(e) =>
                      setSubItemForm({
                        ...subItemForm,
                        breadth: e.target.value,
                      })
                    }
                    className="h-8 text-xs"
                    disabled={estimateExists && !isEditing}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Depth</label>
                  <Input
                    type="number"
                    value={subItemForm.depth}
                    onChange={(e) =>
                      setSubItemForm({ ...subItemForm, depth: e.target.value })
                    }
                    className="h-8 text-xs"
                    disabled={estimateExists && !isEditing}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Qty</label>
                  <Input
                    type="number"
                    value={subItemForm.quantity}
                    onChange={(e) =>
                      setSubItemForm({
                        ...subItemForm,
                        quantity: e.target.value,
                      })
                    }
                    className="h-8 text-xs font-bold bg-slate-50"
                    disabled={estimateExists && !isEditing}
                    min="0"
                  />
                </div>
                <div className="md:col-span-12 flex justify-end gap-2 mt-2">
                  {editingSubItemId && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={cancelEdit}
                      className="rounded-xl px-5 transition-all text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSubItem}
                    className="flex items-center gap-2 rounded-xl bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm transition-all px-5"
                  >
                    <Plus className="h-4 w-4" />
                    {editingSubItemId ? "Update Sub-item" : "Add Sub-item"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Calculation Section */}
        <div className="p-4 bg-slate-100 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="border-slate-300 font-bold"
                        readOnly={hasMeasurements || hasSubItems}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="border-slate-300 font-bold"
                        disabled={(estimateExists && !isEditing) || hasSubItems}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Amount
              </label>
              <div className="h-10 px-3 py-2 bg-white border border-slate-300 rounded-md font-bold text-lg text-green-700">
                {hasSubItems
                  ? totalSubItemsAmount.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })
                  : (
                      Number(values.quantity || 0) * Number(values.rate || 0)
                    ).toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {inDialog && (
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={estimateExists && !isEditing}
              >
                Clear
              </Button>
            )}
            <Button
              onClick={handleAddItem}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md shadow-emerald-500/20 rounded-xl px-6 py-2.5 transition-all"
              disabled={estimateExists && !isEditing}
            >
              {editingMeasurementId || editingSubItemId ? (
                <Edit className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {buttonLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
