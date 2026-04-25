import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LinkageCertificatePDF from "@/components/PrintTemplet/LinkageCertificatePDF";
import FamilyTreeVisualization, {
  Beneficiary,
} from "@/components/FamilyTreeVisualization";

function buildBeneficiaryTree(items: any[]): Beneficiary[] {
  const map = new Map<string, Beneficiary>();
  const roots: Beneficiary[] = [];

  // Initialize map with nodes and empty children arrays
  for (const item of items) {
    map.set(item.id, {
      id: item.id,
      name: item.name,
      relation: item.relation,
      livingStatus: item.livingStatus,
      gender: item.gender,
      parentId: item.parentId,
      children: [],
    });
  }

  // Build the tree structure
  for (const item of items) {
    const current = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(current);
    } else {
      roots.push(current);
    }
  }

  return roots;
}

export default async function LinkagePrintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cert = await db.linkageCertificate.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          linkageApplicationBeneficiaries: { orderBy: { createdAt: "asc" } },
        },
      },
      beneficiaries: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!cert) return notFound();

  // Always render tree from application beneficiaries to avoid partial certificate snapshots.
  const flatBeneficiaries = cert.application.linkageApplicationBeneficiaries;

  const beneficiaryTree = buildBeneficiaryTree(flatBeneficiaries);
  const formattedIssueDate = new Date(cert.issueDate).toLocaleDateString();
  const officeName = "Office Of The Gram Panchayat";

  return (
    <div className="space-y-6 p-6">
      <Card className="overflow-hidden rounded-sm border border-slate-300 shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="border-b-2 border-slate-700 pb-3">
            <p className="text-center text-xs uppercase tracking-[0.18em] text-slate-600">
              Government Of West Bengal
            </p>
            <h1 className="text-center text-xl font-bold text-slate-900">
              Family Linkage Certificate
            </h1>
            <p className="text-center text-sm text-slate-700">{officeName}</p>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            <div className="border border-slate-300 px-3 py-2">
              <span className="font-semibold text-slate-700">
                Certificate No:
              </span>{" "}
              <span className="font-medium text-slate-900">
                {cert.certificateNo}
              </span>
            </div>
            <div className="border border-slate-300 px-3 py-2">
              <span className="font-semibold text-slate-700">
                Date Of Issue:
              </span>{" "}
              <span className="font-medium text-slate-900">
                {formattedIssueDate}
              </span>
            </div>
            <div className="border border-slate-300 px-3 py-2">
              <span className="font-semibold text-slate-700">Memo No:</span>{" "}
              <span className="font-medium text-slate-900">
                {cert.memoNo || "Not Available"}
              </span>
            </div>
            <div className="border border-slate-300 px-3 py-2">
              <span className="font-semibold text-slate-700">
                Reference No:
              </span>{" "}
              <span className="font-medium text-slate-900">
                {cert.referenceNo ||
                  cert.application?.applicationNo ||
                  "Not Available"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2">
            <Badge
              variant="outline"
              className="rounded-sm border-slate-400 text-slate-700"
            >
              Certificate Type: {cert.certificateType || "Linkage"}
            </Badge>
            <LinkageCertificatePDF
              applicationDetails={{
                ...cert.application,
                certificate: cert,
                beneficiaries: flatBeneficiaries,
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="print:shadow-none rounded-sm border border-slate-300">
        <CardHeader className="border-b border-slate-300 bg-slate-100 py-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-800">
            Applicant And Linkage Particulars
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b border-r border-slate-200 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Application No.
              </p>
              <p className="font-medium text-slate-900">
                {cert.application?.applicationNo || "Not Available"}
              </p>
            </div>
            <div className="border-b border-slate-200 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Applicant Name
              </p>
              <p className="font-medium text-slate-900">
                {cert.application?.applicantName || "Not Available"}
              </p>
            </div>
            <div className="border-r border-slate-200 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Linked Entity
              </p>
              <p className="font-medium text-slate-900">
                {cert.application?.linkedEntityName || "Not Available"}
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Contact Number
              </p>
              <p className="font-medium text-slate-900">
                {cert.application?.applicantPhone || "Not Available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {cert.certificateBody && (
        <Card className="print:shadow-none rounded-sm border border-slate-300">
          <CardHeader className="border-b border-slate-300 bg-slate-100 py-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-800">
              Certificate Declaration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="rounded-sm border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-800">
              {cert.certificateBody}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="print:shadow-none rounded-sm border border-slate-300">
        <CardHeader className="border-b border-slate-300 bg-slate-100 py-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-800">
            Beneficiary Register (Family Tree)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FamilyTreeVisualization beneficiaryTree={beneficiaryTree} />
        </CardContent>
      </Card>
    </div>
  );
}
