import { fetchNregaWorkById } from "@/action/nrega/work-actions";
import { getCertificateSummary } from "@/action/nrega/certificate-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, FileText, MapPin, DollarSign, User } from "lucide-react";

interface PageProps {
  params: Promise<{ workId: string }>;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  APPROVED: "bg-blue-100 text-blue-800",
  ONGOING: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-green-100 text-green-800",
};

export default async function WorkDetailPage({ params }: PageProps) {
  const { workId } = await params;
  const work = await fetchNregaWorkById(workId);

  if (!work) return notFound();

  const certificateSummary = await getCertificateSummary(workId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/employeedashboard/nrega/works">Works</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{work.workId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{work.workName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground font-mono">{work.workId}</span>
            <Badge variant="secondary" className={`text-xs ${statusColors[work.workStatus]}`}>
              {work.workStatus}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/employeedashboard/nrega/works/${workId}/edit`}>
            <Button variant="outline" className="gap-2" size="sm">
              <Edit className="h-4 w-4" />
              Edit Work
            </Button>
          </Link>
          <Link href={`/employeedashboard/nrega/works/${workId}/certificates`}>
            <Button className="gap-2" size="sm">
              <FileText className="h-4 w-4" />
              Certificates
            </Button>
          </Link>
        </div>
      </div>

      {/* Work Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Financial Year" value={work.financialYear} />
            <InfoRow label="Scheme" value={work.scheme} />
            <InfoRow label="Nature of Work" value={work.natureOfWork} />
            <InfoRow label="Master Category" value={work.masterCategory} />
            <InfoRow label="Sub Category" value={work.subCategory} />
            <InfoRow label="Permissible Work Sl. No." value={work.permissibleWorkSlNo} />
            <InfoRow label="Permissible Work Description" value={work.permissibleWorkDesc} />
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Gram Panchayat" value={work.gramPanchayat} />
            <InfoRow label="Gram Sansad" value={work.gramSansadName ? `${work.gramSansadName} (No. ${work.gramSansadNumber || ""})` : null} />
            <InfoRow label="Block" value={work.block} />
            <InfoRow label="District" value={work.district} />
            <InfoRow label="Mouza" value={work.mouza} />
            <InfoRow label="JL / Plot" value={work.jlNumber ? `${work.jlNumber} / ${work.plotNumber || ""}` : null} />
            <InfoRow label="Coordinates" value={work.latitude ? `${work.latitude}, ${work.longitude}` : null} />
            <InfoRow label="Worksite Type" value={work.worksiteType} />
            <InfoRow label="Land Area" value={work.landArea} />
          </CardContent>
        </Card>

        {/* Financial */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Estimated Cost" value={`₹ ${work.estimatedCost.toLocaleString("en-IN")}`} />
            <InfoRow label="Wage Component" value={`₹ ${work.wageComponent.toLocaleString("en-IN")}`} />
            <InfoRow label="Material Component" value={`₹ ${work.materialComponent.toLocaleString("en-IN")}`} />
            <InfoRow label="Wage-Material Ratio" value={work.wageMaterialRatio} />
            <InfoRow label="VB-GRAMG Share" value={work.vbGramgShare ? `₹ ${work.vbGramgShare.toLocaleString("en-IN")}` : null} />
            <InfoRow label="Convergence Dept. Share" value={work.convergenceDeptShare ? `₹ ${work.convergenceDeptShare.toLocaleString("en-IN")}` : null} />
            <InfoRow label="Total Estimated Cost" value={`₹ ${work.totalEstimatedCost.toLocaleString("en-IN")}`} highlight />
          </CardContent>
        </Card>

        {/* Beneficiary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Beneficiary & Administrative
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Beneficiary Type" value={work.beneficiaryType} />
            <InfoRow label="Beneficiary Name" value={work.beneficiaryName} />
            <InfoRow label="Job Card Number" value={work.jobCardNumber} />
            <InfoRow label="Beneficiary Category" value={work.beneficiaryCategory} />
            <div className="border-t pt-2 mt-2" />
            <InfoRow label="Gram Sabha Approval" value={work.gramSabhaApprovalDate ? new Date(work.gramSabhaApprovalDate).toLocaleDateString("en-IN") : null} />
            <InfoRow label="Admin Approval" value={work.adminApprovalNumber} />
            <InfoRow label="Technical Sanction" value={work.technicalSanctionNumber} />
            <InfoRow label="DPR Number" value={work.dprNumber} />
          </CardContent>
        </Card>
      </div>

      {/* Certificate Summary */}
      {certificateSummary.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Certificate Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {certificateSummary.map((cert) => (
                <div
                  key={cert.certificateNumber}
                  className={`p-3 rounded-lg border text-center ${
                    cert.status === "COMPLETED" || cert.status === "PRINTED"
                      ? "bg-green-50 border-green-200"
                      : cert.status === "NOT_APPLICABLE"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <p className="text-xs font-bold text-muted-foreground">
                    Cert-{cert.certificateNumber}
                  </p>
                  <p className="text-[10px] mt-0.5 truncate">{cert.certificateName}</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] mt-1 ${
                      cert.status === "COMPLETED" ? "text-green-700" :
                      cert.status === "PRINTED" ? "text-blue-700" :
                      cert.status === "NOT_APPLICABLE" ? "text-orange-600" :
                      "text-gray-500"
                    }`}
                  >
                    {cert.status === "NOT_APPLICABLE" ? "N/A" : cert.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right max-w-[60%] ${highlight ? "font-bold text-primary" : "font-medium"}`}>
        {value || "N/A"}
      </span>
    </div>
  );
}
