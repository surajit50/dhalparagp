import { Suspense } from "react";
import { getApprovedActionPlans } from "@/lib/actionplan";
import { InlineEditActionPlanTable } from "@/components/table-col-ref/actionplan-col-ref";
import { FileCheck, Sparkles, TrendingUp, Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function ActionPlansContent() {
  const actionPlans = await getApprovedActionPlans();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 border border-white/10 p-8 sm:p-14 shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-20 pointer-events-none">
          <Sparkles className="w-96 h-96 text-indigo-400 animate-pulse-subtle" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 opacity-10 pointer-events-none">
          <Boxes className="w-80 h-80 text-purple-400" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start gap-10 xl:items-center">
          <div className="flex flex-col gap-4 max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/10 backdrop-blur-md text-indigo-300 rounded-2xl shadow-inner border border-white/10">
                <FileCheck className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="bg-white/5 backdrop-blur-md text-indigo-200 border-indigo-500/30 px-4 py-1.5 text-sm rounded-full">
                Workspace Management
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-sm">
              Action Plans Registry
            </h1>
            <p className="text-indigo-200/90 text-lg sm:text-xl max-w-2xl mt-2 leading-relaxed font-medium">
              View and manage all approved action plans seamlessly. Monitor ongoing projects and track progress across different financial years.
            </p>
          </div>
          
          <div className="flex w-full xl:w-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl px-8 py-6 shadow-2xl flex items-center gap-6 w-full xl:w-auto hover-scale transition-all duration-300 group cursor-default relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-300 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="flex flex-col relative z-10">
                <span className="text-sm font-semibold text-indigo-200 uppercase tracking-wider">Total Approved</span>
                <span className="text-5xl font-black text-white mt-1 drop-shadow-md">
                  {actionPlans.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section with Glassmorphism */}
      <div className="relative group w-full max-w-full">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-white dark:bg-zinc-950/80 backdrop-blur-2xl rounded-[2rem] border border-gray-100 dark:border-zinc-800/50 shadow-2xl p-4 sm:p-8 overflow-hidden w-full">
          <InlineEditActionPlanTable data={actionPlans} />
        </div>
      </div>
    </div>
  );
}

export default function ActionPlansPage() {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="loader"></div>
          </div>
          <div className="text-indigo-600 dark:text-indigo-400 font-semibold text-lg animate-pulse">Loading action plans registry...</div>
        </div>
      }>
        <ActionPlansContent />
      </Suspense>
    </div>
  );
}
