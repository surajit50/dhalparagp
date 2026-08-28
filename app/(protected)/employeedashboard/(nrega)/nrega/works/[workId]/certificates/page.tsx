import CertificateHub from "@/components/nrega/CertificateHub";
import { fetchNregaWorkById } from "@/action/nrega/work-actions";
import { fetchWorkCertificates } from "@/action/nrega/certificate-actions";
import { notFound } from "next/navigation";
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

export default async function CertificatesPage({ params }: PageProps) {
  const { workId } = await params;
  const [work, certificates] = await Promise.all([
    fetchNregaWorkById(workId),
    fetchWorkCertificates(workId),
  ]);

  if (!work) return notFound();

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
            <BreadcrumbPage>Certificates</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CertificateHub
        workId={work.workId}
        workDbId={work.id}
        workName={work.workName}
        certificates={certificates.map((c) => ({
          certificateNumber: c.certificateNumber,
          certificateName: c.certificateName,
          status: c.status,
        }))}
      />
    </div>
  );
}
