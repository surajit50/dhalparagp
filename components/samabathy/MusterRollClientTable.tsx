"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

type MusterRollData = {
  id: string;
  allottedAmount: number;
  paymentStatus: string;
  createdAt: Date;
  application: {
    id: string;
    applicantName: string;
    villageName: string;
    deceasedName: string;
  };
};

export default function MusterRollClientTable({ data }: { data: MusterRollData[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(data.filter(item => item.paymentStatus !== "PAID").map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleMarkAsPaid = async () => {
    if (selectedIds.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/samabathy/muster/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ musterRollIds: selectedIds }),
      });

      if (res.ok) {
        toast.success(`Successfully marked ${selectedIds.length} records as PAID.`);
        setSelectedIds([]);
        router.refresh();
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      toast.error("An error occurred while updating status.");
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = data.filter(item => item.paymentStatus !== "PAID").length;
  const isAllSelected = selectedIds.length > 0 && selectedIds.length === pendingCount;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Generated Muster Rolls</CardTitle>
        {selectedIds.length > 0 && (
          <Button onClick={handleMarkAsPaid} disabled={loading} className="gap-2 bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4" />
            {loading ? "Processing..." : `Mark ${selectedIds.length} as PAID`}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    disabled={pendingCount === 0}
                  />
                </TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Village</TableHead>
                <TableHead>Deceased Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No muster rolls found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => {
                  const isPaid = item.paymentStatus === "PAID";
                  return (
                    <TableRow key={item.id} className={selectedIds.includes(item.id) ? "bg-muted/50" : ""}>
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectOne(checked as boolean, item.id)}
                          disabled={isPaid}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.application.applicantName}
                      </TableCell>
                      <TableCell>
                        {item.application.villageName}
                      </TableCell>
                      <TableCell>
                        {item.application.deceasedName}
                      </TableCell>
                      <TableCell>
                        ₹{item.allottedAmount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={isPaid ? "default" : "secondary"}
                          className={isPaid ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                        >
                          {item.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
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
  );
}
