"use client";

import { UseFormReturn } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import AddEstimateItemCard from "@/components/AddEstimateItemCard";
import { type EstimateItemFormValues } from "./schema";
import { EstimateItem, type GlobalDimensions, type DrainParams, type EstimateType } from "./types";
import { Pencil, Plus } from "lucide-react";

interface AddEditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<EstimateItemFormValues>;
  isEditMode: boolean;
  onSave: (item: EstimateItem) => void;
  estimateExists: boolean;
  isEditing: boolean;
  items: EstimateItem[];
  setItems: (items: EstimateItem[]) => void;
  globalDimensions?: GlobalDimensions;
  drainParams?: DrainParams;
  estimateType?: EstimateType;
}

export default function AddEditItemDialog({
  open,
  onOpenChange,
  form,
  isEditMode,
  onSave,
  estimateExists,
  isEditing,
  items,
  setItems,
  globalDimensions = { length: "", breadth: "", depth: "" },
  drainParams,
  estimateType = "road",
}: AddEditItemDialogProps) {
  const handleAddItem = (newItem: EstimateItem) => {
    onSave(newItem);
    onOpenChange(false);
  };

  const addItemSubtitle =
    estimateType === "drain"
      ? "For cum/sqm choose which drain param to use for Length, Breadth, Depth — they will auto-update when you change the top parameters."
      : "Length, breadth and depth are pre-filled from Road dimensions. Apply to All (cum/sqm) uses the same values.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-0 shadow-xl rounded-2xl bg-slate-50/95 backdrop-blur-sm">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-4 rounded-t-2xl bg-white border-b border-slate-200">
          <div className="flex items-start gap-3 pr-8">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              {isEditMode ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </span>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-800">
                {isEditMode ? "Edit Item" : "Add Item"}
              </DialogTitle>
              <p className="text-sm text-slate-500 mt-0.5">
                {isEditMode ? "Update the item details below and save." : addItemSubtitle}
              </p>
            </div>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto px-6 py-6 flex-1 min-h-0 bg-slate-50/50">
          <Form {...form}>
            <AddEstimateItemCard
              form={form}
              addItem={handleAddItem}
              estimateExists={estimateExists}
              isEditing={isEditing}
              setItems={setItems}
              items={items}
              inDialog
              submitLabel={isEditMode ? "Update Item" : "Add Item to Estimate"}
              globalDimensions={globalDimensions}
              drainParams={drainParams}
            />
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
