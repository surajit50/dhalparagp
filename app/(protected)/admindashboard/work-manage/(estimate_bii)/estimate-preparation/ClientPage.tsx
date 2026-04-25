"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { estimateItemSchema, type EstimateItemFormValues } from "./schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Sparkles, Check } from "lucide-react";
import ExistingEstimateAlert from "@/components/ExistingEstimateAlert";
import PrintPreview from "@/components/PrintPreview";
import {
  EstimateItem,
  type EstimateType,
  type DrainParams as DrainParamsType,
  type DrainParamKey,
  DEFAULT_DRAIN_PARAMS,
} from "./types";
import { saveEstimate as saveEstimateApi } from "./api";
import { computeDerivedDrainParams } from "./drainCalculations";
import {
  getQuantityFromDimensions,
  getDrainParamValue,
  resolveItemLBD,
} from "./helpers";
import { STEPS } from "./constants";

// Hooks
import { useEstimateWorks } from "./hooks/useEstimateWorks";
import { useEstimateCalculations } from "./hooks/useEstimateCalculations";
import { useEstimatePDF } from "./hooks/useEstimatePDF";
import { useEstimateWizard } from "./hooks/useEstimateWizard";
import { useEstimateItems } from "./hooks/useEstimateItems";

// Steps
import { Step1_SelectWork } from "./steps/Step1_SelectWork";
import { Step2_ProjectDetails } from "./steps/Step2_ProjectDetails";
import { Step3_Dimensions } from "./steps/Step3_Dimensions";
import { Step4_AddItems } from "./steps/Step4_AddItems";
import { Step5_Summary } from "./steps/Step5_Summary";

