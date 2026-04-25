"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  MoreHorizontal,
  RefreshCw,
  Search,
  Eye,
  Edit,
  Trash2,
  EyeOff,
  EyeIcon,
  ListChecks,
  Sparkles,
} from "lucide-react";

type TemplateContent = {
  eligible: string[];
  qualificationCriteria: string[];
  termsConditions: string[];
};

type TenderTermTemplate = {
  id: string;
  name: string;
  description: string | null;
  content: TemplateContent;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const fetchTemplates = async (): Promise<TenderTermTemplate[]> => {
  const response = await fetch("/api/tender-term-templates");
  if (!response.ok) throw new Error("Failed to fetch templates");
  return response.json();
};

const patchTemplateStatus = async ({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) => {
  const response = await fetch(`/api/tender-term-templates/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) throw new Error("Failed to update template status");
  return response.json();
};

const deleteTemplate = async (id: string) => {
  const response = await fetch(`/api/tender-term-templates/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete template");
  return response.json();
};

const duplicateTemplate = async (id: string) => {
  const response = await fetch(`/api/tender-term-templates/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to duplicate template");
  return response.json();
};

const createTemplateFromCurrentTerms = async ({
  name,
  includeInactive,
}: {
  name: string;
  includeInactive: boolean;
}) => {
  const response = await fetch("/api/tender-term-templates/from-current", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      includeInactive,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Failed to create template from current terms");
  }

  return response.json();
};

const TemplatesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<TenderTermTemplate | null>(null);

  const { data: templates = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tender-term-templates"],
    queryFn: fetchTemplates,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: patchTemplateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tender-term-templates"] });
      toast.success("Template status updated");
    },
    onError: () => {
      toast.error("Unable to update template status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tender-term-templates"] });
      toast.success("Template deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete template");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateTemplate,
    onSuccess: (data: TenderTermTemplate) => {
      queryClient.invalidateQueries({ queryKey: ["tender-term-templates"] });
      toast.success(`Template duplicated as "${data.name}"`);
    },
    onError: () => {
      toast.error("Failed to duplicate template");
    },
  });

  const createFromCurrentMutation = useMutation({
    mutationFn: createTemplateFromCurrentTerms,
    onSuccess: (data: TenderTermTemplate) => {
      queryClient.invalidateQueries({ queryKey: ["tender-term-templates"] });
      toast.success(`Template "${data.name}" created from current terms`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesSearch =
        !normalizedSearch ||
        template.name.toLowerCase().includes(normalizedSearch) ||
        template.description?.toLowerCase().includes(normalizedSearch);

      const matchesStatus = showInactive ? true : template.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [templates, search, showInactive]);

  const handleDelete = (id: string) => {
    const template = templates.find((item) => item.id === id);
    const confirmationMessage = template
      ? `Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`
      : "Are you sure you want to delete this template?";

    if (!window.confirm(confirmationMessage)) return;

    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-6xl flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3 text-gray-600">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading tender term templates...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">
            Failed to load tender term templates
          </h2>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
              Tender Term Templates
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Create reusable bundles of tender eligibility, qualification, and terms content.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const defaultName = "Template 1";
                const enteredName = window.prompt(
                  "Enter a name for the template created from current tender terms:",
                  defaultName,
                );
                if (!enteredName) return;
                const includeInactive = window.confirm(
                  "Include inactive tender terms in the template?",
                );
                createFromCurrentMutation.mutate({
                  name: enteredName,
                  includeInactive,
                });
              }}
              disabled={createFromCurrentMutation.isPending}
              className="border-gray-300 hover:bg-gray-50"
            >
              {createFromCurrentMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
              )}
              Build from current terms
            </Button>
            <Button 
              asChild 
              disabled={createFromCurrentMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/admindashboard/manage-tender/add-template">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Link>
            </Button>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by template name or description"
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInactive((prev) => !prev)}
                >
                  {showInactive ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Hide inactive
                    </>
                  ) : (
                    <>
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Show inactive
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  className="text-gray-600"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredTemplates.length} of {templates.length} templates
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-blue-600"></div>
              Templates
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Manage reusable blocks of tender terms and conditions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Description
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Sections
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-28 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="text-gray-500">
                          No templates found. Create your first template to get started.
                        </div>
                        <Button asChild variant="link" className="mt-2">
                          <Link href="/admindashboard/manage-tender/add-template">
                            Create template
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTemplates.map((template) => {
                      const sectionCounts = {
                        eligible: template.content?.eligible?.length ?? 0,
                        qualification: template.content?.qualificationCriteria?.length ?? 0,
                        terms: template.content?.termsConditions?.length ?? 0,
                      };

                      return (
                        <TableRow key={template.id} className="group hover:bg-blue-50/50 transition-colors duration-150">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">
                                {template.name}
                              </span>
                              <span className="text-xs text-gray-500 md:hidden">
                                {template.description || "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="line-clamp-2 text-sm text-gray-600">
                              {template.description || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                Eligible: {sectionCounts.eligible}
                              </Badge>
                              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                Qualification: {sectionCounts.qualification}
                              </Badge>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
                                Terms: {sectionCounts.terms}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={template.isActive ? "default" : "secondary"}
                              className={
                                template.isActive
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                              }
                            >
                              {template.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 data-[state=open]:bg-gray-100"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => setPreviewTemplate(template)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/admindashboard/manage-tender/edit-template/${template.id}`}
                                      className="cursor-pointer"
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      toggleStatusMutation.mutate({
                                        id: template.id,
                                        isActive: !template.isActive,
                                      })
                                    }
                                    className="cursor-pointer"
                                    disabled={toggleStatusMutation.isPending}
                                  >
                                    {template.isActive ? (
                                      <>
                                        <EyeOff className="h-4 w-4 mr-2" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <EyeIcon className="h-4 w-4 mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(template.id)}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => duplicateMutation.mutate(template.id)}
                                    className="cursor-pointer"
                                    disabled={duplicateMutation.isPending}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(previewTemplate)} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-600" />
              {previewTemplate?.name ?? "Template Preview"}
            </DialogTitle>
            {previewTemplate?.description ? (
              <DialogDescription>{previewTemplate.description}</DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-2">
            {previewTemplate ? (
              <>
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Eligible ({previewTemplate.content?.eligible?.length ?? 0})
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                    {(previewTemplate.content?.eligible ?? []).map((item, index) => (
                      <li key={`eligible-${index}`}>{item}</li>
                    ))}
                    {(previewTemplate.content?.eligible ?? []).length === 0 && (
                      <li className="list-none text-gray-400">No items defined</li>
                    )}
                  </ul>
                </section>
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Qualification Criteria ({previewTemplate.content?.qualificationCriteria?.length ?? 0})
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                    {(previewTemplate.content?.qualificationCriteria ?? []).map((item, index) => (
                      <li key={`qualification-${index}`}>{item}</li>
                    ))}
                    {(previewTemplate.content?.qualificationCriteria ?? []).length === 0 && (
                      <li className="list-none text-gray-400">No items defined</li>
                    )}
                  </ul>
                </section>
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Terms &amp; Conditions ({previewTemplate.content?.termsConditions?.length ?? 0})
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                    {(previewTemplate.content?.termsConditions ?? []).map((item, index) => (
                      <li key={`terms-${index}`}>{item}</li>
                    ))}
                    {(previewTemplate.content?.termsConditions ?? []).length === 0 && (
                      <li className="list-none text-gray-400">No items defined</li>
                    )}
                  </ul>
                </section>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplatesPage;

