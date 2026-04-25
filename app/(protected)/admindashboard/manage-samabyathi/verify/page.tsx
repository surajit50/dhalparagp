import { db } from "@/lib/db";
import VerifyApplicationsClient from "./VerifyApplicationsClient";
import { ShieldCheck } from "lucide-react";

export default async function VerifyApplicationsPage() {
  const applications = await db.samabyathiApplication.findMany({
    where: {
      status: "UNDER_REVIEW",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-6 space-y-6 min-h-full bg-muted/20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Verify Applications
          </h1>
          <p className="text-muted-foreground">
            Review and verify citizen submissions for the Samabyathi scheme.
          </p>
        </div>
      </div>

      <VerifyApplicationsClient initialData={JSON.parse(JSON.stringify(applications))} />
    </div>
  );
}
