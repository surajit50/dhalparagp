import CertificatePageClient from "@/components/nrega/CertificatePageClient";
import {
  fetchCertificateDetail,
  fetchCertificateTemplateRange,
} from "@/action/nrega/certificate-actions";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ workId: string; certId: string }>;
}

export default async function IndividualCertificatePage({ params }: PageProps) {
  const { workId, certId } = await params;

  // Strict integer parsing — reject hex (0x), floats, whitespace, non-numeric
  const certIdTrimmed = certId.trim();
  if (!/^\d+$/.test(certIdTrimmed)) {
    return notFound();
  }
  const certificateNumber = Number.parseInt(certIdTrimmed, 10);

  // Validate against the active template range instead of hardcoded 1-8
  const range = await fetchCertificateTemplateRange();
  if (
    Number.isNaN(certificateNumber) ||
    certificateNumber < range.min ||
    certificateNumber > range.max ||
    !range.numbers.includes(certificateNumber)
  ) {
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
