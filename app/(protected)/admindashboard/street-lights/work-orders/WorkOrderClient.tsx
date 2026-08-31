"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/street-lights/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils/date";

// Basic types for the page
type Complaint = {
  id: string;
  complaintNo: string;
  status: string;
  createdAt: string;
  assignedStaff?: { name: string | null } | null;
  streetLight: {
    lightId: string;
    landmark?: string | null;
    mouza?: { mouzaName: string } | null;
  };
};

type Agency = {
  id: string;
  name: string;
};

type WorkOrderClientProps = {
  initialComplaints: Complaint[];
  agencies: Agency[];
};

export default function WorkOrderClient({ initialComplaints, agencies }: WorkOrderClientProps) {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.size === complaints.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(complaints.map((c) => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkAssign = async () => {
    if (selectedIds.size === 0) {
      toast.error("Select at least one complaint");
      return;
    }
    if (!selectedAgencyId) {
      toast.error("Select an agency");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/street-lights/complaints/bulk-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintIds: Array.from(selectedIds),
          assignedAgencyId: selectedAgencyId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to assign work order");
      }

      const data = await res.json();
      toast.success(data.message);
      
      // Remove assigned complaints from list
      setComplaints(complaints.filter(c => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
      setSelectedAgencyId("");
      
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/admindashboard/street-lights"
            className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border/40 shadow-sm hover:bg-muted transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Issue Work Orders
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Select verified complaints and assign them to an agency
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex shrink-0">
          <Button asChild variant="outline">
            <Link href="/admindashboard/street-lights/work-orders/history">
              View Work Order History
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Bulk Action Bar */}
        <div className="flex flex-col sm:flex-row items-end gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex-1 space-y-1.5 w-full">
            <Label>Select Agency for Work Order</Label>
            <Select value={selectedAgencyId} onValueChange={setSelectedAgencyId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select Agency" />
              </SelectTrigger>
              <SelectContent>
                {agencies.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleBulkAssign} 
            disabled={selectedIds.size === 0 || !selectedAgencyId || submitting}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckSquare className="w-4 h-4 mr-2" />}
            Issue Work Order ({selectedIds.size})
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={complaints.length > 0 && selectedIds.size === complaints.length}
                    onCheckedChange={toggleSelectAll}
                    disabled={complaints.length === 0}
                  />
                </TableHead>
                <TableHead>Complaint No.</TableHead>
                <TableHead>Light ID & Landmark</TableHead>
                <TableHead>Reported Date</TableHead>
                <TableHead>Staff Enquiry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No complaints pending work order.
                  </TableCell>
                </TableRow>
              ) : (
                complaints.map((c) => (
                  <TableRow key={c.id} className={selectedIds.has(c.id) ? "bg-muted/40" : ""}>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selectedIds.has(c.id)}
                        onCheckedChange={() => toggleSelect(c.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium">
                      {c.complaintNo}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-orange-700">
                        {c.streetLight?.lightId || "—"}
                      </span>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {c.streetLight?.mouza?.mouzaName ? `${c.streetLight.mouza.mouzaName} - ` : ""}
                        {c.streetLight?.landmark || ""}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(c.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {c.assignedStaff?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="complaint" value={c.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
