import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/utils/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  FileText,
  Tag,
  Building,
  MapPin,
  CalendarDays,
  IndianRupee,
  Landmark,
  Wallet,
  Coins,
} from "lucide-react";
import { CopyNameButton } from "@/components/CopyNameButton";
import { CopyEstimateButton } from "@/components/CopyEstimateButton";
import { BoqToggleButton } from "@/components/BoqToggleButton";
import { UploadEstimateButton } from "@/components/UploadEstimateButton";

// Format amounts in Indian numbering system with the INR symbol (₹)
const formatINR = (amount?: number | null) =>
  `₹${(amount ?? 0).toLocaleString("en-IN")}`;

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
        orderBy: { workslno: "asc" }, // 👈 ensure works are sorted by their serial number
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

  const { tiedEstimate, untiedEstimate } = nit.WorksDetail.reduce(
    (acc, work) => {
      const fundType = (
        work.ApprovedActionPlanDetails?.fundType || ""
      ).toLowerCase();
      const amount = work.finalEstimateAmount || 0;
      if (fundType.includes("untied")) {
        acc.untiedEstimate += amount;
      } else if (fundType.includes("tied")) {
        acc.tiedEstimate += amount;
      }
      return acc;
    },
    { tiedEstimate: 0, untiedEstimate: 0 }
  );

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 p-6 md:p-8 mb-8 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 right-24 w-32 h-32 rounded-full bg-white/10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
              <FileText className="w-4 h-4" />
              NIT / Tender Details
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Memo No. {nit.memoNumber}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-white/90 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(nit.memoDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                {nit.nitCount}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {nit.nitMode}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-white/90 text-orange-700 hover:bg-white px-3 py-1.5 text-sm font-semibold border-0">
              {nit.isPublished ? "Published" : "Draft"}
            </Badge>
            <Badge className="bg-orange-900/25 text-white hover:bg-orange-900/35 px-3 py-1.5 text-sm font-semibold border border-white/30">
              {nit.isSupply ? "Supply" : "Works"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {nit.WorksDetail.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          <SummaryCard
            label="Total Works"
            value={nit.WorksDetail.length}
            icon={<Building className="w-5 h-5" />}
            color="orange"
          />
          <SummaryCard
            label="Total Estimate"
            value={formatINR(totalEstimate)}
            icon={<IndianRupee className="w-5 h-5" />}
            color="green"
          />
          <SummaryCard
            label="Participation Fee"
            value={formatINR(totalParticipation)}
            icon={<Tag className="w-5 h-5" />}
            color="purple"
          />
          <SummaryCard
            label="Tied Fund Amount"
            value={formatINR(tiedEstimate)}
            icon={<Landmark className="w-5 h-5" />}
            color="blue"
          />
          <SummaryCard
            label="Untied Fund Amount"
            value={formatINR(untiedEstimate)}
            icon={<Wallet className="w-5 h-5" />}
            color="amber"
          />
        </div>
      )}

      {/* Main NIT Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Basic Information Card */}
        <Card className="shadow-md border-gray-200 rounded-xl">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-orange-600">
                <CalendarDays className="w-4 h-4" />
              </span>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
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
        <Card className="shadow-md border-gray-200 rounded-xl">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
                <Clock className="w-4 h-4" />
              </span>
              Document Download Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-4">
              <InfoItem
                label="Available From"
                value={formatDateTime(nit.documentDownloadFrom)}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold mb-1">
                    Start Time
                  </p>
                  <p className="font-semibold text-orange-900">
                    {new Date(nit.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-green-600 font-semibold mb-1">
                    End Time
                  </p>
                  <p className="font-semibold text-green-900">
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
        <Card className="shadow-md border-gray-200 rounded-xl">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 text-purple-600">
                <Calendar className="w-4 h-4" />
              </span>
              Bid Opening Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
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
              <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Place of Opening
                </p>
                <p className="font-semibold text-gray-900">
                  {nit.placeOfOpeningBids}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Summary Card */}
        <Card className="shadow-md border-gray-200 rounded-xl">
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </span>
              Timeline Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
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
        <Card className="shadow-lg border-gray-200 rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="text-xl font-bold text-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100 text-orange-600">
                  <Building className="w-4 h-4" />
                </span>
                Work Details ({nit.WorksDetail.length})
              </span>
              <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Coins className="w-4 h-4 text-green-600" />
                Total Value:{" "}
                <span className="text-green-700 font-bold">
                  {formatINR(totalEstimate)}
                </span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 divide-y divide-gray-100">
                {nit.WorksDetail.map((work) => {
                  const actionPlan = work.ApprovedActionPlanDetails;
                  const workName = actionPlan?.activityName || "Unnamed Work";
                  const rawFundType = (
                    actionPlan?.fundType || ""
                  ).toLowerCase();
                  const fundTypeLabel = rawFundType.includes("untied")
                    ? "Untied"
                    : rawFundType.includes("tied")
                    ? "Tied"
                    : actionPlan?.fundType || "Unknown";
                  const isTied = fundTypeLabel === "Tied";

                  return (
                    <div
                      key={work.id}
                      className={`p-5 sm:p-6 transition-colors border-l-4 ${
                        work.boqPrepared
                          ? "bg-green-50/40 border-green-500"
                          : "border-transparent hover:bg-gray-50"
                      }`}
                    >
                      {/* Work Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-sm">
                          {work.workslno}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {actionPlan?.activityCode && (
                              <Badge variant="outline" className="font-medium">
                                {actionPlan.activityCode}
                              </Badge>
                            )}
                            <Badge variant="secondary">{work.tenderStatus}</Badge>
                            <Badge
                              variant="outline"
                              className={
                                isTied
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-amber-100 text-amber-800 border-amber-200"
                              }
                            >
                              {fundTypeLabel} Fund
                            </Badge>
                            {work.boqPrepared && (
                              <Badge
                                variant="success"
                                className="bg-green-100 text-green-800"
                              >
                                BOQ Ready
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {workName}
                          </h3>
                          {actionPlan?.activityDescription && (
                            <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                              {actionPlan.activityDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Full Detail Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                        <DetailItem
                          label="Theme"
                          value={actionPlan?.themeName}
                        />
                        <DetailItem
                          label="Financial Year"
                          value={actionPlan?.financialYear}
                        />
                        <DetailItem
                          label="Sector"
                          value={actionPlan?.sector}
                        />
                        <DetailItem
                          label="Scheme"
                          value={actionPlan?.schemeName}
                        />
                        <DetailItem
                          label="Activity For"
                          value={actionPlan?.activityFor}
                        />
                        <DetailItem
                          label="Location"
                          value={actionPlan?.locationofAsset}
                        />
                        <DetailItem
                          label="Duration"
                          value={actionPlan?.totalduration}
                        />
                        <DetailItem
                          label="Unit"
                          value={
                            actionPlan?.totalUnit
                              ? `${actionPlan.totalUnit} ${
                                  actionPlan.unitType ?? ""
                                }`.trim()
                              : undefined
                          }
                        />
                      </div>

                      {/* Amount Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <AmountBox
                          label="Estimate Cost"
                          value={work.finalEstimateAmount}
                          accent="green"
                        />
                        <AmountBox
                          label="Participation Fee"
                          value={work.participationFee}
                          accent="purple"
                        />
                        <AmountBox
                          label="Earnest Money (EMD)"
                          value={work.earnestMoneyFee}
                          accent="blue"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                        <CopyNameButton workName={workName} />
                        <CopyEstimateButton
                          estimateAmount={work.finalEstimateAmount || 0}
                        />
                        <UploadEstimateButton
                          workId={work.id}
                          initialEstimateDocument={work.estimateDocument}
                        />
                        <BoqToggleButton
                          workId={work.id}
                          initialBoqPrepared={work.boqPrepared || false}
                        />
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
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    {icon && (
      <div className="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
        {icon}
      </div>
    )}
    <div className="flex-1">
      <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
        {label}
      </p>
      <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  </div>
);

const TimelineItem = ({
  date,
  title,
  isFirst = false,
  isLast = false,
}: {
  date: string;
  title: string;
  isFirst?: boolean;
  isLast?: boolean;
}) => (
  <div className="flex items-start gap-3">
    <div className="flex flex-col items-center">
      <div
        className={`w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-100 ${
          isFirst ? "mt-2" : ""
        }`}
      ></div>
      {!isLast && <div className="w-px h-full bg-gray-200 flex-1"></div>}
    </div>
    <div className="pb-1">
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-500">{date}</p>
    </div>
  </div>
);

const SummaryCard = ({
  label,
  value,
  icon,
  color = "orange",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "orange" | "green" | "purple" | "blue" | "amber";
}) => {
  const styles = {
    orange: {
      card: "from-orange-50 to-orange-100 border-orange-200",
      label: "text-orange-700",
      value: "text-orange-900",
      iconBg: "bg-orange-200/60 text-orange-700",
    },
    green: {
      card: "from-green-50 to-green-100 border-green-200",
      label: "text-green-700",
      value: "text-green-900",
      iconBg: "bg-green-200/60 text-green-700",
    },
    purple: {
      card: "from-purple-50 to-purple-100 border-purple-200",
      label: "text-purple-700",
      value: "text-purple-900",
      iconBg: "bg-purple-200/60 text-purple-700",
    },
    blue: {
      card: "from-blue-50 to-blue-100 border-blue-200",
      label: "text-blue-700",
      value: "text-blue-900",
      iconBg: "bg-blue-200/60 text-blue-700",
    },
    amber: {
      card: "from-amber-50 to-amber-100 border-amber-200",
      label: "text-amber-700",
      value: "text-amber-900",
      iconBg: "bg-amber-200/60 text-amber-700",
    },
  }[color];

  return (
    <Card
      className={`border bg-gradient-to-br shadow-sm hover:shadow-md transition-shadow ${styles.card}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-xs sm:text-sm font-medium mb-1 ${styles.label}`}>
              {label}
            </p>
            <p className={`text-xl sm:text-2xl font-bold truncate ${styles.value}`}>
              {value}
            </p>
          </div>
          <div className={`p-2.5 rounded-xl shrink-0 ${styles.iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => (
  <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
    <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold mb-0.5">
      {label}
    </p>
    <p className="text-sm font-semibold text-gray-800 break-words">
      {value || "N/A"}
    </p>
  </div>
);

const AmountBox = ({
  label,
  value,
  accent,
}: {
  label: string;
  value?: number | null;
  accent: "green" | "purple" | "blue";
}) => {
  const styles = {
    green: "bg-green-50 border-green-200 text-green-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
  }[accent];

  return (
    <div className={`rounded-lg border px-3 py-2.5 ${styles}`}>
      <p className="text-[11px] uppercase tracking-wide font-semibold opacity-80 mb-0.5">
        {label}
      </p>
      <p className="text-base sm:text-lg font-bold flex items-center gap-0.5">
        <IndianRupee className="w-4 h-4" />
        {(value ?? 0).toLocaleString("en-IN")}
      </p>
    </div>
  );
};
