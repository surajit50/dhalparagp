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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { TenderStatus } from "@prisma/client";
import { FileX, FileText, AlertCircle } from "lucide-react";
import { GenerateNoticeButton } from "./GenerateNoticeButton";

const statusVariants: Record<
  TenderStatus,
  "destructive" | "success" | "warning" | "default"
> = {
  Cancelled: "destructive",
  published: "success",
  ToBeOpened: "warning",
  publish: "success",
  TechnicalBidOpening: "warning",
  TechnicalEvaluation: "warning",
  FinancialBidOpening: "warning",
  FinancialEvaluation: "warning",
  Retender: "warning",
  AOC: "default",
};

async function generateCorrigendumNotice(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;

  if (!id) {
    return { success: false, error: "Tender ID is required" };
  }

  try {
    // Fetch tender details
    const tender = await db.worksDetail.findUnique({
      where: { id },
      include: {
        nitDetails: true,
        ApprovedActionPlanDetails: true,
      },
    });

    if (!tender) {
      return { success: false, error: "Tender not found" };
    }

    if (tender.tenderStatus !== "Cancelled") {
      return { success: false, error: "Only cancelled tenders can have corrigendum notices" };
    }

    // TODO: Implement actual PDF/document generation logic here
    // This is a placeholder - implement the actual document generation
    // You might want to:
    // 1. Generate a PDF using a library like pdfkit or react-pdf
    // 2. Create a notice document with tender details
    // 3. Upload to cloudinary or storage
    // 4. Create a record in the database if needed

    revalidatePath("/admindashboard/manage-tender/corrigendum");
    return { success: true, message: "Corrigendum notice generated successfully" };
  } catch (error) {
    console.error("Error generating corrigendum notice:", error);
    return { success: false, error: "Failed to generate corrigendum notice" };
  }
}

export default async function CorrigendumPage() {
  // Fetch cancelled tenders
  const cancelledTenders = await db.worksDetail.findMany({
    where: {
      tenderStatus: "Cancelled",
    },
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Header Card */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 via-indigo-50 to-slate-50 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">
                Tender Corrigendum
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generate corrigendum notices for cancelled tenders
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-700">
              Select a cancelled tender below to generate a corrigendum notice.
            </p>
            <Button asChild variant="outline">
              <a href="/admindashboard/manage-tender/cancel-tender">
                View Cancel Tenders
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cancelled Tenders List */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center">
                <FileX className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  Cancelled Tenders
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  List of cancelled tenders eligible for corrigendum notice generation
                </p>
              </div>
            </div>
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {cancelledTenders.length} Cancelled
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-b-lg">
            <Table>
              <TableCaption className="text-sm text-muted-foreground bg-slate-50 py-3">
                {cancelledTenders.length} cancelled tender{cancelledTenders.length !== 1 ? "s" : ""} found
              </TableCaption>
              <TableHeader className="bg-slate-100">
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead className="min-w-[200px]">NIT Details</TableHead>
                  <TableHead className="min-w-[280px]">Work Description</TableHead>
                  <TableHead className="w-40">Status</TableHead>
                  <TableHead className="min-w-[200px]">Cancelled Date</TableHead>
                  <TableHead className="text-right min-w-[200px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cancelledTenders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 opacity-50" />
                        <p className="font-medium">No cancelled tenders</p>
                        <p className="text-sm">All tenders are currently active</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  cancelledTenders.map((item, i) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="text-center font-medium text-slate-600">
                        {i + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        <ShowNitDetails
                          nitdetails={item.nitDetails.memoNumber}
                          memoDate={item.nitDetails.memoDate}
                          workslno={item.workslno}
                        />
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <p className="truncate" title={item.ApprovedActionPlanDetails.activityDescription}>
                          {item.ApprovedActionPlanDetails.activityDescription}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[item.tenderStatus]} className="font-medium">
                          {item.tenderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <GenerateNoticeButton
                          tenderId={item.id}
                          tenderDescription={item.ApprovedActionPlanDetails.activityDescription}
                          generateCorrigendumNotice={generateCorrigendumNotice}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
