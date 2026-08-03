import React from "react";
import { notFound } from "next/navigation";
import { getDigitalCertificateApplication } from "@/action/digital-certificate";
import DigitalCertificatePrintTemplate from "@/components/digital-certificate/DigitalCertificatePrintTemplate";

interface AdminPrintPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminDigitalCertificatePrintPage({
  params,
}: AdminPrintPageProps) {
  const { id } = await params;
  const res = await getDigitalCertificateApplication(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-2 sm:px-4 print:bg-white print:p-0 print:m-0">
      <DigitalCertificatePrintTemplate
        data={res.data}
        showPrintButton={true}
        backUrl="/admindashboard/manage-digital-certificate"
      />
    </div>
  );
}
