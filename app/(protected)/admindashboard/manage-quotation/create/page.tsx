"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash, Sparkles, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { getProcurementCategories } from "@/action/procurement-category";
import { createQuotation } from "@/action/procurement-quotation";
import { processAiProcurement } from "@/action/procurement-ai";
import { seedGPCategories } from "@/action/procurement-seed";
import { format } from "date-fns";

interface Item {
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

interface FormData {
  nitNo: string;
  nitDate: Date;
  categoryId: string;
  workName: string;
  description: string;
  estimatedAmount: number;
  submissionDate: Date;
  submissionTime: string;
  openingDate: Date;
  openingTime: string;
  dynamicData: Record<string, any>;
  items: Item[];
}

interface Category {
  id: string;
  name: string;
  fields: any[];
}

export default function CreateQuotationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const [formData, setFormData] = useState<FormData>({
    nitNo: "",
    nitDate: new Date(),
    categoryId: "",
    workName: "",
    description: "",
    estimatedAmount: 0,
    submissionDate: new Date(),
    submissionTime: "14:00",
    openingDate: new Date(),
    openingTime: "15:00",
    dynamicData: {},
    items: [{ description: "", quantity: 1, unit: "Nos", rate: 0, amount: 0 }],
  });

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getProcurementCategories();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSeed = useCallback(async () => {
    try {
      setLoading(true);
      const result = await seedGPCategories();
      if (result.success) {
        toast({ title: "GP Categories Initialized" });
        fetchCategories();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, toast]);

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      const category = categories.find((c) => c.id === categoryId);
      setSelectedCategory(category || null);
      setFormData((prev) => ({
        ...prev,
        categoryId,
        dynamicData: {}, // Reset dynamic data when category changes
      }));
    },
    [categories],
  );

