import { listLinkageApplications } from "@/action/linkage-actions";
import { LinkageApplicationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import LinkageIssueListClient from "@/components/LinkageIssueListClient";

export default async function IssuePage() {
  const res = await listLinkageApplications({ status: LinkageApplicationStatus.OWNERSHIP_VERIFIED });
  const apps = (res.success && Array.isArray(res.data)) ? (res.data as any[]) : [];
  const gpInfo = await db.gPProfile.findFirst();

  return (
    <div className="p-6">
      <LinkageIssueListClient initialItems={apps} gpInfo={gpInfo} />
    </div>
  );
}
