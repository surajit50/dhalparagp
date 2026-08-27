import Link from "next/link";
import { ChevronLeft, Smartphone } from "lucide-react";
import { SurveyForm } from "@/components/street-lights/SurveyForm";

export const metadata = {
  title: "Field Survey | Street Light Register",
  description: "Mobile-optimized street light survey form for field data collection.",
};

export default function SurveyPage() {
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 ring-1 ring-orange-500/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Field Survey
              </h1>
              <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                Mobile-friendly entry — GPS, photo, and details in 5 steps
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile hint */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
        <div className="rounded-xl border border-blue-200/50 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-800/50 px-4 py-3 text-sm text-blue-800 dark:text-blue-300 flex items-center gap-3 backdrop-blur-sm shadow-sm">
          <Smartphone className="w-5 h-5 flex-shrink-0 animate-pulse" />
          <p>For best experience, open this page on your mobile phone. GPS capture and camera will work automatically.</p>
        </div>
      </div>

      {/* Survey Form Section */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both delay-150">
        <SurveyForm />
      </div>
    </div>
  );
}
