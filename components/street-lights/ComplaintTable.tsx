"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
  streetLightId?: string; // filter by light; omit for all complaints
}

export function ComplaintTable({ streetLightId }: ComplaintTableProps) {
  const router = useRouter();
  const url = streetLightId
    ? `/api/street-lights/${streetLightId}/complaints`
    : `/api/street-lights/complaints`;

  const { data, isLoading } = useSWR(url, fetcher, {
    refreshInterval: 30000,
  });

  // Per-light endpoint returns array; all-complaints returns { complaints, total }
  const complaints: Complaint[] = streetLightId
    ? (Array.isArray(data) ? data : [])
    : (data?.complaints ?? []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="rounded-lg border border-border/50 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Complaint No.</TableHead>
            {!streetLightId && <TableHead>Light ID</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                Loading complaints…
              </TableCell>
            </TableRow>
          ) : !complaints?.length ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                No complaints found.
              </TableCell>
            </TableRow>
          ) : (
            complaints.map((c) => (
              <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-mono text-xs font-semibold">{c.complaintNo}</TableCell>
                {!streetLightId && (
                  <TableCell>
                    <span className="font-mono text-xs text-orange-700">
                      {c.streetLight?.lightId}
                    </span>
                    {c.streetLight?.landmark && (
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {c.streetLight.landmark}
                      </p>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-sm">{formatDate(c.complaintDate)}</TableCell>
                <TableCell className="text-sm">
                  {c.complaintType?.replace(/_/g, " ") ?? "—"}
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
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      router.push(`/admindashboard/street-lights/complaints/${c.id}`)
                    }
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
