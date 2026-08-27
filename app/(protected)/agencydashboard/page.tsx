import { currentUser } from "@/lib/auth";
import { getAgencyDashboardData } from "@/lib/agencydata";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; // Assuming shadcn progress component
import {
  Building2,
  Briefcase,
  IndianRupee,
  LayoutDashboard,
  Users,
  GanttChartSquare,
  ScrollText,
  Landmark,
  FileCheck,
  FileText,
  ShieldCheck,
  Mail,
  Phone,
  Fingerprint
} from "lucide-react";
import { NoticePopup } from "@/components/dashboard/NoticePopup";

async function AgencyDashboardContent() {
  const user = await currentUser();
  if (!user || user.role !== "agency" || !user.agencyDetailsId) {
    redirect("/auth/login");
  }

  const agencyData = await getAgencyDashboardData(user.agencyDetailsId) ?? null;
  if (!agencyData) {
    return <div className="p-6">Agency details not found.</div>;
  }

  const agency = agencyData;
  const bidAgencies = agencyData.Bidagency;
  const works = bidAgencies.flatMap((ba) => ba.WorksDetail ? [ba.WorksDetail] : []);
  const aocs = bidAgencies.flatMap((ba) => ba.workorderdetails.map((wod) => wod.awardofcontractdetails));
  const acceptedWorks = bidAgencies
    .filter((ba) => ba.workorderdetails.length > 0 && ba.WorksDetail)
    .map((ba) => ba.WorksDetail!);
  const payments = acceptedWorks.flatMap((w) => w.paymentDetails);
  const totalRevenue = payments.reduce((acc, p) => acc + p.netAmt, 0);
  const conversionRate = works.length > 0 ? (acceptedWorks.length / works.length) * 100 : 0;

  const earnestMoneyRecords = bidAgencies.flatMap((ba) => ba.earnestMoneyRegister);
  const technicalEvals = bidAgencies
    .map((ba) => ba.technicalEvelution)
    .filter((te): te is NonNullable<typeof te> => te != null);
  const bids = agency.Bid;
  const orders = agency.Order;
  const users = agency.users;

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 min-h-screen">
      <NoticePopup />
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overview</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            {agency.name}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm font-semibold shadow-sm">
            {agency.agencyType}
          </Badge>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
            Active Status
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Profile */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Financial Hero Card */}
          <Card className="relative border-none shadow-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 text-white overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
              <IndianRupee className="h-32 w-32" />
            </div>
            <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <CardContent className="p-8 relative z-10">
              <p className="text-indigo-100 font-medium mb-2 uppercase tracking-wider text-sm">Total Net Payments Received</p>
              <h2 className="text-5xl font-extrabold mb-8 drop-shadow-sm">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </h2>
              <div className="flex gap-6">
                <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-md shadow-sm hover:bg-white/20 transition-colors">
                  <p className="text-xs text-indigo-100 uppercase tracking-wider font-semibold mb-1">Total Bids</p>
                  <p className="text-2xl font-bold">{bids.length}</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl p-4 backdrop-blur-md shadow-sm hover:bg-white/20 transition-colors">
                  <p className="text-xs text-indigo-100 uppercase tracking-wider font-semibold mb-1">Success Rate</p>
                  <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-slate-200/60 hover:shadow-md hover:border-orange-200 hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Active Works</CardTitle>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Briefcase className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-slate-800">{works.length}</div>
                <Progress value={conversionRate} className="h-1.5 mt-4 bg-orange-100" indicatorClassName="bg-orange-500" />
                <p className="text-xs font-medium text-slate-500 mt-3">{acceptedWorks.length} Completed</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200/60 hover:shadow-md hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">AOCs Issued</CardTitle>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-slate-800">{aocs.length}</div>
                <p className="text-xs font-medium text-slate-500 mt-3">Contracts awarded to date</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200/60 hover:shadow-md hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Orders</CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <GanttChartSquare className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-slate-800">{orders.length}</div>
                <p className="text-xs font-medium text-slate-500 mt-3">Purchase & Work orders</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Compliance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-slate-200/60 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  </div>
                  Compliance & EMD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <div className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all group">
                  <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-700 transition-colors">Technical Evaluations</span>
                  <span className="font-bold text-lg text-slate-800 bg-slate-50 px-3 py-1 rounded-md">{technicalEvals.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all group">
                  <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-700 transition-colors">EMD Records</span>
                  <span className="font-bold text-lg text-slate-800 bg-slate-50 px-3 py-1 rounded-md">{earnestMoneyRecords.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200/60 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-800">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  Team Management
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-5 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-extrabold text-2xl shadow-inner">
                    {users.length}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">Associated Users</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">Active personnel with access</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Agency Profile Details */}
        <div className="space-y-6">
          <Card className="shadow-lg border-none overflow-hidden relative">
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 w-full absolute top-0 left-0" />
            <CardHeader className="pb-4 bg-slate-50/50">
              <CardTitle className="text-xl font-bold text-slate-800">Agency Profile</CardTitle>
              <CardDescription className="font-medium">Official registration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-7 pt-6">
              <ProfileItem icon={<Building2 />} label="Proprietor" value={agency.proprietorName} />
              <ProfileItem icon={<Mail />} label="Email Address" value={agency.email} />
              <ProfileItem icon={<Phone />} label="Mobile Number" value={agency.mobileNumber} />
              <div className="pt-6 border-t border-slate-100 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <ProfileItem icon={<Fingerprint />} label="PAN" value={agency.pan} small />
                  <ProfileItem icon={<ScrollText />} label="GST" value={agency.gst} small />
                </div>
                <ProfileItem icon={<Landmark />} label="TIN" value={agency.tin} />
              </div>
              <div className="pt-6 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Contact Address</p>
                <p className="text-sm font-medium leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {agency.contactDetails || "No address provided"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component for Profile Items
function ProfileItem({ icon, label, value, small = false }: { icon: React.ReactNode, label: string, value?: string | null, small?: boolean }) {
  return (
    <div className="flex gap-4 items-start group">
      <div className="mt-0.5 p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all duration-300">
        {icon && typeof icon === 'object' && 'props' in icon ? 
          // @ts-ignore - handling lucide icon sizing
          cloneElement(icon, { size: small ? 16 : 20 }) : icon}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-0.5 group-hover:text-indigo-400 transition-colors">{label}</p>
        <p className={`${small ? 'text-sm' : 'text-base'} font-bold text-slate-800`}>{value || "—"}</p>
      </div>
    </div>
  );
}

import { cloneElement } from "react";

export default function AgencyDashboardPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          <div className="h-12 bg-slate-200 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <AgencyDashboardContent />
    </Suspense>
  );
}
