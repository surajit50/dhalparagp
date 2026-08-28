import WorkForm from "@/components/nrega/WorkForm";
import { fetchNregaWorkById } from "@/action/nrega/work-actions";
import { fetchAllMasterData } from "@/action/nrega/master-data-actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface PageProps {
  params: Promise<{ workId: string }>;
}

export default async function EditWorkPage({ params }: PageProps) {
  const { workId } = await params;
  const [work, masterData] = await Promise.all([
    fetchNregaWorkById(workId),
    fetchAllMasterData(),
  ]);

  if (!work) return notFound();

  const formMasterData: Record<string, Array<{ value: string; label: string }>> = {};
  for (const [type, items] of Object.entries(masterData)) {
    formMasterData[type] = items.map((item) => ({
      value: item.value,
      label: item.label,
    }));
  }

  // Convert work data to form values
  const initialData = {
    id: work.id,
    financialYear: work.financialYear,
    scheme: work.scheme,
    workName: work.workName,
    natureOfWork: work.natureOfWork || undefined,
    masterCategory: work.masterCategory || undefined,
    subCategory: work.subCategory || undefined,
    permissibleWorkSlNo: work.permissibleWorkSlNo || undefined,
    permissibleWorkDesc: work.permissibleWorkDesc || undefined,
    gramPanchayat: work.gramPanchayat,
    gramSansadName: work.gramSansadName || undefined,
    gramSansadNumber: work.gramSansadNumber || undefined,
    block: work.block,
    district: work.district,
    mouza: work.mouza || undefined,
    jlNumber: work.jlNumber || undefined,
    plotNumber: work.plotNumber || undefined,
    latitude: work.latitude || undefined,
    longitude: work.longitude || undefined,
    worksiteType: work.worksiteType || undefined,
    landArea: work.landArea || undefined,
    estimatedCost: work.estimatedCost,
    wageComponent: work.wageComponent,
    materialComponent: work.materialComponent,
    wageMaterialRatio: work.wageMaterialRatio || undefined,
    vbGramgShare: work.vbGramgShare ?? 0,
    convergenceDeptShare: work.convergenceDeptShare ?? 0,
    totalEstimatedCost: work.totalEstimatedCost,
    beneficiaryType: work.beneficiaryType || undefined,
    beneficiaryName: work.beneficiaryName || undefined,
    jobCardNumber: work.jobCardNumber || undefined,
    beneficiaryCategory: work.beneficiaryCategory || undefined,
    gramSabhaApprovalDate: work.gramSabhaApprovalDate || undefined,
    adminApprovalNumber: work.adminApprovalNumber || undefined,
    adminApprovalDate: work.adminApprovalDate || undefined,
    technicalSanctionNumber: work.technicalSanctionNumber || undefined,
    technicalSanctionDate: work.technicalSanctionDate || undefined,
    dprNumber: work.dprNumber || undefined,
    dprDate: work.dprDate || undefined,
    convergingDepartment: work.convergingDepartment || undefined,
    convergingScheme: work.convergingScheme || undefined,
    convergenceCategory: work.convergenceCategory || undefined,
    technicalKnowledgeProvided: work.technicalKnowledgeProvided || undefined,
    nocReceived: work.nocReceived || undefined,
    nocMemoNumber: work.nocMemoNumber || undefined,
    nocDate: work.nocDate || undefined,
    remarks: work.remarks || undefined,
    workStatus: work.workStatus as "DRAFT" | "APPROVED" | "ONGOING" | "COMPLETED",
  };

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
