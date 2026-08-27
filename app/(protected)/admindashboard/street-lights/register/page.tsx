import Link from "next/link";
import { ChevronLeft, Plus, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreetLightTable } from "@/components/street-lights/StreetLightTable";

export const metadata = {
  title: "Street Light Register | Dhalpara GP",
  description: "Complete register of all street lights in Dhalpara Gram Panchayat.",
};

export default function StreetLightRegisterPage() {
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
              Street Light Register
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Complete register — all Mouzas, all lights
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button asChild variant="outline" className="gap-2 rounded-xl h-11 px-5 border-orange-200 hover:bg-orange-50 hover:text-orange-700 transition-colors">
            <Link href="/admindashboard/street-lights/map">
              <Map className="w-4 h-4" />
              Map View
            </Link>
          </Button>
          <Button asChild className="gap-2 rounded-xl h-11 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/20 transition-all hover:shadow-lg hover:shadow-orange-500/40">
            <Link href="/admindashboard/street-lights/register/add">
              <Plus className="w-5 h-5" />
              Add Street Light
            </Link>
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
        <div className="p-6">
          <StreetLightTable />
        </div>
      </div>
    </div>
  );
}