  const handleAiProcess = useCallback(async () => {
    if (!aiPrompt) return;
    try {
      setAiLoading(true);
      const result = await processAiProcurement(aiPrompt);
      if (result.success) {
        const aiData = result.data;
        const category = categories.find((c) => c.id === aiData.categoryId);
        setSelectedCategory(category || null);

        setFormData((prev) => ({
          ...prev,
          categoryId: aiData.categoryId,
          workName: aiData.workName,
          items:
            aiData.items.length > 0
              ? aiData.items.map((it: any) => ({
                  ...it,
                  rate: 0,
                  amount: 0,
                }))
              : prev.items,
          estimatedAmount: aiData.estimatedAmount || prev.estimatedAmount,
          dynamicData: aiData.dynamicData || {},
        }));

        toast({
          title: "AI Generation Successful",
          description: "Fields have been populated.",
        });
      } else {
        toast({
          title: "AI Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process AI request",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  }, [aiPrompt, categories, toast]);

  const addItem = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", quantity: 1, unit: "Nos", rate: 0, amount: 0 },
      ],
    }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const handleItemChange = useCallback(
    (index: number, field: keyof Item, value: any) => {
      setFormData((prev) => {
        const newItems = [...prev.items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === "quantity" || field === "rate") {
          newItems[index].amount =
            (newItems[index].quantity || 0) * (newItems[index].rate || 0);
        }
        return { ...prev, items: newItems };
      });
    },
    [],
  );

  const handleDynamicChange = useCallback((name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      dynamicData: { ...prev.dynamicData, [name]: value },
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      const result = await createQuotation(formData);
      if (result.success) {
        toast({
          title: "Quotation Created",
          description: "NIT has been saved successfully.",
        });
        router.push("/admindashboard/manage-quotation/view");
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quotation",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }, [formData, router, toast]);

  return (
    <div className="container mx-auto py-6 space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Create New Quotation</h1>
          <p className="text-muted-foreground">
            Issue a new NIQ (Notice Inviting Quotation)
          </p>
        </div>
      </div>

      {/* AI Assistant Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" /> AI Procurement Assistant
          </CardTitle>
          <CardDescription>
            Type what you need, and the AI will fill the form for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input
            placeholder="e.g. Create quotation for 500 bags cement or Hire JCB for 6 hours"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAiProcess()}
          />
          <Button onClick={handleAiProcess} disabled={aiLoading}>
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Generate"
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quotation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>NIT/Memo Number</Label>
                  <Input
                    value={formData.nitNo}
                    onChange={(e) =>
                      setFormData({ ...formData, nitNo: e.target.value })
                    }
                    placeholder="e.g. 123/GP/2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label>NIT Date</Label>
                  <Input
                    type="date"
                    value={format(formData.nitDate, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nitDate: new Date(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                {categories.length === 0 ? (
                  <div className="flex gap-2">
                    <p className="text-sm text-muted-foreground self-center">
                      No categories found.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSeed}
                      disabled={loading}
                    >
                      Initialize GP Categories
                    </Button>
                  </div>
                ) : (
                  <Select
                    onValueChange={handleCategoryChange}
                    value={formData.categoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Work Name / Title</Label>
                <Input
                  value={formData.workName}
                  onChange={(e) =>
                    setFormData({ ...formData, workName: e.target.value })
                  }
                  placeholder="e.g. Repair of Village Drain at Sansad IV"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detailed description of the work or supply requirements"
                />
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Category Fields */}
          {selectedCategory && selectedCategory.fields.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="text-blue-700">
                  Category Specific Information
                </CardTitle>
                <CardDescription>
                  Custom requirements for {selectedCategory.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {selectedCategory.fields.map((field: any) => (
                  <div key={field.id} className="space-y-2">
                    <Label>
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    {field.type === "select" ? (
                      <Select
                        onValueChange={(val) =>
                          handleDynamicChange(field.name, val)
                        }
                        value={formData.dynamicData[field.name] || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options.map((opt: string) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "textarea" ? (
                      <Textarea
                        value={formData.dynamicData[field.name] || ""}
                        onChange={(e) =>
                          handleDynamicChange(field.name, e.target.value)
                        }
                      />
                    ) : (
                      <Input
                        type={field.type}
                        value={formData.dynamicData[field.name] || ""}
                        onChange={(e) =>
                          handleDynamicChange(field.name, e.target.value)
                        }
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Items Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items / Schedule of Works</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left w-24">Qty</th>
                      <th className="p-2 text-left w-24">Unit</th>
                      <th className="p-2 text-left w-32">Rate (Est)</th>
                      <th className="p-2 text-left w-32">Amount</th>
                      <th className="p-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-2">
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Item description"
                            className="h-8"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                parseFloat(e.target.value),
                              )
                            }
                            className="h-8"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={item.unit}
                            onChange={(e) =>
                              handleItemChange(index, "unit", e.target.value)
                            }
                            className="h-8"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "rate",
                                parseFloat(e.target.value),
                              )
                            }
                            className="h-8"
                          />
                        </td>
                        <td className="p-2 font-medium">
                          ₹{item.amount.toLocaleString()}
                        </td>
                        <td className="p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 font-bold">
                    <tr>
                      <td colSpan={4} className="p-2 text-right">
                        Total Estimated Amount:
                      </td>
                      <td className="p-2">
                        ₹
                        {formData.items
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString()}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Schedule Card */}
          <Card>
            <CardHeader>
              <CardTitle>Timelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Submission Deadline Date</Label>
                <Input
                  type="date"
                  value={format(formData.submissionDate, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      submissionDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Submission Time</Label>
                <Input
                  type="time"
                  value={formData.submissionTime}
                  onChange={(e) =>
                    setFormData({ ...formData, submissionTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Opening Date</Label>
                <Input
                  type="date"
                  value={format(formData.openingDate, "yyyy-MM-dd")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      openingDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Opening Time</Label>
                <Input
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) =>
                    setFormData({ ...formData, openingTime: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full h-12 text-lg"
            size="lg"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            Save & Publish NIQ
          </Button>
        </div>
      </div>
    </div>
  );
}
