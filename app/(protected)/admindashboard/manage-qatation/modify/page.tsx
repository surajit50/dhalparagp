"use client";

import { useState } from "react";
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

// Mock data
const quotations = [
  {
    id: 1,
    nitNo: "01/NIQ/23-24",
    date: "2024-01-15",
    workName: "Supply of HP Laptop",
    estimatedAmount: 50000,
    status: "Draft",
    lastModified: "2024-01-16",
  },
  {
    id: 2,
    nitNo: "02/NIQ/23-24",
    date: "2024-01-20",
    workName: "Office Furniture Supply",
    estimatedAmount: 75000,
    status: "Published",
    lastModified: "2024-01-21",
  },
  {
    id: 3,
    nitNo: "03/NIQ/23-24",
    date: "2024-01-25",
    workName: "Air Conditioning Installation",
    estimatedAmount: 120000,
    status: "Closed",
    lastModified: "2024-01-26",
  },
];

export default function ModifyQuotationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredQuotations, setFilteredQuotations] = useState(quotations);

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
      case "Draft":
        return "bg-yellow-100 text-yellow-800";
      case "Published":
        return "bg-green-100 text-green-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const canModify = (status: string) => {
    return status === "Draft" || status === "Published";
  };

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
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
                      <TableCell>{quotation.lastModified}</TableCell>
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
                          <Button size="sm" variant="outline">
                            <History className="h-4 w-4 mr-1" />
                            History
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredQuotations.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No quotations found matching your search.
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                Modification Guidelines:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Draft quotations can be freely modified</li>
                <li>
                  • Published quotations require approval for major changes
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
