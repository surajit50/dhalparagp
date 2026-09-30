"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Eye, Printer, FileDown, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { fetcher } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import { toTitleCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateComplaintPDF, generateMultipleComplaintsPDF } from "@/lib/utils/pdf";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";

interface Complaint {
  id: string;
  complaintNo: string;
  complaintDate: string;
  complaintType?: string;
  description?: string;
  reportedBy?: string;
  priority: string;
  status: string;
  assignedTo?: string;
  streetLight?: {
    lightId: string;
    mouza?: { mouzaName: string };
    landmark?: string;
  };
}

interface ComplaintTableProps {
  streetLightId?: string;
}

export function ComplaintTable({ streetLightId }: ComplaintTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const url = streetLightId
    ? `/api/street-lights/${streetLightId}/complaints`
    : `/api/street-lights/complaints`;

  const { data, isLoading } = useSWR<Complaint[] | { complaints: Complaint[]; total: number }>(
    url,
    fetcher,
    { refreshInterval: 30000 }
  );

  const complaints: Complaint[] = streetLightId
    ? (Array.isArray(data) ? data : [])
    : (!Array.isArray(data) ? data?.complaints ?? [] : []);

  const colSpan = streetLightId ? 8 : 9;

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = !searchQuery || 
      c.complaintNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.streetLight?.lightId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.streetLight?.landmark || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / itemsPerPage));
  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedComplaints.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkPrint = () => {
    const selectedComplaints = complaints.filter(c => selectedIds.has(c.id));
    if (selectedComplaints.length > 0) {
      generateMultipleComplaintsPDF(selectedComplaints);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by complaint no, light ID, landmark..." 
            className="pl-9 bg-card border-border/40 focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px] bg-card border-border/40">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px] bg-card border-border/40">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-3 px-4 rounded-xl shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
             <div className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-primary/20 px-2 text-xs font-bold text-primary">
                {selectedIds.size}
             </div>
             <span className="text-sm font-semibold text-primary">
               {selectedIds.size === 1 ? 'Complaint Selected' : 'Complaints Selected'}
             </span>
          </div>
          <Button onClick={handleBulkPrint} size="sm" className="gap-2 rounded-lg bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
            <FileDown className="w-4 h-4" />
            Print Selected ({selectedIds.size})
          </Button>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px] pl-5">
                <Checkbox 
                  checked={paginatedComplaints.length > 0 && selectedIds.size === paginatedComplaints.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-primary"
                />
              </TableHead>
              <TableHead className="font-semibold text-foreground/80">Complaint No.</TableHead>
              {!streetLightId && <TableHead className="font-semibold text-foreground/80">Light ID</TableHead>}
              <TableHead className="font-semibold text-foreground/80">Date</TableHead>
              <TableHead className="font-semibold text-foreground/80">Type</TableHead>
              <TableHead className="font-semibold text-foreground/80">Priority</TableHead>
              <TableHead className="font-semibold text-foreground/80">Status</TableHead>
              <TableHead className="font-semibold text-foreground/80">Assigned To</TableHead>
              <TableHead className="text-right pr-5 font-semibold text-foreground/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-16 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                     <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
                     <p className="text-sm">Loading complaints…</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : !paginatedComplaints?.length ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="text-center py-16 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                     <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Printer className="h-5 w-5 text-muted-foreground/50" />
                     </div>
                     <p className="text-sm font-medium">No complaints found</p>
                     <p className="text-xs">Try adjusting your filters or search terms.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedComplaints.map((c) => (
                <TableRow 
                  key={c.id} 
                  className={`transition-colors hover:bg-muted/50 ${selectedIds.has(c.id) ? 'bg-primary/5 hover:bg-primary/5' : ''}`}
                >
                  <TableCell className="pl-5">
                    <Checkbox 
                      checked={selectedIds.has(c.id)}
                      onCheckedChange={(checked) => handleSelectOne(c.id, checked as boolean)}
                      aria-label={`Select complaint ${c.complaintNo}`}
                      className="rounded-[4px] border-muted-foreground/30 data-[state=checked]:bg-primary"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm font-medium text-foreground/90">
                    {c.complaintNo}
                  </TableCell>
                  {!streetLightId && (
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-sm font-medium text-orange-600 dark:text-orange-500">
                          {c.streetLight?.lightId}
                        </span>
                        {c.streetLight?.landmark && (
                          <span className="text-[11px] text-muted-foreground truncate max-w-[120px]" title={c.streetLight.landmark}>
                            {c.streetLight.landmark}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="text-sm text-muted-foreground font-medium">
                    {formatDate(c.complaintDate)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {c.complaintType ? toTitleCase(c.complaintType) : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="priority" value={c.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="complaint" value={c.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.assignedTo ?? "—"}
                  </TableCell>
                  <TableCell className="pr-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg hover:bg-blue-500/10 hover:text-blue-600"
                        onClick={() =>
                          router.push(`/admindashboard/street-lights/complaints/${c.id}`)
                        }
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                        onClick={() => generateComplaintPDF(c)}
                        title="Download Application PDF"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-sm text-muted-foreground font-medium">
            Showing <span className="text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredComplaints.length)}</span> of <span className="text-foreground">{filteredComplaints.length}</span> entries
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-card hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-card hover:bg-muted"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
