import ApplicationForm from "@/components/samabathy/ApplicationForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FilePlus2 } from "lucide-react";

export default function NewApplicationPage() {
  return (
    <div className="p-6 space-y-6 min-h-full bg-muted/20">
      {/* Header with Back Button */}
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/admindashboard/manage-samabyathi/applications">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FilePlus2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              New Application
            </h1>
            <p className="text-muted-foreground">
              Create a new entry for the Samabyathi funeral assistance scheme.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pb-10">
        <div className="w-full max-w-3xl">
          <ApplicationForm />
        </div>
      </div>
    </div>
  );
}
