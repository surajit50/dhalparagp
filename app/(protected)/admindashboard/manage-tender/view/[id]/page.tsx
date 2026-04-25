import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/utils/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, DollarSign, Tag, Building, MapPin, CalendarDays } from "lucide-react";
import { CopyNameButton } from "@/components/CopyNameButton";
import { CopyEstimateButton } from "@/components/CopyEstimateButton";
import { BoqToggleButton } from "@/components/BoqToggleButton";

export default async function NITDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const nit = await db.nitDetails.findUnique({
    where: { id },
    include: {
      WorksDetail: {
        include: {
          ApprovedActionPlanDetails: true,
        },
      },
    },
  });

  if (!nit) {
    notFound();
  }

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    return `${formatDate(d)} ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const totalEstimate = nit.WorksDetail.reduce(
    (sum, work) => sum + (work.finalEstimateAmount || 0),
    0
  );
  
  const totalParticipation = nit.WorksDetail.reduce(
    (sum, work) => sum + (work.participationFee || 0),
    0
  );

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">NIT Details</h1>
          <div className="flex gap-2">
            <Badge 
              variant={nit.isPublished ? "default" : "secondary"}
              className="px-3 py-1 text-sm"
            >
              {nit.isPublished ? "Published" : "Draft"}
            </Badge>
            <Badge 
              variant={nit.isSupply ? "default" : "outline"}
              className="px-3 py-1 text-sm"
            >
              {nit.isSupply ? "Supply" : "Works"}
            </Badge>
          </div>
        </div>
        <p className="text-gray-600 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Memo Number: <span className="font-semibold text-blue-600">{nit.memoNumber}</span>
        </p>
      </div>

      {/* Stats Summary */}
      {nit.WorksDetail.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium mb-1">Total Works</p>
                  <p className="text-2xl font-bold text-blue-900">{nit.WorksDetail.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium mb-1">Total Estimate</p>
                  <p className="text-2xl font-bold text-green-900">
                    ₹{totalEstimate.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium mb-1">Participation Fee</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ₹{totalParticipation.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Tag className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main NIT Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Basic Information Card */}
        <Card className="shadow-md border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InfoItem 
                label="Memo Number" 
                value={nit.memoNumber.toString()}
                icon={<FileText className="w-4 h-4" />}
              />
              <InfoItem 
                label="Memo Date" 
                value={formatDate(nit.memoDate)}
                icon={<Calendar className="w-4 h-4" />}
              />
              <InfoItem 
                label="Publishing Date" 
                value={formatDate(nit.publishingDate)}
                icon={<Calendar className="w-4 h-4" />}
              />
              <InfoItem 
                label="Bid Validity" 
                value={`${nit.bidValidity} days`}
                icon={<Clock className="w-4 h-4" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Download Card */}
        <Card className="shadow-md border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Document Download Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InfoItem 
                label="Available From" 
                value={formatDateTime(nit.documentDownloadFrom)}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium mb-1">Start Time</p>
                  <p className="font-semibold">
                    {new Date(nit.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600 font-medium mb-1">End Time</p>
                  <p className="font-semibold">
                    {new Date(nit.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bid Opening Card */}
        <Card className="shadow-md border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Bid Opening Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <InfoItem 
                label="Technical Bid Opening" 
                value={formatDateTime(nit.technicalBidOpeningDate)}
              />
              {nit.financialBidOpeningDate && (
                <InfoItem 
                  label="Financial Bid Opening" 
                  value={formatDateTime(nit.financialBidOpeningDate)}
                />
              )}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Place of Opening
                </p>
                <p className="font-semibold">{nit.placeOfOpeningBids}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Summary Card */}
        <Card className="shadow-md border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Timeline Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <TimelineItem 
                date={formatDate(nit.memoDate)}
                title="Memo Issued"
                isFirst={true}
              />
              <TimelineItem 
                date={formatDate(nit.publishingDate)}
                title="Published"
              />
              <TimelineItem 
                date={formatDate(nit.documentDownloadFrom)}
                title="Document Download Starts"
              />
              <TimelineItem 
                date={formatDate(nit.technicalBidOpeningDate)}
                title="Technical Bid Opening"
                isLast={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Works Details Section */}
      {nit.WorksDetail && nit.WorksDetail.length > 0 && (
        <Card className="shadow-lg border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Work Details ({nit.WorksDetail.length})
              </span>
              <span className="text-sm font-normal text-gray-600">
                Total Value: ₹{totalEstimate.toLocaleString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 divide-y divide-gray-100">
                {nit.WorksDetail.map((work, idx) => {
                  const actionPlan = work.ApprovedActionPlanDetails;
                  const workName = actionPlan?.activityName || "Unnamed Work";
                  return (
                    <div 
                      key={work.id} 
                      className={`p-6 transition-colors ${
                        work.boqPrepared 
                          ? 'bg-green-50/50 border-l-4 border-green-500 hover:bg-green-100/50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Left: Index and Status */}
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="font-bold text-blue-700">{idx + 1}</span>
                            </div>
                            <Badge 
                              variant={actionPlan?.isPublish ? "default" : "secondary"}
                              className="mt-2 text-xs"
                            >
                              {actionPlan?.isPublish ? "Published" : "Draft"}
                            </Badge>
                          </div>
                        </div>

                        {/* Middle: Work Details */}
                        <div className="flex-1">
                          <div className="mb-4">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-medium">
                                {actionPlan?.activityCode}
                              </Badge>
                              <Badge variant="secondary">
                                {work.tenderStatus}
                              </Badge>
                              {work.boqPrepared && (
                                <Badge variant="success" className="bg-green-100 text-green-800">
                                  BOQ Ready
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {workName}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                              {actionPlan?.activityDescription}
                            </p>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatBox 
                              label="Theme" 
                              value={actionPlan?.themeName}
                              color="blue"
                            />
                            <StatBox 
                              label="Financial Year" 
                              value={actionPlan?.financialYear}
                              color="green"
                            />
                            <StatBox 
                              label="Estimate Cost" 
                              value={`₹${work.finalEstimateAmount?.toLocaleString()}`}
                              color="purple"
                            />
                            <StatBox 
                              label="Participation Fee" 
                              value={`₹${work.participationFee?.toLocaleString()}`}
                              color="orange"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-4 flex items-center gap-3 border-t pt-4">
                            <CopyNameButton workName={workName} />
                            <CopyEstimateButton estimateAmount={work.finalEstimateAmount || 0} />
                            <BoqToggleButton
                              workId={work.id}
                              initialBoqPrepared={work.boqPrepared || false}
                            />
                          </div>
                        </div>

                        {/* Right: Quick Actions/Info */}
                        <div className="lg:w-48 flex flex-col gap-2">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Estimate</p>
                            <p className="text-lg font-bold text-blue-700">
                              ₹{work.finalEstimateAmount?.toLocaleString()}
                            </p>
                          </div>
                          <div className="h-px bg-gray-200"></div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Fee</p>
                            <p className="text-lg font-semibold text-green-700">
                              ₹{work.participationFee?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper Components
const InfoItem = ({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string; 
  icon?: React.ReactNode 
}) => (
  <div className="flex items-start gap-3">
    {icon && (
      <div className="text-gray-400 mt-0.5">
        {icon}
      </div>
    )}
    <div className="flex-1">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const TimelineItem = ({ 
  date, 
  title, 
  isFirst = false, 
  isLast = false 
}: { 
  date: string; 
  title: string; 
  isFirst?: boolean; 
  isLast?: boolean; 
}) => (
  <div className="flex items-start gap-3">
    <div className="flex flex-col items-center">
      <div className={`w-2 h-2 rounded-full bg-blue-500 ${isFirst ? 'mt-2' : ''}`}></div>
      {!isLast && <div className="w-px h-full bg-gray-300 flex-1"></div>}
    </div>
    <div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
  </div>
);

const StatBox = ({ 
  label, 
  value, 
  color = "gray" 
}: { 
  label: string; 
  value?: string; 
  color?: string 
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  };

  return (
    <div className={`p-3 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-xs font-medium mb-1">{label}</p>
      <p className="font-semibold">{value || "N/A"}</p>
    </div>
  );
};
