"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CorrectionRequestForm from "@/components/warishcorrection/correction-request-form";
import { useCurrentUser } from "@/hooks/use-current-user";

interface CorrectionRequest {
  id: string;
  fieldToModify?: string | null;
  currentValue?: string | null;
  proposedValue?: string | null;
  modifications?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }> | null;
  reasonForModification: string;
  requestedBy: string;
  requestedDate: Date;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string | null;
  reviewedDate?: Date | null;
  reviewComments?: string | null;
  targetType: "application" | "detail";
  warishApplicationId?: string | null;
  warishDetailId?: string | null;
  warishApplication?: {
    id: string;
    acknowlegment: string;
    applicantName: string;
  } | null;
}

interface ApplicationData {
  id: string;
  acknowlegment: string;
  applicantName: string;
  applicantMobileNumber: string;
  relationwithdeceased: string;
  nameOfDeceased: string;
  fatherName: string;
  spouseName?: string | null;
  villageName: string;
  postOffice: string;
  gender: string;
  maritialStatus: string;
  dateOfDeath: Date;
  reportingDate: Date;
  warishApplicationStatus: string;
  warishDetails: Array<{
    id: string;
    name: string;
    gender: string;
    relation: string;
    livingStatus: string;
    maritialStatus: string;
    hasbandName?: string | null;
  }>;
}

interface ClientPageProps {
  application: ApplicationData;
  initialRequests: CorrectionRequest[];
  flatWarishDetails: any[]; // <-- add this
}

