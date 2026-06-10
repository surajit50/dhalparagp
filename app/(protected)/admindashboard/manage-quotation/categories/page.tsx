"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  getProcurementCategories,
  createProcurementCategory,
  updateProcurementCategory,
  deleteProcurementCategory,
  addProcurementField,
  deleteProcurementField,
} from "@/action/procurement-category";
import { seedGPCategories } from "@/action/procurement-seed";
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    icon: "",
    color: "",
  });
  const [newField, setNewField] = useState({
    label: "",
    name: "",
    type: "text",
    required: false,
    options: "",
    order: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const data = await getProcurementCategories();
    setCategories(data);
    setLoading(false);
  }

  async function handleSaveCategory() {
    if (!newCategory.name) return;

    let result;
    if (selectedCategory) {
      result = await updateProcurementCategory(
        selectedCategory.id,
        newCategory,
      );
    } else {
      result = await createProcurementCategory(newCategory);
    }

    if (result.success) {
      toast({
        title: `Category ${selectedCategory ? "updated" : "created"} successfully`,
      });
      setIsCategoryDialogOpen(false);
      setSelectedCategory(null);
      setNewCategory({ name: "", description: "", icon: "", color: "" });
      fetchCategories();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  async function handleDeleteCategory(id: string) {
    if (
      !confirm(
        "Are you sure? This will delete all fields and quotations in this category.",
      )
    )
      return;
    const result = await deleteProcurementCategory(id);
    if (result.success) {
      toast({ title: "Category deleted" });
      fetchCategories();
    }
  }

  async function handleAddField() {
    if (!newField.label || !newField.name) return;

    const fieldData = {
      label: newField.label,
      name: newField.name,
      type: newField.type,
      required: newField.required,
      order: newField.order,
      options: newField.options
        ? newField.options.split(",").map((o) => o.trim())
        : [],
    };

    const result = await addProcurementField(selectedCategory.id, fieldData);
    if (result.success) {
      toast({ title: "Field added successfully" });
      setIsFieldDialogOpen(false);
      setNewField({
        label: "",
        name: "",
        type: "text",
        required: false,
        options: "",
        order: 0,
      });
      fetchCategories();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  async function handleDeleteField(id: string) {
    const result = await deleteProcurementField(id);
    if (result.success) {
      toast({ title: "Field deleted" });
      fetchCategories();
    }
  }

  async function handleSeedCategories() {
    setLoading(true);
    const result = await seedGPCategories();
    if (result.success) {
      toast({
        title: "GP Categories Initialized",
        description: "Standard Gram Panchayat categories have been added.",
      });
      fetchCategories();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Procurement Categories</h1>
          <p className="text-muted-foreground">
            Manage dynamic categories and custom fields for quotations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSeedCategories}
            disabled={loading}
          >
            Initialize GP Categories
          </Button>
          <Button
            onClick={() => {
              setSelectedCategory(null);
              setNewCategory({
                name: "",
                description: "",
                icon: "",
                color: "",
              });
              setIsCategoryDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <span style={{ color: category.color }}>
                    {category.icon || "📁"}
                  </span>
                  {category.name}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setIsFieldDialogOpen(true);
                  }}
                >
                  <Settings2 className="mr-2 h-4 w-4" /> Fields
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setNewCategory({
                      name: category.name,
                      description: category.description || "",
                      icon: category.icon || "",
                      color: category.color || "",
                    });
                    setIsCategoryDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {category.fields.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      No custom fields defined.
                    </span>
                  ) : (
                    category.fields.map((field: any) => (
                      <Badge
                        key={field.id}
                        variant="secondary"
                        className="flex gap-2 py-1 px-3"
                      >
                        {field.label} ({field.type})
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Dialog */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
            <DialogDescription>
              Define a new procurement category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                placeholder="e.g. Vehicle & Machinery Hiring"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon (Emoji)</Label>
                <Input
                  id="icon"
                  value={newCategory.icon}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, icon: e.target.value })
                  }
                  placeholder="🚜"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={newCategory.color}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, color: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveCategory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Field Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Custom Field to {selectedCategory?.name}
            </DialogTitle>
            <DialogDescription>
              Define a custom field for this category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="f-label">Label</Label>
              <Input
                id="f-label"
                value={newField.label}
                onChange={(e) =>
                  setNewField({ ...newField, label: e.target.value })
                }
                placeholder="e.g. Vehicle Type"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="f-name">System Name (snake_case)</Label>
              <Input
                id="f-name"
                value={newField.name}
                onChange={(e) =>
                  setNewField({ ...newField, name: e.target.value })
                }
                placeholder="e.g. vehicle_type"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="f-type">Type</Label>
              <select
                id="f-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newField.type}
                onChange={(e) =>
                  setNewField({ ...newField, type: e.target.value })
                }
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="select">Select</option>
                <option value="textarea">Textarea</option>
              </select>
            </div>
            {newField.type === "select" && (
              <div className="grid gap-2">
                <Label htmlFor="f-options">Options (comma separated)</Label>
                <Input
                  id="f-options"
                  value={newField.options}
                  onChange={(e) =>
                    setNewField({ ...newField, options: e.target.value })
                  }
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="f-required"
                checked={newField.required}
                onChange={(e) =>
                  setNewField({ ...newField, required: e.target.checked })
                }
              />
              <Label htmlFor="f-required">Required Field</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddField}>Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
