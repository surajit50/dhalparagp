"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adjustWorkOrderStock } from "@/action/tubewell";
import { toast } from "sonner";
import {
  Loader2,
  PackagePlus,
  PackageMinus,
  Plus,
  Trash2,
} from "lucide-react";
import { TubewellWorkOrderWithRelations } from "@/types";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface AdjustmentRow {
  id: string; // client-side id for list key
  orderMaterialId?: string; // existing TubewellOrderMaterial.id (for returns)
  materialId: string;
  materialName: string;
  currentQty: number; // currently issued qty
  adjustQty: number; // how many to add / return
  availableStock: number; // stock left in warehouse
  type: "ADD" | "RETURN";
}

interface AdjustStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: TubewellWorkOrderWithRelations;
  allMaterials: Array<{
    id: string;
    name: string;
    stock: number;
    unit: string;
    rate: number;
  }>;
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export function AdjustStockDialog({
  isOpen,
  onClose,
  order,
  allMaterials,
}: AdjustStockDialogProps) {
  const [isPending, startTransition] = useTransition();

  // adjustments staged by the user before saving
  const [rows, setRows] = useState<AdjustmentRow[]>([]);

  // for adding a new material (not yet in the order)
  const [newMatId, setNewMatId] = useState("");
  const [newQty, setNewQty] = useState(1);

  // ── helpers ────────────────────────────────

  const addReturnRow = (om: (typeof order.materials)[0]) => {
    const alreadyAdded = rows.some(
      (r) => r.orderMaterialId === om.id && r.type === "RETURN"
    );
    if (alreadyAdded) return;
    setRows((prev) => [
      ...prev,
      {
        id: `return-${om.id}`,
        orderMaterialId: om.id,
        materialId: om.materialId,
        materialName: om.material.name,
        currentQty: om.quantity,
        adjustQty: 1,
        availableStock: 0,
        type: "RETURN",
      },
    ]);
  };

  const addIssueRow = () => {
    if (!newMatId) return toast.error("Select a material to add");
    if (newQty <= 0) return toast.error("Quantity must be > 0");

    const mat = allMaterials.find((m) => m.id === newMatId);
    if (!mat) return;
    if (mat.stock < newQty)
      return toast.error(`Only ${mat.stock} in stock`);

    // if same material already exists in the order, reuse its orderMaterialId
    const existingOM = order.materials.find((om) => om.materialId === newMatId);

    const duplicate = rows.some(
      (r) => r.materialId === newMatId && r.type === "ADD"
    );
    if (duplicate) return toast.error("Already added to adjustments list");

    setRows((prev) => [
      ...prev,
      {
        id: `add-${newMatId}-${Date.now()}`,
        orderMaterialId: existingOM?.id,
        materialId: newMatId,
        materialName: mat.name,
        currentQty: existingOM?.quantity ?? 0,
        adjustQty: newQty,
        availableStock: mat.stock,
        type: "ADD",
      },
    ]);
    setNewMatId("");
    setNewQty(1);
  };

  const removeRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const updateAdjustQty = (id: string, val: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.type === "RETURN" && val > r.currentQty) {
          toast.error(`Cannot return more than ${r.currentQty} issued`);
          return r;
        }
        if (r.type === "ADD" && val > r.availableStock) {
          toast.error(`Only ${r.availableStock} available in stock`);
          return r;
        }
        return { ...r, adjustQty: val };
      })
    );
  };

  const handleSave = () => {
    if (rows.length === 0) return toast.error("No adjustments to save");

    const invalids = rows.filter((r) => r.adjustQty <= 0);
    if (invalids.length > 0)
      return toast.error("All quantities must be greater than 0");

    startTransition(async () => {
      try {
        await adjustWorkOrderStock(
          order.id,
          rows.map((r) => ({
            orderMaterialId: r.orderMaterialId,
            materialId: r.materialId,
            quantity: r.adjustQty,
            type: r.type,
          }))
        );
        toast.success("Stock adjusted successfully!");
        setRows([]);
        onClose();
      } catch (e: any) {
        toast.error(e.message || "Failed to adjust stock");
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setRows([]);
      setNewMatId("");
      setNewQty(1);
      onClose();
    }
  };

  // materials not yet in the order that can be issued
  const availableToAdd = allMaterials.filter(
    (m) => m.stock > 0
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Adjust Stock — {order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            Issue additional items to the work order or return unused items back
            to stock. Changes take effect immediately upon saving.
          </DialogDescription>
        </DialogHeader>

        {/* ── Currently issued materials ──────────────── */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Currently Issued
          </h4>
          {order.materials.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No materials issued yet.
            </p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left">Material</th>
                    <th className="p-2 text-center">Issued Qty</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {order.materials.map((om) => (
                    <tr key={om.id} className="border-t">
                      <td className="p-2 font-medium">{om.material.name}</td>
                      <td className="p-2 text-center">{om.quantity}</td>
                      <td className="p-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-amber-600 border-amber-300 hover:bg-amber-50"
                          onClick={() => addReturnRow(om)}
                          disabled={rows.some(
                            (r) =>
                              r.orderMaterialId === om.id &&
                              r.type === "RETURN"
                          )}
                        >
                          <PackageMinus className="h-3 w-3" />
                          Return
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Add new material ────────────────────────── */}
        <div className="space-y-2 border-t pt-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Issue More Items
          </h4>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <select
                value={newMatId}
                onChange={(e) => setNewMatId(e.target.value)}
                className="w-full border rounded-md h-9 px-3 text-sm bg-background"
              >
                <option value="">— Select material —</option>
                {availableToAdd.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Stock: {m.stock})
                  </option>
                ))}
              </select>
            </div>
            <Input
              type="number"
              min={1}
              value={newQty}
              onChange={(e) => setNewQty(Number(e.target.value))}
              className="w-24"
            />
            <Button
              variant="default"
              size="sm"
              className="gap-1"
              onClick={addIssueRow}
            >
              <Plus className="h-3 w-3" />
              Add
            </Button>
          </div>
        </div>

        {/* ── Staged adjustments ──────────────────────── */}
        {rows.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Pending Adjustments
            </h4>
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left">Material</th>
                    <th className="p-2 text-center">Type</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">
                        <span className="font-medium">{r.materialName}</span>
                        {r.type === "RETURN" && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (max {r.currentQty})
                          </span>
                        )}
                        {r.type === "ADD" && r.availableStock > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (avail {r.availableStock})
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {r.type === "ADD" ? (
                          <Badge className="bg-green-100 text-green-800 gap-1">
                            <PackagePlus className="h-3 w-3" />
                            Issue
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 gap-1">
                            <PackageMinus className="h-3 w-3" />
                            Return
                          </Badge>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <Input
                          type="number"
                          min={1}
                          max={
                            r.type === "RETURN"
                              ? r.currentQty
                              : r.availableStock
                          }
                          value={r.adjustQty}
                          onChange={(e) =>
                            updateAdjustQty(r.id, Number(e.target.value))
                          }
                          className="w-20 mx-auto"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 h-7 w-7"
                          onClick={() => removeRow(r.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || rows.length === 0}
            className="gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Adjustments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
