"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------- TYPES ----------------
interface ScheduleRate {
  id: string;
  code: string;
  description: string;
  unit: string;
  rate: number;
  category: string;
}

// ---------------- HELPERS ----------------
const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

// Highlight search
const highlight = (text: string, search: string) => {
  if (!search) return text;
  const regex = new RegExp(`(${search})`, "gi");

  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="bg-yellow-200 text-black px-1 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
};

// ---------------- COMPONENT ----------------
export default function EstimateLibraryDialog({
  onAddItems,
  trigger,
}: any) {
  const [open, setOpen] = useState(false);
  const [rates, setRates] = useState<ScheduleRate[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState("all");

  // ---------------- FETCH ----------------
  const fetchRates = async () => {
    const res = await fetch("/api/development-works/schedule-rates");
    const data = await res.json();
    setRates(data);
  };

  useEffect(() => {
    if (open) fetchRates();
  }, [open]);

  // ---------------- FILTER ----------------
  const filtered = useMemo(() => {
    return rates.filter((r) => {
      const matchSearch =
        r.description.toLowerCase().includes(search.toLowerCase()) ||
        r.code.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        category === "all" || r.category === category;

      return matchSearch && matchCategory;
    });
  }, [rates, search, category]);

  const categories = useMemo(() => {
    return Array.from(new Set(rates.map((r) => r.category)));
  }, [rates]);

  // ---------------- SELECTION ----------------
  const toggle = (id: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleAdd = () => {
    const items = filtered.filter((r) => selected.has(r.id));
    onAddItems(items);
    setSelected(new Set());
    setOpen(false);
  };

  // ---------------- KEYBOARD ----------------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleAdd();
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected]);

  // ---------------- UI ----------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Select Items</Button>}
      </DialogTrigger>

      <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">

        {/* 🔥 TOP BAR */}
        <div className="px-6 py-3 border-b bg-muted/30 flex justify-between">
          <div className="flex gap-3 items-center">
            <Badge>Schedule Library</Badge>
            <span className="text-sm text-muted-foreground">
              {filtered.length} items
            </span>
          </div>
          <div className="text-sm font-medium text-primary">
            Selected: {selected.size}
          </div>
        </div>

        {/* 🔍 SEARCH */}
        <div className="p-4 border-b flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2 h-4 w-4" />
            <Input
              className="pl-8"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {search && (
            <Button size="icon" onClick={() => setSearch("")}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* 🧠 CATEGORY CHIPS */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto border-b">
          <Button
            size="sm"
            variant={category === "all" ? "default" : "outline"}
            onClick={() => setCategory("all")}
          >
            All
          </Button>

          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={category === cat ? "default" : "outline"}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* 📊 TABLE */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="h-10 text-sm">
                <TableHead className="w-10" />
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Rate</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r.id}
                  className={cn(
                    "cursor-pointer hover:bg-muted/40",
                    selected.has(r.id) && "bg-primary/10"
                  )}
                  onClick={() => toggle(r.id)}
                >
                  <TableCell className="py-2">
                    <Checkbox checked={selected.has(r.id)} />
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">{r.code}</Badge>
                  </TableCell>

                  <TableCell>
                    {highlight(r.description, search)}
                  </TableCell>

                  <TableCell>{r.unit}</TableCell>

                  <TableCell className="text-right font-medium">
                    {formatCurrency(r.rate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 🚀 FLOATING ACTION */}
        {selected.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background border shadow-xl rounded-xl px-6 py-3 flex items-center gap-4 z-50">
            <span>{selected.size} selected</span>
            <Button onClick={handleAdd}>
              Add to Estimate
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
