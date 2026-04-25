import { listLinkageApplications } from "@/action/linkage-actions";
import { LinkageApplicationStatus } from "@prisma/client";
import LinkageOwnershipListClient from "@/components/LinkageOwnershipListClient";

export default async function OwnershipPage() {
  const res = await listLinkageApplications({ status: LinkageApplicationStatus.OWNERSHIP_PENDING });
  const apps = (res.success && Array.isArray(res.data)) ? (res.data as any[]) : [];

  return (
    <div className="p-6">
      <LinkageOwnershipListClient initialItems={apps} />
    </div>
  );
}
 
