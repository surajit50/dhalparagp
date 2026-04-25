import { notFound } from "next/navigation";
import { getCertificateById } from "@/action/certificate-actions";
import CertificateDownload from "@/components/certificate-download";

interface CertificatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CertificatePage({
  params,
}: CertificatePageProps) {
  const { id } = await params;
  const result = await getCertificateById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const certificate = result.data;

  // Transform data for the certificate component
  const certificateData = {
    certificateNo: certificate.certificateNo,
    issueDate: certificate.issueDate
      ? new Date(certificate.issueDate).toLocaleDateString("en-IN")
      : "",
    expiryDate: certificate.expiryDate
      ? new Date(certificate.expiryDate).toLocaleDateString("en-IN")
      : "",
    ancestorName: certificate.ancestorName,
    casteCategory: certificate.casteCategory,
    village: certificate.village,
    postOffice: certificate.postOffice,
    block: certificate.block,
    district: certificate.district,
    state: certificate.state,
    familyTree: certificate.familyMembers || [],
    issuedBy: certificate.issuedBy || "",
    designation: certificate.designation || "",
    applicantName: certificate.applicantName,
    applicantAddress: certificate.applicantAddress,
  };

  return <CertificateDownload certificateData={certificateData} />;
}
