"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Users,
  Clipboard,
  User,
  Calendar,
  MapPin,
  File,
  ExternalLink,
  Hash,
} from "lucide-react";
import LegalHeirrApplicationDetails from "@/components/LegalHeirrApplicationDetails";
import { formatDate } from "@/utils/utils";
import { WarishApplicationProps } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EnquiryReportForm from "@/components/form/WarishForm/EnquiryReportForm";
import { processWarishDetails } from "@/utils/warishUtils";

interface StaffWarishApplicationDetailsClientProps {
  application: any;
  documents: any[];
  onClose?: () => void;
}

export default function StaffWarishApplicationDetailsClient({
  application,
  documents,
  onClose,
}: StaffWarishApplicationDetailsClientProps) {
  const rootWarishDetails = processWarishDetails(application);

  const getStatusVariant = () => {
    if (application.warishApplicationStatus === "approved") return "success";
    if (application.warishApplicationStatus === "rejected")
      return "destructive";
    if (application.warishApplicationStatus === "process") return "secondary";
    return "default";
  };

  return (
    <div className="space-y-8">
      {/* MAIN APPLICATION CARD */}
      <Card className="shadow-xl border rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-600 text-white">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <FileText className="h-7 w-7" />
              Warish Application Details
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={getStatusVariant() as any} className="capitalize">
                {application.warishApplicationStatus}
              </Badge>
              <div className="flex items-center gap-1 text-sm font-mono">
                <Hash className="h-4 w-4" />
                {application.acknowlegment}
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8 space-y-10">
          {/* Reporting Info */}
          <Section
            title="Reporting Information"
            icon={<Calendar className="h-5 w-5 text-orange-600" />}
          >
            <Info
              label="Reporting Date"
              value={formatDate(application.reportingDate)}
            />
          </Section>

          <Separator />

          {/* Applicant */}
          <Section
            title="Applicant Details"
            icon={<User className="h-5 w-5 text-green-600" />}
          >
            <Info label="Applicant Name" value={application.applicantName} />
            <Info label="Mobile No" value={application.applicantMobileNumber} />
            <Info
              label="Relation With Deceased"
              value={application.relationwithdeceased}
            />
          </Section>

          <Separator />

          {/* Deceased */}
          <Section
            title="Deceased Details"
            icon={<Users className="h-5 w-5 text-red-600" />}
          >
            <Info label="Name" value={application.nameOfDeceased} />
            <Info
              label="Date of Death"
              value={formatDate(application.dateOfDeath)}
            />
            <Info label="Gender" value={application.gender} />
            <Info label="Marital Status" value={application.maritialStatus} />
            <Info label="Father's Name" value={application.fatherName} />
            {application.spouseName && (
              <Info label="Spouse Name" value={application.spouseName} />
            )}
          </Section>

          <Separator />

          {/* Address */}
          <Section
            title="Address"
            icon={<MapPin className="h-5 w-5 text-purple-600" />}
          >
            <Info label="Village" value={application.villageName} />
            <Info label="Post Office" value={application.postOffice} />
            <Info label="Police Station" value="Hili" />
            <Info label="District" value="Dakshin Dinajpur" />
          </Section>

          <Separator />

          {/* Legal Heir Tree */}
          <LegalHeirrApplicationDetails
            application={application as WarishApplicationProps}
            rootWarishDetails={rootWarishDetails}
          />

          <Separator />

          {/* Documents */}
          <Section
            title="Uploaded Documents"
            icon={<FileText className="h-5 w-5 text-orange-600" />}
          >
            {documents.length === 0 ? (
              <p className="text-gray-500 text-sm italic">
                No documents uploaded.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4 w-full">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="border rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium">
                        {document.documentType}
                      </span>
                    </div>

                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={document.cloudinaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </CardContent>
      </Card>

      {/* ENQUIRY REPORT */}
      <Card className="shadow-xl border rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <Clipboard className="h-6 w-6" />
            Enquiry Report Form
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <EnquiryReportForm
            applicationId={application.id}
            initialReport={application.fieldreportRemark || ""}
            onClose={onClose}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 w-full">
      <h2 className="text-xl font-semibold flex items-center gap-2 text-orange-700">
        {icon}
        {title}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value || "-"}</p>
    </div>
  );
}
