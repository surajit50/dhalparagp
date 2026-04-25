"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Printer,
  Save,
  BookOpen,
  ChevronRight,
  Hash,
  FileText,
  Ruler,
  CheckCircle,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

import {
  Measurement,
  SubItem,
  EstimateItem,
  MeasurableItem,
  MBEntry,
  MBFormData,
} from "./components/types";
import { WorkSelection } from "./components/WorkSelection";
import { MBMetadata } from "./components/MBMetadata";
import { MeasurementProgress } from "./components/MeasurementProgress";
import { MeasurementSummary } from "./components/MeasurementSummary";
import { AvailableItemsTable } from "./components/AvailableItemsTable";
import { MeasuredItemsTable } from "./components/MeasuredItemsTable";
import { gpname } from "@/constants/gpinfor";
import MBMeasurementDialog from "./components/MBMeasurementDialog";
import { MBPrintPreview } from "./components/MBPrintPreview";
import {
  fetchWorks as fetchWorksApi,
  fetchEstimateItems as fetchEstimateItemsApi,
  generateMBBookPDF as generatePDFBlob,
} from "./api";
import { useMBEntries } from "./hooks/useMBEntries";

import {
  getMeasurableItems,
  isItemMeasured,
  getSortedMbEntries,
  getGroupedItems,
} from "./helpers";

