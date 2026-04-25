"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LinkageCertificatePDF from "@/components/PrintTemplet/LinkageCertificatePDF";

type Beneficiary = {
  id: string;
  name: string;
  relation: string;
  livingStatus?: string | null;
  gender?: string | null;
  parentId?: string | null;
  children?: Beneficiary[];
};

function buildBeneficiaryTree(items: any[]): Beneficiary[] {
  const map = new Map<string, Beneficiary>();
  const roots: Beneficiary[] = [];

  for (const item of items) {
    map.set(item.id, {
      id: item.id,
      name: item.name,
      relation: item.relation,
      gender: item.gender,
      livingStatus: item.livingStatus,
      parentId: item.parentId,
      children: [],
    });
  }

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

function formatRelationLabel(relation: string) {
  if (!relation) return "Member";
  return relation;
}

function formatDisplayName(name: string, livingStatus?: string | null) {
  const cleanName = (name || "").trim();
  if (!cleanName) return "Unnamed";
  if (livingStatus === "dead" && !/^Late\s+/i.test(cleanName)) {
    return `Late ${cleanName}`;
  }
  return cleanName;
}

function renderFamilyTreeNodes(
  nodes: Beneficiary[],
  isChildLevel = false,
): React.ReactNode[] {
  return nodes.map((node) => (
    <li key={node.id} className="tree-node">
      {isChildLevel && (
        <div className="tree-up-line" aria-hidden="true" />
      )}

      <div className="node-card">
        <div className="node-avatar" aria-hidden="true">
          <span>{formatDisplayName(node.name, node.livingStatus).charAt(0).toUpperCase()}</span>
        </div>
      </div>
      <div className="node-label">
        <div className="node-name">{formatDisplayName(node.name, node.livingStatus)}</div>
        <div className="node-meta">{formatRelationLabel(node.relation)}</div>
      </div>

      {node.children && node.children.length > 0 && (
        <>
          <div className="tree-down-wrap" aria-hidden="true">
            <div className="tree-down-line" />
            <span className="tree-down-arrow">↓</span>
          </div>
          <ul className="tree-children">{renderFamilyTreeNodes(node.children, true)}</ul>
        </>
      )}
    </li>
  ));
}

export default function LinkagePrintDetailsClient({ cert }: { cert: any }) {
  const flatBeneficiaries = cert.application.linkageApplicationBeneficiaries;

  const beneficiaryTree = buildBeneficiaryTree(flatBeneficiaries);
  const formattedIssueDate = new Date(cert.issueDate).toLocaleDateString();
  const officeName = "Office Of The Gram Panchayat";

  return (
    <div className="space-y-6">
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
              <span className="font-semibold text-slate-700">Certificate No:</span>{" "}
              <span className="font-medium text-slate-900">{cert.certificateNo}</span>
            </div>
            <div className="border border-slate-300 px-3 py-2">
              <span className="font-semibold text-slate-700">Date Of Issue:</span>{" "}
              <span className="font-medium text-slate-900">{formattedIssueDate}</span>
            </div>
            <div className="border border-slate-300 px-3 py-2">
              <span className="font-semibold text-slate-700">Memo No:</span>{" "}
              <span className="font-medium text-slate-900">{cert.memoNo || "Not Available"}</span>
            </div>
            <div className="border border-slate-300 px-3 py-2">
              <span className="font-semibold text-slate-700">Reference No:</span>{" "}
              <span className="font-medium text-slate-900">
                {cert.referenceNo || cert.application?.applicationNo || "Not Available"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-slate-300 bg-slate-50 px-3 py-2">
            <Badge variant="outline" className="rounded-sm border-slate-400 text-slate-700">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="rounded-sm border border-slate-300 shadow-none">
          <CardHeader className="border-b border-slate-300 bg-slate-100 py-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-800">
              Applicant Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-sm">
            <div className="grid grid-cols-2">
              <div className="border-b border-r border-slate-200 px-3 py-2 text-xs uppercase tracking-wide text-slate-500">
                Application No.
              </div>
              <div className="border-b border-slate-200 px-3 py-2 font-medium text-slate-900">
                {cert.application?.applicationNo || "Not Available"}
              </div>
              <div className="border-b border-r border-slate-200 px-3 py-2 text-xs uppercase tracking-wide text-slate-500">
                Applicant Name
              </div>
              <div className="border-b border-slate-200 px-3 py-2 font-medium text-slate-900">
                {cert.application?.applicantName || "Not Available"}
              </div>
              <div className="border-r border-slate-200 px-3 py-2 text-xs uppercase tracking-wide text-slate-500">
                Contact Number
              </div>
              <div className="px-3 py-2 font-medium text-slate-900">
                {cert.application?.applicantPhone || "Not Available"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border border-slate-300 shadow-none">
          <CardHeader className="border-b border-slate-300 bg-slate-100 py-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-800">
              Certificate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 text-sm">
            <div className="grid grid-cols-2">
              <div className="border-b border-r border-slate-200 px-3 py-2 text-xs uppercase tracking-wide text-slate-500">
                Linked Entity
              </div>
              <div className="border-b border-slate-200 px-3 py-2 font-medium text-slate-900">
                {cert.application?.linkedEntityName || "Not Available"}
              </div>
              <div className="border-b border-r border-slate-200 px-3 py-2 text-xs uppercase tracking-wide text-slate-500">
                Certificate Type
              </div>
              <div className="border-b border-slate-200 px-3 py-2 font-medium text-slate-900">
                {cert.certificateType || "Linkage"}
              </div>
              <div className="border-r border-slate-200 px-3 py-2 text-xs uppercase tracking-wide text-slate-500">
                Memo No.
              </div>
              <div className="px-3 py-2 font-medium text-slate-900">
                {cert.memoNo || "Not Available"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {cert.certificateBody && (
        <Card className="rounded-sm border border-slate-300 shadow-none">
          <CardHeader className="border-b border-slate-300 bg-slate-100 py-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-800">
              Certificate Declaration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="rounded-sm border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-800 whitespace-pre-wrap">
              {cert.certificateBody}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-sm border border-slate-300 shadow-none">
        <CardHeader className="border-b border-slate-300 bg-slate-100 py-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-800">
            Beneficiary Register (Family Tree)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {beneficiaryTree.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500 italic">
              No beneficiaries recorded
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <div className="tree-wrap min-w-max">
                <ul className="tree-root">{renderFamilyTreeNodes(beneficiaryTree)}</ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <style jsx>{`
        .tree-wrap {
          padding: 14px 8px;
        }
        .tree-root,
        .tree-children {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          list-style: none;
          position: relative;
        }
        .tree-root {
          gap: 10px;
          align-items: flex-start;
        }
        .tree-children {
          margin-top: 6px;
          gap: 10px;
          padding-top: 14px;
          border-top: 1px solid #9ca3af;
        }
        .tree-node {
          text-align: center;
          position: relative;
          padding: 0 6px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tree-up-line {
          width: 0;
          height: 12px;
          border-left: 1px solid #9ca3af;
        }
        .tree-down-wrap {
          position: relative;
          width: 0;
          height: 20px;
          margin-top: 2px;
        }
        .tree-down-line {
          height: 16px;
          border-left: 1px solid #9ca3af;
        }
        .tree-down-arrow {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: #64748b;
          line-height: 1;
          background: #fff;
          padding: 0 2px;
        }
        .node-card {
          width: 72px;
          height: 72px;
          border: 2px solid #334155;
          border-radius: 9999px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .node-avatar {
          width: 48px;
          height: 48px;
          border-radius: 9999px;
          border: 1px solid #94a3b8;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          font-weight: 700;
          font-size: 18px;
        }
        .node-label {
          margin-top: 6px;
          text-align: center;
          max-width: 140px;
        }
        .node-name {
          font-size: 12px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
          word-break: break-word;
          text-align: center;
        }
        .node-meta {
          font-size: 10px;
          color: #475569;
          line-height: 1.2;
          margin-top: 4px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
