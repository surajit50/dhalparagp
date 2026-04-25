"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Trash2, ArrowLeft, Loader2, FileText, Pencil } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TemplateItem {
  code?: string;
  description: string;
  unit: string;
  rate: number;
  defaultQty?: number;
  category?: string;
}

interface EstimateTemplate {
  id: string;
  name: string;
  estimateType: string;
  items: TemplateItem[];
  createdAt: string;
}

export default function EstimateTemplet() {
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [templateToDelete, setTemplateToDelete] = useState<EstimateTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EstimateTemplate | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [search]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("q", search);

      const res = await fetch(`/api/development-works/estimate-templates?${params.toString()}`);
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

  const handleEditClick = (template: EstimateTemplate) => {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditType(template.estimateType);
  };

  const handleUpdate = async () => {
    if (!editingTemplate) return;
    setIsUpdating(true);
    try {
      const res = await fetch("/api/development-works/estimate-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTemplate.id,
          name: editName,
          estimateType: editType,
        }),
      });

      if (res.ok) {
        setTemplates(
          templates.map((t) =>
            t.id === editingTemplate.id
              ? { ...t, name: editName, estimateType: editType }
              : t
          )
        );
        setEditingTemplate(null);
      } else {
        alert("Failed to update template");
      }
    } catch (error) {
      console.error("Error updating template:", error);
      alert("Error updating template");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/development-works/estimate-templates?id=${templateToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTemplates(templates.filter((t) => t.id !== templateToDelete.id));
        setTemplateToDelete(null);
      } else {
        alert("Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      alert("Error deleting template");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admindashboard/work-manage/estimate-preparation">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Estimate Templates</h1>
              <p className="text-slate-500">Manage your saved estimate templates</p>
            </div>
          </div>
          <Link href="/admindashboard/work-manage/estimate-preparation">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New via Estimate
            </Button>
          </Link>
        </div>

        <div className="flex items-center space-x-2 bg-white p-4 rounded-lg shadow-sm">
          <Search className="h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none focus-visible:ring-0"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed">
            <FileText className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No templates found</h3>
            <p className="text-slate-500 mb-4">
              Start by creating an estimate and saving it as a template.
            </p>
            <Link href="/admindashboard/work-manage/estimate-preparation">
              <Button variant="outline">Go to Estimate Preparation</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold truncate pr-2" title={template.name}>
                      {template.name}
                    </CardTitle>
                    <Badge variant="outline" className="shrink-0">
                      {template.estimateType}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created on {new Date(template.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-slate-600">
                      <p className="font-medium mb-1">Items Preview:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        {template.items.slice(0, 3).map((item, i) => (
                          <li key={i} className="truncate">
                            {item.description}
                          </li>
                        ))}
                      </ul>
                      {template.items.length > 3 && (
                        <p className="text-xs text-slate-400 mt-1 pl-4">
                          + {template.items.length - 3} more items
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end pt-2 border-t gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditClick(template)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setTemplateToDelete(template)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template
              {templateToDelete?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the template details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Template Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Estimate Type</Label>
              <Input
                id="type"
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                placeholder="e.g. road, building, drain"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
