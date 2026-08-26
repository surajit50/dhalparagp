import Link from "next/link";
import { ChevronLeft, Smartphone } from "lucide-react";
import { SurveyForm } from "@/components/street-lights/SurveyForm";

export const metadata = {
  title: "Field Survey | Street Light Register",
  description: "Mobile-optimized street light survey form for field data collection.",
};

export default function SurveyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admindashboard/street-lights" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Field Survey</h1>
            <p className="text-sm text-muted-foreground">
              Mobile-friendly entry — GPS, photo, and details in 5 steps
            </p>
          </div>
        </div>
      </div>

      {/* Mobile hint */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex items-center gap-2">
        <Smartphone className="w-4 h-4 flex-shrink-0" />
        For best experience, open this page on your mobile phone. GPS capture and camera will work automatically.
      </div>

      <SurveyForm />
    </div>
  );
}