export default function MBCreateClientPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<MeasurableItem | null>(null);
  const [editingEstimateItemId, setEditingEstimateItemId] = useState<
    string | null
  >(null);
  const [editingSubItemId, setEditingSubItemId] = useState<string | null>(null);
  const [dialogMeasurements, setDialogMeasurements] = useState<Measurement[]>(
    [],
  );

  // Animation state
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("available");

  // Collapsible state
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<MBFormData>({
    mbNumber: "",
    mbPageNumber: "",
    measuredDate: new Date().toISOString().split("T")[0],
    measuredBy: "",
    checkedBy: "",
  });

  const [isMBSaved, setIsMBSaved] = useState(false);

  // MB Entries hook
  const {
    mbEntries,
    setMbEntries,
    loading,
    fetchMBEntries,
    handleDeleteEntry,
    handleSave,
  } = useMBEntries({
    selectedWorkId,
    formData,
    setFormData,
    setIsMBSaved,
  });

  const handleMBConfirm = () => {
    if (isMBSaved) {
      setIsMBSaved(false);
      toast.info("MB Details unlocked for editing");
    } else {
      if (
        !formData.mbNumber ||
        !formData.mbPageNumber ||
        !formData.measuredBy
      ) {
        toast.error("Please fill MB Number, MB Page Number, and Measured By", {
          position: "top-center",
        });
        return;
      }
      setIsMBSaved(true);
      toast.success("MB Details saved", {
        position: "top-center",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  useEffect(() => {
    if (selectedWorkId) {
      // Reset form defaults before fetching new data
      setFormData({
        mbNumber: "",
        mbPageNumber: "",
        measuredDate: new Date().toISOString().split("T")[0],
        measuredBy: "",
        checkedBy: "",
      });
      fetchEstimateItems(selectedWorkId);
      fetchMBEntries(selectedWorkId);
      setIsMBSaved(false);
    } else {
      setEstimateItems([]);
      setMbEntries([]);
      setIsMBSaved(false);
      setFormData({
        mbNumber: "",
        mbPageNumber: "",
        measuredDate: new Date().toISOString().split("T")[0],
        measuredBy: "",
        checkedBy: "",
      });
    }
  }, [selectedWorkId, fetchMBEntries, setMbEntries]);

  // Auto-switch to measured tab when items are added
  useEffect(() => {
    if (mbEntries.length > 0 && activeTab === "available" && recentlyAddedId) {
      setTimeout(() => setActiveTab("measured"), 500);
    }
  }, [mbEntries.length, recentlyAddedId, activeTab]);

  const fetchWorks = async () => {
    try {
      const data = await fetchWorksApi();
      // Filter works that have estimate items
      const worksWithEstimates = data.filter(
        (work: any) => (work._count?.workEstimateItems || 0) > 0,
      );
      setWorks(worksWithEstimates);
    } catch (error) {
      console.error("Error fetching works:", error);
    }
  };

  const fetchEstimateItems = async (workId: string) => {
    try {
      const validItems = await fetchEstimateItemsApi(workId);
      setEstimateItems(validItems);
    } catch (error) {
      console.error("Error fetching estimate items:", error);
    }
  };

  const openAddDialog = (estimateItem: MeasurableItem) => {
    if (!formData.mbNumber || !formData.mbPageNumber || !formData.measuredBy) {
      toast.error("Please fill MB Number, MB Page Number, and Measured By", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    // Pass the estimate item as is – the dialog will read nos, length, breadth, depth
    setCurrentItem(estimateItem);
    setDialogMeasurements([]);
    setEditingEstimateItemId(null);
    setIsDialogOpen(true);
  };

  // Function to add all subitems of a parent at once
  const addAllSubItems = (parentItem: MeasurableItem) => {
    if (!formData.mbNumber || !formData.mbPageNumber || !formData.measuredBy) {
      toast.error("Please fill MB Number, MB Page Number, and Measured By", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    if (!parentItem.subItems || parentItem.subItems.length === 0) {
      toast.error("No subitems found", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    // Create entries for all subitems
    const newEntries: MBEntry[] = parentItem.subItems.map(
      (subItem: SubItem) => {
        return {
          estimateItemId: parentItem.id,
          subItemId: subItem.id,
          mbNumber: formData.mbNumber,
          mbPageNumber: formData.mbPageNumber,
          workItemDescription: subItem.description,
          unit: subItem.unit,
          quantityExecuted: subItem.quantity, // Use estimate quantity as initial
          rate: subItem.rate,
          amount: subItem.amount,
          measuredDate: formData.measuredDate,
          measuredBy: formData.measuredBy,
          checkedBy: formData.checkedBy,
          measurements: [
            {
              id: Date.now().toString(),
              description: subItem.description,
              nos: subItem.nos ?? 1,
              length: subItem.length ?? 0,
              breadth: subItem.breadth ?? 0,
              depth: subItem.depth ?? 0,
              quantity: subItem.quantity,
            },
          ],
          createdAt: new Date().toISOString(),
        };
      },
    );

    // Add all entries at once
    setMbEntries((prev) => [...prev, ...newEntries]);
    setRecentlyAddedId(parentItem.id);

    toast.success(
      `All ${parentItem.subItems.length} subitems added to measurements`,
      {
        description: `${parentItem.description}`,
        position: "top-center",
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      },
    );

    setTimeout(() => setRecentlyAddedId(null), 2000);
  };

  const openEditDialog = (entry: MBEntry) => {
    setFormData({
      mbNumber: entry.mbNumber,
      mbPageNumber: entry.mbPageNumber,
      measuredDate: new Date(entry.measuredDate).toISOString().split("T")[0],
      measuredBy: entry.measuredBy,
      checkedBy: entry.checkedBy || "",
    });

    const tempItem: EstimateItem = {
      id: entry.subItemId || entry.estimateItemId,
      slNo: 0,
      schedulePageNo: "",
      description: entry.workItemDescription,
      quantity: entry.quantityExecuted ?? 0,
      unit: entry.unit,
      rate: entry.rate,
      amount: entry.amount ?? 0,
    };
    setCurrentItem(tempItem);
    setDialogMeasurements(
      Array.isArray(entry.measurements)
        ? entry.measurements
        : entry.measurements
          ? [entry.measurements]
          : [],
    );
    setEditingEstimateItemId(entry.estimateItemId);
    setEditingSubItemId(entry.subItemId || null);
    setIsDialogOpen(true);
  };

  const handleMeasurementsSave = (
    measurements: Measurement[],
    totalQuantity: number,
    metadata?: any,
  ) => {
    if (editingEstimateItemId) {
      const updatedEntries = mbEntries.map((entry) => {
        const isTargetEntry =
          entry.estimateItemId === editingEstimateItemId &&
          (editingSubItemId
            ? entry.subItemId === editingSubItemId
            : !entry.subItemId);
        if (isTargetEntry) {
          const firstParticular = measurements[0]?.description?.trim?.();
          const updatedEntry = {
            ...entry,
            workItemDescription: firstParticular || entry.workItemDescription,
            measurements: measurements,
            quantityExecuted: totalQuantity,
            amount: totalQuantity * entry.rate,
          };

          if (metadata) {
            updatedEntry.mbNumber = metadata.mbNumber;
            updatedEntry.mbPageNumber = metadata.mbPageNumber;
            updatedEntry.measuredDate = metadata.measuredDate;
            updatedEntry.measuredBy = metadata.measuredBy;
            updatedEntry.checkedBy = metadata.checkedBy;
          }
          return updatedEntry;
        }
        return entry;
      });

      setMbEntries(updatedEntries);
      // Update global formData with latest metadata for better workflow
      if (metadata) {
        setFormData((prev) => ({
          ...prev,
          mbNumber: metadata.mbNumber,
          mbPageNumber: metadata.mbPageNumber,
          measuredDate: metadata.measuredDate,
          measuredBy: metadata.measuredBy,
          checkedBy: metadata.checkedBy,
        }));
      }

      setEditingSubItemId(null);
      toast.success("Measurement updated successfully", {
        position: "top-center",
        duration: 2000,
        icon: <CheckCircle className="h-5 w-5" />,
      });
    } else if (currentItem) {
      // For subitems, we need to store them differently
      const firstParticular = measurements[0]?.description?.trim?.();
      const newEntry: MBEntry = {
        estimateItemId: currentItem.isSubItem
          ? currentItem.parentId!
          : currentItem.id,
        subItemId: currentItem.isSubItem ? currentItem.id : undefined, // Store subitem ID
        mbNumber: metadata?.mbNumber || formData.mbNumber,
        mbPageNumber: metadata?.mbPageNumber || formData.mbPageNumber,
        workItemDescription: firstParticular || currentItem.description,
        unit: currentItem.unit,
        quantityExecuted: totalQuantity,
        rate: currentItem.rate,
        amount: totalQuantity * currentItem.rate,
        measuredDate: metadata?.measuredDate || formData.measuredDate,
        measuredBy: metadata?.measuredBy || formData.measuredBy,
        checkedBy: metadata?.checkedBy || formData.checkedBy,
        measurements: measurements,
        createdAt: new Date().toISOString(),
      };

      setMbEntries((prev) => [...prev, newEntry]);
      // Update global formData with latest metadata for better workflow
      if (metadata) {
        setFormData((prev) => ({
          ...prev,
          mbNumber: metadata.mbNumber,
          mbPageNumber: metadata.mbPageNumber,
          measuredDate: metadata.measuredDate,
          measuredBy: metadata.measuredBy,
          checkedBy: metadata.checkedBy,
        }));
      }

      setRecentlyAddedId(currentItem.id);

      toast.success(`Item Added to Measurements`, {
        description: `${currentItem.description} (${totalQuantity.toFixed(2)} ${currentItem.unit})`,
        position: "top-center",
        duration: 3000,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });

      setTimeout(() => setRecentlyAddedId(null), 2000);
    }
    setEditingEstimateItemId(null);
    setEditingSubItemId(null);
    setIsDialogOpen(false);
  };

  const hasUnsavedChanges = mbEntries.some((e) => !e.id);
  const measurableItems = getMeasurableItems(estimateItems);
  const availableEstimateItems = measurableItems.filter(
    (item) => !item.isHeader && !isItemMeasured(item, mbEntries),
  );
  const groupedItems = getGroupedItems(estimateItems, mbEntries);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const sortedMbEntries = getSortedMbEntries(mbEntries, estimateItems);

  const handleDownloadMBBook = async () => {
    if (!selectedWorkId) {
      toast.error("Please select a work");
      return;
    }

    if (sortedMbEntries.length === 0) {
      toast.error("No MB entries to generate book");
      return;
    }

    const workDetails = works.find((w) => w.id === selectedWorkId);
    if (!workDetails) {
      toast.error("Work details not found");
      return;
    }

    // Extract work meta similar to DetailsPage & AbstractPage
    const aap = workDetails.ApprovedActionPlanDetails || {};
    const nit = workDetails.nitDetails || {};
    const aoc = workDetails.AwardofContract || {};
    const workOrderDetails = aoc?.workorderdetails?.[0] || {};
    const bidAgency = workOrderDetails?.Bidagency || {};
    const agency = bidAgency?.agencydetails || {};

    const workName = aap.activityDescription || "";
    const workId = aap.activityCode || "";
    const location = aap.locationofAsset || "";
    const fund = aap.schemeName || "";
    const agencyName = agency.name || { gpname };

    // Abstract items from MB entries
    const abstractItems = sortedMbEntries.map((entry) => {
      const parentItem = estimateItems.find(
        (item) =>
          item.id === entry.estimateItemId ||
          item.subItems?.some(
            (s) => s.description === entry.workItemDescription,
          ),
      );

      const checkIsSubItem = (e: any, pItem: any) => {
        if (e.subItemId) return true;
        if (!pItem || !Array.isArray(pItem.subItems)) return false;
        return pItem.subItems.some(
          (sub: any) =>
            typeof sub?.description === "string" &&
            sub.description.trim() === e.workItemDescription.trim(),
        );
      };

      const isSubItem = checkIsSubItem(entry, parentItem);

      let displaySlNo = parentItem?.slNo?.toString() || "";
      if (isSubItem && parentItem && parentItem.subItems) {
        const subIdx = parentItem.subItems.findIndex(
          (sub) =>
            sub.id === entry.subItemId ||
            sub.description === entry.workItemDescription,
        );
        if (subIdx !== -1) {
          displaySlNo = `${parentItem.slNo}(${String.fromCharCode(97 + subIdx)})`;
        }
      } else if (parentItem?.slNo) {
        displaySlNo = parentItem.slNo.toString();
      }

      const desc = isSubItem
        ? `${displaySlNo} - ${entry.workItemDescription} (Sub-item of: ${parentItem?.description || "Unknown"})`
        : `${displaySlNo ? displaySlNo + " - " : ""}${entry.workItemDescription}`;

      return {
        description: desc,
        quantity: entry.quantityExecuted || 0,
        unit: entry.unit,
        rate: entry.rate,
        amount: entry.amount || 0,
      };
    });

    // Flatten measurements for MB pages
    const measurements: Array<{
      description: string;
      nos: number;
      length: number;
      breadth: number;
      depth: number;
      quantity: number;
      unit: string;
      rate: number;
      amount: number;
    }> = [];

    sortedMbEntries.forEach((entry) => {
      if (entry.measurements && entry.measurements.length > 0) {
        entry.measurements.forEach((m: any) => {
          const nos = Number(m.nos || 1);
          const length = Number(m.length || 0);
          const breadth = Number(m.breadth || 0);
          const depth = Number(m.depth || 0);
          const qty = Number(m.quantity || 0);
          const rate = Number(entry.rate || 0);
          const amount = qty * rate;

          measurements.push({
            description: m.description || entry.workItemDescription,
            nos,
            length,
            breadth,
            depth,
            quantity: qty,
            unit: entry.unit,
            rate,
            amount,
          });
        });
      } else {
        // No detailed measurements - use entry totals
        measurements.push({
          description: entry.workItemDescription,
          nos: 1,
          length: 0,
          breadth: 0,
          depth: 0,
          quantity: entry.quantityExecuted || 0,
          unit: entry.unit,
          rate: entry.rate,
          amount: entry.amount || 0,
        });
      }
    });

    const completionDate =
      (workDetails as any).completionDate ||
      formData.measuredDate ||
      new Date().toISOString().split("T")[0];

    const officer = formData.measuredBy || "";

    const payload = {
      workName,
      workId,
      location,
      fund,
      agency: agencyName,
      abstractItems,
      measurements,
      completionDate,
      officer,
    };

    try {
      setGeneratingPDF(true);
      const blob = await generatePDFBlob(payload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "measurement-book.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("MB Book PDF downloaded", {
        position: "top-center",
      });
    } catch (error) {
      console.error("Error generating MB book PDF:", error);
      toast.error("Error generating MB book PDF");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handlePrintPreview = () => {
    if (sortedMbEntries.length === 0) {
      toast.error("No MB entries to print");
      return;
    }
    setShowPreview(true);
  };

  // Calculate completion percentage
  const completionPercentage =
    estimateItems.length > 0
      ? Math.round(
          (mbEntries.length /
            measurableItems.filter((item) => !item.isHeader).length) *
            100,
        )
      : 0;

  // Calculate total amount
  const totalAmount = sortedMbEntries.reduce(
    (sum, entry) => sum + entry.amount,
    0,
  );

  return (
    <div className="min-h-screen bg-wb-bg p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">Measurement Book</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-sm">Create Entry</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-wb-primary">
              Create Measurement Book
            </h1>
            <p className="text-gray-600 mt-2">
              Record and manage work measurements with detailed breakdowns
            </p>
          </div>

          <div className="flex items-center gap-4">
            {selectedWorkId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Badge
                  variant="outline"
                  className="bg-wb-primary/5 text-wb-primary border-wb-primary/30"
                >
                  <Hash className="h-3 w-3 mr-1" />
                  MB: {formData.mbNumber || "Not Set"}
                </Badge>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-gray-600">
                  {mbEntries.length} items
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Work Selection Section */}
        <WorkSelection
          works={works}
          selectedWorkId={selectedWorkId}
          onSelect={setSelectedWorkId}
        />

        {/* Progress Bar */}
        <MeasurementProgress
          mbEntriesLength={mbEntries.length}
          measurableItemsLength={
            measurableItems.filter((item) => !item.isHeader).length
          }
          completionPercentage={completionPercentage}
          selectedWorkId={selectedWorkId}
        />

        {/* Main Content Grid */}
        {selectedWorkId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Work Selection & Metadata */}
            <div className="lg:col-span-1 space-y-6">
              {/* MB Metadata Card */}
              <MBMetadata
                formData={formData}
                setFormData={setFormData}
                selectedWorkId={selectedWorkId}
                onConfirm={handleMBConfirm}
                isConfirmed={isMBSaved}
              />

              {/* Summary Stats */}
              <MeasurementSummary
                mbEntries={mbEntries}
                totalAmount={totalAmount}
                selectedWorkId={selectedWorkId}
                workDetails={works.find((w) => w.id === selectedWorkId)}
              />
            </div>

            {/* Right Column - Tables */}
            {isMBSaved && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 bg-wb-bg p-1 border border-wb-border">
                    <TabsTrigger
                      value="available"
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-wb-border"
                    >
                      <FileText className="h-4 w-4" />
                      Available Items
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-wb-primary/10 text-wb-primary"
                      >
                        {availableEstimateItems.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="measured"
                      className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-wb-border"
                    >
                      <Ruler className="h-4 w-4" />
                      Measured Items
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-wb-success/10 text-wb-success"
                      >
                        {mbEntries.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="available" className="space-y-4 mt-4">
                    <AvailableItemsTable
                      availableEstimateItems={availableEstimateItems}
                      groupedItems={groupedItems}
                      expandedGroups={expandedGroups}
                      toggleGroup={toggleGroup}
                      addAllSubItems={addAllSubItems}
                      openAddDialog={openAddDialog}
                      formData={formData}
                      setActiveTab={setActiveTab}
                    />
                  </TabsContent>

                  <TabsContent value="measured" className="space-y-4 mt-4">
                    <MeasuredItemsTable
                      mbEntries={mbEntries}
                      sortedMbEntries={sortedMbEntries}
                      estimateItems={estimateItems}
                      openEditDialog={openEditDialog}
                      handleDeleteEntry={handleDeleteEntry}
                      recentlyAddedId={recentlyAddedId}
                    />
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {selectedWorkId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {hasUnsavedChanges && (
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-wb-success hover:bg-wb-success/90 text-white shadow-lg"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            )}

            {mbEntries.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={handlePrintPreview}
                  className="bg-white hover:bg-wb-bg text-gray-700 border-wb-border shadow-sm"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Preview
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadMBBook}
                  disabled={generatingPDF}
                  className="bg-white hover:bg-wb-bg text-gray-700 border-wb-border shadow-sm"
                >
                  {generatingPDF ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Download MB Book
                </Button>
              </>
            )}
          </motion.div>
        )}
      </div>

      <MBMeasurementDialog
        key={
          editingEstimateItemId
            ? `edit-${editingEstimateItemId}-${editingSubItemId || "main"}`
            : `add-${currentItem?.id || "new"}`
        }
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        estimateItem={currentItem}
        onSave={handleMeasurementsSave}
        initialMeasurements={dialogMeasurements}
        initialMetadata={formData}
      />

      {showPreview && (
        <MBPrintPreview
          entries={sortedMbEntries}
          workDetails={works.find((w) => w.id === selectedWorkId)}
          metadata={formData}
          onClose={() => setShowPreview(false)}
          estimateItems={estimateItems}
        />
      )}
    </div>
  );
}
