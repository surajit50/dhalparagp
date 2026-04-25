"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getWarishApplicationDetails } from "@/action/warish-verification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, FileDigit, CalendarDays, Shield, Loader2 } from "lucide-react";

import { WarishApplicationProps, WarishDetailProps } from "@/types";
import { formatDate } from "@/utils/utils";
import LegalHeirrApplicationDetails from "@/components/LegalHeirrApplicationDetails";

export function WarishApplicationDetails() {
  const [isOpen, setIsOpen] = useState(false);
  const [application, setApplication] = useState<
    (WarishApplicationProps & { warishDetails: WarishDetailProps[] }) | null
  >(null);
  const [isGenuine, setIsGenuine] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      fetchApplicationDetails(id);
    } else {
      setError("Application ID not found in the URL.");
    }
  }, [searchParams]);

  const fetchApplicationDetails = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getWarishApplicationDetails(id);
      if (result.success && result.application) {
        const applicationWithChildren = {
          ...result.application,
          warishDetails: result.application.warishDetails.map(
            (detail: any) => ({
              ...detail,
              children: [],
            })
          ),
        };
        setApplication(applicationWithChildren);
        
        // Fixed the condition for checking genuine certificate
        // Based on your WarishApplicationStatus enum
        const status = result.application.warishApplicationStatus;
        
        // Check if status is either "approved" or "renewed"
        setIsGenuine(status === "approved" || status === "renewed");
        
        setIsOpen(true);
      } else {
        setError("Failed to fetch application details. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      setError("An unexpected error occurred while fetching the application.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog>
        <DialogContent>
          <Alert variant="destructive">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-1" />
              <div>
                <AlertTitle>Error Loading Certificate</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
            </div>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  if (!application) return null;

  const warishDetailsMap = new Map<string, WarishDetailProps>();
  application.warishDetails.forEach((detail) => {
    warishDetailsMap.set(detail.id, { ...detail, children: [] });
  });

  const rootWarishDetails: WarishDetailProps[] = [];
  warishDetailsMap.forEach((detail) => {
    if (detail.parentId) {
      const parent = warishDetailsMap.get(detail.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(detail);
      }
    } else {
      rootWarishDetails.push(detail);
    }
  });

  // Status configuration based on your enum
  const statusConfig = {
    submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800" },
    pending: { label: "Pending", color: "bg-amber-100 text-amber-800" },
    process: { label: "In Process", color: "bg-purple-100 text-purple-800" },
    approved: { label: "Approved", color: "bg-green-100 text-green-800" },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-800" },
    cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
    renewed: { label: "Renewed", color: "bg-teal-100 text-teal-800" }
  };

  const status = application.warishApplicationStatus;
  const statusInfo = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-800" };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Warish Certificate Details
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-100px)] pr-4">
          {!isGenuine && (
            <Alert variant="destructive" className="mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-1" />
                <div>
                  <AlertTitle>Certificate Verification Warning</AlertTitle>
                  <AlertDescription>
                    This certificate has not been approved by the authorities.
                    The information presented may be incomplete or inaccurate.
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <Card className="w-full max-w-4xl mx-auto border-2 border-indigo-100 shadow-lg">
            <CardHeader className="bg-indigo-800 text-white border-b-4 border-indigo-600">
              <div className="flex flex-col items-center space-y-2">
                <CardTitle className="text-2xl font-bold text-center mb-2">
                  No 3 Dhalpara Gram Panchayat
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  <p className="text-sm">Hili Development Block</p>
                  <p className="text-sm">Dakshin Dinajpur, West Bengal</p>
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 py-6">
              <div className="grid grid-cols-2 gap-6 mb-8 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileDigit className="h-6 w-6 text-indigo-700" />
                    <div>
                      <p className="text-sm font-semibold text-gray-600">
                        Certificate Number
                      </p>
                      <p className="font-mono text-lg text-indigo-900">
                        {application.warishRefNo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">
                        Application Status
                      </p>
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">
                        Date of Issue
                      </p>
                      <p className="text-gray-900 font-medium">
                        {application.warishRefDate
                          ? formatDate(application.warishRefDate)
                          : "NA"}
                      </p>
                    </div>
                    <CalendarDays className="h-6 w-6 text-indigo-700" />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Badge 
                      variant={isGenuine ? "default" : "destructive"} 
                      className={isGenuine ? "bg-green-600" : ""}
                    >
                      {isGenuine ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-indigo-900 font-serif">
                  LEGAL HEIR CERTIFICATE
                </h3>
                <div className="border-t-2 border-indigo-200 w-1/3 mx-auto"></div>
              </div>

              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed font-serif">
                  Certified that late{" "}
                  <span className="font-semibold">
                    {application.nameOfDeceased}
                  </span>
                  ,{" "}
                  {application.gender === "male"
                    ? "son of"
                    : application.gender === "female" &&
                      application.maritialStatus === "unmarried"
                    ? "daughter of"
                    : "wife of"}{" "}
                  <span className="font-semibold">
                    {application.gender === "female" &&
                    application.maritialStatus === "married"
                      ? application.spouseName
                      : application.fatherName}
                  </span>{" "}
                  residing at{" "}
                  <span className="font-semibold">
                    {application.villageName}
                  </span>{" "}
                  Village,{" "}
                  <span className="font-semibold">
                    {application.postOffice}
                  </span>{" "}
                  Post Office, Hili Police Station of Dakshin Dinajpur District,
                  West Bengal State, expired on{" "}
                  <span className="font-semibold">
                    {application.dateOfDeath
                      ? formatDate(application.dateOfDeath)
                      : ""}
                  </span>
                  , leaving behind the following persons as his/her legal heirs:
                </p>

                <LegalHeirrApplicationDetails
                  application={application}
                  rootWarishDetails={rootWarishDetails}
                />
              </div>

              <div className="mt-8 pt-4 border-t-2 border-indigo-100">
                <p className="text-sm text-gray-500 text-center">
                  This certificate is issued based on information provided by
                  the applicant and verification by local authorities
                </p>
              </div>
            </CardContent>
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
