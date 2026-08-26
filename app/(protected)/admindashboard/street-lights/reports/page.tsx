import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StreetLightReports } from "@/components/street-lights/StreetLightReports";

export const metadata = {
  title: "Reports | Street Light Register",
  description: "Generate Mouza-wise, Sansad-wise, and status reports for street lights.",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admindashboard/street-lights" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Street Light Reports</h1>
          <p className="text-sm text-muted-foreground">
            Mouza-wise, Sansad-wise, defective, GPS survey, LED totals, and more
          </p>
        </div>
      </div>
      <StreetLightReports />
    </div>
  );
}
