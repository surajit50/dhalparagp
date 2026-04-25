
import { Suspense } from "react";
import { db } from "@/lib/db";
import { WorkListByScheme } from "@/components/WorkListByScheme";

async function getWorks() {
  const works = await db.approvedActionPlanDetails.findMany({
    orderBy: [{ financialYear: "desc" }, { schemeName: "asc" }],
  });
  return works;
}

async function WorkListContent() {
  const works = await getWorks();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:items-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Scheme-wise Work List
          </span>
        </h1>
      </div>

      <div className="bg-white rounded-xl border p-6 shadow-lg">
        <WorkListByScheme works={works} />
      </div>
    </div>
  );
}

export default function SchemeWisePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense
        fallback={
          <div className="text-center text-gray-500 mt-8 animate-pulse">
            Loading scheme-wise work list...
          </div>
        }
      >
        <WorkListContent />
      </Suspense>
    </div>
  );
}
