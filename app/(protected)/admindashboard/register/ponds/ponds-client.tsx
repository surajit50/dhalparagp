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
      {/* HEADER */}
      <div className="bg-gradient-to-r from-cyan-700 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Waves className="h-9 w-9 text-cyan-200" />
              Pond Inventory Management
            </h1>
            <p className="text-cyan-100/90 mt-2 text-lg">
              Manage your Gram Panchayat&apos;s pond records and lease availability.
            </p>
          </div>

          <PondDialog />
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Ponds</p>
              <p className="text-2xl font-bold">{totalPonds}</p>
            </div>
            <Waves className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-emerald-600">
                {availablePonds}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Leased</p>
              <p className="text-2xl font-bold text-amber-600">
                {leasedPonds}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>
      </div>

      {/* TABLE CARD */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-bold">Pond List</CardTitle>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search ponds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0 z-10">
                <TableRow>
                  <TableHead>SL</TableHead>
                  <TableHead>Pond Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Waves className="h-10 w-10 text-slate-300 mb-2" />
                        <p className="text-lg font-medium text-slate-600">
                          No ponds found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting search or add a new pond
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((pond, index) => (
                    <TableRow
                      key={pond.id}
                      className="hover:bg-slate-50 transition"
                    >
                      <TableCell>{index + 1}</TableCell>

                      <TableCell className="font-semibold">
                        {pond.name}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center text-slate-600">
                          <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                          {pond.location}
                        </div>
                      </TableCell>

                      <TableCell>
                        {pond.area ? `${pond.area} Decimal` : "N/A"}
                      </TableCell>

                      <TableCell>
                        {pond.status === "AVAILABLE" ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            AVAILABLE
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
                            <XCircle className="h-3.5 w-3.5 mr-1" />
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
