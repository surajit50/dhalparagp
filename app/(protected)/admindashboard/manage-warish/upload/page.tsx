"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  FileSearch,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Edit,
  Eye,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type WarishApplication = {
  id: string;
  acknowlegment: string;
  warishRefNo: string | null;
  nameOfDeceased: string;
  dateOfDeath: Date | null;
  applicantName: string;
  reportingDate: Date | null;
};

export default function WarishApplicationSearch() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [applications, setApplications] = useState<WarishApplication[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError(null);
    setApplications(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchQuery }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch applications");
      }

      // For demonstration, we'll assume the API returns an array of applications
      // If your API returns a single application, you can wrap it in an array: [result]
      const result = await response.json();
      setApplications(Array.isArray(result) ? result : [result]);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      setError(
        error.message || "An error occurred while fetching applications"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    router.push(`/admindashboard/manage-warish/view/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateString: Date | string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-12">
      <div className="container mx-auto py-8 max-w-6xl px-4 sm:px-6">
        <div className="mb-8 space-y-4">
          <Breadcrumb className="animate-in fade-in slide-in-from-left-5 duration-500">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/admindashboard"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  aria-current="page"
                  className="font-medium"
                >
                  Search Warish
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 animate-in fade-in slide-in-from-left-5 duration-700 delay-100">
            <div className="bg-primary/10 p-4 rounded-2xl shadow-sm">
              <FileSearch className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Warish Application Search
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                Upload document 
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-8 shadow-xl border-t-4 border-t-primary rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
          <CardHeader className="pb-4 bg-muted/30 border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Upload documents 
            </CardTitle>
            <CardDescription className="mt-1">
              Search by Acknowledgement Number, Warish Reference, or Deceased
              Name
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative w-full group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  placeholder="Enter search term..."
                  className="pl-11 h-12 text-base focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 border-muted-foreground/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <span className="text-sm text-muted-foreground mt-2 block sm:hidden">
                  Press Enter to search
                </span>
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="h-12 px-8 w-full sm:w-auto bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FileSearch className="h-4 w-4" />
                    Search
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 border-2 rounded-xl shadow-lg animate-in fade-in zoom-in duration-300"
          >
            <AlertDescription className="flex items-center gap-2 py-1">
              <AlertCircle className="h-5 w-5" />
              {error}
            </AlertDescription>
          </Alert>
        )}

        {applications && applications.length > 0 && !loading && (
          <Card className="shadow-xl rounded-xl overflow-hidden border-t-4 border-t-primary animate-in fade-in slide-in-from-bottom-5 duration-700">
            <CardHeader className="bg-muted/30 border-b pb-5">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold">Search Results</span>
                <Badge className="ml-2">{applications.length} found</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20 hover:bg-muted/30">
                      <TableHead className="font-semibold">
                        Acknowledgement
                      </TableHead>
                      <TableHead className="font-semibold">
                        Reference No.
                      </TableHead>
                      <TableHead className="font-semibold">
                        Deceased Name
                      </TableHead>
                      <TableHead className="font-semibold">
                        Date of Death
                      </TableHead>
                      <TableHead className="font-semibold">Applicant</TableHead>
                      <TableHead className="font-semibold">
                        Reporting Date
                      </TableHead>
                      <TableHead className="font-semibold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id} className="hover:bg-muted/10">
                        <TableCell className="font-medium">
                          {app.acknowlegment}
                        </TableCell>
                        <TableCell>
                          {app.warishRefNo ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {app.warishRefNo}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{app.nameOfDeceased}</TableCell>
                        <TableCell>{formatDate(app.dateOfDeath)}</TableCell>
                        <TableCell>{app.applicantName}</TableCell>
                        <TableCell>{formatDate(app.reportingDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(app.id)}
                              className="h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/admindashboard/manage-warish/upload/${app.id}`
                                )
                              }
                              className="h-8 px-3 text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <Upload className="h-3.5 w-3.5 mr-1" />
                              Upload
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t py-4 px-6">
              <div className="text-sm text-muted-foreground">
                Showing {applications.length} result
                {applications.length !== 1 ? "s" : ""}
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </CardFooter>
          </Card>
        )}

        {applications && applications.length === 0 && !loading && (
          <Card className="shadow-xl rounded-xl overflow-hidden border-t-4 border-t-primary animate-in fade-in slide-in-from-bottom-5 duration-700">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="bg-muted/30 p-4 rounded-full mb-4">
                <FileSearch className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground max-w-md">
                We could not find any applications matching your search
                criteria. Please try with different keywords.
              </p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="animate-pulse shadow-xl rounded-xl overflow-hidden border-t-4 border-t-primary">
            <CardHeader className="space-y-4 bg-muted/30 border-b">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      {[...Array(7)].map((_, i) => (
                        <TableHead key={i}>
                          <Skeleton className="h-5 w-full" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t py-4 px-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-9 w-32 ml-auto" />
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
