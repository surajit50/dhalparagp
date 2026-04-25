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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Trash2, FileText, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MBEntry, EstimateItem } from "./types";

const truncateText = (text: string, maxLength: number = 700) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

interface MeasuredItemsTableProps {
  mbEntries: MBEntry[];
  sortedMbEntries: MBEntry[];
  estimateItems: EstimateItem[];
  openEditDialog: (entry: MBEntry) => void;
  handleDeleteEntry: (entry: MBEntry) => void;
  recentlyAddedId: string | null;
}

export const MeasuredItemsTable: React.FC<MeasuredItemsTableProps> = ({
  mbEntries,
  sortedMbEntries,
  estimateItems,
  openEditDialog,
  handleDeleteEntry,
  recentlyAddedId,
}) => {
  if (mbEntries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-sm rounded-xl">
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center justify-center space-y-5">
              <div className="p-5 bg-white shadow-sm rounded-full">
                <Ruler className="h-10 w-10 text-slate-400" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-slate-700">
                  No Measurements Yet
                </h3>
                <p className="text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                  Go to the &quot;Available Items&quot; tab to start adding
                  measurements to your book.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-800">
          Recorded Measurements
        </CardTitle>
        <CardDescription className="text-slate-500">
          Items that have been measured and added to the measurement book
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="w-16 font-semibold text-slate-600">
                  SL No
                </TableHead>
                <TableHead className="w-32 font-semibold text-slate-600">
                  MB Details
                </TableHead>
                <TableHead className="font-semibold text-slate-600">
                  Description
                </TableHead>
                <TableHead className="w-28 text-right font-semibold text-slate-600">
                  Qty Exec
                </TableHead>
                <TableHead className="w-24 font-semibold text-slate-600">
                  Unit
                </TableHead>
                <TableHead className="w-28 text-right font-semibold text-slate-600">
                  Rate
                </TableHead>
                <TableHead className="w-28 text-right font-semibold text-slate-600">
                  Amount
                </TableHead>
                <TableHead className="w-24 font-semibold text-slate-600 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {(() => {
                  let lastParentId: string | null = null; // Track by Parent ID, not estimateItemId from entry
                  return sortedMbEntries.map((entry, index) => {
                    // 1. Robust Parent Finding
                    const parentItem =
                      estimateItems.find(
                        (item) => item.id === entry.estimateItemId,
                      ) ||
                      estimateItems.find((item) =>
                        item.subItems?.some(
                          (s) => s.description === entry.workItemDescription,
                        ),
                      );

                    // 2. Robust SubItem Check
                    const checkIsSubItem = (e: any, pItem: any) => {
                      if (e.subItemId) return true;
                      if (!pItem || !Array.isArray((pItem as any).subItems))
                        return false;
                      return (pItem as any).subItems.some(
                        (sub: any) =>
                          typeof sub?.description === "string" &&
                          sub.description.trim() ===
                            e.workItemDescription.trim(),
                      );
                    };

                    const isSubItem = checkIsSubItem(entry, parentItem);

                    // 3. Robust Grouping Logic
                    // Use parentItem.id for grouping if available, fallback to estimateItemId
                    const currentGroupId =
                      parentItem?.id || entry.estimateItemId;
                    const isNewGroup = currentGroupId !== lastParentId;

                    // Update lastParentId for next iteration
                    if (isNewGroup && currentGroupId) {
                      lastParentId = currentGroupId;
                    }

                    // Determine SL No
                    let displaySlNo = parentItem?.slNo?.toString() || "";
                    if (isSubItem && parentItem?.subItems) {
                      const subIdx = parentItem.subItems.findIndex(
                        (sub) =>
                          sub.id === entry.subItemId ||
                          sub.description === entry.workItemDescription,
                      );
                      if (subIdx !== -1) {
                        displaySlNo = `${parentItem.slNo}(${String.fromCharCode(
                          97 + subIdx,
                        )})`;
                      }
                    }

                    const rows = [];

                    // Add Group Header if it's a new group and is a subitem
                    if (isNewGroup && isSubItem && parentItem) {
                      rows.push(
                        <motion.tr
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={`group-${parentItem.id}-${index}`}
                        >
                          <TableCell className="font-bold text-wb-primary align-top text-center">
                            {parentItem.slNo}
                          </TableCell>
                          <TableCell
                            colSpan={7}
                            className="font-bold text-slate-800"
                            title={parentItem.description}
                          >
                            {truncateText(parentItem.description)}
                          </TableCell>
                        </motion.tr>,
                      );
                    }

                    rows.push(
                      <motion.tr
                        key={entry.id || `temp-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          backgroundColor:
                            recentlyAddedId === entry.estimateItemId
                              ? "#ecfdf5"
                              : "transparent",
                        }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TableCell className="font-medium text-slate-600 text-center">
                          {displaySlNo}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 align-middle">
                            <Badge
                              variant="outline"
                              className="w-fit bg-wb-primary/5 text-wb-primary border-wb-primary/20 text-[10px] uppercase font-bold tracking-wider shadow-sm"
                            >
                              MB: {entry.mbNumber}
                            </Badge>
                            <span className="text-[11px] font-medium text-slate-500">
                              Pg: {entry.mbPageNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[300px]">
                            <p
                              className={`line-clamp-2 font-medium text-slate-800 group-hover:text-slate-900 transition-colors ${isSubItem ? "pl-4 border-l-2 border-slate-200 ml-1" : ""}`}
                              title={entry.workItemDescription}
                            >
                              {truncateText(entry.workItemDescription)}
                            </p>
                            <div
                              className={`flex items-center gap-2 mt-1.5 text-xs text-slate-500 ${isSubItem ? "pl-5 ml-1" : ""}`}
                            >
                              <span className="flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                                {new Date(
                                  entry.measuredDate,
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="font-medium">
                                By: {entry.measuredBy}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-700">
                          {entry.quantityExecuted.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                          >
                            {entry.unit}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-600">
                          ₹{(Number(entry.rate) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          ₹{entry.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(entry)}
                              className="h-8 w-8 text-wb-primary hover:text-wb-primary hover:bg-wb-primary/10 transition-colors"
                              title="Edit Entry"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteEntry(entry)}
                              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>,
                    );

                    return rows;
                  });
                })()}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
