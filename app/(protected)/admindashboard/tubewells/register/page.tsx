import Link from "next/link";
import { ChevronLeft, Plus, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TubewellTable } from "@/components/tubewells/TubewellTable";

export const metadata = {
  title: "Tubewell Register | Dhalpara GP",
  description: "Complete register of all tubewells in Dhalpara Gram Panchayat.",
};

export default function TubewellRegisterPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/admindashboard"
            className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border/40 shadow-sm hover:bg-muted transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Tubewell Register
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Complete register — all Mouzas, all tubewells
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button asChild className="gap-2 rounded-xl h-11 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40">
            <Link href="/admindashboard/tubewells/register/add">
              <Plus className="w-5 h-5" />
              Add Tubewell
            </Link>
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
        <div className="p-6">
          <TubewellTable />
        </div>
      </div>
    </div>
  );
}
