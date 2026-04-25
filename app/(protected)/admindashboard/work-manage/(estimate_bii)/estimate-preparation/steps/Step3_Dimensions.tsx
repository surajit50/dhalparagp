import { Ruler, Droplets, Route, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepHeader, StepNav } from "../components";
import {
  DRAIN_PARAM_KEYS,
  DRAIN_CALCULATED_KEYS,
  DRAIN_PARAM_LABELS,
  EstimateType,
  GlobalDimensions,
  DrainParams,
  DrainParamKey,
  EstimateItem,
} from "../types";

interface Step3Props {
  estimateType: EstimateType;
  setEstimateType: (type: EstimateType) => void;
  globalDimensions: GlobalDimensions;
  setGlobalDimensions: React.Dispatch<React.SetStateAction<GlobalDimensions>>;
  drainParams: DrainParams;
  handleDrainParamChange: (key: DrainParamKey, value: string) => void;
  applyGlobalDimensionsToAllItems: () => void;
  items: EstimateItem[];
  estimateExists: boolean;
  isEditing: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function Step3_Dimensions({
  estimateType,
  setEstimateType,
  globalDimensions,
  setGlobalDimensions,
  drainParams,
  handleDrainParamChange,
  applyGlobalDimensionsToAllItems,
  items,
  estimateExists,
  isEditing,
  onNext,
  onPrev,
}: Step3Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <StepHeader
        step={3}
        icon={<Ruler className="h-5 w-5 text-slate-600" />}
        title="Estimate Type & Dimensions"
        description="Choose Road or Drain and configure the master dimensions"
      />

      {(!estimateExists || isEditing) && (
        <Card className="p-6 shadow-sm border border-slate-200 bg-white">
          <h3 className="text-base font-semibold text-slate-700 mb-4">
            Estimate Type
          </h3>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={estimateType === "road" ? "default" : "outline"}
              className={`gap-2 flex-1 h-12 ${
                estimateType === "road"
                  ? "bg-slate-700 hover:bg-slate-800 text-white"
                  : "border-slate-300 hover:bg-slate-50"
              }`}
              onClick={() => setEstimateType("road")}
            >
              <Route className="h-5 w-5" />
              Road
            </Button>
            <Button
              type="button"
              variant={estimateType === "drain" ? "default" : "outline"}
              className={`gap-2 flex-1 h-12 ${
                estimateType === "drain"
                  ? "bg-teal-600 hover:bg-teal-700 text-white"
                  : "border-slate-300 hover:bg-slate-50"
              }`}
              onClick={() => setEstimateType("drain")}
            >
              <Droplets className="h-5 w-5" />
              Drain
            </Button>
          </div>
        </Card>
      )}

      {(!estimateExists || isEditing) && estimateType === "road" && (
        <Card className="p-6 shadow-sm border border-slate-200 bg-white">
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            Road Dimensions
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Set length, breadth &amp; depth once. <strong>cum</strong> = L × B ×
            D; <strong>sqm</strong> = L × B.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Length (m)
              </label>
              <Input
                type="number"
                min={0}
                step="any"
                placeholder="0"
                value={globalDimensions.length}
                onChange={(e) =>
                  setGlobalDimensions((p) => ({ ...p, length: e.target.value }))
                }
                className="bg-white border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Breadth (m)
              </label>
              <Input
                type="number"
                min={0}
                step="any"
                placeholder="0"
                value={globalDimensions.breadth}
                onChange={(e) =>
                  setGlobalDimensions((p) => ({
                    ...p,
                    breadth: e.target.value,
                  }))
                }
                className="bg-white border-slate-300"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Depth (m)
              </label>
              <Input
                type="number"
                min={0}
                step="any"
                placeholder="0"
                value={globalDimensions.depth}
                onChange={(e) =>
                  setGlobalDimensions((p) => ({ ...p, depth: e.target.value }))
                }
                className="bg-white border-slate-300"
              />
            </div>
            <Button
              type="button"
              onClick={applyGlobalDimensionsToAllItems}
              disabled={items.length === 0}
              className="gap-2 bg-slate-600 hover:bg-slate-700 text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Apply to All
            </Button>
          </div>
        </Card>
      )}

      {(!estimateExists || isEditing) && estimateType === "drain" && (
        <Card className="p-6 shadow-sm border border-teal-200/80 bg-gradient-to-r from-teal-50/80 to-cyan-50/80">
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            Drain Estimate Parameters
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Configure drain dimensions and bed slope. D/S depth, Width of Earth
            Cutting and average depths are calculated from inputs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DRAIN_PARAM_KEYS.map((key) => {
              const isCalculated = DRAIN_CALCULATED_KEYS.includes(key);
              return (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    {DRAIN_PARAM_LABELS[key]}
                    {isCalculated && (
                      <span className="text-xs font-normal text-slate-400">
                        (Calculated)
                      </span>
                    )}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="0"
                    value={drainParams[key]}
                    readOnly={isCalculated}
                    onChange={(e) =>
                      isCalculated
                        ? undefined
                        : handleDrainParamChange(key, e.target.value)
                    }
                    className={`bg-white border-slate-300 ${isCalculated ? "bg-slate-50 cursor-default" : ""}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={applyGlobalDimensionsToAllItems}
              disabled={items.length === 0}
              className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Apply to All (cum/sqm)
            </Button>
            <span className="text-xs text-slate-500">
              Applies to cum/sqm items not linked to params.
            </span>
          </div>
        </Card>
      )}

      <StepNav
        step={3}
        totalSteps={5}
        canNext={true}
        onPrev={onPrev}
        onNext={onNext}
        nextLabel="Continue to Add Items"
      />
    </div>
  );
}
