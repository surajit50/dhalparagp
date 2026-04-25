"use client";

import React, { JSX } from "react";

export type Beneficiary = {
  id: string;
  name: string;
  relation: string;
  livingStatus?: string | null;
  gender?: string | null;
  parentId?: string | null;
  children?: Beneficiary[];
};

interface FamilyTreeVisualizationProps {
  beneficiaryTree: Beneficiary[];
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

export default function FamilyTreeVisualization({
  beneficiaryTree,
}: FamilyTreeVisualizationProps) {
  function renderFamilyTreeNodes(
    nodes: Beneficiary[],
    isChildLevel = false,
  ): JSX.Element[] {
    return nodes.map((node) => (
      <li key={node.id} className="tree-node">
        {isChildLevel && <div className="tree-up-line" aria-hidden="true" />}

        <div className="node-card">
          <div className="node-avatar" aria-hidden="true">
            <span>
              {formatDisplayName(node.name, node.livingStatus)
                .charAt(0)
                .toUpperCase()}
            </span>
          </div>
        </div>
        <div className="node-label">
          <div className="node-name">
            {formatDisplayName(node.name, node.livingStatus)}
          </div>
          <div className="node-meta">{formatRelationLabel(node.relation)}</div>
        </div>
        {node.children && node.children.length > 0 && (
          <>
            <div className="tree-down-wrap" aria-hidden="true">
              <div className="tree-down-line" />
              <span className="tree-down-arrow">↓</span>
            </div>
            <ul className="tree-children">
              {renderFamilyTreeNodes(node.children, true)}
            </ul>
          </>
        )}
      </li>
    ));
  }

  if (beneficiaryTree.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No beneficiaries recorded
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="tree-wrap min-w-max">
        <ul className="tree-root">{renderFamilyTreeNodes(beneficiaryTree)}</ul>
      </div>
      <style jsx>{`
        .tree-wrap {
          padding: 16px 8px;
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
          gap: 12px;
          align-items: flex-start;
        }
        .tree-children {
          margin-top: 6px;
          gap: 12px;
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
          text-align: center;
        }
        .node-meta {
          margin-top: 2px;
          font-size: 10px;
          color: #475569;
          line-height: 1.2;
          text-align: center;
        }
        @media print {
          .node-card {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
