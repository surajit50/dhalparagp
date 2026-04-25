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
              Warish Application
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
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
          <TabsTrigger value="details">Application Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
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
          {application.WarishDocument &&
          application.WarishDocument.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Attached Documents</CardTitle>
                </div>
                <CardDescription>
                  Supporting documents provided with the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {application.WarishDocument.map((doc) => (
                    <TooltipProvider key={doc.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={doc.cloudinaryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                          >
                            <div className="flex-shrink-0 h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                {doc.documentType}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                View Document
                              </p>
                            </div>
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to view {doc.documentType}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-2 pb-4">
                <VerifyAllButton warishId={application.id} />
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">
                  No documents attached to this application
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="warish">
          {application.warishDetails && application.warishDetails.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Warish Members</CardTitle>
                </div>
                <CardDescription>
                  List of warish members associated with this application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] rounded-md">
                  <div className="w-full">
                    <ShowWarishDetails warishapplicationid={application.id} />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">
                  No warish members found for this application
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      <div className="flex justify-between gap-3 pt-4">
        <Button variant="outline" className="gap-2" asChild>
          <Link href="/admindashboard/manage-warish/view-application">
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Link>
        </Button>
      </div>
    </div>
  );
};

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
  <div className="space-y-1.5">
    <dt className="text-sm text-muted-foreground flex items-center gap-1.5">
      {icon}
      {label}
    </dt>
    <dd className={`font-medium ${capitalize ? "capitalize" : ""}`}>{value}</dd>
  </div>
);

export default Page;
