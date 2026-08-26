import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MouzaTable } from "@/components/street-lights/MouzaTable";

export const metadata = {
  title: "Mouza Master | Street Light Register",
  description: "Manage Mouza records for the Street Light Register System.",
};

export default function MouzaMasterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admindashboard/street-lights"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Mouza Master</h1>
          <p className="text-sm text-muted-foreground">
            Manage Mouza records and their street light counts
          </p>
        </div>
      </div>
      <MouzaTable />
    </div>
  );
}
