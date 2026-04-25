import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Upload } from "lucide-react";
import { getApprovedActionPlans } from "@/lib/actionplan";
import { DataTable } from "@/components/data-table";
import { actionplancolumns } from "@/components/table-col-ref/actionplan-col-ref";

async function ActionPlansContent() {
  const actionPlans = await getApprovedActionPlans();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:items-center">

        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Approved Action Plans
            </span>
          </h1>

          <span className="px-3 py-1 text-sm bg-muted rounded-full">
            {actionPlans.length}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            asChild
            className="rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            <Link href="/admindashboard/work-manage/add" className="flex gap-2">
              <PlusCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Add New Plan</span>
            </Link>
          </Button>

          <Button
            asChild
            className="rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            <Link href="/admindashboard/work-manage/upload" className="flex gap-2">
              <Upload className="h-5 w-5" />
              <span className="hidden sm:inline">Upload Excel</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border shadow-sm p-6">

        {actionPlans.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No action plans found
          </div>
        ) : (
          <DataTable data={actionPlans} columns={actionplancolumns} />
        )}

      </div>
    </div>
  );
}

export default function ActionPlansPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-64 bg-muted animate-pulse rounded-xl" />
          </div>
        }
      >
        <ActionPlansContent />
      </Suspense>
    </div>
  );
}