export default function ApplicationCorrectionRequestsClientPage({
  application,
  initialRequests,
  flatWarishDetails, // <-- add this
}: ClientPageProps) {
  const [requests, setRequests] = useState(initialRequests);
  const currentUser = useCurrentUser();
  const requesterName = currentUser?.name || application.applicantName;

  const refreshRequests = async () => {
    try {
      const response = await fetch(
        `/api/warish-correction-requests?warishApplicationId=${application.id}`,
      );
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error("Failed to refresh requests:", error);
      // Fallback to page reload
      window.location.reload();
    }
  };

  const handleRequestReviewed = () => {
    refreshRequests();
  };

  const handleRequestSubmitted = () => {
    refreshRequests();
  };

  // Define available fields for correction
  const applicationFields = useMemo(
    () => [
      {
        value: "applicantName",
        label: "Applicant Name",
        currentValue: application.applicantName,
      },
      {
        value: "applicantMobileNumber",
        label: "Mobile Number",
        currentValue: application.applicantMobileNumber,
      },
      {
        value: "relationwithdeceased",
        label: "Relation with Deceased",
        currentValue: application.relationwithdeceased,
      },
      {
        value: "nameOfDeceased",
        label: "Name of Deceased",
        currentValue: application.nameOfDeceased,
      },
      {
        value: "fatherName",
        label: "Father Name",
        currentValue: application.fatherName,
      },
      {
        value: "spouseName",
        label: "Spouse Name",
        currentValue: application.spouseName || "",
      },
      {
        value: "villageName",
        label: "Village Name",
        currentValue: application.villageName,
      },
      {
        value: "postOffice",
        label: "Post Office",
        currentValue: application.postOffice,
      },
    ],
    [application],
  );

  // Memoize warishDetails array
  const memoizedWarishDetails = useMemo(
    () => application.warishDetails,
    [application.warishDetails],
  );

  // Memoize availableFields for each family member
  const getFamilyFields = useCallback(
    (detail: {
      name: any;
      gender: any;
      relation: any;
      livingStatus: any;
      maritialStatus: any;
      hasbandName?: any;
    }) => [
      { value: "name", label: "Name", currentValue: detail.name },
      { value: "gender", label: "Gender", currentValue: detail.gender },
      { value: "relation", label: "Relation", currentValue: detail.relation },
      {
        value: "livingStatus",
        label: "Living Status",
        currentValue: detail.livingStatus,
      },
      {
        value: "maritialStatus",
        label: "Marital Status",
        currentValue: detail.maritialStatus,
      },
      {
        value: "hasbandName",
        label: "Husband Name",
        currentValue: detail.hasbandName || "",
      },
    ],
    [],
  );

  // Helper to get family member name by ID
  const getFamilyMemberName = (id: string) => {
    const member = application.warishDetails.find((d) => d.id === id);
    return member ? `${member.name} (${member.relation})` : "Unknown Member";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/admin/warish-applications">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </Link>
      </div>

      {/* Application Details */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Application Details</CardTitle>
              <div className="mt-2 space-y-1">
                <p className="text-lg font-medium">
                  {application.applicantName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Acknowledgment: {application.acknowlegment}
                </p>
                <p className="text-sm text-muted-foreground">
                  Deceased: {application.nameOfDeceased}
                </p>
                <p className="text-sm text-muted-foreground">
                  Village: {application.villageName}, PO:{" "}
                  {application.postOffice}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge
                variant="outline"
                className={
                  application.warishApplicationStatus === "approved"
                    ? "text-green-600 border-green-600"
                    : application.warishApplicationStatus === "rejected"
                      ? "text-red-600 border-red-600"
                      : "text-yellow-600 border-yellow-600"
                }
              >
                {application.warishApplicationStatus.charAt(0).toUpperCase() +
                  application.warishApplicationStatus.slice(1)}
              </Badge>
              <CorrectionRequestForm
                warishApplicationId={application.id}
                targetType="application"
                availableFields={applicationFields}
                onRequestSubmitted={handleRequestSubmitted}
                requesterName={requesterName}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Mobile:</span>{" "}
              {application.applicantMobileNumber}
            </div>
            <div>
              <span className="font-medium">Relation:</span>{" "}
              {application.relationwithdeceased}
            </div>
            <div>
              <span className="font-medium">Father:</span>{" "}
              {application.fatherName}
            </div>
            {application.spouseName && (
              <div>
                <span className="font-medium">Spouse:</span>{" "}
                {application.spouseName}
              </div>
            )}
            <div>
              <span className="font-medium">Gender:</span> {application.gender}
            </div>
            <div>
              <span className="font-medium">Marital Status:</span>{" "}
              {application.maritialStatus}
            </div>
            <div>
              <span className="font-medium">Date of Death:</span>{" "}
              {new Date(application.dateOfDeath).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Reporting Date:</span>{" "}
              {new Date(application.reportingDate).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Details Summary */}
      {application.warishDetails.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Family Members ({application.warishDetails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {memoizedWarishDetails.slice(0, 5).map((detail, index) => (
                <div
                  key={detail.id}
                  className="flex justify-between items-center p-2 bg-muted/50 rounded"
                >
                  <div>
                    <span className="font-medium">{detail.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({detail.relation}, {detail.gender}, {detail.livingStatus}
                      )
                    </span>
                  </div>
                  <CorrectionRequestForm
                    warishDetailId={detail.id}
                    targetType="detail"
                    availableFields={getFamilyFields(detail)}
                    warishDetails={flatWarishDetails}
                    onRequestSubmitted={handleRequestSubmitted}
                    requesterName={requesterName}
                  />
                </div>
              ))}
              {application.warishDetails.length > 5 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  ... and {application.warishDetails.length - 5} more members
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Correction Requests Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Correction Requests ({requests.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No correction requests found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {request.targetType === "application" ? (
                          <>
                            <span>Application</span>
                            <Badge variant="secondary">Application Level</Badge>
                          </>
                        ) : (
                          <>
                            <span>Family Member</span>
                            <Badge variant="secondary">
                              {request.warishDetailId
                                ? getFamilyMemberName(request.warishDetailId)
                                : "Unknown Member"}
                            </Badge>
                          </>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.modifications &&
                        request.modifications.length > 0 ? (
                          <span className="flex flex-wrap gap-1 mt-1">
                            {request.modifications.map((mod, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-[10px] bg-muted/50"
                              >
                                {mod.field}
                              </Badge>
                            ))}
                          </span>
                        ) : (
                          <>
                            Field:{" "}
                            <span className="font-medium">
                              {request.fieldToModify}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge
                        variant="outline"
                        className={
                          request.status === "approved"
                            ? "text-green-600 border-green-600"
                            : request.status === "rejected"
                              ? "text-red-600 border-red-600"
                              : "text-yellow-600 border-yellow-600"
                        }
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(request.requestedDate).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {request.modifications && request.modifications.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {request.modifications.map((mod, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs p-2 bg-muted/30 rounded border border-dashed"
                        >
                          <div>
                            <span className="text-muted-foreground block font-semibold uppercase text-[10px]">
                              {mod.field} (Current)
                            </span>
                            <span className="line-through decoration-muted-foreground/50">
                              {String(mod.oldValue || "Empty")}
                            </span>
                          </div>
                          <div>
                            <span className="text-green-600 block font-semibold uppercase text-[10px]">
                              Proposed
                            </span>
                            <span className="font-medium">
                              {String(mod.newValue)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm">Current Value</p>
                        <p className="font-medium">{request.currentValue}</p>
                      </div>
                      <div>
                        <p className="text-sm">Proposed Value</p>
                        <p className="font-medium">{request.proposedValue}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="text-sm">Reason</p>
                    <p className="font-medium">
                      {request.reasonForModification}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm">Requested By</p>
                    <p className="font-medium">{request.requestedBy}</p>
                  </div>

                  {request.status !== "pending" && request.reviewedBy && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm">
                        Reviewed By:{" "}
                        <span className="font-medium">
                          {request.reviewedBy}
                        </span>{" "}
                        on{" "}
                        <span className="font-medium">
                          {request.reviewedDate &&
                            new Date(request.reviewedDate).toLocaleString()}
                        </span>
                      </p>
                      {request.reviewComments && (
                        <div className="mt-2">
                          <p className="text-sm">Comments:</p>
                          <p className="font-medium">
                            {request.reviewComments}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
