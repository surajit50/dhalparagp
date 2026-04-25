/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface EstimateType {
  id: string;
  name: string;
  code: string;
}

interface TemplateItem {
  code?: string;
  description: string;
  unit: string;
  rate: number;
  defaultQty?: number;
  category?: string;
  subItems?: Array<{
    id?: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
    nos?: number;
    length?: number;
    breadth?: number;
    depth?: number;
  }>;
  measurements?: Array<{
    id?: string;
    description: string;
    nos: number;
    length: number;
    breadth: number;
    depth: number;
    quantity: number;
  }>;
  nos?: number;
  length?: number;
  breadth?: number;
  depth?: number;
}

interface EstimateTemplate {
  id: string;
  name: string;
  estimateType: string;
  items: TemplateItem[];
  createdAt: string;
}

interface LoadTemplateDialogProps {
  onSelectTemplate: (items: any[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function LoadTemplateDialog({
  onSelectTemplate,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: LoadTemplateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const [types, setTypes] = useState<EstimateType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      fetchTypes();
    }
  }, [open]);

  useEffect(() => {
    fetchTemplates();
  }, [selectedType, search, open]);

  const fetchTypes = async () => {
    try {
      const res = await fetch("/api/development-works/estimate-types");
      if (res.ok) {
        const data = await res.json();
        setTypes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTemplates = async () => {
    if (!open) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append("estimateType", selectedType);
      if (search) params.append("q", search);

      const res = await fetch(
        `/api/development-works/estimate-templates?${params.toString()}`,
      );
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (template: EstimateTemplate) => {
    const itemsToAdd = template.items.map((item) => {
      const qty = item.defaultQty ?? 1;
      const subItems = Array.isArray(item.subItems)
        ? item.subItems.map((sub: any) => ({
            ...sub,
            id: sub.id || `sub-${Math.random().toString(36).slice(2, 9)}`,
          }))
        : [];
      return {
        schedulePageNo: item.code || "",
        description: item.description,
        unit: item.unit,
        rate: item.rate,
        quantity: qty,
        amount: item.rate * qty,
        measurements: Array.isArray(item.measurements) ? item.measurements : [],
        subItems,
        nos: item.nos ?? 1,
        length: item.length ?? 0,
        breadth: item.breadth ?? 0,
        depth: item.depth ?? 0,
      };
    });

    onSelectTemplate(itemsToAdd);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Load from Template
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Load Estimate Template</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden pt-4">
          {/* Left Sidebar - Types */}
          <div className="w-48 flex-shrink-0 border-r pr-4 overflow-y-auto">
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
              Categories
            </h3>
            <Button
              variant={selectedType === "" ? "secondary" : "ghost"}
              className="w-full justify-start text-sm mb-1"
              onClick={() => setSelectedType("")}
            >
              All Templates
            </Button>
            <div className="space-y-1">
              {types.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.code ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => setSelectedType(type.code)}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Right Content - Templates */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No templates found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleSelect(template)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">
                            {template.name}
                          </CardTitle>
                          <Badge variant="outline">
                            {template.estimateType}
                          </Badge>
                        </div>
                        <CardDescription>
                          {template.items.length} items •{" "}
                          {new Date(template.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.items
                            .slice(0, 3)
                            .map((i) => i.description)
                            .join(", ")}
                          {template.items.length > 3 && "..."}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
