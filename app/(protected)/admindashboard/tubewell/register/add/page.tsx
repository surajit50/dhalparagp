import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TubewellRegisterForm } from "@/components/tubewells/TubewellRegisterForm";

export default function AddTubewellPage() {
  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admindashboard/tubewell/register">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Add New Tubewell
            </h1>
            <p className="text-sm text-muted-foreground">
              Register a tubewell with its Mouza, GPS coordinates, photo, and details.
            </p>
          </div>
        </div>

        <TubewellRegisterForm mode="create" />
      </div>
    </div>
  );
}
