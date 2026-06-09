"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Search, Edit, History } from "lucide-react";
import { getQuotations } from "@/lib/actions/quotations";

export default function ModifyQuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredQuotations, setFilteredQuotations] = useState<any[]>([]);

  useEffect(() => {
    const fetchQuotations = async () => {
      setLoading(true);
      try {
        const result = await getQuotations();
        if (result.success) {
          setQuotations(result.data || []);
          setFilteredQuotations(result.data || []);
        } else {
          setError(result.error || "Failed to fetch quotations");
        }
      } catch (error) {
        setError("An unexpected error occurred");
        console.error("Error fetching quotations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = quotations.filter(
      (quotation) =>
        quotation.nitNo.toLowerCase().includes(value.toLowerCase()) ||
        quotation.workName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredQuotations(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "PUBLISHED":
      case "Published":
        return "bg-green-100 text-green-800";
      case "CLOSED":
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const canModify = (status: string) => {
    const normalized = status.toUpperCase();
    return normalized === "DRAFT" || normalized === "PUBLISHED";
  };

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admindashboard/manage-qatation/view">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to View
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Edit className="h-6 w-6" />
              Modify Quotations
            </CardTitle>
            <CardDescription>
              Edit and update existing quotation notices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by NIT No. or Work Name..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading quotations...</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NIT/NIQ No.</TableHead>
                      <TableHead>Work Name</TableHead>
                      <TableHead>Estimated Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotations.map((quotation) => (
                      <TableRow key={quotation.id}>
                        <TableCell className="font-medium">
                          {quotation.nitNo}
                        </TableCell>
                        <TableCell>{quotation.workName}</TableCell>
                        <TableCell>
                          ₹{quotation.estimatedAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(quotation.status)}>
                            {quotation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(quotation.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {canModify(quotation.status) ? (
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/admindashboard/manage-qatation/modify/${quotation.id}`}>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Link>
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" disabled>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {filteredQuotations.length === 0 && !loading && !error && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No quotations found matching your search.
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-2">
                Modification Guidelines:
              </h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Draft quotations can be freely modified</li>
                <li>
                  • Published quotations cannot be modified directly (cannot update status or fields once published)
                </li>
                <li>• Closed quotations cannot be modified</li>
                <li>• All modifications are tracked and logged</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
