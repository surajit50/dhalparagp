"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";

interface EstimateType {
  id: string;
  name: string;
  code: string;
}

interface SaveTemplateDialogProps {
  items: any[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function SaveTemplateDialog({
  items,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: SaveTemplateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const [name, setName] = useState("");
  const [estimateType, setEstimateType] = useState("");
  const [types, setTypes] = useState<EstimateType[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTypes();
      setName("");
      setEstimateType("");
    }
  }, [open]);

  const fetchTypes = async () => {
    try {
      setFetchingTypes(true);
      const res = await fetch("/api/development-works/estimate-types");
      if (res.ok) {
        const data = await res.json();
        setTypes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching types:", error);
    } finally {
      setFetchingTypes(false);
    }
  };

  const handleSave = async () => {
    if (!name || !estimateType) {
      alert("Please enter a name and select an estimate type");
      return;
    }

    if (items.length === 0) {
      alert("No items to save");
      return;
    }

    setLoading(true);
    try {
      // Map items to template format including subItems and measurements
      const templateItems = items.map((item) => ({
        code: item.schedulePageNo || "",
        description: item.description,
        unit: item.unit,
        rate: Number(item.rate),
        defaultQty: Number(item.quantity),
        category: "General",
        subItems: Array.isArray(item.subItems) ? item.subItems : [],
        measurements: Array.isArray(item.measurements) ? item.measurements : [],
        nos: item.nos ?? 1,
        length: item.length ?? 0,
        breadth: item.breadth ?? 0,
        depth: item.depth ?? 0,
      }));

      const response = await fetch(
        "/api/development-works/estimate-templates",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            estimateType, // This should be the 'code' or 'id' depending on what the API expects.
            // The API expects 'estimateType' string. Let's assume it matches the type 'code' or 'id' we send.
            // Looking at the API code: t.estimateType === estimateType.
            // And existing seeds use 'road', 'building', etc. which are codes.
            // So we should send the type code.
            items: templateItems,
          }),
        },
      );

      if (response.ok) {
        alert("Template saved successfully");
        setOpen(false);
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Error saving template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save as Template
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard Road Estimate"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Estimate Type</Label>
            <Select value={estimateType} onValueChange={setEstimateType}>
              <SelectTrigger>
                <SelectValue
                  placeholder={fetchingTypes ? "Loading..." : "Select type"}
                />
              </SelectTrigger>
              <SelectContent>
                {types
                  .filter((type) => type.code && type.code.trim() !== "")
                  .map((type) => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            Saving {items.length} items to this template.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
