import React from "react";
import { notFound } from "next/navigation";
import { getInternalAuditReportById } from "@/action/internal-audit-actions";
import InternalAuditForm from "../../_components/InternalAuditForm";

export const metadata = {
  title: "Edit Internal Audit Report | Admin Dashboard",
};

export default async function EditInternalAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getInternalAuditReportById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <InternalAuditForm initialData={res.data} reportId={id} />
    </div>
  );
}
