import { Button } from "@/components/ui/button";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Check,
  X,
  FileText,
} from "lucide-react";

import { db } from "@/lib/db";
import Link from "next/link";
import { Prisma } from "@prisma/client";

interface PageProps {
  searchParams?: Promise<{
    page?: string;
    search?: string;
  }>;
}

const ITEMS_PER_PAGE = 10;

export default async function NitTablePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = Number(params?.page) || 1;
  const search = params?.search?.trim() || "";

  /* ✅ SAFE WHERE CONDITION FOR INT FIELD */
  let whereCondition: Prisma.NitDetailsWhereInput | undefined;

  if (search && !isNaN(Number(search))) {
    whereCondition = {
      memoNumber: Number(search),
    };
  } else {
    whereCondition = undefined;
  }

  const totalCount = await db.nitDetails.count({
    where: whereCondition,
  });

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / ITEMS_PER_PAGE)
  );

  const nits = await db.nitDetails.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  const formatDate = (date: Date | null) =>
    date ? new Date(date).toLocaleDateString("en-GB") : "-";

  return (
    <div className="container mx-auto py-8">
      <Card className="rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-2xl font-bold text-gray-800">
              NIT Management
            </CardTitle>

            <div className="flex gap-3">
              <form>
                <Input
                  name="search"
                  defaultValue={search}
                  placeholder="Search memo number..."
                  className="w-64"
                />
              </form>

              <Link href="/nits/create">
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                  <Plus className="h-4 w-4 mr-2" />
                  Create NIT
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {nits.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <div className="text-gray-500 mb-4">
                No NIT records found
              </div>
              <Link href="/nits/create">
                <Button variant="outline">
                  Create First NIT
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Sl</TableHead>
                      <TableHead>Memo Number</TableHead>
                      <TableHead>Memo Date</TableHead>
                      <TableHead>Publishing Date</TableHead>
                      <TableHead>Supply</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {nits.map((nit, index) => (
                      <TableRow key={nit.id}>
                        <TableCell>
                          {(page - 1) * ITEMS_PER_PAGE + index + 1}
                        </TableCell>

                        <TableCell className="font-semibold">
                          <Link
                            href={`/nits/${nit.id}`}
                            className="hover:underline text-indigo-600"
                          >
                            {nit.memoNumber ?? "-"}
                          </Link>
                        </TableCell>

                        <TableCell>
                          {formatDate(nit.memoDate)}
                        </TableCell>

                        <TableCell>
                          {formatDate(nit.publishingDate)}
                        </TableCell>

                        <TableCell>
                          {nit.isSupply ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="h-4 w-4 mr-1" />
                              Supply
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800">
                              <X className="h-4 w-4 mr-1" />
                              Non-Supply
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          {nit.isPublished ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              Published
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700">
                              Draft
                            </Badge>
                          )}
                        </TableCell>

                        {/* 🔐 Edit only if Draft */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              {/* View Always */}
                              <DropdownMenuItem asChild>
                                <Link href={`/nits/${nit.id}`}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>

                              {/* Edit only if Draft */}
                              {!nit.isPublished ? (
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admindashboard/manage-tender/edit/${nit.id}`}
                                  >
                                    <Pencil className="mr-2 h-4 w-4 text-indigo-600" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  disabled
                                  className="text-gray-400"
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Locked (Published)
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>

                <div className="flex gap-2">
                  {page > 1 && (
                    <Link href={`?page=${page - 1}&search=${search}`}>
                      <Button variant="outline">Previous</Button>
                    </Link>
                  )}

                  {page < totalPages && (
                    <Link href={`?page=${page + 1}&search=${search}`}>
                      <Button variant="outline">Next</Button>
                    </Link>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
