import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StreetLightReports } from "@/components/street-lights/StreetLightReports";

export const metadata = {
  title: "Reports | Street Light Register",
  description: "Generate Mouza-wise, Sansad-wise, and status reports for street lights.",
};

export default function ReportsPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/admindashboard/street-lights"
            className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border/40 shadow-sm hover:bg-muted transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Street Light Reports
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              Mouza-wise, Sansad-wise, defective, GPS survey, LED totals, and more
            </p>
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
        <StreetLightReports />
      </div>
    </div>
  );
}
