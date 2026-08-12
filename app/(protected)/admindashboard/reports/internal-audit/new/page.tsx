import React from "react";
import InternalAuditForm from "../_components/InternalAuditForm";
import { getOrSeedDefaultGpDetails } from "@/action/gp-profile-actions";

export const metadata = {
  title: "New Quarterly Internal Audit Report | Admin Dashboard",
};

export default async function NewInternalAuditPage() {
  const gpDetailsRes = await getOrSeedDefaultGpDetails();
  const initialData = gpDetailsRes.success && gpDetailsRes.data ? gpDetailsRes.data : undefined;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <InternalAuditForm initialData={initialData} />
    </div>
  );
}

