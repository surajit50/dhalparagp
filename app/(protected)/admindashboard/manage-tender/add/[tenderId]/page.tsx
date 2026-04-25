import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import WorkDetailsList from "./WorkDetailsList";
import AddWorkDetaisForm from "@/components/form/AddWorkDetaisForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, ListChecks } from "lucide-react";
import { NITCopy } from "@/components/PrintTemplet/PrintNIt-copy";

interface PageProps {
  params: Promise<{ tenderId: string }>;
}

type Props = {
  nit: any;
};
async function fetchWorkDetails(tenderId: string) {
  const workDetails = await db.nitDetails.findUnique({
    where: { id: tenderId },
    include: {
      WorksDetail: {
        include: {
          ApprovedActionPlanDetails: true,
        },
      },
    },
  });

  if (!workDetails) {
    notFound();
  }

  return workDetails;
}

export default async function Page({ params }: PageProps) {
  const { tenderId } = await params;
  const workDetails = await fetchWorkDetails(tenderId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-7xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Header Section */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md">
                <ListChecks className="h-6 w-6 text-white" />
                <NITCopy nitdetails={workDetails} />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Work Details Management
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 ml-12">
              Manage and organize work details for your tender
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10">
            {/* Add New Work Details Card */}
            <Card className="lg:w-1/2 border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-t-lg border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                    <PlusCircle className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                    Add New Work Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <AddWorkDetaisForm tenderId={tenderId} />
              </CardContent>
            </Card>

            {/* Existing Work Details Card */}
            <Card className="lg:w-1/2 border-2 border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30">
              <CardHeader className="pb-4 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-t-lg border-b border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm">
                    <ListChecks className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                    Existing Work Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Suspense
                  fallback={
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <Skeleton className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[250px] bg-gradient-to-r from-gray-200 to-gray-300" />
                            <Skeleton className="h-4 w-[200px] bg-gradient-to-r from-gray-200 to-gray-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  }
                >
                  <WorkDetailsList workDetails={workDetails} />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
