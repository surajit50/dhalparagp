import React from "react";
import { notFound } from "next/navigation";
import { getInternalAuditReportById } from "@/action/internal-audit-actions";
import InternalAuditViewClient from "./InternalAuditViewClient";

export const metadata = {
  title: "View Internal Audit Report | Admin Dashboard",
};

export default async function ViewInternalAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getInternalAuditReportById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return <InternalAuditViewClient report={res.data} />;
}
