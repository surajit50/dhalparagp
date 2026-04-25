import React from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { columns, WarishApplication } from "./warish-columns";
import { DataTable } from "@/components/data-table";
import { Info, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

const WarishRenewPage = async () => {
  const today = new Date();
  const currentYear = today.getFullYear().toString();

  const warishApplications = await db.warishApplication.findMany({
    where: {
      warishApplicationStatus: "approved",
      OR: [
        { renewdate: { lte: today } },
        { approvalYear: { not: currentYear } },
      ],
    },
    select: {
      id: true,
      applicantName: true,
      warishRefNo: true,
      warishRefDate: true,
      renewdate: true,
      approvalYear: true,
    },
    orderBy: {
      renewdate: "asc",
    },
  });

  // Type assertion to match the WarishApplication type
  const typedWarishApplications: WarishApplication[] = warishApplications.map(
    (app) => ({
      ...app,
      warishRefNo: app.warishRefNo || undefined,
      warishRefDate: app.warishRefDate || undefined,
      renewdate: app.renewdate || undefined,
      approvalYear: app.approvalYear || undefined,
    })
  );

  // Calculate statistics
  const overdueCount = typedWarishApplications.filter(app => 
    app.renewdate && app.renewdate < today
  ).length;
  
  const differentYearCount = typedWarishApplications.filter(app => 
    app.approvalYear && app.approvalYear !== currentYear
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Renewal Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage application renewals and track renewal status
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <RefreshCw className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{typedWarishApplications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Different Year</p>
                  <p className="text-2xl font-bold text-yellow-600">{differentYearCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white shadow-xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  Applications Requiring Renewal
                </CardTitle>
                <p className="text-blue-100 text-sm mt-1">
                  Applications sorted by nearest renewal date
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Renewal Dashboard</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {typedWarishApplications.length > 0 ? (
              <div className="overflow-hidden">
                <DataTable 
                  columns={columns} 
                  data={typedWarishApplications}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  All Caught Up!
                </h3>
                <p className="text-gray-600 text-center max-w-md mb-4">
                  No applications require immediate renewal attention. 
                  The system will automatically notify you when renewals are needed.
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Info className="h-4 w-4" />
                  <span>Applications will appear here when renewal is needed</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-0">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How Renewal Works</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium mb-1">• Overdue Applications</p>
                      <p className="text-gray-500">Applications past their renewal date</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">• Different Year Applications</p>
                      <p className="text-gray-500">Applications from previous years</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">• Renewal Process</p>
                      <p className="text-gray-500">Click renew to update application status</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">• Auto Updates</p>
                      <p className="text-gray-500">System automatically tracks renewal dates</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WarishRenewPage;
