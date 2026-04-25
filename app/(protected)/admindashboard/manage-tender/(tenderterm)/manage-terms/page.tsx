"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  ArrowUpDown,
  RefreshCw,
  FileText, // Added for PDF icon
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TenderTerm {
  id: string;
  category: string;
  title: string;
  content: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const fetchTerms = async (): Promise<TenderTerm[]> => {
  const response = await fetch("/api/tender-terms");
  if (!response.ok) throw new Error("Failed to fetch terms");
  return response.json();
};

const deleteTerm = async (id: string) => {
  const response = await fetch(`/api/tender-terms/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete term");
  return response.json();
};

const toggleTermStatus = async (id: string, isActive: boolean) => {
  const response = await fetch(`/api/tender-terms/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive: !isActive }),
  });
  if (!response.ok) throw new Error("Failed to update term status");
  return response.json();
};

const duplicateTerm = async (id: string) => {
  const response = await fetch(`/api/tender-terms/${id}/duplicate`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to duplicate term");
  return response.json();
};

const ManageTermsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortConfig, setSortConfig] = useState<{ 
    key: string; 
    direction: 'ascending' | 'descending' 
  }>({ 
    key: 'order', 
    direction: 'ascending' 
  });

  // Fetch terms using React Query
  const { 
    data: terms = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['tender-terms'],
    queryFn: fetchTerms,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tender-terms'] });
      toast.success("Term deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete term");
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      toggleTermStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tender-terms'] });
      toast.success("Term status updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update term status");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateTerm,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tender-terms'] });
      toast.success(`Duplicated as "${data.title}"`);
    },
    onError: () => {
      toast.error("Failed to duplicate term");
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this term? This action cannot be undone.")) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ id, isActive: currentStatus });
  };

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleExportPDF = () => {
    // Create a PDF of the filtered terms
    const printContent = `
      <html>
        <head>
          <title>Tender Terms Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .active { background-color: #dcfce7; color: #166534; }
            .inactive { background-color: #f3f4f6; color: #374151; }
          </style>
        </head>
        <body>
          <h1>Tender Terms Export</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Total terms: ${filteredTerms.length}</p>
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Category</th>
                <th>Title</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTerms.map(term => `
                <tr>
                  <td>${term.order}</td>
                  <td>${getCategoryLabel(term.category)}</td>
                  <td>${term.title}</td>
                  <td>
                    <span class="badge ${term.isActive ? 'active' : 'inactive'}">
                      ${term.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const sortedTerms = [...terms].sort((a, b) => {
    if (a[sortConfig.key as keyof TenderTerm] < b[sortConfig.key as keyof TenderTerm]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key as keyof TenderTerm] > b[sortConfig.key as keyof TenderTerm]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredTerms = sortedTerms.filter((term) => {
    const matchesSearch = term.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      term.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "ELIGIBLE":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "QUALIFICATION_CRITERIA":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "TERMS_CONDITIONS":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "ELIGIBLE":
        return "Eligible";
      case "QUALIFICATION_CRITERIA":
        return "Qualification Criteria";
      case "TERMS_CONDITIONS":
        return "Terms & Conditions";
      default:
        return category;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="mt-2 text-gray-600">Loading tender terms...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">Failed to load tender terms</p>
              <Button onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
              Manage Tender Terms
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              View, edit, and manage tender terms and conditions
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild className="whitespace-nowrap border-gray-300 hover:bg-gray-50">
              <Link href="/admindashboard/manage-tender/templates">
                Manage Templates
              </Link>
            </Button>
            <Button asChild className="whitespace-nowrap bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Link href="/admindashboard/manage-tender/add-terms">
                <Plus className="h-4 w-4 mr-2" />
                Add New Term
              </Link>
            </Button>
          </div>
        </div>

        {/* Actions and Filters */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search terms by title or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      <option value="ELIGIBLE">Eligible</option>
                      <option value="QUALIFICATION_CRITERIA">
                        Qualification Criteria
                      </option>
                      <option value="TERMS_CONDITIONS">Terms & Conditions</option>
                    </select>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("");
                    }}
                    disabled={!searchTerm && !selectedCategory}
                  >
                    Clear Filters
                  </Button>

                  {/* PDF Export Button */}
                  <Button 
                    variant="outline" 
                    onClick={handleExportPDF}
                    disabled={filteredTerms.length === 0}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {filteredTerms.length} of {terms.length} terms
              </p>
              
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
          </CardContent>
        </Card>

        {/* Terms Table */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-blue-600"></div>
              Tender Terms
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Manage all tender terms and conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="w-20 cursor-pointer"
                      onClick={() => handleSort('order')}
                    >
                      <div className="flex items-center">
                        Order
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead 
                      className="w-24 cursor-pointer"
                      onClick={() => handleSort('isActive')}
                    >
                      <div className="flex items-center">
                        Status
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTerms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="text-gray-500">
                          {searchTerm || selectedCategory
                            ? "No terms found matching your criteria."
                            : "No terms found. Add your first term to get started."}
                        </div>
                        {(searchTerm || selectedCategory) && (
                          <Button 
                            variant="link" 
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedCategory("");
                            }}
                            className="mt-2"
                          >
                            Clear filters
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTerms.map((term) => (
                      <TableRow key={term.id} className="group hover:bg-blue-50/50 transition-colors duration-150">
                        <TableCell className="font-medium text-center">
                          {term.order}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getCategoryBadgeColor(term.category)}
                          >
                            {getCategoryLabel(term.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <div className="font-medium text-gray-900 line-clamp-1">
                              {term.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {term.content}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={term.isActive ? "default" : "secondary"}
                            className={
                              term.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {term.isActive ? "Active" : "Inactive"}
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
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admindashboard/manage-tender/edit-terms/${term.id}`}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Term
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleStatus(term.id, term.isActive)
                                  }
                                  className="cursor-pointer"
                                  disabled={toggleStatusMutation.isPending}
                                >
                                  {term.isActive ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(term.id)}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => duplicateMutation.mutate(term.id)}
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageTermsPage;
