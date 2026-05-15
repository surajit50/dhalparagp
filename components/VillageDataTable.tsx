"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Column {
  header: string;
  accessor: string | ((item: any) => React.ReactNode);
  className?: string;
}

interface VillageDataTableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  isLoading?: boolean;
}

export function VillageDataTable({
  columns,
  data,
  emptyMessage = "No records found.",
  emptyIcon: EmptyIcon,
  isLoading,
}: VillageDataTableProps) {
  return (
    <Card className="shadow-xl shadow-gray-200/50 border-gray-100 overflow-hidden bg-white">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
              <TableRow className="hover:bg-transparent border-b-gray-200">
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={`h-14 font-bold text-gray-700 uppercase tracking-wider text-xs ${column.className}`}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {data.length > 0 ? (
                  data.map((item, rowIndex) => (
                    <motion.tr
                      key={item.id || rowIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: rowIndex * 0.05 }}
                    >
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={`py-4 group-hover:text-orange-900 transition-colors ${column.className}`}
                        >
                          {typeof column.accessor === "function"
                            ? column.accessor(item)
                            : item[column.accessor]}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-[400px] text-center"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {EmptyIcon && (
                          <div className="p-4 bg-gray-50 rounded-full">
                            <EmptyIcon className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                        <p className="text-gray-400 font-medium italic text-lg">
                          {emptyMessage}
                        </p>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
