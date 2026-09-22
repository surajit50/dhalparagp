import WorkForm from "@/components/nrega/WorkForm";
import { fetchNregaWorkById } from "@/action/nrega/work-actions";
import { fetchAllMasterData } from "@/action/nrega/master-data-actions";
import { notFound } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { mapNregaWorkToFormInput, transformMasterData } from "@/lib/utils/nrega";

interface PageProps {
  params: Promise<{ workId: string }>;
}

export default async function EditWorkPage({ params }: PageProps) {
  const { workId } = await params;
  const [work, masterDataRaw] = await Promise.all([
    fetchNregaWorkById(workId),
    fetchAllMasterData(),
  ]);

  if (!work) return notFound();

  // Use shared helpers instead of inline mapping
  const formMasterData = transformMasterData(masterDataRaw);
  const initialData = mapNregaWorkToFormInput(work);

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/employeedashboard/nrega/works">Works</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/employeedashboard/nrega/works/${workId}`}>
              {work.workId}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit Work</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Work</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {work.workName}
        </p>
      </div>
      <WorkForm initialData={initialData} masterData={formMasterData} mode="edit" />
    </div>
  );
}
