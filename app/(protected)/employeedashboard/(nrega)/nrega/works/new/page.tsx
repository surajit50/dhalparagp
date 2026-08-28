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

export default async function NewWorkPage() {
  const masterData = await fetchAllMasterData();

  // Convert to the format WorkForm expects
  const formMasterData: Record<string, Array<{ value: string; label: string }>> = {};
  for (const [type, items] of Object.entries(masterData)) {
    formMasterData[type] = items.map((item) => ({
      value: item.value,
      label: item.label,
    }));
  }

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
