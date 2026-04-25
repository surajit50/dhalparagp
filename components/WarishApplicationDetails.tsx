import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Users,
  Clipboard,
  User,
  Calendar,
  MapPin,
  AlertCircle,
  Info,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import LegalHeirrApplicationDetails from "@/components/LegalHeirrApplicationDetails";
import { formatDate } from "@/utils/utils";
import { WarishDetailProps, WarishApplicationProps } from "@/types";
import ApprovalForm from "./ApprovalForm";
import { getUserById } from "@/data/user";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

import WarishDocumentUpload from "./warish-document-upload";
import { CopyApplicationId } from "./copy-application-id";
interface WarishApplicationDetailsProps {
  application: WarishApplicationProps;
  rootWarishDetails: WarishDetailProps[];
}

export default function WarishApplicationDetailsEdit({
  application,
  rootWarishDetails,
}: WarishApplicationDetailsProps) {
  return (
    <div className="w-full p-6 space-y-6">
      <Card className="shadow-xl border-t-4 border-t-blue-500">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-900">
                Warish Application Details
              </CardTitle>
            </div>

            <CopyApplicationId applicationId={application.acknowlegment}/>
          
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-8">
            <ApplicationOverview application={application} />
            <Separator className="my-8" />
            <FieldReport application={application} />

            <Separator className="my-8" />
            <WarishDocumentUpload applicantid={application.id} />
            <LegalHeirrApplicationDetails
              application={application}
              rootWarishDetails={rootWarishDetails}
            />
          </div>
        </CardContent>
      </Card>
      <div>
        <ApprovalForm id={application.id} />
      </div>
    </div>
  );
}

function ApplicationOverview({
  application,
}: {
  application: WarishApplicationProps;
}) {
  return (
    <div className="space-y-8">
      {/* Reporting Information */}
      <SectionWrapper
        icon={<Calendar className="h-5 w-5 text-blue-600" />}
        title="Reporting Information / প্রতিবেদন তথ্য"
        titleNumber="1"
      >
        <InfoGrid>
          <InfoItem
            label="Reporting Date / প্রতিবেদন তারিখ"
            value={formatDate(application.reportingDate)}
          />
        </InfoGrid>
      </SectionWrapper>

      <Separator />

      {/* Applicant Details */}
      <SectionWrapper
        icon={<User className="h-5 w-5 text-green-600" />}
        title="Applicant Details / আবেদনকারীর বিবরণ"
        titleNumber="2"
      >
        <InfoGrid>
          <InfoItem
            label="Applicant Name / আবেদনকারীর নাম"
            value={application.applicantName}
          />
          <InfoItem
            label="Mobile No / মোবাইল নম্বর"
            value={application.applicantMobileNumber}
          />
          <InfoItem
            label="Relation with Deceased / সম্পর্ক"
            value={application.relationwithdeceased}
          />
        </InfoGrid>
      </SectionWrapper>

      <Separator />

      {/* Deceased Details */}
      <SectionWrapper
        icon={<Users className="h-5 w-5 text-red-600" />}
        title="Deceased Details / মৃত ব্যক্তির বিবরণ"
        titleNumber="3"
      >
        <div className="space-y-6">
          <InfoGrid>
            <InfoItem
              label="Name of Deceased / নাম"
              value={application.nameOfDeceased}
            />
            <InfoItem
              label="Date of Death / মৃত্যুর তারিখ"
              value={formatDate(application.dateOfDeath)}
            />
            <InfoItem
              label="Gender / লিঙ্গ"
              value={<Badge variant="outline">{application.gender}</Badge>}
            />
            <InfoItem
              label="Marital Status / বৈবাহিক অবস্থা"
              value={
                <Badge variant="outline">{application.maritialStatus}</Badge>
              }
            />
          </InfoGrid>

          <InfoGrid>
            <InfoItem
              label="Father's Name / পিতার নাম"
              value={
                application.fatherName === "NA"
                  ? "Not Applicable"
                  : application.fatherName
              }
            />
            {application.spouseName && (
              <InfoItem
                label="Spouse's Name / স্বামী/স্ত্রীর নাম"
                value={application.spouseName}
              />
            )}
          </InfoGrid>

          <SectionWrapper
            icon={<MapPin className="h-5 w-5 text-purple-600" />}
            title="Address / ঠিকানা"
            className="bg-gray-50 p-4 rounded-lg"
          >
            <InfoGrid>
              <InfoItem
                label="Village / গ্রাম"
                value={application.villageName}
              />
              <InfoItem
                label="Post Office / ডাকঘর"
                value={application.postOffice}
              />
              <InfoItem label="Police Station / থানা" value="Hili" />
              <InfoItem label="District / জেলা" value="Dakshin Dinajpur" />
            </InfoGrid>
          </SectionWrapper>
        </div>
      </SectionWrapper>
    </div>
  );
}

async function FieldReport({
  application,
}: {
  application: WarishApplicationProps;
}) {
  if (application.assingstaffId === null) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50/50 border-2 border-yellow-200 p-6 rounded-xl flex items-center gap-4 text-yellow-800 shadow-md">
        <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl shadow-sm">
          <AlertCircle className="h-6 w-6 text-yellow-700" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-semibold text-lg">
            No Field Report Available
          </span>
          <span className="text-sm text-yellow-700 bg-yellow-100/50 px-3 py-1 rounded-full w-fit">
            Field inspection pending
          </span>
        </div>
      </div>
    );
  }

  const user = await getUserById(application.assingstaffId);

  return (
    <SectionWrapper
      icon={<Clipboard className="h-5 w-5 text-orange-600" />}
      title="Field Report / ফিল্ড রিপোর্ট"
      className="border-2 border-orange-200 shadow-md"
    >
      <div className="space-y-6">
        {/* Officer Info Section */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50/50 border-2 border-orange-100 p-5 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl shadow-sm">
              <User className="h-5 w-5 text-orange-700" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-orange-900/70 bg-orange-100/50 px-3 py-0.5 rounded-full w-fit">
                Investigating Officer
              </span>
              <span className="text-lg font-semibold text-orange-800">
                {user?.name ?? "Unknown Officer"}
              </span>
            </div>
          </div>
        </div>

        {/* Report Findings Section */}
        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50/30 border-2 border-orange-100 p-5 rounded-xl">
          <div className="flex gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl shadow-sm">
              <FileText className="h-5 w-5 text-orange-700" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-orange-900/70 bg-orange-100/50 px-3 py-0.5 rounded-full w-fit">
                Report Findings
              </span>
              <div className="bg-white/50 p-4 rounded-lg border border-orange-100 shadow-sm">
                <p className="text-orange-900 leading-relaxed">
                  {application.fieldreportRemark ?? "No remarks provided"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

// Reusable Components
function SectionWrapper({
  icon,
  title,
  titleNumber,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  titleNumber?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-white rounded-lg border shadow-sm", className)}>
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          {titleNumber && (
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-medium">
              {titleNumber}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded-md shadow-sm">{icon}</div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{children}</div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-base text-gray-900 font-medium">{value}</span>
    </div>
  );
}
