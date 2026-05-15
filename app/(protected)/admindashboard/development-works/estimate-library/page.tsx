/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Search,
  Plus,
  Loader2,
  Upload,
  Trash,
  Check,
  ShieldCheck,
  Ban,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface EstimateType {
  id: string;
  name: string;
  code: string;
}

interface SubItem {
  description: string;
  unit: string;
  rate: number;
}

interface ScheduleRate {
  id: string;
  code: string;
  description: string;
  unit: string;
  rate: number;
  category: string;
  verified?: boolean;
  isPattern?: boolean;
  pageReference?: string;
  chapter?: string;
  subItems?: SubItem[];
}

export default function EstimateLibraryPage() {
  const [types, setTypes] = useState<EstimateType[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [rates, setRates] = useState<ScheduleRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    if (selectedType) fetchRates();
    else setRates([]);
  }, [selectedType, search]);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const fetchTypes = async () => {
    const res = await fetch("/api/development-works/estimate-types");
    if (res.ok) {
      const data = await res.json();
      setTypes(data);
      if (data.length > 0) setSelectedType(data[0].id);
    }
  };

  const fetchRates = async () => {
    setLoading(true);
    const params = new URLSearchParams({ estimateTypeId: selectedType });
    if (search) params.append("search", search);

    const res = await fetch(
      `/api/development-works/schedule-rates?${params.toString()}`,
    );

    if (res.ok) setRates(await res.json());
    setLoading(false);
  };

  const handleVerify = async (id: string) => {
    const res = await fetch("/api/development-works/schedule-rates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, verified: true }),
    });

    if (res.ok) {
      toast.success("Item verified successfully");
      fetchRates();
    } else {
      toast.error("Failed to verify item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;

    const res = await fetch(`/api/development-works/schedule-rates/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Item deleted");
      fetchRates();
    } else {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-900 to-orange-700 bg-clip-text text-transparent">
            Estimate Library
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage schedule rates, verify items, and maintain estimate patterns.
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" className="shadow-sm">
            <Link href="/admindashboard/development-works/estimate-library/bulk-upload">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Link>
          </Button>

          <Button asChild className="shadow-sm">
            <Link href="/admindashboard/development-works/estimate-library/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* SIDEBAR */}
        <Card className="w-full md:w-72 shadow-sm border-muted">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>

          <CardContent className="p-2">
            <div className="flex flex-col gap-1">
              {types.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "secondary" : "ghost"}
                  className={`justify-start h-11 font-medium transition-all ${
                    selectedType === type.id
                      ? "bg-orange-50 text-orange-900 hover:bg-orange-100"
                      : ""
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* MAIN TABLE */}
        <Card className="flex-1 shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items List</CardTitle>

            <div className="relative w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schedule..."
                className="pl-9 shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Page No.</TableHead>
                    <TableHead>Chapter</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center">
                        <Loader2 className="animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : rates.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No schedule items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rates.map((rate) => (
                      <>
                        <TableRow
                          key={rate.id}
                          className="hover:bg-muted/40 transition cursor-pointer"
                          onClick={() =>
                            rate.subItems?.length && toggleRow(rate.id)
                          }
                        >
                          <TableCell className="font-semibold">
                            <div className="flex items-center gap-2">
                              {rate.subItems?.length ? (
                                expandedRows.has(rate.id) ? (
                                  <ChevronDown size={16} />
                                ) : (
                                  <ChevronRight size={16} />
                                )
                              ) : null}

                              {rate.code}

                              {rate.isPattern && (
                                <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                                  Pattern
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {rate.pageReference || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {rate.chapter || "-"}
                          </TableCell>

                          <TableCell>{rate.description}</TableCell>
                          <TableCell>{rate.unit}</TableCell>

                          <TableCell className="text-right font-medium">
                            ₹{rate.rate}
                          </TableCell>

                          <TableCell className="text-center">
                            {rate.verified ? (
                              <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-semibold">
                                <ShieldCheck size={14} />
                                Verified
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Pending
                              </span>
                            )}
                          </TableCell>

                          <TableCell
                            className="text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!rate.verified ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleVerify(rate.id)}
                                >
                                  <Check className="text-green-600" />
                                </Button>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(rate.id)}
                                >
                                  <Trash className="text-red-600" />
                                </Button>
                              </div>
                            ) : (
                              <Ban className="mx-auto text-muted-foreground" />
                            )}
                          </TableCell>
                        </TableRow>

                        {expandedRows.has(rate.id) && rate.subItems && (
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={8}>
                              <div className="pl-10">
                                <Table>
                                  <TableBody>
                                    {rate.subItems.map((sub, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell className="w-[60%]">
                                          {sub.description}
                                        </TableCell>
                                        <TableCell>{sub.unit}</TableCell>
                                        <TableCell className="text-right">
                                          ₹{sub.rate}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
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
}
