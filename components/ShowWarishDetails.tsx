"use client";

import { useState, useEffect, useMemo } from "react";

import { getWarishApplicationDetails } from "@/action/warish-verification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

import { WarishApplicationProps, WarishDetailProps } from "@/types";
import LegalHeirrApplicationDetails from "@/components/LegalHeirrApplicationDetails";

export const ShowWarishDetails = ({
  warishapplicationid,
}: {
  warishapplicationid: string;
}) => {
  const [application, setApplication] = useState<
    (WarishApplicationProps & { warishDetails: WarishDetailProps[] }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchApplicationDetails = async (warishapplicationid: string) => {
    if (!warishapplicationid) {
      setError("Invalid application ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getWarishApplicationDetails(warishapplicationid);
      if (result.success && result.application) {
        setApplication({
          ...result.application,
          warishDetails: result.application.warishDetails.map((detail) => ({
            ...detail,
            children: [],
          })),
        });
      } else {
        setError("Failed to fetch application details. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      setError(
        "An unexpected error occurred while fetching the application. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && warishapplicationid) {
      fetchApplicationDetails(warishapplicationid);
    }
  }, [open, warishapplicationid]);

  const rootWarishDetails = useMemo(() => {
    if (!application?.warishDetails) return [];

    const warishDetailsMap = new Map<string, WarishDetailProps>();
    application.warishDetails.forEach((detail) => {
      warishDetailsMap.set(detail.id, { ...detail, children: [] });
    });

    const roots: WarishDetailProps[] = [];
    warishDetailsMap.forEach((detail) => {
      if (detail.parentId) {
        const parent = warishDetailsMap.get(detail.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(detail);
        }
      } else {
        roots.push(detail);
      }
    });
    return roots;
  }, [application?.warishDetails]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when dialog is closed
      setApplication(null);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          View Legal Heirs
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Legal Heirs List
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(80vh-100px)] pr-4">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">
                Loading application details...
              </p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : application ? (
            <Card>
              <CardContent className="pt-6">
                <LegalHeirrApplicationDetails
                  application={application}
                  rootWarishDetails={rootWarishDetails}
                />
              </CardContent>
            </Card>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
