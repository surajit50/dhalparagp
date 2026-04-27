"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { Check, X, Loader2 } from "lucide-react";

interface Application {
  id: string;
  applicationNumber: string | null;
  applicantName: string;
  mobileNumber: string;
  villageName: string;
  deceasedName: string;
  relation: string;
  dateOfDeath: string;
  aadhaarNumber?: string;
  status: string;
  createdAt: string;
}

export default function VerifyApplicationsClient({
  initialData,
}: {
  initialData: Application[];
}) {
  const [data, setData] = useState<Application[]>(initialData);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [lastAction, setLastAction] = useState<any>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  // 🔍 Filter
  const filtered = useMemo(() => {
    return data.filter(
      (app) =>
        app.applicantName.toLowerCase().includes(search.toLowerCase()) ||
        app.mobileNumber.includes(search)
    );
  }, [data, search]);

  // ✅ Action
  const handleAction = async (ids: string[], action: "VERIFY" | "REJECT") => {
    setLoadingIds(ids);

    try {
      const res = await fetch("/api/samabathy/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action }),
      });

      if (res.ok) {
        const removed = data.filter((d) => ids.includes(d.id));
        setLastAction({ removed });

        setData((prev) => prev.filter((d) => !ids.includes(d.id)));
        setSelectedIds([]);

        toast.success(
          action === "VERIFY"
            ? `${ids.length} verified`
            : `${ids.length} rejected`
        );
      }
    } catch {
      toast.error("Failed");
    } finally {
      setLoadingIds([]);
    }
  };

  // 🔁 Undo
  const undo = () => {
    if (lastAction) {
      setData((prev) => [...lastAction.removed, ...prev]);
      toast.success("Undo successful");
    }
  };

  // ⌨️ Keyboard
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (filtered.length === 0) return;

      // Focus search
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }

      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        undo();
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;

        case "Enter":
        case "v":
        case "V":
          handleAction([filtered[selectedIndex].id], "VERIFY");
          break;

        case "r":
        case "R":
          handleAction([filtered[selectedIndex].id], "REJECT");
          break;

        case "Escape":
          setSelectedIds([]);
          break;
      }
    };

    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [filtered, selectedIndex]);

  // Multi select
  const toggleSelect = (id: string, index: number, e: any) => {
    if (e.shiftKey) {
      const range = filtered.slice(
        Math.min(selectedIndex, index),
        Math.max(selectedIndex, index) + 1
      );
      setSelectedIds(range.map((r) => r.id));
    } else if (e.ctrlKey || e.metaKey) {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
      setSelectedIndex(index);
    }
  };

  return (
    <div className="space-y-4">

      {/* Top Bar */}
      <div className="flex justify-between gap-2">
        <Input
          ref={searchRef}
          placeholder="Search... (/)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={!selectedIds.length}
            onClick={() => handleAction(selectedIds, "VERIFY")}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Verify Selected
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={!selectedIds.length}
            onClick={() => handleAction(selectedIds, "REJECT")}
            className="text-red-600"
          >
            Reject Selected
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Village</TableHead>
              <TableHead>Deceased</TableHead>
              <TableHead>DOD</TableHead>
              <TableHead>Aadhaar</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((app, i) => (
              <TableRow
                key={app.id}
                onClick={(e) => toggleSelect(app.id, i, e)}
                className={`cursor-pointer ${
                  selectedIds.includes(app.id)
                    ? "bg-primary/10"
                    : i === selectedIndex
                    ? "bg-muted/40"
                    : ""
                }`}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(app.id)}
                    readOnly
                  />
                </TableCell>

                <TableCell>{app.applicationNumber}</TableCell>

                <TableCell>
                  <div className="font-medium">{app.applicantName}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(app.createdAt), "dd MMM")}
                  </div>
                </TableCell>

                <TableCell>{app.mobileNumber}</TableCell>
                <TableCell>{app.villageName}</TableCell>

                <TableCell className="text-red-600">
                  {app.deceasedName}
                </TableCell>

                <TableCell>
                  {format(new Date(app.dateOfDeath), "dd MMM yyyy")}
                </TableCell>

                <TableCell className="font-mono text-xs">
                  {app.aadhaarNumber
                    ? `XXXX XXXX ${app.aadhaarNumber.slice(-4)}`
                    : "N/A"}
                </TableCell>

                <TableCell className="flex gap-1">
                  <Button
                    size="icon"
                    disabled={loadingIds.includes(app.id)}
                    onClick={() => handleAction([app.id], "VERIFY")}
                    className="bg-emerald-600"
                  >
                    {loadingIds.includes(app.id) ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Check />
                    )}
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    disabled={loadingIds.includes(app.id)}
                    onClick={() => handleAction([app.id], "REJECT")}
                  >
                    <X />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Shortcuts */}
      <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
        <span>↑ ↓ Navigate</span>
        <span>Shift = Multi-select</span>
        <span>Enter / V = Verify</span>
        <span>R = Reject</span>
        <span>/ Search</span>
        <span>Ctrl + Z Undo</span>
      </div>
    </div>
  );
}
