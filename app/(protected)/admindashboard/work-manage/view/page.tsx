import { Suspense } from "react";
import { getApprovedActionPlans } from "@/lib/actionplan";
import { InlineEditActionPlanTable } from "@/components/table-col-ref/actionplan-col-ref";

async function ActionPlansContent() {
  const actionPlans = await getApprovedActionPlans();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-orange-600 to-purple-600 text-transparent bg-clip-text">
              Approved Action Plans
            </span>
          </h1>
          <span className="px-3 py-1 text-sm bg-muted rounded-full">
            {actionPlans.length}
          </span>
        </div>
        {/* Add New Plan and Upload buttons if needed */}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border shadow-sm p-6">
        <InlineEditActionPlanTable data={actionPlans} />
      </div>
    </div>
  );
}

export default function ActionPlansPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <ActionPlansContent />
      </Suspense>
    </div>
  );
}
