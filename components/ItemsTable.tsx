import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, ArrowUp, ArrowDown } from "lucide-react";

export interface Measurement {
  id?: string;
  description: string;
  nos: number;
  length: number;
  breadth: number;
  depth: number;
  quantity: number;
}

export interface SubItem {
  id: string;
  description: string;
  nos?: number;
  length?: number;
  breadth?: number;
  depth?: number;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface EstimateItem {
  id: string;
  slNo: number;
  schedulePageNo: string;
  description: string;
  nos: number;
  length: number;
  breadth: number;
  depth: number;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  measurements: Measurement[];
  subItems?: SubItem[];
}

interface ItemsTableProps {
  items: EstimateItem[];
  deleteItem: (index: number) => void;
  editItem?: (index: number) => void;
  moveItem?: (index: number, direction: 'up' | 'down') => void;
  estimateExists: boolean;
  isEditing: boolean;
}

export default function ItemsTable({
  items,
  deleteItem,
  editItem,
  moveItem,
  estimateExists,
  isEditing,
}: ItemsTableProps) {
  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow className="border-0 bg-slate-100/80 hover:bg-slate-100/80">
            <TableHead className="h-11 font-semibold text-slate-700 w-12 shrink-0 rounded-tl-lg">
              #
            </TableHead>
            <TableHead className="h-11 font-semibold text-slate-700 w-28 shrink-0">
              Page/Schedule
            </TableHead>
            <TableHead className="h-11 font-semibold text-slate-700 min-w-[min(40%,320px)] w-[50%]">
              Items of Work
            </TableHead>
            <TableHead className="h-11 font-semibold text-slate-700 text-right w-14 shrink-0">
              Nos
            </TableHead>
            <TableHead className="h-11 font-semibold text-slate-700 text-right w-20 shrink-0">
              Length (M)
            </TableHead>
            <TableHead className="h-11 font-semibold text-slate-700 text-right w-20 shrink-0">
              Breadth (M)
            </TableHead>
            <TableHead className="h-11 font-semibold text-slate-700 text-right w-18 shrink-0">
              Depth (M)
            </TableHead>
            <TableHead className="h-11 font-semibold text-slate-700 text-right w-20 shrink-0">
              Quantity
            </TableHead>
            <TableHead className="h-11 font-semibold text-slate-700 w-14 shrink-0">
              Unit
            </TableHead>
            <TableHead className="h-11 font-semibold text-slate-700 text-right w-24 shrink-0">
              Rate (₹/Unit)
            </TableHead>
            <TableHead className="h-11 font-semibold text-slate-700 text-right w-24 shrink-0">
              Amount (₹)
            </TableHead>
            <TableHead className="h-11 font-semibold text-slate-700 w-28 shrink-0 text-center rounded-tr-lg">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            <React.Fragment key={item.id || item.slNo || idx}>
              {/* Item Description Row */}
              <TableRow className="border-b border-slate-100 bg-white hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-medium text-slate-800 align-top py-3">
                  {item.slNo}
                </TableCell>
                <TableCell className="text-sm text-slate-600 align-top py-3">
                  {item.schedulePageNo}
                </TableCell>
                <TableCell
                  colSpan={9}
                  className="text-sm font-medium text-slate-800 whitespace-pre-wrap align-top py-3"
                >
                  {item.description}
                </TableCell>
                <TableCell className="align-top py-3">
                  <div className="flex items-center justify-center gap-1">
                    {moveItem && (
                      <div className="flex flex-col gap-0.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => moveItem(idx, "up")}
                          className="h-7 w-7 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                          disabled={(estimateExists && !isEditing) || idx === 0}
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => moveItem(idx, "down")}
                          className="h-7 w-7 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                          disabled={(estimateExists && !isEditing) || idx === items.length - 1}
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                    {editItem && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => editItem(idx)}
                        className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                        disabled={estimateExists && !isEditing}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteItem(idx)}
                      className="h-8 w-8 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={estimateExists && !isEditing}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

                  {/* Measurement/SubItem Rows */}
                  {item.subItems && item.subItems.length > 0 ? (
                    item.subItems.map((sub, sIdx) => (
                      <TableRow
                        key={sub.id || `item-${idx}-sub-${sIdx}`}
                        className="border-b border-slate-100 bg-slate-50/40 hover:bg-slate-100/50 transition-colors"
                      >
                        <TableCell colSpan={2} className="border-0 py-2"></TableCell>
                        <TableCell className="pl-8 text-sm text-slate-600 border-0 py-2">
                          <span className="inline-block mr-2 text-slate-400 font-medium">
                            {String.fromCharCode(97 + sIdx)})
                          </span>
                          {sub.description}
                        </TableCell>
                        <TableCell colSpan={4} className="border-0 py-2"></TableCell>
                        <TableCell className="text-right text-sm border-0 py-2 font-medium text-slate-700">
                          {Number(sub.quantity || 0).toFixed(3)}
                        </TableCell>
                        <TableCell className="text-center text-sm border-0 py-2 text-slate-500">
                          {sub.unit}
                        </TableCell>
                        <TableCell className="text-right text-sm border-0 py-2 text-slate-500">
                          {Number(sub.rate || 0).toFixed(3)}
                        </TableCell>
                        <TableCell className="text-right text-sm border-0 py-2 font-medium text-slate-700">
                          {Number(sub.amount || 0).toFixed(3)}
                        </TableCell>
                        <TableCell className="border-0 py-2"></TableCell>
                      </TableRow>
                    ))
                  ) : item.measurements && item.measurements.length > 0 ? (
                    item.measurements.map((m, mIdx) => (
                      <TableRow
                        key={`item-${idx}-meas-${mIdx}`}
                        className="border-b border-slate-50 bg-slate-50/30"
                      >
                        <TableCell colSpan={2} className="border-0 py-2"></TableCell>
                        <TableCell className="pl-8 text-xs text-slate-600 border-0 py-2">
                          {m.description}
                        </TableCell>
                        <TableCell className="text-right text-xs border-0 py-2">{m.nos}</TableCell>
                        <TableCell className="text-right text-xs border-0 py-2">{m.length}</TableCell>
                        <TableCell className="text-right text-xs border-0 py-2">{m.breadth}</TableCell>
                        <TableCell className="text-right text-xs border-0 py-2">{m.depth}</TableCell>
                        <TableCell className="text-right text-xs border-0 py-2">
                          {Number(m.quantity || 0).toFixed(3)}
                        </TableCell>
                        <TableCell colSpan={4} className="border-0 py-2"></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow key={item.id} className="border-b border-slate-50 bg-slate-50/30">
                      <TableCell colSpan={2} className="border-0 py-2"></TableCell>
                      <TableCell className="pl-8 text-xs text-slate-600 border-0 py-2">
                        Measurement
                      </TableCell>
                      <TableCell className="text-right text-xs border-0 py-2">{item.nos}</TableCell>
                      <TableCell className="text-right text-xs border-0 py-2">{item.length}</TableCell>
                      <TableCell className="text-right text-xs border-0 py-2">{item.breadth}</TableCell>
                      <TableCell className="text-right text-xs border-0 py-2">{item.depth}</TableCell>
                      <TableCell className="text-right text-xs border-0 py-2">
                        {Number(item.quantity || 0).toFixed(3)}
                      </TableCell>
                      <TableCell colSpan={4} className="border-0 py-2"></TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
  );
}
