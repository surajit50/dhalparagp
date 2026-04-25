import { useState, useCallback, useEffect } from "react";
import { EstimateItem, EstimateType, DrainParams, DrainParamKey, DEFAULT_DRAIN_PARAMS } from "../types";
import { computeDerivedDrainParams } from "../drainCalculations";
import { getQuantityFromDimensions, getDrainParamValue, resolveItemLBD } from "../helpers";
import { UseFormReturn } from "react-hook-form";
import { EstimateItemFormValues } from "../schema";

interface UseEstimateItemsProps {
  form: UseFormReturn<EstimateItemFormValues>;
}

export function useEstimateItems({ form }: UseEstimateItemsProps) {
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [contingency, setContingency] = useState<number>(0);
  const [estimateType, setEstimateType] = useState<EstimateType>("road");
  const [globalDimensions, setGlobalDimensions] = useState({
    length: "",
    breadth: "",
    depth: "",
  });
  const [drainParams, setDrainParams] = useState<DrainParams>(() => ({
    ...DEFAULT_DRAIN_PARAMS,
  }));

  // When switching to drain, sync drain params
  useEffect(() => {
    if (estimateType === "drain") {
      setDrainParams((prev) => ({
        ...prev,
        ...computeDerivedDrainParams(prev),
      }));
    }
  }, [estimateType]);

  // When drain params change, recalculate linked items
  useEffect(() => {
    if (estimateType !== "drain") return;
    setItems((prev) =>
      prev.map((item) => {
        const hasParam =
          item.lengthParamKey || item.breadthParamKey || item.depthParamKey;
        const u = (item.unit || "").toLowerCase();
        if (!hasParam || (u !== "cum" && u !== "sqm")) return item;
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const { L, B, D } = resolveItemLBD(item, drainParams);
        const depthForItem = u === "sqm" ? 0 : D;

        if (hasSubItems) {
          const newSubItems = (item.subItems || []).map((si) => {
            const siNos = si.nos ?? 1;
            const siL = si.length ?? L;
            const siB = si.breadth ?? B;
            const siD = si.depth ?? depthForItem;
            const siQty = getQuantityFromDimensions(
              si.unit || item.unit,
              siNos,
              siL,
              siB,
              siD,
            );
            return { ...si, quantity: siQty, amount: siQty * (si.rate || 0) };
          });
          const totalQty = newSubItems.reduce((acc, si) => acc + si.quantity, 0);
          const totalAmount = totalQty * (item.rate || 0);
          return {
            ...item,
            length: L,
            breadth: B,
            depth: depthForItem,
            subItems: newSubItems,
            quantity: totalQty,
            amount: totalAmount,
          };
        }
        const nos = item.nos || 1;
        const newQty = getQuantityFromDimensions(
          item.unit,
          nos,
          L,
          B,
          depthForItem,
        );
        const amount = newQty * (item.rate || 0);
        return {
          ...item,
          length: L,
          breadth: B,
          depth: depthForItem,
          quantity: newQty,
          amount,
        };
      }),
    );
  }, [estimateType, drainParams]);

  const resetItems = useCallback(() => {
    setItems([]);
    setContingency(0);
    setEstimateType("road");
    setGlobalDimensions({ length: "", breadth: "", depth: "" });
    setDrainParams({ ...DEFAULT_DRAIN_PARAMS });
  }, []);

  const handleAddLibraryItems = useCallback((newItems: any[]) => {
    setItems((prev) => {
      const itemsToAdd = newItems.map((item, index) => ({
        ...item,
        slNo: prev.length + index + 1,
      }));
      return [...prev, ...itemsToAdd];
    });
  }, []);

  const handleLoadTemplateItems = useCallback((newItems: any[]) => {
    setItems((prev) => {
      const itemsToAdd = newItems.map((item, index) => ({
        ...item,
        quantity: item.defaultQty || item.quantity || 0,
        slNo: prev.length + index + 1,
      }));
      return [...prev, ...itemsToAdd];
    });
  }, []);

  const handleDrainParamChange = useCallback((key: DrainParamKey, value: string) => {
    setDrainParams((prev) => {
      const next = { ...prev, [key]: value };
      return { ...next, ...computeDerivedDrainParams(next) };
    });
  }, []);

  const applyGlobalDimensionsToAllItems = useCallback(() => {
    if (items.length === 0) {
      alert("Add items first, then apply dimensions.");
      return;
    }
    const isDrain = estimateType === "drain";
    const L = isDrain
      ? getDrainParamValue(drainParams, "lengthOfDrain") ||
        Number(globalDimensions.length) ||
        0
      : Number(globalDimensions.length) || 0;
    const B = isDrain
      ? getDrainParamValue(drainParams, "widthEarthCutting") ||
        Number(globalDimensions.breadth) ||
        0
      : Number(globalDimensions.breadth) || 0;
    const D = isDrain
      ? getDrainParamValue(drainParams, "avgDepthEarthCutting") ||
        Number(globalDimensions.depth) ||
        0
      : Number(globalDimensions.depth) || 0;

    const u = (unit: string) => (unit || "").toLowerCase();

    setItems((prev) =>
      prev.map((item) => {
        if (
          isDrain &&
          (item.lengthParamKey || item.breadthParamKey || item.depthParamKey)
        )
          return item;
        const unit = u(item.unit);
        if (unit !== "cum" && unit !== "sqm") return item;
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const depthForItem = unit === "sqm" ? 0 : D;

        if (hasSubItems) {
          const newSubItems = (item.subItems || []).map((si) => {
            const siNos = si.nos ?? 1;
            const siL = si.length ?? L;
            const siB = si.breadth ?? B;
            const siD = si.depth ?? depthForItem;
            const siQty = getQuantityFromDimensions(
              si.unit || item.unit,
              siNos,
              siL,
              siB,
              siD,
            );
            return { ...si, quantity: siQty, amount: siQty * (si.rate || 0) };
          });
          const totalQty = newSubItems.reduce((acc, si) => acc + si.quantity, 0);
          const totalAmount = totalQty * (item.rate || 0);
          return {
            ...item,
            length: L,
            breadth: B,
            depth: depthForItem,
            subItems: newSubItems,
            quantity: totalQty,
            amount: totalAmount,
          };
        }

        const nos = item.nos || 1;
        const newQty = getQuantityFromDimensions(
          item.unit,
          nos,
          L,
          B,
          depthForItem,
        );
        const amount = newQty * (item.rate || 0);
        return {
          ...item,
          length: L,
          breadth: B,
          depth: depthForItem,
          quantity: newQty,
          amount,
        };
      }),
    );
  }, [items, estimateType, drainParams, globalDimensions]);

  return {
    items,
    setItems,
    contingency,
    setContingency,
    estimateType,
    setEstimateType,
    globalDimensions,
    setGlobalDimensions,
    drainParams,
    setDrainParams,
    resetItems,
    handleAddLibraryItems,
    handleLoadTemplateItems,
    handleDrainParamChange,
    applyGlobalDimensionsToAllItems,
  };
}
