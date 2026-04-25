import type React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { WarishApplicationStatus } from "@prisma/client";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  ChevronRight,
  FileText,
  User,
  Calendar,
  Phone,
  MapPin,
  Users,
  Home,
  Printer,
  ArrowLeft,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShowWarishDetails } from "@/components/ShowWarishDetails";
import { VerifyAllButton } from "@/components/verify-all-button";
import Image from "next/image";
import { DocumentVerificationCard } from "@/components/DocumentVerificationCard";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const application = await db.warishApplication.findUnique({
    where: { id },
    include: {
      warishDetails: true,
      WarishDocument: true,
    },
  });

  if (!application) {
    notFound();
  }

  // Helper function to get status badge variant
  const getStatusVariant = (status: WarishApplicationStatus) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admindashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admindashboard/manage-warish/application">
              Warish Applications
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Verify Documents</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(application.applicantName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Verify Warish Application Documents
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground text-sm">
                #{application.acknowlegment}
              </span>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(application.dateOfDeath), "dd MMM yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Badge
          variant={getStatusVariant(
            application.warishApplicationStatus || "pending"
          )}
          className="text-sm px-3 py-1"
        >
          {application.warishApplicationStatus || "pending"}
        </Badge>
      </div>

      <Separator />

      {/* Main content */}
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="details">Application Details</TabsTrigger>
          <TabsTrigger value="warish">Warish Members</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Applicant Details Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">
                    Applicant Information
                  </CardTitle>
                </div>
                <CardDescription>
                  Personal details of the applicant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={<User className="h-4 w-4 text-muted-foreground" />}
                    label="Applicant Name"
                    value={application.applicantName}
                  />
                  <InfoItem
                    icon={<Phone className="h-4 w-4 text-muted-foreground" />}
                    label="Mobile Number"
                    value={application.applicantMobileNumber}
                  />
                  <InfoItem
                    icon={<User className="h-4 w-4 text-muted-foreground" />}
                    label="Father's Name"
                    value={application.fatherName}
                  />
                  <InfoItem
                    icon={<User className="h-4 w-4 text-muted-foreground" />}
                    label="Spouse Name"
                    value={application.spouseName || "N/A"}
                  />
                  <InfoItem
                    label="Gender"
                    value={application.gender.toLowerCase()}
                    capitalize
                  />
                  <InfoItem
                    label="Marital Status"
                    value={application.maritialStatus.toLowerCase()}
                    capitalize
                  />
                </div>
              </CardContent>
            </Card>

            {/* Deceased Details Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">
                    Deceased Person Details
                  </CardTitle>
                </div>
                <CardDescription>
                  Information about the deceased person
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={<User className="h-4 w-4 text-muted-foreground" />}
                    label="Name of Deceased"
                    value={application.nameOfDeceased}
                  />
                  <InfoItem
                    label="Relation with Deceased"
                    value={application.relationwithdeceased}
                  />
                  <InfoItem
                    icon={
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    }
                    label="Date of Death"
                    value={format(
                      new Date(application.dateOfDeath),
                      "dd MMM yyyy"
                    )}
                  />
                  <InfoItem
                    icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                    label="Village"
                    value={application.villageName}
                  />
                  <InfoItem
                    icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                    label="Post Office"
                    value={application.postOffice}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Attached Documents</CardTitle>
                </div>
                <CardDescription>
                  Verify or reject the supporting documents.
                </CardDescription>
              </div>
              <VerifyAllButton warishId={application.id} />
            </CardHeader>
            <CardContent>
              {application.WarishDocument &&
              application.WarishDocument.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {application.WarishDocument.map((doc) => (
                    <DocumentVerificationCard
                      key={doc.id}
                      document={doc}
                      warishId={application.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    No documents attached.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="warish">
          <Card>
            <CardHeader>
              <CardTitle>Warish Members</CardTitle>
              <CardDescription>
                Details of the warish members related to the deceased.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShowWarishDetails warishapplicationid={application.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="flex justify-start gap-4 mt-8">
        <Button variant="outline" asChild>
          <Link href="/admindashboard/manage-warish/application">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Page;

const InfoItem = ({
  label,
  value,
  capitalize = false,
  icon,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-start">
    {icon && <div className="mr-3 pt-1">{icon}</div>}
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`font-semibold ${capitalize ? "capitalize" : ""}`}>
        {value}
      </p>
    </div>
  </div>
);
