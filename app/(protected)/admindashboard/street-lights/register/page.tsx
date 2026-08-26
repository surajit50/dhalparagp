import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreetLightTable } from "@/components/street-lights/StreetLightTable";

export const metadata = {
  title: "Street Light Register | Dhalpara GP",
  description: "Complete register of all street lights in Dhalpara Gram Panchayat.",
};

export default function StreetLightRegisterPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admindashboard/street-lights" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Street Light Register</h1>
            <p className="text-sm text-muted-foreground">
              Complete register — all Mouzas, all lights
            </p>
          </div>
        </div>
        <Button asChild className="gap-2 w-fit">
          <Link href="/admindashboard/street-lights/register/add">
            <Plus className="w-4 h-4" />
            Add Street Light
          </Link>
        </Button>
      </div>
      <StreetLightTable />
    </div>
  );
}
