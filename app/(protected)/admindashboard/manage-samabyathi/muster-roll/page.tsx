import { db } from "@/lib/db";
import MusterRollGroupClient from "@/components/samabathy/MusterRollGroupClient";
import GenerateMusterButton from "@/components/samabathy/GenerateMusterButton";
import { IndianRupee, Users, CheckCircle, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MusterPage() {
  const data = await db.musterRoll.findMany({
    include: { application: true },
    orderBy: { createdAt: "desc" },
  });

  const totalAmount = data.reduce((sum, d) => sum + d.allottedAmount, 0);
  const totalBeneficiaries = data.length;
  const completed = data.filter(d => d.paymentStatus === "COMPLETED").length;
  const pending = totalBeneficiaries - completed;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* 🔷 HERO HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-600 to-violet-600 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Muster Roll Dashboard
            </h1>
            <p className="text-orange-100 text-sm">
              Samabyathi Assistance Distribution System
            </p>
          </div>

          <div className="relative z-10">
            <GenerateMusterButton />
          </div>
        </div>

        <div
          className="absolute right-0 top-0 opacity-10 text-9xl font-bold pointer-events-none select-none"
          aria-hidden="true"
        >
          MR
        </div>
      </div>

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Beneficiaries" value={totalBeneficiaries} icon={<Users />} />
        <StatCard title="Total Amount" value={`₹${totalAmount.toLocaleString("en-IN")}`} icon={<IndianRupee />} />
        <StatCard title="Completed" value={completed} icon={<CheckCircle />} color="green" />
        <StatCard title="Pending" value={pending} icon={<FileText />} color="yellow" />
      </div>

      {/* 📦 LIST */}
      <MusterRollGroupClient data={data as any} />
    </div>
  );
}

/* 🔥 PREMIUM STAT CARD */
function StatCard({ title, value, icon, color = "blue" }: any) {
  const colors: any = {
    blue: "from-orange-500 to-orange-500",
    green: "from-emerald-500 to-green-500",
    yellow: "from-amber-500 to-orange-500",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur border shadow-md hover:shadow-xl transition-all p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {value}
          </p>
        </div>

        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white shadow`}>
          {icon}
        </div>
      </div>

      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br opacity-10 rounded-full blur-2xl"></div>
    </div>
  );
}
