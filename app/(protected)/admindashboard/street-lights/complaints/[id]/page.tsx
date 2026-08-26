import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StatusBadge } from "@/components/street-lights/StatusBadge";
import { LightIDBadge } from "@/components/street-lights/LightIDBadge";
import { ComplaintUpdateForm } from "@/components/street-lights/ComplaintUpdateForm";
import Image from "next/image";
import { formatDate } from "@/lib/utils/date";
import { toTitleCase } from "@/lib/utils";

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const complaint = await db.streetLightComplaint.findUnique({
    where: { id },
    include: {
      streetLight: { include: { mouza: { select: { mouzaName: true } } } },
    },
  });
  if (!complaint) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admindashboard/street-lights/complaints" className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Complaint {complaint.complaintNo}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge type="complaint" value={complaint.status} />
            <StatusBadge type="priority" value={complaint.priority} />
          </div>
        </div>
      </div>

      {/* Light info */}
      <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Street Light</p>
        <LightIDBadge lightId={complaint.streetLight.lightId} />
        <p className="text-sm text-muted-foreground">
          {complaint.streetLight.mouza?.mouzaName} • {complaint.streetLight.landmark ?? "—"}
        </p>
        <Link
          href={`/admindashboard/street-lights/register/${complaint.streetLightId}`}
          className="text-xs text-orange-600 underline underline-offset-2"
        >
          View Light Details →
        </Link>
      </div>

      {/* Complaint details */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
        <h2 className="text-base font-semibold">Complaint Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <DetailRow label="Complaint No." value={complaint.complaintNo} />
          <DetailRow label="Date" value={formatDate(complaint.complaintDate)} />
          <DetailRow label="Type" value={complaint.complaintType ? toTitleCase(complaint.complaintType) : "—"} />
          <DetailRow label="Reported By" value={complaint.reportedBy ?? "—"} />
          <DetailRow label="Mobile" value={complaint.reporterMobile ?? "—"} />
          <DetailRow label="Assigned To" value={complaint.assignedTo ?? "Not assigned"} />
          <DetailRow label="Repair Date" value={complaint.repairDate ? formatDate(complaint.repairDate) : "—"} />
          <DetailRow label="Resolved Date" value={complaint.resolvedDate ? formatDate(complaint.resolvedDate) : "—"} />
        </div>
        {complaint.description && (
          <div className="rounded-lg bg-muted/40 p-3 text-sm">
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p>{complaint.description}</p>
          </div>
        )}
        {complaint.repairRemarks && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
            <p className="text-xs text-emerald-600 mb-1">Repair Remarks</p>
            <p>{complaint.repairRemarks}</p>
          </div>
        )}

        {/* Photos */}
        <div className="grid grid-cols-2 gap-3">
          {complaint.complaintImageUrl && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Complaint Photo</p>
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                <Image src={complaint.complaintImageUrl} alt="Complaint" fill className="object-cover" />
              </div>
            </div>
          )}
          {complaint.completionImageUrl && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">After-Repair Photo</p>
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                <Image src={complaint.completionImageUrl} alt="Completion" fill className="object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update form */}
      {complaint.status !== "CLOSED" && (
        <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
          <h2 className="text-base font-semibold">Update Complaint</h2>
          <ComplaintUpdateForm complaintId={complaint.id} currentStatus={complaint.status} />
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
