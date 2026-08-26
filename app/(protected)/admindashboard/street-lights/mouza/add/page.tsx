import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MouzaForm } from "@/components/street-lights/MouzaForm";

export const metadata = { title: "Add Mouza | Street Light Register" };

export default function AddMouzaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admindashboard/street-lights/mouza" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Mouza</h1>
          <p className="text-sm text-muted-foreground">Register a new Mouza in the system</p>
        </div>
      </div>
      <MouzaForm />
    </div>
  );
}
