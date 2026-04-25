import { Suspense } from "react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/utils";
import { Download, Clock, FileText, Calendar, Hash } from "lucide-react";
import { NitDetail } from "@/types/nitDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { gpcode } from "@/constants/gpinfor";
// Define the TendersTableProps interface
interface TendersTableProps {
  tenders: NitDetail[];
}

// First rename the function to be more accurate
async function fetchCurrentTenders(): Promise<NitDetail[]> {
  try {
    const today = new Date();

    return await db.nitDetails.findMany({
      where: {
        endTime: {
          gte: today, // Changed from 'lt' to 'gte' to get future/current dates
        },
        publishhardcopy: {
          not: null,
        },
      },
      orderBy: {
        endTime: "asc", // Changed to ascending to show nearest deadlines first
      },
      select: {
        id: true,
        memoNumber: true,
        publishingDate: true,
        endTime: true,
        publishhardcopy: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch current tenders:", error);
    throw new Error("Failed to fetch current tenders");
  }
}

function TendersTable({ tenders }: TendersTableProps) {
  return (
    <div className="rounded-xl border shadow-lg overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="hover:bg-transparent border-b border-gray-200">
            <TableHead className="w-[60px] font-semibold">Sl No</TableHead>
            <TableHead className="font-semibold">NIT Details</TableHead>
            <TableHead className="w-[150px] font-semibold text-center">
              Document
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-100">
          {tenders.map((tender, index) => (
            <TableRow
              key={tender.id}
              className="hover:bg-gray-50/50 transition-colors"
            >
              <TableCell className="font-medium text-gray-500">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="font-medium text-gray-900">
                      NIT No: {tender.memoNumber}/${gpcode}/
                      {new Date(tender.publishingDate).getFullYear()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Closed on {formatDate(tender.endTime)}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {tender.publishhardcopy ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-blue-50 hover:text-blue-700 border-blue-200"
                    asChild
                  >
                    <a
                      href={tender.publishhardcopy}
                      download
                      className="flex items-center justify-center"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  </Button>
                ) : (
                  <span className="text-gray-400 text-sm">Not available</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Add loading state component
function LoadingTable() {
  return (
    <div className="rounded-xl border shadow-lg overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="hover:bg-transparent border-b border-gray-200">
            <TableHead className="w-[60px] font-semibold">Sl No</TableHead>
            <TableHead className="font-semibold">NIT Details</TableHead>
            <TableHead className="w-[150px] font-semibold text-center">
              Document
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-8 w-24 mx-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Add the default export page component
export default async function CurrentTendersPage() {
  const tenders = await fetchCurrentTenders();

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Current Tenders</h1>
      <Suspense fallback={<LoadingTable />}>
        <TendersTable tenders={tenders} />
      </Suspense>
    </div>
  );
}
