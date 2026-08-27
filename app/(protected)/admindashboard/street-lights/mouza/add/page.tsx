import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MouzaForm } from "@/components/street-lights/MouzaForm";

export const metadata = { title: "Add Mouza | Street Light Register" };

export default function AddMouzaPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/admindashboard/street-lights/mouza"
            className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border/40 shadow-sm hover:bg-muted transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Add New Mouza
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Register a new Mouza in the system
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
        <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-1">
          <MouzaForm />
        </div>
      </div>
    </div>
  );
}
