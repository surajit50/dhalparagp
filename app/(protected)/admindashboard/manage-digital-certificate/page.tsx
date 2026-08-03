import React from "react";
import {
  getAllDigitalCertificateApplications,
  getDigitalCertificateStats,
} from "@/action/digital-certificate";
import DigitalCertificateTable from "@/components/digital-certificate/DigitalCertificateTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileBadge2,
  Baby,
  HeartCrack,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Manage Digital Birth & Death Certificates | Admin Dashboard",
  description: "Administrative console for managing digital birth and death certificate applications, office records, and Sub-Registrar verification orders.",
};

export default async function ManageDigitalCertificatePage() {
  const [statsRes, initialAppsRes] = await Promise.all([
    getDigitalCertificateStats(),
    getAllDigitalCertificateApplications({ page: 1, limit: 10 }),
  ]);

  const stats = statsRes.data || {
    total: 0,
    birthCount: 0,
    deathCount: 0,
    submittedCount: 0,
    underReviewCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  };

  const initialApps = initialAppsRes.data?.applications || [];
  const initialTotal = initialAppsRes.data?.total || 0;
  const initialPage = initialAppsRes.data?.page || 1;
  const initialTotalPages = initialAppsRes.data?.totalPages || 1;

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2.5">
            <FileBadge2 className="w-8 h-8 text-blue-200" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Digital Birth & Death Certificates
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl">
            Office of the Sub-Registrar of Births & Deaths &bull; No. 3 Dhalpara Gram Panchayat. Verify office records, generate Sub-Registrar orders, and issue digital certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="gap-2 bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-sm">
            <Link href="/admindashboard/manage-digital-certificate/new">
              <PlusCircle className="w-4 h-4 text-blue-700" /> New Application
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <Card className="border-l-4 border-l-blue-600 shadow-sm bg-card">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              Total Apps <FileText className="w-4 h-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-extrabold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>

        {/* Birth */}
        <Card className="border-l-4 border-l-cyan-600 shadow-sm bg-card">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              Birth Apps <Baby className="w-4 h-4 text-cyan-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-extrabold text-cyan-700">{stats.birthCount}</p>
          </CardContent>
        </Card>

        {/* Death */}
        <Card className="border-l-4 border-l-purple-600 shadow-sm bg-card">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              Death Apps <HeartCrack className="w-4 h-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-extrabold text-purple-700">{stats.deathCount}</p>
          </CardContent>
        </Card>

        {/* Submitted */}
        <Card className="border-l-4 border-l-amber-500 shadow-sm bg-card">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              Submitted <Clock className="w-4 h-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-extrabold text-amber-600">{stats.submittedCount}</p>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card className="border-l-4 border-l-green-600 shadow-sm bg-card">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              Approved <CheckCircle2 className="w-4 h-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-extrabold text-green-600">{stats.approvedCount}</p>
          </CardContent>
        </Card>

        {/* Rejected */}
        <Card className="border-l-4 border-l-red-500 shadow-sm bg-card">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase flex items-center justify-between">
              Rejected <XCircle className="w-4 h-4 text-red-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-2xl font-extrabold text-red-600">{stats.rejectedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Table */}
      <DigitalCertificateTable
        initialData={initialApps}
        initialTotal={initialTotal}
        initialPage={initialPage}
        initialTotalPages={initialTotalPages}
        isAdmin={true}
      />
    </div>
  );
}
