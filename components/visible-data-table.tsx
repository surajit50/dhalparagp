"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, Eye, Sliders } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  pdfFileName?: string;
  excelFileName?: string;
}

export function VisibleDataTable<TData, TValue>({
  columns,
  data,
  title,
  pdfFileName,
  excelFileName,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { columnVisibility },
  });

  const getHeaderLabel = (column: any) =>
    (column.columnDef as any).label || column.columnDef.header || column.id;

  const getCellExportValue = (cell: any, rowOriginal: any) => {
    const colDef: any = cell.column.columnDef;

    if (colDef.meta && typeof colDef.meta.exportValue === "function") {
      return colDef.meta.exportValue(rowOriginal);
    }

    const raw = cell.getValue();

    if (raw === null || raw === undefined) return "";
    if (raw instanceof Date) return raw.toLocaleDateString("en-IN");
    if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}T/.test(raw)) {
      const d = new Date(raw);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString("en-IN");
      }
    }
    if (typeof raw === "boolean") return raw ? "Yes" : "No";

    return String(raw);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      format: "a2",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const currentDate = new Date().toLocaleDateString("en-IN");
    const documentTitle = title || "Data Report";

    pdf.setTextColor(11, 60, 140);
    pdf.setFontSize(18);
    pdf.text(documentTitle, pageWidth / 2, 16, { align: "center" });

    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, 22, {
      align: "center",
    });

    const exportColumns = table
      .getAllColumns()
      .filter((col) => col.getIsVisible() && col.id !== "id");

    const headers = [
      "Sl No",
      ...exportColumns.map((col) => getHeaderLabel(col)),
    ];

    const body = table.getRowModel().rows.map((row, index) => [
      index + 1,
      ...exportColumns.map((column) => {
        const cell = row
          .getVisibleCells()
          .find((c) => c.column.id === column.id);
        if (!cell) return "";
        return getCellExportValue(cell, row.original);
      }),
    ]);

    autoTable(pdf, {
      head: [headers],
      body,
      startY: 30,
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 1,
        valign: "middle",
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [15, 82, 186],
        textColor: 255,
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [239, 246, 255],
      },
      tableWidth: "auto",
      columnStyles: {
        2: { cellWidth: 90 },
      },
      horizontalPageBreak: true,
    });

    const fileName = pdfFileName || "data-report.pdf";
    pdf.save(fileName);
  };

  const exportToExcel = () => {
    const rows = table.getRowModel().rows;

    const exportColumns = table
      .getAllColumns()
      .filter((col) => col.getIsVisible() && col.id !== "id");

    const exportData = rows.map((row, index) => {
      const rowData: Record<string, unknown> = {};
      rowData["Sl No"] = index + 1;

      exportColumns.forEach((column) => {
        const cell = row
          .getVisibleCells()
          .find((c) => c.column.id === column.id);
        if (!cell) return;

        const headerLabel = getHeaderLabel(column);
        const value = getCellExportValue(cell, row.original);

        rowData[String(headerLabel)] = value;
      });

      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const fileName = excelFileName || "data-report.xlsx";
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="rounded-xl border border-orange-200 bg-white shadow-md">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b border-orange-200 bg-gradient-to-r from-[#0B3C8C] to-[#1E63B5] text-white rounded-t-xl">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-white text-white hover:bg-white hover:text-[#0B3C8C]"
            >
              <Sliders className="h-4 w-4" />
              <span>Columns</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>
                      {(column.columnDef as any).label ||
                        column.columnDef.header ||
                        column.id}
                    </span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={exportToExcel}
            className="gap-2 bg-white text-[#0B3C8C] hover:bg-orange-100 font-semibold"
          >
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </Button>
          <Button
            onClick={exportToPDF}
            className="gap-2 bg-white text-[#0B3C8C] hover:bg-orange-100 font-semibold"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table className="border-collapse">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-orange-50">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="font-semibold text-[#0B3C8C] border-b border-orange-200 py-3"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                className={`transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-orange-50"
                } hover:bg-orange-100`}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="border-b border-orange-100 py-3 text-gray-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-gray-500"
              >
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
