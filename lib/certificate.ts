import { type Certificate, CertificateStatus } from "@/types";

export function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `FLC/${year}/${random}`;
}

export function calculateExpiryDate(issueDate: Date, validityMonths = 6): Date {
  const expiryDate = new Date(issueDate);
  expiryDate.setMonth(expiryDate.getMonth() + validityMonths);
  return expiryDate;
}

export function isExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}

export function getStatusColor(status: CertificateStatus): string {
  switch (status) {
    case CertificateStatus.DRAFT:
      return "bg-gray-100 text-gray-800";
    case CertificateStatus.FIELD_ENQUIRY_PENDING:
      return "bg-yellow-100 text-yellow-800";
    case CertificateStatus.FIELD_ENQUIRY_COMPLETED:
      return "bg-blue-100 text-blue-800";
    case CertificateStatus.APPROVAL_PENDING:
      return "bg-orange-100 text-orange-800";
    case CertificateStatus.APPROVED:
    case CertificateStatus.ISSUED:
      return "bg-green-100 text-green-800";
    case CertificateStatus.EXPIRED:
    case CertificateStatus.REJECTED:
    case CertificateStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function canRenew(certificate: Certificate): boolean {
  return (
    certificate.status === CertificateStatus.ISSUED ||
    certificate.status === CertificateStatus.EXPIRED
  );
}

export function canApprove(certificate: Certificate): boolean {
  return (
    certificate.status === CertificateStatus.FIELD_ENQUIRY_COMPLETED ||
    certificate.status === CertificateStatus.APPROVAL_PENDING
  );
}

export function canConductEnquiry(certificate: Certificate): boolean {
  return certificate.status === CertificateStatus.FIELD_ENQUIRY_PENDING;
}
