"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Home,
  Droplets,
  Trash2,
} from "lucide-react";
import { getVillageOverview, getVillageDetails } from "@/action/villagemanage";

type OverviewItem = {
  id: string;
  name: string;
  jlno: string;
  householdCount: number;
  totalPopulation: number;
  water?: {
    tapWater?: number;
    handPump?: number;
    well?: number;
    pond?: number;
    other?: number;
  } | null;
  toilet?: {
    totalHousehold?: number;
    toiletAvailable?: number;
    toiletNotAvailable?: number;
  } | null;
};

export default function ViewVillageDetails() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [overview, setOverview] = useState<OverviewItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<any | null>(null);
  const villagesPerPage = 10;

  const loadOverview = useCallback(async () => {
    const res = await getVillageOverview();
    if (res.success) {
      setOverview(res.data ?? []);
    } else {
      setOverview([]);
    }
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const loadDetails = useCallback(async () => {
    if (!selectedId) return;
    const res = await getVillageDetails(selectedId);
    if (res.success) {
      setDetails(res.data);
    } else {
      setDetails(null);
    }
  }, [selectedId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const filtered = overview.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.jlno.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const indexOfLastVillage = currentPage * villagesPerPage;
  const indexOfFirstVillage = indexOfLastVillage - villagesPerPage;
  const currentVillages = filtered.slice(
    indexOfFirstVillage,
    indexOfLastVillage,
  );
  const totalPages = Math.ceil(filtered.length / villagesPerPage) || 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Village Overview</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search by name or J.L. No."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          size="icon"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          size="icon"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Villages</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>J.L. No.</TableHead>
                  <TableHead>Households</TableHead>
                  <TableHead>Population</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentVillages.map((v) => (
                  <TableRow
                    key={v.id}
                    className={selectedId === v.id ? "bg-gray-50" : ""}
                  >
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell>{v.jlno}</TableCell>
                    <TableCell>{v.householdCount}</TableCell>
                    <TableCell>{v.totalPopulation}</TableCell>
                    <TableCell>{new Date((v as any).createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{(v as any).updatedAt ? new Date((v as any).updatedAt).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedId(v.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {currentVillages.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-gray-400"
                    >
                      No records
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            {details ? (
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="population">Population</TabsTrigger>
                  <TabsTrigger value="water">Water</TabsTrigger>
                  <TabsTrigger value="toilet">Toilet</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <div className="space-y-4">
                    <div>
                      <Label>Mouza</Label>
                      <Input
                        value={`${details.mouza?.name || ""} (JL ${details.mouza?.jlno || ""})`}
                        readOnly
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-orange-500" />
                      <div>
                        <Label>Households</Label>
                        <p className="text-2xl font-bold">
                          {details.households || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="population">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-orange-500" />
                      <div>
                        <Label>Total</Label>
                        <p className="text-2xl font-bold">
                          {(details.population?.male || 0) +
                            (details.population?.female || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Male</Label>
                        <Input
                          value={String(details.population?.male || 0)}
                          readOnly
                        />
                      </div>
                      <div>
                        <Label>Female</Label>
                        <Input
                          value={String(details.population?.female || 0)}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="water">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Tap</Label>
                      <Droplets className="h-4 w-4 text-orange-500" />
                    </div>
                    <Input
                      value={String(details.water?.tapWater || 0)}
                      readOnly
                    />
                    <div className="flex items-center justify-between">
                      <Label>Hand Pump</Label>
                    </div>
                    <Input
                      value={String(details.water?.handPump || 0)}
                      readOnly
                    />
                    <div className="flex items-center justify-between">
                      <Label>Well</Label>
                    </div>
                    <Input value={String(details.water?.well || 0)} readOnly />
                    <div className="flex items-center justify-between">
                      <Label>Pond</Label>
                    </div>
                    <Input value={String(details.water?.pond || 0)} readOnly />
                    <div className="flex items-center justify-between">
                      <Label>Other</Label>
                    </div>
                    <Input value={String(details.water?.other || 0)} readOnly />
                  </div>
                </TabsContent>
                <TabsContent value="toilet">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5 text-rose-500" />
                      <div>
                        <Label>Total Households</Label>
                        <p className="text-2xl font-bold">
                          {details.toilet?.totalHousehold || 0}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Available</Label>
                        <Input
                          value={String(details.toilet?.toiletAvailable || 0)}
                          readOnly
                        />
                      </div>
                      <div>
                        <Label>Not Available</Label>
                        <Input
                          value={String(
                            details.toilet?.toiletNotAvailable || 0,
                          )}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="py-12 text-center text-gray-400">
                Select a village to see details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
