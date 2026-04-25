import { listLinkageApplications } from "@/action/linkage-actions";
import { LinkageApplicationStatus } from "@prisma/client";
import LinkageValidateListClient from "@/components/LinkageValidateListClient";

export default async function ValidatePage() {
  const res = await listLinkageApplications({ status: LinkageApplicationStatus.VALIDATION_PENDING });
  const apps = (res.success && Array.isArray(res.data)) ? (res.data as any[]) : [];

  return (
    <div className="p-6">
      <LinkageValidateListClient initialItems={apps} />
    </div>
  );
}
 
