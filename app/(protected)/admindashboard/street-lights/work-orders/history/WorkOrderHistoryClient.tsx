"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils/date";
import { StatusBadge } from "@/components/street-lights/StatusBadge";
import PrintableWorkOrder from "./PrintableWorkOrder";
import { useReactToPrint } from "react-to-print";

type Complaint = {
  id: string;
  complaintNo: string;
  status: string;
  createdAt: string;
  assignedDate: string | null;
  assignedAgencyId: string | null;
  assignedAgency: { name: string; contactDetails: string } | null;
  streetLight: {
    lightId: string;
    landmark?: string | null;
    mouza?: { mouzaName: string } | null;
  };
};

type Agency = {
  id: string;
  name: string;
  contactDetails: string;
};

type WorkOrderHistoryClientProps = {
  initialComplaints: Complaint[];
  agencies: Agency[];
};

export default function WorkOrderHistoryClient({ initialComplaints, agencies }: WorkOrderHistoryClientProps) {
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const filteredComplaints = useMemo(() => {
    if (selectedAgencyId === "all") return initialComplaints;
    return initialComplaints.filter(c => c.assignedAgencyId === selectedAgencyId);
  }, [initialComplaints, selectedAgencyId]);

  useEffect(() => {
    setSelectedIds([]);
  }, [selectedAgencyId, initialComplaints]);

  const complaintsToPrint = useMemo(() => {
    return filteredComplaints.filter(c => selectedIds.includes(c.id));
  }, [filteredComplaints, selectedIds]);

  const selectedAgency = useMemo(() => {
    if (selectedAgencyId === "all") return null;
    return agencies.find(a => a.id === selectedAgencyId) || null;
  }, [agencies, selectedAgencyId]);

  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef as any,
    documentTitle: `Work_Order_${selectedAgency?.name || "All"}_${new Date().toISOString().split("T")[0]}`,
  });

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/admindashboard/street-lights/work-orders"
            className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border/40 shadow-sm hover:bg-muted transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Work Order History
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              View and print issued work orders by agency
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-end gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex-1 space-y-1.5 w-full">
            <Label>Filter by Agency</Label>
            <Select value={selectedAgencyId} onValueChange={setSelectedAgencyId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select Agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                {agencies.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => handlePrint()} 
            disabled={!selectedAgency || complaintsToPrint.length === 0}
            className="w-full sm:w-auto min-w-[200px]"
            variant="default"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Work Order
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={filteredComplaints.length > 0 && selectedIds.length === filteredComplaints.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds(filteredComplaints.map(c => c.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-12 text-center">Sl No.</TableHead>
                <TableHead>Complaint No.</TableHead>
                <TableHead>Light ID & Location</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No issued work orders found for the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredComplaints.map((c, idx) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-center">
                      <Checkbox 
                        checked={selectedIds.includes(c.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIds(prev => [...prev, c.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== c.id));
                          }
                        }}
                        aria-label={`Select complaint ${c.complaintNo}`}
                      />
                    </TableCell>
                    <TableCell className="text-center">{idx + 1}</TableCell>
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
                    <TableCell className="text-sm font-medium">
                      {c.assignedAgency?.name || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {c.assignedDate ? formatDate(c.assignedDate) : "—"}
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

      {/* Hidden printable component */}
      <div className="hidden">
        {selectedAgency && complaintsToPrint.length > 0 && (
          <PrintableWorkOrder 
            ref={printRef}
            agency={selectedAgency}
            complaints={complaintsToPrint}
            printDate={new Date().toISOString()}
          />
        )}
      </div>
    </div>
  );
}
