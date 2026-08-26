import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StreetLightForm } from "@/components/street-lights/StreetLightForm";

export const metadata = {
  title: "Add Street Light | Dhalpara GP",
  description: "Record a new street light with GPS, photograph, and specification details.",
};

export default function AddStreetLightPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admindashboard/street-lights/register" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Street Light</h1>
          <p className="text-sm text-muted-foreground">
            Capture GPS location, photograph, and specification details
          </p>
        </div>
      </div>
      <StreetLightForm />
    </div>
  );
}