// Components
import { StepIndicator } from "./components";

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function EstimatePreparationClientPage() {
  // Wizard hook
  const {
    currentStep,
    completedUpTo,
    setCompletedUpTo,
    goToStep,
    goNext,
    goPrev,
    resetWizard,
  } = useEstimateWizard();

  // Form hook
  const form = useForm<EstimateItemFormValues>({
    resolver: zodResolver(estimateItemSchema),
    defaultValues: {
      schedulePageNo: "",
      description: "",
      nos: "1",
      length: "0",
      breadth: "0",
      depth: "0",
      quantity: "0",
      unit: "m",
      rate: "0",
      measurements: [],
      subItems: [],
      lengthParamKey: "",
      breadthParamKey: "",
      depthParamKey: "",
    },
  });

  // Items hook
  const {
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
  } = useEstimateItems({ form });

  // Core UI state
  const [isEditing, setIsEditing] = useState(false);
  const [libraryDialogOpen, setLibraryDialogOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [loadTemplateOpen, setLoadTemplateOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [addEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Custom Hooks
  const {
    works,
    loadingWorks,
    selectedWorkId,
    setSelectedWorkId,
    workSelected,
    projectInfo,
    setProjectInfo,
    handleWorkSelection,
    existingEstimate,
    estimateExists,
    setEstimateExists,
    loadExistingEstimate,
    initialLoad,
  } = useEstimateWorks();

  // Keep completedUpTo in sync with wizard progress
  useEffect(() => {
    if (workSelected && completedUpTo < 1) setCompletedUpTo(1);
  }, [completedUpTo, workSelected]);

  const calculations = useEstimateCalculations(items, contingency);
  const { itemTotal, gst, costExclLWC, lwc, costInclLWC, finalCost } =
    calculations;

  const { generatePDF, loadingPDF, setPdfMode, pdfMode } = useEstimatePDF({
    works,
    selectedWorkId,
    projectInfo,
    items,
    itemTotal,
    gst,
    costExclLWC,
    lwc,
    costInclLWC,
    contingency,
    finalCost,
  });

  /* ─── Actions ────────────────────────────────────────────────────────────── */
  const resetForm = () => {
    setIsEditing(false);
    setEditIndex(null);
    setAddEditDialogOpen(false);
    resetItems();
    setProjectInfo({
      projectName: "",
      projectCode: "",
      location: "",
      preparedBy: "",
      date: new Date().toISOString().split("T")[0],
    });
    resetWizard();
    form.reset({
      schedulePageNo: "",
      description: "",
      nos: "1",
      length: "0",
      breadth: "0",
      depth: "0",
      quantity: "0",
      unit: "m",
      rate: "0",
      measurements: [],
      subItems: [],
      lengthParamKey: "",
      breadthParamKey: "",
      depthParamKey: "",
    });
  };

  const handleEditItem = (index: number) => {
    const itemToEdit = items[index];
    form.reset({
      schedulePageNo: itemToEdit.schedulePageNo,
      description: itemToEdit.description,
      nos: itemToEdit.nos.toString(),
      length: itemToEdit.length.toString(),
      breadth: itemToEdit.breadth.toString(),
      depth: itemToEdit.depth.toString(),
      quantity: itemToEdit.quantity.toString(),
      unit: itemToEdit.unit,
      rate: itemToEdit.rate.toString(),
      measurements: itemToEdit.measurements || [],
      subItems: itemToEdit.subItems || [],
      lengthParamKey: itemToEdit.lengthParamKey ?? "",
      breadthParamKey: itemToEdit.breadthParamKey ?? "",
      depthParamKey: itemToEdit.depthParamKey ?? "",
    });
    setEditIndex(index);
    setAddEditDialogOpen(true);
  };

  const handleSaveAddEditItem = (newItem: EstimateItem) => {
    if (editIndex !== null) {
      const updated = [...items];
      updated[editIndex] = { ...newItem, slNo: editIndex + 1 };
      setItems(updated);
      setEditIndex(null);
    } else {
      setItems([...items, { ...newItem, slNo: items.length + 1 }]);
    }
    setAddEditDialogOpen(false);
    const isDrain = estimateType === "drain";
    form.reset({
      schedulePageNo: "",
      description: "",
      nos: "1",
      length: isDrain
        ? drainParams.lengthOfDrain || "0"
        : globalDimensions.length || "0",
      breadth: isDrain
        ? drainParams.widthEarthCutting || "0"
        : globalDimensions.breadth || "0",
      depth: isDrain
        ? drainParams.avgDepthEarthCutting || "0"
        : globalDimensions.depth || "0",
      quantity: "0",
      unit: isDrain ? "cum" : "m",
      rate: "0",
      measurements: [],
      subItems: [],
      lengthParamKey: "",
      breadthParamKey: "",
      depthParamKey: "",
    });
  };

  const openAddItemDialog = () => {
    setEditIndex(null);
    const isDrain = estimateType === "drain";
    const L = isDrain
      ? drainParams.lengthOfDrain || "0"
      : globalDimensions.length || "0";
    const B = isDrain
      ? drainParams.widthEarthCutting || "0"
      : globalDimensions.breadth || "0";
    const D = isDrain
      ? drainParams.avgDepthEarthCutting || "0"
      : globalDimensions.depth || "0";
    form.reset({
      schedulePageNo: "",
      description: "",
      nos: "1",
      length: L,
      breadth: B,
      depth: D,
      quantity: "0",
      unit: isDrain ? "cum" : "m",
      rate: "0",
      measurements: [],
      subItems: [],
      lengthParamKey: "",
      breadthParamKey: "",
      depthParamKey: "",
    });
    setAddEditDialogOpen(true);
  };

  const saveEstimate = async () => {
    if (!selectedWorkId) {
      alert("Please select a work first");
      return;
    }
    if (items.length === 0) {
      alert("Add items before saving");
      return;
    }
    if (estimateExists && !isEditing) {
      alert(
        "An estimate already exists for this work. Please edit the existing estimate or delete it first.",
      );
      return;
    }
    try {
      await saveEstimateApi(selectedWorkId, items, projectInfo, contingency);
      const message = isEditing
        ? "Estimate updated successfully"
        : "Estimate saved successfully";
      alert(message);
      resetForm();
      setEstimateExists(true);
      setIsEditing(false);
      loadExistingEstimate(selectedWorkId);
    } catch (error) {
      console.error(error);
      alert(
        `Error saving estimate: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handlePrint = () => setShowPreview(true);

  /* ─── Derived ────────────────────────────────────────────────────────────── */
  const isViewOnly = estimateExists && !isEditing;

  /* ═══════════════════════════════════════════════════════════════════════════
   * RENDER
   * ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-wb-bg pb-16">
      {/* ── FIXED TOP HEADER ────────────────────────────────────────────────── */}
      <div className="bg-wb-primary sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Estimate Preparation
              </h1>
              <p className="text-white/75 text-sm mt-0.5">
                Step-by-step cost estimation wizard
              </p>
            </div>
            {/* Quick stats */}
            <div className="flex gap-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-bold text-white">
                  {items.length}
                </div>
                <div className="text-xs text-white/70">Items</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                <div className="text-xl font-bold text-white">
                  ₹{finalCost.toLocaleString()}
                </div>
                <div className="text-xs text-white/70">Total Cost</div>
              </div>
            </div>
          </div>

          {/* ── STEP INDICATOR ── */}
          <div className="bg-white/10 rounded-2xl px-4 py-3">
            <StepIndicator
              currentStep={currentStep}
              completedUpTo={completedUpTo}
              onStepClick={goToStep}
            />
          </div>
        </div>
      </div>

      {/* ── CONTENT AREA ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* Alerts always visible */}
        <ExistingEstimateAlert
          estimateExists={estimateExists}
          initialLoad={initialLoad}
          selectedWorkId={selectedWorkId}
          isEditing={isEditing}
          existingEstimate={existingEstimate}
          setIsEditing={setIsEditing}
          setItems={setItems}
          setProjectInfo={setProjectInfo}
          setContingency={setContingency}
          resetForm={resetForm}
          fetchExistingEstimate={loadExistingEstimate}
          setShowPreview={setShowPreview}
        />

        {isViewOnly && selectedWorkId && (
          <Alert className="border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-sm">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 ml-2">
              View-only mode — click <strong>Edit Estimate</strong> above to
              make changes.
            </AlertDescription>
          </Alert>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            WIZARD STEPS
            ════════════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <Step1_SelectWork
            works={works}
            selectedWorkId={selectedWorkId}
            loadingWorks={loadingWorks}
            workSelected={workSelected}
            projectInfo={projectInfo}
            handleWorkSelection={handleWorkSelection}
            isEditing={isEditing}
            estimateExists={estimateExists}
            onNext={() => {
              setCompletedUpTo((p) => Math.max(p, 1));
              goNext();
            }}
          />
        )}

        {currentStep === 2 && (
          <Step2_ProjectDetails
            projectInfo={projectInfo}
            setProjectInfo={setProjectInfo}
            workSelected={workSelected}
            onPrev={goPrev}
            onNext={() => {
              setCompletedUpTo((p) => Math.max(p, 2));
              goNext();
            }}
          />
        )}

        {currentStep === 3 && (
          <Step3_Dimensions
            estimateType={estimateType}
            setEstimateType={setEstimateType}
            globalDimensions={globalDimensions}
            setGlobalDimensions={setGlobalDimensions}
            drainParams={drainParams}
            handleDrainParamChange={handleDrainParamChange}
            applyGlobalDimensionsToAllItems={applyGlobalDimensionsToAllItems}
            items={items}
            estimateExists={estimateExists}
            isEditing={isEditing}
            onPrev={goPrev}
            onNext={() => {
              setCompletedUpTo((p) => Math.max(p, 3));
              goNext();
            }}
          />
        )}

        {currentStep === 4 && (
          <Step4_AddItems
            items={items}
            setItems={setItems}
            handleEditItem={handleEditItem}
            addEditDialogOpen={addEditDialogOpen}
            setAddEditDialogOpen={setAddEditDialogOpen}
            form={form}
            editIndex={editIndex}
            handleSaveAddEditItem={handleSaveAddEditItem}
            estimateExists={estimateExists}
            isEditing={isEditing}
            globalDimensions={globalDimensions}
            drainParams={drainParams}
            estimateType={estimateType}
            libraryDialogOpen={libraryDialogOpen}
            setLibraryDialogOpen={setLibraryDialogOpen}
            handleAddLibraryItems={handleAddLibraryItems}
            saveTemplateOpen={saveTemplateOpen}
            setSaveTemplateOpen={setSaveTemplateOpen}
            loadTemplateOpen={loadTemplateOpen}
            setLoadTemplateOpen={setLoadTemplateOpen}
            handleLoadTemplateItems={handleLoadTemplateItems}
            openAddItemDialog={openAddItemDialog}
            onPrev={goPrev}
            onNext={() => {
              setCompletedUpTo((p) => Math.max(p, 4));
              goNext();
            }}
          />
        )}

        {currentStep === 5 && (
          <Step5_Summary
            items={items}
            contingency={contingency}
            setContingency={setContingency}
            estimateExists={estimateExists}
            isEditing={isEditing}
            calculations={calculations}
            loadingPDF={loadingPDF}
            saveEstimate={saveEstimate}
            generatePDF={generatePDF}
            pdfMode={pdfMode}
            setPdfMode={setPdfMode}
            selectedWorkId={selectedWorkId}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            handlePrint={handlePrint}
            setSaveTemplateOpen={setSaveTemplateOpen}
            works={works}
            goToStep={goToStep}
            onPrev={goPrev}
          />
        )}
      </div>

      {/* Print Preview */}
      <PrintPreview
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        projectInfo={projectInfo}
        items={items}
        contingency={contingency}
        itemTotal={itemTotal}
        gst={gst}
        costExclLWC={costExclLWC}
        lwc={lwc}
        costInclLWC={costInclLWC}
        finalCost={finalCost}
      />
    </div>
  );
}
