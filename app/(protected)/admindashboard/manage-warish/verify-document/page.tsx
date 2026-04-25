"use client";

import React, { useState } from "react";
import { searchWarishApplications } from "@/action/warishApplicationAction";
import { WarishVerificationDetails } from "@/components/WarishVerificationDetails";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Search, FileSearch, Eye, CheckCircle2, Clock } from "lucide-react";

export default function VerifyDocumentSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }
    setLoading(true);
    setError(null);
    setApplications(null);
    try {
      const result = await searchWarishApplications({
        deceasedName: searchQuery,
        acknowledgementNo: searchQuery,
        certificateNo: searchQuery,
      });
      setApplications(Array.isArray(result) ? result : [result]);
    } catch (err: any) {
      setError(err.message || "An error occurred while searching");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleVerify = (app: any) => {
    setSelectedApp(app);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedApp(null);
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
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admindashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admindashboard/manage-warish/application">
                Warish Applications
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Verify Documents</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Verify Warish Application Documents
        </h1>
        <Card className="mb-8 shadow-xl border-t-4 border-t-primary rounded-xl overflow-hidden">
          <CardHeader className="pb-4 bg-muted/30 border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Applications
            </CardTitle>
            <CardDescription className="mt-1">
              Search by Acknowledgement Number, Certificate Number, or Deceased
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
          <Alert variant="destructive" className="mb-6">
            <AlertDescription className="flex items-center gap-2 py-1">
              {error}
            </AlertDescription>
          </Alert>
        )}
        {applications && applications.length > 0 && !loading && (
          <Card className="shadow-xl rounded-xl overflow-hidden border-t-4 border-t-primary">
            <CardHeader className="bg-muted/30 border-b pb-5">
              <CardTitle className="text-xl flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
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
                        Certificate No.
                      </TableHead>
                      <TableHead className="font-semibold">
                        Deceased Name
                      </TableHead>
                      <TableHead className="font-semibold">Applicant</TableHead>
                      <TableHead className="font-semibold">
                        Date of Death
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
                          {app.warishRefNo || (
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
                        <TableCell>{app.applicantName}</TableCell>
                        <TableCell>{formatDate(app.dateOfDeath)}</TableCell>
                        <TableCell className="text-right">
                          {app.warishdocumentverified ? (
                            <div>Docmument already verified</div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerify(app)}
                              className="h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Verify
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
        {applications && applications.length === 0 && !loading && (
          <Card className="shadow-xl rounded-xl overflow-hidden border-t-4 border-t-primary">
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
              <div className="h-8 w-3/4 bg-muted rounded mb-2" />
              <div className="flex gap-2">
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-6 w-24 bg-muted rounded" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      {[...Array(6)].map((_, i) => (
                        <TableHead key={i}>
                          <div className="h-5 w-full bg-muted rounded" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-5 w-full bg-muted rounded" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>Verify Application</DialogTitle>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  className="absolute right-2 top-2"
                  onClick={closeModal}
                >
                  Close
                </Button>
              </DialogClose>
            </DialogHeader>
            {selectedApp && (
              <WarishVerificationDetails application={selectedApp} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
