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
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
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
          <Card className="border-none shadow-lg bg-primary text-primary-foreground overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <IndianRupee className="h-32 w-32" />
            </div>
            <CardContent className="p-8">
              <p className="text-primary-foreground/80 font-medium mb-2">Total Net Payments Received</p>
              <h2 className="text-5xl font-bold mb-6">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </h2>
              <div className="flex gap-6">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-xs text-primary-foreground/70 uppercase">Total Bids</p>
                  <p className="text-xl font-semibold">{bids.length}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-xs text-primary-foreground/70 uppercase">Success Rate</p>
                  <p className="text-xl font-semibold">{conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Works</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{works.length}</div>
                <Progress value={conversionRate} className="h-1 mt-3" />
                <p className="text-[10px] text-muted-foreground mt-2">{acceptedWorks.length} Completed</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">AOCs Issued</CardTitle>
                <FileCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aocs.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Contracts awarded to date</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
                <GanttChartSquare className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Purchase/Work orders</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Compliance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Compliance & EMD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Technical Evaluations</span>
                  <span className="font-bold">{technicalEvals.length}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-muted-foreground">EMD Records</span>
                  <span className="font-bold">{earnestMoneyRecords.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Team Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {users.length}
                  </div>
                  <div>
                    <p className="font-medium">Associated Users</p>
                    <p className="text-xs text-muted-foreground">Active personnel with access</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Agency Profile Details */}
        <div className="space-y-6">
          <Card className="shadow-md border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="text-xl">Agency Profile</CardTitle>
              <CardDescription>Official registration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProfileItem icon={<Building2 />} label="Proprietor" value={agency.proprietorName} />
              <ProfileItem icon={<Mail />} label="Email Address" value={agency.email} />
              <ProfileItem icon={<Phone />} label="Mobile Number" value={agency.mobileNumber} />
              <div className="pt-4 border-t space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <ProfileItem icon={<Fingerprint />} label="PAN" value={agency.pan} small />
                  <ProfileItem icon={<ScrollText />} label="GST" value={agency.gst} small />
                </div>
                <ProfileItem icon={<Landmark />} label="TIN" value={agency.tin} />
              </div>
              <div className="pt-4 border-t">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Contact Address</p>
                <p className="text-sm leading-relaxed text-slate-600 italic">
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
    <div className="flex gap-3 items-start">
      <div className="mt-1 text-muted-foreground">
        {icon && typeof icon === 'object' && 'props' in icon ? 
          // @ts-ignore - handling lucide icon sizing
          cloneElement(icon, { size: small ? 14 : 18 }) : icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tight">{label}</p>
        <p className={`${small ? 'text-xs' : 'text-sm'} font-semibold text-slate-700`}>{value || "—"}</p>
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
