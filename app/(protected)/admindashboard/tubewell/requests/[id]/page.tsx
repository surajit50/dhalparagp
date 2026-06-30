import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  FileText,
  MapPin,
  User,
  Phone,
  AlertCircle,
  Calendar,
  Settings2,
  CheckCircle2,
  XCircle,
  Wrench,
  ClipboardList,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface RequestDetailsPageProps {
  params: Promise<{ id: string }>;
}

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200/50 px-4 py-1.5 rounded-full font-semibold text-sm">
          Pending Approval
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200/50 px-4 py-1.5 rounded-full font-semibold text-sm">
          Approved (Ready for WO)
        </Badge>
      );
    case "WORK_ORDER_ISSUED":
      return (
        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200/50 px-4 py-1.5 rounded-full font-semibold text-sm">
          Work Order Issued
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200/50 px-4 py-1.5 rounded-full font-semibold text-sm">
          Completed
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className="px-4 py-1.5 rounded-full font-semibold text-sm">
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline" className="px-4 py-1.5 rounded-full font-semibold text-sm">{status}</Badge>;
  }
};

export default async function RequestDetailsPage({ params }: RequestDetailsPageProps) {
  const { id } = await params;

  const request = await db.tubewellRepairRequest.findUnique({
    where: { id },
    include: {
      workOrders: {
        include: {
          mistri: true,
          materials: { include: { material: true } },
        },
      },
    },
  });

  if (!request) {
    notFound();
  }

  const totalMaterialCost = request.workOrders.reduce((sum, wo) =>
    sum + wo.materials.reduce((s, m) => s + m.quantity * m.rate, 0), 0
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* BACK */}
        <Button variant="ghost" size="sm" asChild className="hover:bg-white hover:shadow-sm transition-all text-slate-500 hover:text-slate-900">
          <Link href="/admindashboard/tubewell/requests" className="flex items-center gap-2 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Requests
          </Link>
        </Button>

        {/* PAGE HEADER */}
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl border shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="relative flex gap-5 items-start z-10">
            <div className="p-4 bg-orange-50 rounded-2xl shrink-0 shadow-inner">
              <Wrench className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Repair Request Details
              </h1>
              <p className="text-slate-500 mt-1 font-medium text-sm">
                ID: <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-lg">{request.id}</span>
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-3 shrink-0 z-10">
            <StatusBadge status={request.status} />
            {request.status === "APPROVED" && (
              <Button asChild className="gap-2 rounded-xl px-5 h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-sm">
                <Link href={`/admindashboard/tubewell/work-orders/create?reqId=${request.id}`}>
                  <Settings2 className="h-4 w-4" /> Issue Work Order
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* LEFT: Problem + Citizen + Location */}
          <div className="md:col-span-2 space-y-6">

            {/* Problem description */}
            <div className="bg-white rounded-3xl border shadow-sm p-8 space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2 bg-rose-50 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-rose-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Problem Description</h2>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 italic text-slate-700 text-sm leading-relaxed">
                {request.problemDetails || "No detailed description provided."}
              </div>

              {/* Citizen & location fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <InfoRow icon={<User className="h-4 w-4 text-slate-400" />} label="Citizen Name" value={request.citizenName} />
                <InfoRow icon={<Phone className="h-4 w-4 text-slate-400" />} label="Contact Number" value={request.mobileNumber || "N/A"} />
                <InfoRow icon={<MapPin className="h-4 w-4 text-slate-400" />} label="Location / Address" value={request.address} />
                <InfoRow icon={<MapPin className="h-4 w-4 text-slate-400" />} label="Mouza / Village" value={request.mouza || "N/A"} />
                <InfoRow icon={<Calendar className="h-4 w-4 text-slate-400" />} label="Date Reported" value={format(new Date(request.createdAt), "dd MMM yyyy, hh:mm a")} />
                <InfoRow icon={<Calendar className="h-4 w-4 text-slate-400" />} label="Last Updated" value={format(new Date(request.updatedAt), "dd MMM yyyy")} />
              </div>
            </div>
          </div>

          {/* RIGHT: Quick stats */}
          <div className="space-y-6">
            <QuickStat
              icon={<ClipboardList className="h-6 w-6" />}
              label="Work Orders"
              value={request.workOrders.length}
              color="blue"
            />
            <QuickStat
              icon={<IndianRupee className="h-6 w-6" />}
              label="Total Material Cost"
              value={`₹${totalMaterialCost.toLocaleString("en-IN")}`}
              color="emerald"
            />
            <QuickStat
              icon={
                request.status === "COMPLETED" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : request.status === "REJECTED" ? (
                  <XCircle className="h-6 w-6" />
                ) : (
                  <Wrench className="h-6 w-6" />
                )
              }
              label="Current Status"
              value={request.status.replace(/_/g, " ")}
              color={
                request.status === "COMPLETED" ? "emerald" :
                request.status === "REJECTED" ? "rose" :
                request.status === "PENDING" ? "amber" : "orange"
              }
            />
          </div>
        </div>

        {/* WORK ORDERS */}
        {request.workOrders.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <FileText className="h-5 w-5 text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Associated Work Orders</h2>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{request.workOrders.length}</span>
            </div>
            {request.workOrders.map((order) => {
              const materialCost = order.materials.reduce((s, m) => s + m.quantity * m.rate, 0);
              return (
                <div key={order.id} className="bg-white rounded-3xl border-l-4 border-l-orange-500 border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex justify-between items-start p-6 border-b border-slate-50 bg-slate-50/50">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Issued to: <span className="font-semibold text-slate-700">{order.mistri.name}</span>
                      </p>
                    </div>
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1 rounded-full font-semibold">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <InfoItem label="Issue Date" value={format(new Date(order.issueDate), "dd MMM yyyy")} />
                    <InfoItem label="Labor Cost" value={`₹${order.mustiAmount.toFixed(2)}`} />
                    <InfoItem label="Material Cost" value={`₹${materialCost.toLocaleString("en-IN")}`} />
                    <InfoItem label="Materials Used" value={`${order.materials.length} types`} />
                  </div>
                  <div className="px-6 pb-5">
                    <Button variant="link" size="sm" asChild className="h-auto p-0 text-orange-600 hover:text-orange-700 font-semibold">
                      <Link href={`/admindashboard/tubewell/work-orders/${order.id}/print`}>
                        View Full Order →
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 border-blue-100 text-blue-700",
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
  amber: "bg-amber-50 border-amber-100 text-amber-700",
  rose: "bg-rose-50 border-rose-100 text-rose-700",
  orange: "bg-orange-50 border-orange-100 text-orange-700",
};

function QuickStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const cls = colorMap[color] || colorMap.blue;
  return (
    <div className={`rounded-2xl border p-5 ${cls} flex items-center gap-4`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
        <p className="text-2xl font-extrabold tracking-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}
