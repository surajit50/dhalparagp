import { Calculator, FileText, Sparkles, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AbstractEstimateCard from "@/components/AbstractEstimateCard";
import ActionButtons from "@/components/ActionButtons";
import ItemsTable from "@/components/ItemsTable";
import { StepHeader, StepNav } from "../components";
import { EstimateItem, Work } from "../types";

interface Step5Props {
  items: EstimateItem[];
  contingency: number;
  setContingency: (val: number) => void;
  estimateExists: boolean;
  isEditing: boolean;
  calculations: {
    itemTotal: number;
    gst: number;
    costExclLWC: number;
    lwc: number;
    costInclLWC: number;
    finalCost: number;
  };
  loadingPDF: boolean;
  saveEstimate: () => Promise<void>;
  generatePDF: (mode?: "detailed" | "abstract") => Promise<void>;
  pdfMode: "detailed" | "abstract";
  setPdfMode: (mode: "detailed" | "abstract") => void;
  selectedWorkId: string;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  handlePrint: () => void;
  setSaveTemplateOpen: (open: boolean) => void;
  works: Work[];
  goToStep: (step: number) => void;
  onPrev: () => void;
}

export function Step5_Summary({
  items,
  contingency,
  setContingency,
  estimateExists,
  isEditing,
  calculations,
  loadingPDF,
  saveEstimate,
  generatePDF,
  pdfMode,
  setPdfMode,
  selectedWorkId,
  showPreview,
  setShowPreview,
  handlePrint,
  setSaveTemplateOpen,
  works,
  goToStep,
  onPrev,
}: Step5Props) {
  const { itemTotal, gst, costExclLWC, lwc, costInclLWC, finalCost } =
    calculations;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <StepHeader
        step={5}
        icon={<Calculator className="h-5 w-5 text-orange-600" />}
        title="Summary & Save"
        description="Review cost summary and save or export your estimate"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-6 shadow-sm border border-wb-border bg-white sticky top-[160px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-wb-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-wb-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Cost Summary
                </h2>
                <p className="text-sm text-slate-500">
                  Total estimate calculations
                </p>
              </div>
            </div>
            <AbstractEstimateCard
              items={items}
              contingency={contingency}
              setContingency={setContingency}
              estimateExists={estimateExists}
              isEditing={isEditing}
              itemTotal={itemTotal}
              gst={gst}
              costExclLWC={costExclLWC}
              lwc={lwc}
              costInclLWC={costInclLWC}
              finalCost={finalCost}
            />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 shadow-sm border border-wb-border bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-wb-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-wb-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Actions
                </h2>
                <p className="text-sm text-slate-500">
                  Manage and export estimate
                </p>
              </div>
            </div>
            <ActionButtons
              loading={loadingPDF}
              onSave={saveEstimate}
              onGeneratePDF={() => generatePDF()}
              onGenerateAbstractPDF={() => generatePDF("abstract")}
              pdfMode={pdfMode}
              setPdfMode={setPdfMode}
              items={items}
              selectedWorkId={selectedWorkId}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              handlePrint={handlePrint}
              isEditing={isEditing}
              onSaveTemplate={() => setSaveTemplateOpen(true)}
            />
          </Card>

          {items.length > 0 && (
            <Card className="p-6 shadow-sm border border-wb-border bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Items Overview
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-slate-600">
                    {items.length} items
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => goToStep(4)}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs gap-1"
                  >
                    Edit Items
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="w-full overflow-x-auto rounded-lg border border-wb-border">
                <ItemsTable
                  items={items}
                  deleteItem={() => {}}
                  editItem={() => {}}
                  estimateExists={true}
                  isEditing={false}
                />
              </div>
            </Card>
          )}

          {(() => {
            const tenderAmt: number =
              works.find((w) => w.id === selectedWorkId)?.finalEstimateAmount ??
              0;
            if (!tenderAmt || items.length === 0) return null;
            const diff = finalCost - tenderAmt;
            const isAbove = diff > 0;
            const absDiff = Math.abs(diff);
            const pct = Math.min(
              100,
              Math.round((finalCost / tenderAmt) * 100),
            );

            return (
              <div
                className={`rounded-2xl border-2 p-6 shadow-md ${
                  isAbove
                    ? "border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50"
                    : "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50"
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl ${isAbove ? "bg-orange-100" : "bg-green-100"}`}
                    >
                      <span
                        className={`text-2xl font-bold ${isAbove ? "text-orange-600" : "text-green-600"}`}
                      >
                        {isAbove ? "▲" : "▼"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        Tender vs Prepared Estimate
                      </h3>
                      <p className="text-sm text-slate-500">
                        Comparison against the tendered amount
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 items-center">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-0.5">
                        Tender Amount
                      </p>
                      <p className="text-xl font-bold text-slate-700">
                        ₹{tenderAmt.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={`text-center px-4 py-2 rounded-xl border-2 ${
                        isAbove
                          ? "border-orange-300 bg-orange-100"
                          : "border-green-300 bg-green-100"
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-500 mb-0.5">
                        {isAbove ? "Above Tender By" : "Less Than Tender By"}
                      </p>
                      <p
                        className={`text-xl font-bold ${isAbove ? "text-orange-700" : "text-green-700"}`}
                      >
                        ₹{absDiff.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-0.5">
                        Your Estimate
                      </p>
                      <p className="text-xl font-bold text-orange-700">
                        ₹{finalCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>₹0</span>
                    <span
                      className={`font-semibold ${isAbove ? "text-orange-600" : "text-green-600"}`}
                    >
                      Your estimate is {pct}% of tender amount
                    </span>
                    <span>₹{tenderAmt.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAbove ? "bg-orange-400" : "bg-green-400"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <StepNav step={5} totalSteps={5} canNext={false} onPrev={onPrev} />
    </div>
  );
}
