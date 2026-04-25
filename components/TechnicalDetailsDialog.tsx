"use client";

import { useState } from "react";
import {
  Eye,
  FileText,
  Calendar,
  Building,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

import { AgencyType } from "@prisma/client";
import { ModifyTechnicalDetailsDialog } from "./ModifyTechnicalDetailsDialog";

interface TechnicalDetailsDialogProps {
  bidderId: string;
  bidderName: string;
  bidderType: AgencyType;
  bidderProprietorName: string | null;
  onDetailsLoad?: (details: any) => void;
}

interface TechnicalDetails {
  id: string;
  remarks?: string;
  qualify: boolean;
  // Document checks
  byelow: boolean;
  pfregistrationupdatechalan: boolean;
  declaration: boolean;
  machinary: boolean;
  // Credential checks
  credencial: {
    sixtyperamtput: boolean;
    workorder: boolean;
    paymentcertificate: boolean;
    comcertificat: boolean;
  };
  // Validity checks
  validityofdocument: {
    itreturn: boolean;
    gst: boolean;
    tradelicence: boolean;
    ptax: boolean;
  };
}

export function TechnicalDetailsDialog({
  bidderId,
  bidderName,
  bidderType,
  bidderProprietorName,
  onDetailsLoad,
}: TechnicalDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<TechnicalDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTechnicalDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/technical-details/${bidderId}`);
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
        onDetailsLoad?.(data);
      }
    } catch (error) {
      console.error("Failed to fetch technical details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      fetchTechnicalDetails();
    } else {
      setDetails(null);
    }
  };

  const calculateComplianceScore = () => {
    if (!details) return 0;

    const checks = [
      details.byelow,
      details.pfregistrationupdatechalan,
      details.declaration,
      details.machinary,
      details.credencial.sixtyperamtput,
      details.credencial.workorder,
      details.credencial.paymentcertificate,
      details.credencial.comcertificat,
      details.validityofdocument.itreturn,
      details.validityofdocument.gst,
      details.validityofdocument.tradelicence,
      details.validityofdocument.ptax,
    ];

    const passedChecks = checks.filter(Boolean).length;
    return Math.round((passedChecks / checks.length) * 100);
  };

  const CheckItem = ({
    label,
    value,
    description,
  }: {
    label: string;
    value: boolean;
    description?: string;
  }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center">
        {value ? (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-200"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Compliant
          </Badge>
        ) : (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 border-red-200"
          >
            <X className="w-3 h-3 mr-1" />
            Non-Compliant
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center bg-transparent"
        >
          <Eye className="mr-2 h-4 w-4 text-blue-600" />
          <span className="text-blue-600">View Details</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Technical Evaluation - {bidderName}
            {bidderType == "FARM" && (
              <span className="text-sm text-muted-foreground">
                ({bidderProprietorName})
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Detailed technical evaluation and compliance check for this bidder
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Evaluation Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Overall Status
                    </p>
                    <Badge
                      variant={details.qualify ? "default" : "destructive"}
                      className={
                        details.qualify
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {details.qualify ? "Qualified" : "Not Qualified"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Compliance Score
                    </p>
                    <p className="font-semibold text-lg">
                      {calculateComplianceScore()}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Evaluation Date
                    </p>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                {details.remarks && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Remarks
                    </p>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {details.remarks}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <CheckItem
                    label="Bye-law Compliance"
                    value={details.byelow}
                    description="Compliance with local bye-laws"
                  />
                  <CheckItem
                    label="PF Registration & Chalan"
                    value={details.pfregistrationupdatechalan}
                    description="Provident Fund registration and payment"
                  />
                  <CheckItem
                    label="Declaration"
                    value={details.declaration}
                    description="Required declarations submitted"
                  />
                  <CheckItem
                    label="Machinery Details"
                    value={details.machinary}
                    description="Machinery and equipment details"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Credentials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <CheckItem
                    label="Six Type Ram Tput"
                    value={details.credencial.sixtyperamtput}
                    description="Technical capability certificate"
                  />
                  <CheckItem
                    label="Work Order"
                    value={details.credencial.workorder}
                    description="Previous work order certificates"
                  />
                  <CheckItem
                    label="Payment Certificate"
                    value={details.credencial.paymentcertificate}
                    description="Payment completion certificates"
                  />
                  <CheckItem
                    label="Completion Certificate"
                    value={details.credencial.comcertificat}
                    description="Work completion certificates"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Document Validity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Validity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <CheckItem
                    label="IT Return"
                    value={details.validityofdocument.itreturn}
                    description="Income Tax Return filing"
                  />
                  <CheckItem
                    label="GST Registration"
                    value={details.validityofdocument.gst}
                    description="GST registration certificate"
                  />
                  <CheckItem
                    label="Trade License"
                    value={details.validityofdocument.tradelicence}
                    description="Valid trade license"
                  />
                  <CheckItem
                    label="Professional Tax"
                    value={details.validityofdocument.ptax}
                    description="Professional tax compliance"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No technical details found</p>
          </div>
        )}

        {/* Modify Technical Details Dialog Trigger */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <ModifyTechnicalDetailsDialog
            bidderId={bidderId}
            bidderName={bidderName}
            onUpdate={() => {
              // Refresh the details when modified
              setDetails(null);
              fetchTechnicalDetails();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
