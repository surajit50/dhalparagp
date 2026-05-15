import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/utils/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarIcon,
  FileTextIcon,
  UserIcon,
  ClipboardListIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  XCircleIcon,
  Loader2Icon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyApplicationId } from "@/components/copy-application-id";
import StaffWarishActionCell from "@/components/StaffWarishActionCell";

const StaffDashboard = async () => {
  const cstaff = await currentUser();

  if (!cstaff) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-orange-50 to-purple-100">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md">
          <AlertCircleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Please login to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  const warishApplications = await db.warishApplication.findMany({
    where: {
      assingstaffId: cstaff.id,
      warishApplicationStatus: "process",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 📊 Dashboard Stats
  const total = warishApplications.length;
  const processing = warishApplications.filter(
    (a) => a.warishApplicationStatus === "process",
  ).length;
  const approved = warishApplications.filter(
    (a) => a.warishApplicationStatus === "approved",
  ).length;
  const rejected = warishApplications.filter(
    (a) => a.warishApplicationStatus === "rejected",
  ).length;

  const getStatusVariant = (status: string) => {
    if (status === "approved") return "success";
    if (status === "rejected") return "destructive";
    if (status === "process") return "secondary";
    return "default";
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-orange-50">
      <div className="container mx-auto py-10 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ClipboardListIcon className="w-8 h-8 text-orange-600" />
            Staff Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and review your assigned applications.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total" value={total} icon={<FileTextIcon />} />
          <StatCard
            title="Processing"
            value={processing}
            icon={<Loader2Icon />}
          />
          <StatCard
            title="Approved"
            value={approved}
            icon={<CheckCircle2Icon />}
          />
          <StatCard title="Rejected" value={rejected} icon={<XCircleIcon />} />
        </div>

        {/* Table Section */}
        <div className="bg-white shadow-lg rounded-2xl border overflow-hidden">
          {total === 0 ? (
            <div className="text-center py-20">
              <FileTextIcon className="mx-auto h-14 w-14 text-gray-400 mb-4" />
              <p className="text-xl font-semibold text-gray-700">
                No applications assigned
              </p>
              <p className="text-gray-500 text-sm">
                Assigned applications will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {warishApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <CopyApplicationId
                        applicationId={application.acknowlegment}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserIcon className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium">
                          {application.applicantName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={getStatusVariant(
                          application.warishApplicationStatus,
                        )}
                        className="capitalize"
                      >
                        {application.warishApplicationStatus}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4" />
                        {formatDate(application.createdAt)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <StaffWarishActionCell applicationId={application.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default StaffDashboard;

// 📌 Reusable Stat Card
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
}
