import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Users,
  Clipboard,
  User,
  Calendar,
  Phone,
  Gavel,
  MapPin,
  AlertCircle,
} from "lucide-react";
import LegalHeirrApplicationDetails from "@/components/LegalHeirrApplicationDetails";
import { formatDate } from "@/utils/utils";
import { WarishDetailProps, WarishApplicationProps } from "@/types";
import ApprovalForm from "./ApprovalForm";
import { getUserById } from "@/data/user";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface WarishApplicationDetailsEditProps {
  application: WarishApplicationProps;
  rootWarishDetails: WarishDetailProps[];
}

export default function WarishApplicationDetailsEdit({
  application,
  rootWarishDetails,
}: WarishApplicationDetailsEditProps) {
  return (
    <div className="w-full p-4 space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-blue-50/50 border-b">
          <CardTitle className="text-2xl font-bold flex items-center gap-3 text-blue-800">
            <FileText className="h-6 w-6" />
            Warish Application Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <ApplicationOverview application={application} />

          <Separator className="my-6" />

          <Separator className="my-6" />

          <LegalHeirrApplicationDetails
            application={application}
            rootWarishDetails={rootWarishDetails}
          />
        </CardContent>
      </Card>

      <Button>Update</Button>
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
    <div className={className}>
      <div className="flex items-center gap-3 mb-4">
        {titleNumber && (
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
            {titleNumber}
          </div>
        )}
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
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
    <div className="flex items-start gap-3">
      <span className="font-medium text-gray-600 min-w-[160px]">{label}:</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}
