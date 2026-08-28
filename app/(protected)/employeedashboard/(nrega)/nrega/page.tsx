import NregaDashboard from "@/components/nrega/NregaDashboard";
import { getNregaDashboardStats, fetchNregaWorks } from "@/action/nrega/work-actions";

export default async function NregaDashboardPage() {
  const [stats, worksResult] = await Promise.all([
    getNregaDashboardStats(),
    fetchNregaWorks(1, 10),
  ]);

  return (
    <NregaDashboard
      stats={stats}
      recentWorks={worksResult.works.map((w) => ({
        id: w.id,
        workId: w.workId,
        workName: w.workName,
        financialYear: w.financialYear,
        gramPanchayat: w.gramPanchayat,
        estimatedCost: w.estimatedCost,
        workStatus: w.workStatus,
        certificates: w.certificates,
      }))}
    />
  );
}
