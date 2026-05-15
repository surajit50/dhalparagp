/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Loader2, Edit, Save, ArrowRight, Info, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

/* ===============================
ENUMS
================================ */

const GenderEnum = ["male", "female", "other"] as const;

const MaritialStatusEnum = [
  "married",
  "unmarried",
  "divorced",
  "widowed",
] as const;

const LivingStatusEnum = ["alive", "dead"] as const;

/* ===============================
UTIL
================================ */

const formatLabel = (value: string) =>
  value.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

/* ===============================
COMPONENT
================================ */

export default function CorrectionRequestForm({
  warishApplicationId,
  warishDetailId,
  targetType,
  availableFields,
  warishDetails = [],
  onRequestSubmitted,
  requesterName = "",
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedDetailId, setSelectedDetailId] = useState(
    warishDetailId || "",
  );

  // New state for multiple modifications
  const [modifications, setModifications] = useState<any[]>([]);

  // Current field being edited in the form
  const [currentMod, setCurrentMod] = useState({
    fieldToModify: "",
    proposedValue: "",
  });

  const [reasonForModification, setReasonForModification] = useState("");
  const [requestedBy, setRequestedBy] = useState(requesterName);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fieldOptionsMap: any = {
    gender: GenderEnum.map((g) => ({
      value: g,
      label: formatLabel(g),
    })),

    maritialStatus: MaritialStatusEnum.map((m) => ({
      value: m,
      label: formatLabel(m),
    })),

    livingStatus: LivingStatusEnum.map((l) => ({
      value: l,
      label: formatLabel(l),
    })),
  };

  const isSelectField = fieldOptionsMap[currentMod.fieldToModify];

  const selectedDetail = useMemo(
    () => warishDetails.find((d: any) => d.id === selectedDetailId),
    [warishDetails, selectedDetailId],
  );

  const getCurrentValue = (field: string) => {
    if (!field) return "";

    if (targetType === "detail" && selectedDetail) {
      return (selectedDetail as any)[field] || "";
    }

    const fieldObj = availableFields.find((f: any) => f.value === field);

    return fieldObj?.currentValue || "";
  };

  const currentFieldValue = useMemo(
    () => getCurrentValue(currentMod.fieldToModify),
    [currentMod.fieldToModify, selectedDetail],
  );

  const addModification = () => {
    if (!currentMod.fieldToModify || !currentMod.proposedValue) {
      setFormErrors({
        ...formErrors,
        currentMod: "Please select a field and provide a proposed value",
      });
      return;
    }

    // Check if field already in modifications
    if (modifications.find((m) => m.field === currentMod.fieldToModify)) {
      setFormErrors({
        ...formErrors,
        currentMod: "This field is already in the list",
      });
      return;
    }

    const newMod = {
      field: currentMod.fieldToModify,
      oldValue: currentFieldValue,
      newValue: currentMod.proposedValue,
      label:
        availableFields.find((f: any) => f.value === currentMod.fieldToModify)
          ?.label || currentMod.fieldToModify,
    };

    setModifications([...modifications, newMod]);
    setCurrentMod({ fieldToModify: "", proposedValue: "" });
    setFormErrors({});
  };

  const removeModification = (index: number) => {
    setModifications(modifications.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (modifications.length === 0 && !currentMod.fieldToModify)
      errors.modifications = "Add at least one correction";

    if (!reasonForModification)
      errors.reasonForModification = "Reason required";

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let finalModifications = [...modifications];

    // If user has filled the current mod but not clicked "Add", add it automatically
    if (
      currentMod.fieldToModify &&
      currentMod.proposedValue &&
      !modifications.find((m) => m.field === currentMod.fieldToModify)
    ) {
      finalModifications.push({
        field: currentMod.fieldToModify,
        oldValue: currentFieldValue,
        newValue: currentMod.proposedValue,
        label:
          availableFields.find((f: any) => f.value === currentMod.fieldToModify)
            ?.label || currentMod.fieldToModify,
      });
    }

    if (finalModifications.length === 0) {
      setFormErrors({ modifications: "Add at least one correction" });
      return;
    }

    if (!reasonForModification) {
      setFormErrors({ reasonForModification: "Reason required" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        warishApplicationId,
        warishDetailId: targetType === "detail" ? selectedDetailId : undefined,
        modifications: finalModifications.map(
          ({ field, oldValue, newValue }) => ({ field, oldValue, newValue }),
        ),
        reasonForModification,
        requestedBy,
      };

      const res = await fetch("/api/warish-correction-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Submission failed");
      }

      toast({
        title: "Success",
        description: "Correction request submitted",
      });

      setIsOpen(false);
      setModifications([]);
      setCurrentMod({ fieldToModify: "", proposedValue: "" });
      setReasonForModification("");
      onRequestSubmitted();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Submission failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ===============================
  UI
  ============================== */

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="shadow-sm">
          <Edit className="w-4 h-4 mr-2" />
          Request Correction
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}

        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Info className="w-5 h-5 text-orange-600" />
            Correction Request
          </DialogTitle>

          <p className="text-sm text-muted-foreground">
            You can request corrections for multiple fields in a single
            submission.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* ADD MODIFICATION SECTION */}

          <Card className="p-4 bg-muted/30 border-dashed">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Field to Correct</Label>
                  <Select
                    value={currentMod.fieldToModify}
                    onValueChange={(value) =>
                      setCurrentMod((prev) => ({
                        ...prev,
                        fieldToModify: value,
                        proposedValue: "",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFields.map((field: any) => (
                        <SelectItem
                          key={field.value}
                          value={field.value}
                          disabled={modifications.some(
                            (m) => m.field === field.value,
                          )}
                        >
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Proposed Value</Label>
                  {isSelectField ? (
                    <Select
                      value={currentMod.proposedValue}
                      onValueChange={(value) =>
                        setCurrentMod((prev) => ({
                          ...prev,
                          proposedValue: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct value" />
                      </SelectTrigger>
                      <SelectContent>
                        {isSelectField.map((option: any) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Enter correct value"
                      value={currentMod.proposedValue}
                      onChange={(e) =>
                        setCurrentMod((prev) => ({
                          ...prev,
                          proposedValue: e.target.value,
                        }))
                      }
                      disabled={!currentMod.fieldToModify}
                    />
                  )}
                </div>
              </div>

              {currentMod.fieldToModify && (
                <div className="flex items-center justify-between bg-background p-2 rounded border text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Current</Badge>
                    <span className="font-medium">
                      {formatLabel(currentFieldValue || "Empty")}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addModification}
                    disabled={!currentMod.proposedValue}
                    variant="secondary"
                  >
                    Add to List
                  </Button>
                </div>
              )}

              {formErrors.currentMod && (
                <p className="text-xs text-destructive font-medium">
                  {formErrors.currentMod}
                </p>
              )}
            </div>
          </Card>

          {/* LIST OF MODIFICATIONS */}

          {modifications.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                Corrections to be requested ({modifications.length})
              </Label>
              <div className="space-y-2">
                {modifications.map((mod, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-lg group animate-in slide-in-from-left-2 duration-200"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center text-sm">
                      <span className="font-semibold text-orange-700 dark:text-orange-400">
                        {mod.label}
                      </span>
                      <div className="flex items-center gap-2 text-muted-foreground line-through decoration-muted-foreground/40 text-xs">
                        {formatLabel(mod.oldValue || "Empty")}
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <ArrowRight className="w-3 h-3 text-orange-500" />
                        {formatLabel(mod.newValue)}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => removeModification(index)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formErrors.modifications && (
            <p className="text-sm text-destructive font-medium bg-destructive/5 p-2 rounded border border-destructive/20">
              {formErrors.modifications}
            </p>
          )}

          {/* REASON */}

          <div className="space-y-3">
            <Label className="font-semibold">Reason for Correction</Label>
            <Textarea
              rows={3}
              value={reasonForModification}
              onChange={(e) => setReasonForModification(e.target.value)}
              placeholder="Explain why these corrections are required (e.g., Spelling mistake in original document)..."
              className="resize-none"
            />
            {formErrors.reasonForModification && (
              <p className="text-xs text-destructive font-medium">
                {formErrors.reasonForModification}
              </p>
            )}
          </div>

          {/* ACTION */}

          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[160px] bg-orange-600 hover:bg-orange-700 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Submit{" "}
                  {modifications.length +
                    (currentMod.fieldToModify && currentMod.proposedValue
                      ? 1
                      : 0)}{" "}
                  Corrections
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
