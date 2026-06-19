"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  MapPin,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Waves,
} from "lucide-react";

import { toast } from "sonner";
import { deletePond } from "./actions";
import { PondDialog } from "./pond-dialog";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

interface PondsClientProps {
  data: any[];
}

export function PondsClient({ data }: PondsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Statistics
  const totalPonds = data.length;
  const availablePonds = data.filter((p) => p.status === "AVAILABLE").length;
  const leasedPonds = data.filter((p) => p.status === "LEASED").length;

  // Optimized search
  const filteredData = useMemo(() => {
    return data.filter(
      (pond) =>
        (pond.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (pond.location?.toLowerCase() ?? "").includes(
          searchTerm.toLowerCase(),
        ),
    );
  }, [data, searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      await deletePond(id);
      toast.success("Pond deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete pond");
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/10 via-primary/5 to-transparent p-6 md:p-8 border border-border/50 backdrop-blur-sm">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              <Waves className="h-9 w-9 text-blue-600" />
              Pond Inventory Management
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-lg">
              Manage your Gram Panchayat&apos;s pond records and lease availability efficiently.
            </p>
          </div>

          <div className="flex-shrink-0">
            <PondDialog />
          </div>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="group overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Ponds</p>
                <p className="text-3xl font-bold mt-2">{totalPonds}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Waves className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-3xl font-bold mt-2 text-emerald-600">
                  {availablePonds}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leased</p>
                <p className="text-3xl font-bold mt-2 text-amber-600">
                  {leasedPonds}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <XCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLE CARD */}
      <Card className="border-border/50 shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Pond List</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all ponds
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-border/50 focus-visible:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-muted/50">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="font-semibold">SL</TableHead>
                  <TableHead className="font-semibold">Pond Name</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Area</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Waves className="h-12 w-12 opacity-30 mb-3" />
                        <p className="text-lg font-medium text-foreground">
                          No ponds found
                        </p>
                        <p className="text-sm">
                          Try adjusting your search terms or add a new pond
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((pond, index) => (
                    <TableRow
                      key={pond.id}
                      className="group hover:bg-muted/40 transition-colors duration-150"
                    >
                      <TableCell className="font-mono text-sm">{index + 1}</TableCell>

                      <TableCell className="font-semibold text-foreground">
                        {pond.name}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                          <span className="truncate">{pond.location}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {pond.area ? `${pond.area} Decimal` : "N/A"}
                      </TableCell>

                      <TableCell>
                        {pond.status === "AVAILABLE" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200/50">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            AVAILABLE
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200/50">
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            LEASED
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <PondDialog initialData={pond} />

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Pond?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. Deleting will
                                  fail if the pond has lease records.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                  onClick={() => handleDelete(pond.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
  );
}
