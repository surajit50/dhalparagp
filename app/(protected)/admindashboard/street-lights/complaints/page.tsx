import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ComplaintTable } from "@/components/street-lights/ComplaintTable";

export const metadata = {
  title: "Complaints | Street Light Register",
  description: "All street light complaints and repair tracking.",
};

export default function ComplaintsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admindashboard/street-lights" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Street Light Complaints</h1>
          <p className="text-sm text-muted-foreground">
            All complaints, repairs, and resolution tracking
          </p>
        </div>
      </div>
      <ComplaintTable />
    </div>
  );
}
