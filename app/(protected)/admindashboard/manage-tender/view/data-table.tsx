"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FaFilePdf, FaSearch } from "react-icons/fa";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { useState } from "react";

import { getCsvBlob } from "tanstack-table-export-to-csv";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [filtering, setFiltering] = useState<string>("");

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter: filtering,
        },
        onGlobalFilterChange: setFiltering,
    });


    const handleExportToCsv = async () => {
        const headers = await table
            .getHeaderGroups()
            .map((x) => x.headers)
            .flat();

        console.log(headers)

        const rows = table.getCoreRowModel().rows;

        console.log(rows)

        const csvBlob = getCsvBlob(headers, rows);
        console.log(csvBlob)

        // Create a link element
        const url = URL.createObjectURL(csvBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };


    return (
        <div className="p-4 border rounded-lg shadow-md bg-white">
            <div className="flex justify-between px-2 m-2">
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-40"
                    value={filtering}
                    onChange={(e) => setFiltering(e.target.value)}
                />



                <Button onClick={handleExportToCsv}>


                    <FaFilePdf
                        className="text-green-800 p-2 cursor-pointer w-8 h-8"

                    />
                </Button>
            </div>
            <Table>
                <TableHeader className="bg-gray-100">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className="font-semibold text-gray-700 px-4 py-2"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className="hover:bg-gray-100"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="px-4 py-2">
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
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
                                <span className="inline-flex items-center">
                                    <FaSearch className="mr-2 h-5 w-5 text-gray-400" />
                                    No results.
                                </span>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-500"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <ArrowBigLeft />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-500"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <ArrowBigRight />
                </Button>
            </div>
        </div>
    );
}
