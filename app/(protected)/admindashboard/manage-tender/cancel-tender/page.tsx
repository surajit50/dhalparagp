import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TenderStatus } from "@prisma/client";
import { updatenitstatus } from "@/action/bookNitNuber";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { ActiveTendersTable } from "./ActiveTendersTable";
import { CancelledTendersPagination } from "./CancelledTendersPagination";
import {
  FileX,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

async function updateTenderStatus(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const status = formData.get("status") as TenderStatus;

  if (!id || !status) return;

  await updatenitstatus(id, status);

  revalidatePath("/admindashboard/manage-tender/cancel-tender");
}

const ITEMS_PER_PAGE = 10;

interface CancelTenderPageProps {
  searchParams: Promise<{ cancelledPage?: string }>;
}

const CancelTenderPage = async ({ searchParams }: CancelTenderPageProps) => {
  const { cancelledPage } = await searchParams;
  const cancelledCurrentPage = Number(cancelledPage) || 1;
  const cancelledSkip = (cancelledCurrentPage - 1) * ITEMS_PER_PAGE;

  const activeTenders = await db.worksDetail.findMany({
    where: {
      tenderStatus: {
        notIn: ["Cancelled", "AOC"],
      },
    },
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const [cancelledTenders, cancelledTotal] = await Promise.all([
    db.worksDetail.findMany({
      where: { tenderStatus: "Cancelled" },
      include: {
        nitDetails: true,
        ApprovedActionPlanDetails: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: cancelledSkip,
      take: ITEMS_PER_PAGE,
    }),
    db.worksDetail.count({
      where: { tenderStatus: "Cancelled" },
    }),
  ]);

  const cancelledTotalPages = Math.ceil(cancelledTotal / ITEMS_PER_PAGE);

  return (
    <div className="max-w-[1600px] mx-auto py-6 px-6 space-y-6">

      {/* ===== DASHBOARD SUMMARY ===== */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-blue-600">
          <CardContent className="flex items-center gap-4 p-5">
            <TrendingUp className="text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Active Tenders</p>
              <h2 className="text-2xl font-bold">{activeTenders.length}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-red-600">
          <CardContent className="flex items-center gap-4 p-5">
            <FileX className="text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <h2 className="text-2xl font-bold">{cancelledTotal}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-600">
          <CardContent className="flex items-center gap-4 p-5">
            <CheckCircle2 className="text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">System Status</p>
              <h2 className="text-lg font-semibold">Operational</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== ACTIVE TENDERS ===== */}
      <Card className="shadow-sm">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp size={18} /> Active Tender Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <ActiveTendersTable
            tenders={activeTenders}
            updateTenderStatus={updateTenderStatus}
          />
        </CardContent>
      </Card>

      {/* ===== CANCELLED TENDERS ===== */}
      <Card className="shadow-sm">
        <CardHeader className="bg-red-50 border-b">
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={18} /> Cancelled Tenders
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableCaption>
              Total Cancelled Tender: {cancelledTotal}
            </TableCaption>

            <TableHeader>
              <TableRow className="bg-slate-100">
                <TableHead>#</TableHead>
                <TableHead>NIT Details</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Restore</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {cancelledTenders.map((item, i) => (
                <TableRow key={item.id} className="hover:bg-slate-50">
                  <TableCell>{cancelledSkip + i + 1}</TableCell>

                  <TableCell>
                    <ShowNitDetails
                      nitdetails={item.nitDetails.memoNumber}
                      memoDate={item.nitDetails.memoDate}
                      workslno={item.workslno}
                    />
                  </TableCell>

                  <TableCell className="max-w-[400px]">
                    {item.ApprovedActionPlanDetails.activityDescription}
                  </TableCell>

                  <TableCell>
                    <Badge variant="destructive" className="gap-1">
                      <FileX size={14} /> Cancelled
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    <form action={updateTenderStatus}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="publish" />

                      <button className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded">
                        <RotateCcw size={14} />
                        Restore
                      </button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <CancelledTendersPagination
            currentPage={cancelledCurrentPage}
            totalPages={cancelledTotalPages}
            totalItems={cancelledTotal}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CancelTenderPage;
