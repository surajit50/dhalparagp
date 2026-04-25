import React from "react";
import { db } from "@/lib/db";
import { WarishApplicationProps, WarishDetailProps } from "@/types";
import {
  processWarishDetails,
  createWarishDetailsMap,
  organizeWarishDetailsHierarchy,
} from "@/utils/warishUtils";
import WarishEditFormComponent from "@/components/form/WarishForm/warish-edit-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, AlertCircle, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { revalidatePath } from "next/cache";
import { WarishDetailType } from "@/types/warish";
import { FamilyRelationship } from "@prisma/client";
import { updateWarishDetail, deleteWarishDetail } from "./actions";
import { WarishDetailRow } from "./warish-detail-row";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

async function getWarishDetails(id: string): Promise<WarishDetailType[]> {
  try {
    console.log("Fetching warish details for application ID:", id);

    const application = await db.warishApplication.findUnique({
      where: { id },
      include: { warishDetails: true },
    });

    if (!application) {
      console.log("No application found with ID:", id);
      return [];
    }

    console.log("Found application:", application.id);
    console.log(
      "Total warish details in application:",
      application.warishDetails.length
    );

    // Get all warish details for this application
    const warishDetails = await db.warishDetail.findMany({
      where: {
        warishApplicationId: id,
      },
      include: {
        children: true,
      },
      orderBy: { createdAt: "asc" },
    });

    console.log("Found all warish details:", warishDetails.length);
    console.log("Warish details:", JSON.stringify(warishDetails, null, 2));

    // Transform the data to match WarishDetailType
    const transformWarishDetail = (detail: any): WarishDetailProps => ({
      id: detail.id,
      name: detail.name,
      gender: detail.gender,
      relation: detail.relation,
      livingStatus: detail.livingStatus,
      maritialStatus: detail.maritialStatus,
      hasbandName: detail.hasbandName,
      parentId: detail.parentId,
      warishApplicationId: detail.warishApplicationId,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
      children: (detail.children || []).map(transformWarishDetail),
    });

    const transformedDetails = warishDetails.map(transformWarishDetail);

    // Create a map of warish details
    const warishDetailsMap = createWarishDetailsMap(transformedDetails);

    // Organize the hierarchy
    const rootWarishDetails = organizeWarishDetailsHierarchy(warishDetailsMap);

    console.log(
      "Root warish details:",
      JSON.stringify(rootWarishDetails, null, 2)
    );
    return rootWarishDetails;
  } catch (error) {
    console.error("Error fetching warish details:", error);
    throw new Error("Failed to fetch warish details");
  }
}

export default async function WarishEditPage({ params }: Props) {
  const { id } = await params;
  const warishDetails = await getWarishDetails(id);

  return (
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Edit Warish Application
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Update the warish application details and beneficiary information
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <WarishEditFormComponent applicationId={id} />
          </Suspense>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Warish Details
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Manage beneficiary details and relationships
                </p>
              </div>
              <Button asChild className="gap-2">
                <Link href={`/warish/${id}/details/new`}>
                  <PlusCircle className="h-4 w-4" />
                  Add Beneficiary
                </Link>
              </Button>
            </div>

            <Suspense fallback={<HierarchicalSkeleton />}>
              {warishDetails.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center">
                  <AlertCircle className="h-8 w-8 text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium">
                    No warish details found
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Start by adding a new beneficiary
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[10%] text-gray-600 font-medium">
                          No.
                        </TableHead>
                        <TableHead className="text-gray-600 font-medium">
                          Name
                        </TableHead>
                        <TableHead className="text-gray-600 font-medium">
                          Gender
                        </TableHead>
                        <TableHead className="text-gray-600 font-medium">
                          Marital Status
                        </TableHead>
                        <TableHead className="text-gray-600 font-medium">
                          Relation
                        </TableHead>
                        <TableHead className="text-gray-600 font-medium">
                          Living Status
                        </TableHead>

                        <TableHead className="text-right text-gray-600 font-medium">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {warishDetails.map((detail, index) => (
                        <WarishDetailRow
                          key={detail.id}
                          detail={detail}
                          index={index}
                          warishApplicationId={id}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Updated Loading Skeletons
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-1/3 rounded-lg" />
        <Skeleton className="h-10 w-1/3 rounded-lg" />
        <Skeleton className="h-10 w-1/3 rounded-lg" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-1/2 rounded-lg" />
        <Skeleton className="h-10 w-1/2 rounded-lg" />
      </div>
    </div>
  );
}

function HierarchicalSkeleton() {
  return (
    <div className="rounded-lg border">
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4 rounded-lg" />
              <Skeleton className="h-4 w-1/3 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
