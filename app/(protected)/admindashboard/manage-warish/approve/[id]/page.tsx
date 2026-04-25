import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import WarishApplicationDetails from "@/components/WarishApplicationDetails";
import { WarishDetailProps, WarishApplicationProps } from "@/types";
import {
  createWarishDetailsMap,
  organizeWarishDetailsHierarchy,
} from "@/utils/warishUtils";

import { Separator } from "@/components/ui/separator";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await db.warishApplication.findUnique({
    where: { id },
    include: {
      warishDetails: true,
    },
  });

  if (!application) {
    notFound();
  }

  const typedApplication = application as WarishApplicationProps;

  // Build the tree structure for warishDetails
  const warishDetailsMap = createWarishDetailsMap(
    typedApplication.warishDetails
  );
  const rootWarishDetails = organizeWarishDetailsHierarchy(warishDetailsMap);

  return (
    <div className="flex flex-col gap-2">
      <WarishApplicationDetails
        application={typedApplication}
        rootWarishDetails={rootWarishDetails}
      />
      <Separator className="my-4" />
     
    </div>
  );
}
