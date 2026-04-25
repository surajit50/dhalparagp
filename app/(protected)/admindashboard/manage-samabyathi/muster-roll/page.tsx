import { db } from "@/lib/db";
import MusterRollGroupClient from "@/components/samabathy/MusterRollGroupClient";
import GenerateMusterButton from "@/components/samabathy/GenerateMusterButton";
import { FileText, IndianRupee, Users, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic"; // ⬅️ THIS IS THE KEY LINE

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
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Muster Roll Dashboard
          </h1>
          <p className="text-slate-500">
            Manage distribution and beneficiary payments
          </p>
        </div>
        <GenerateMusterButton />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Beneficiaries" value={totalBeneficiaries} icon={<Users />} />
        <StatCard title="Total Amount" value={`₹${totalAmount.toLocaleString("en-IN")}`} icon={<IndianRupee />} />
        <StatCard title="Completed" value={completed} icon={<CheckCircle />} color="green" />
        <StatCard title="Pending" value={pending} icon={<FileText />} color="yellow" />
      </div>

      {/* GROUP LIST */}
      <MusterRollGroupClient data={data as any} />
    </div>
  );
}

function StatCard({ title, value, icon, color = "blue" }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`p-2 rounded-lg ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}
