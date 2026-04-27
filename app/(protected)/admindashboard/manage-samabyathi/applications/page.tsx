import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  IndianRupee,
} from "lucide-react";
import SamabyathiTable from "@/components/samabathy/SamabyathiTable";
import { FinancialYearFilter } from "@/components/FinancialYearFilter";
import CreateApplicationDialog from "@/components/samabathy/CreateApplicationDialog";
import {
  getFinancialYearDateRange,
  getCurrentFinancialYear,
} from "@/utils/financialYear";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ financialYear?: string }>;
}) {
  const { financialYear } = await searchParams;
  const currentFY = financialYear || getCurrentFinancialYear();
  const { financialYearStart, financialYearEnd } =
    getFinancialYearDateRange(currentFY);

  const data = await db.samabyathiApplication.findMany({
    where: {
      createdAt: {
        gte: financialYearStart,
        lte: financialYearEnd,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: data.length,
    pending: data.filter((item) => item.status === "PENDING").length,
    approved: data.filter((item) => item.status === "APPROVED").length,
    paid: data.filter((item) => item.status === "PAID").length,
    totalAmount: data.reduce(
      (acc, item) => acc + (item.sanctionAmount || 0),
      0,
    ),
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Samabyathi Applications
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track funeral assistance applications for the Samabyathi
            scheme.
          </p>
        </div>
        <CreateApplicationDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Total Applications
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Pending
                </p>
                <h3 className="text-2xl font-bold mt-1 text-amber-600">
                  {stats.pending}
                </h3>
              </div>
              <div className="p-3 bg-amber-50 rounded-full">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Approved/Paid
                </p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">
                  {stats.approved + stats.paid}
                </h3>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Total Disbursed
                </p>
                <h3 className="text-2xl font-bold mt-1 text-blue-600">
                  ₹{stats.totalAmount.toLocaleString("en-IN")}
                </h3>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <IndianRupee className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="shadow-sm border-none bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-semibold">
              Recent Applications
            </CardTitle>
            <CardDescription>
              A list of all applications for FY {currentFY}.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <FinancialYearFilter />
          </div>
        </CardHeader>
        <CardContent>
          <SamabyathiTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
