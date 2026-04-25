"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { NITCopy } from "@/components/PrintTemplet/PrintNIt-copy";

import { formatDateTime } from "@/utils/utils";
import { gpcode } from "@/constants/gpinfor";

type Props = {
  nits: any[];
  onDeleteNit: (id: string) => Promise<void>;
};

export default function NITListWithYearFilter({
  nits,
  onDeleteNit,
}: Props) {

  function getFinancialYear(date: string | number | Date) {
    const d = new Date(date);

    const year =
      d.getMonth() >= 3
        ? d.getFullYear()
        : d.getFullYear() - 1;

    const nextYear = (year + 1)
      .toString()
      .slice(-2);

    return `${year}-${nextYear}`;
  }

  const years = useMemo(() => {

    const set = new Set<string>();

    nits.forEach((nit) =>
      set.add(getFinancialYear(nit.memoDate))
    );

    return Array.from(set)
      .sort()
      .reverse();

  }, [nits]);

  const [selectedYear, setSelectedYear] =
    useState(years[0] || "");

  const filteredNits = useMemo(
    () =>
      nits.filter(
        (nit) =>
          getFinancialYear(nit.memoDate) === selectedYear
      ),
    [nits, selectedYear]
  );

  return (

    <Card className="shadow-md">

      {/* Header */}
      <CardHeader className="bg-blue-50 border-b">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">

          <CardTitle className="text-blue-900">
            Notice Inviting Tender (NIT) List
          </CardTitle>

          <div className="flex items-center gap-2">

            <span className="text-sm font-medium">
              Financial Year:
            </span>

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(e.target.value)
              }
              className="border rounded px-3 py-1 text-sm"
            >
              {years.map((year) => (
                <option key={year}>
                  {year}
                </option>
              ))}
            </select>

          </div>

        </div>

      </CardHeader>


      {/* Table */}
      <CardContent>

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead>Sl No</TableHead>

              <TableHead>Memo Number</TableHead>

              <TableHead>Memo Date</TableHead>

              <TableHead className="text-center">
                Works
              </TableHead>

              <TableHead className="text-center">
                Status
              </TableHead>

              <TableHead className="text-center">
                Actions
              </TableHead>

            </TableRow>

          </TableHeader>


          <TableBody>

            {filteredNits.length === 0 && (

              <TableRow>

                <TableCell
                  colSpan={6}
                  className="text-center py-6"
                >
                  No NIT Found
                </TableCell>

              </TableRow>

            )}

            {filteredNits.map((nit, index) => {

              const nitYear =
                new Date(nit.memoDate).getFullYear();

              const isPublished =
                nit.isPublished === true;

              return (

                <TableRow key={nit.id}>

                  {/* Serial */}
                  <TableCell>
                    {index + 1}
                  </TableCell>


                  {/* Memo */}
                  <TableCell>

                    <Link
                      href={`/admindashboard/manage-tender/view/${nit.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {nit.memoNumber}/{gpcode}/{nitYear}
                    </Link>

                  </TableCell>


                  {/* Date */}
                  <TableCell>

                    {
                      formatDateTime(
                        nit.memoDate
                      ).dateOnly
                    }

                  </TableCell>


                  {/* Works */}
                  <TableCell className="text-center">

                    <Badge variant="secondary">
                      {nit.WorksDetail?.length || 0}
                    </Badge>

                  </TableCell>


                  {/* Status */}
                  <TableCell className="text-center">

                    {isPublished ? (

                      <Badge className="bg-green-600">
                        Published
                      </Badge>

                    ) : (

                      <Badge variant="outline">
                        Draft
                      </Badge>

                    )}

                  </TableCell>


                  {/* Actions */}
                  <TableCell>

                    <div className="flex gap-2 justify-center flex-wrap">

                      {/* View */}
                      <Link
                        href={`/admindashboard/manage-tender/view/${nit.id}`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          View
                        </Button>
                      </Link>


                      {/* Add Work */}
                      {!isPublished && (

                        <Link
                          href={`/admindashboard/manage-tender/add/${nit.id}`}
                        >
                          <Button size="sm">
                            Add Work
                          </Button>
                        </Link>

                      )}


                      {/* Delete */}
                      {!isPublished &&
                        nit.WorksDetail?.length ===
                          0 && (

                          <form
                            onSubmit={async (
                              e
                            ) => {

                              e.preventDefault();

                              await onDeleteNit(
                                nit.id
                              );

                            }}
                          >

                            <Button
                              size="sm"
                              variant="destructive"
                            >
                              Delete
                            </Button>

                          </form>

                        )}


                      {/* Print */}
                      <NITCopy
                        nitdetails={nit}
                      />

                    </div>

                  </TableCell>

                </TableRow>

              );

            })}

          </TableBody>

        </Table>

      </CardContent>

    </Card>

  );

}
