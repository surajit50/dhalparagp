import CertificatePageClient from "@/components/nrega/CertificatePageClient";
import { fetchCertificateDetail } from "@/action/nrega/certificate-actions";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ workId: string; certId: string }>;
}

export default async function IndividualCertificatePage({ params }: PageProps) {
  const { workId, certId } = await params;
  const certificateNumber = parseInt(certId, 10);

  if (isNaN(certificateNumber) || certificateNumber < 1 || certificateNumber > 8) {
    return notFound();
  }

  const { certificate, verifications, work, template } = await fetchCertificateDetail(
    workId,
    certificateNumber
  );

  if (!certificate || !work) {
    return notFound();
  }

  return (
    <CertificatePageClient
      work={work}
      certificate={certificate}
      verifications={verifications}
      template={template}
    />
  );
}
