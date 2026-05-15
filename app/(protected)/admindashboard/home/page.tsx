import { LayoutDashboard, Plus, FilePlus } from "lucide-react";
import Link from "next/link";
import FundSummaryCards from "@/components/protectedComponent/FundSummaryCards";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  return (
    <div className="mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-600 rounded-xl shadow-lg shadow-orange-200">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard
            </h1>
          </div>
          <p className="text-slate-500 font-medium">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admindashboard/manage-warish/application">
            <button className="group flex items-center gap-2 bg-white hover:bg-orange-600 text-slate-700 hover:text-white px-5 py-2.5 rounded-xl border border-slate-200 hover:border-orange-600 shadow-sm transition-all duration-200 font-semibold">
              <FilePlus
                size={18}
                className="text-orange-600 group-hover:text-white transition-colors"
              />
              New Application
            </button>
          </Link>

          <Link href="/admindashboard/manage-tender/add">
            <button className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-slate-200 transition-all duration-200 font-semibold">
              <Plus
                size={18}
                className="text-slate-400 group-hover:text-white transition-colors"
              />
              Create NIT
            </button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>}>
        <FundSummaryCards />
      </Suspense>
    </div>
  );
}
