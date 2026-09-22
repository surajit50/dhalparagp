import WorkForm from "@/components/nrega/WorkForm";
import { fetchAllMasterData } from "@/action/nrega/master-data-actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { transformMasterData } from "@/lib/utils/nrega";

export default async function NewWorkPage() {
  const masterDataRaw = await fetchAllMasterData();

  // Use shared helper for consistent transformation
  const formMasterData = transformMasterData(masterDataRaw);

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/employeedashboard/nrega/works">Works</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New Work</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Work</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter work details once — all certificates will use this data automatically.
        </p>
      </div>
      <WorkForm masterData={formMasterData} mode="create" />
    </div>
  );
}
