"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import {
  Building,
  FileText,
  AlertCircle,
  FileCheck,
  Shield,
  Receipt,
  Info,
  ChevronsUpDown,
  Calendar,
  FileDigit,
  Banknote,
  Clock,
  CheckCircle,
  Download,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { gpcode } from "@/constants/gpinfor";
import PrintPrayerDocument from "./PrintPrayerDocument";

/* ================= TYPES ================= */

type WorkDetail = {
  id: string;
  workslno: number;
  completionDate: Date | null;
  finalEstimateAmount: number;
  workStatus?: string | null;
  paymentDetails: Array<{
    securityDeposit: {
      securityDepositAmt: number;
      paymentstatus?: string | null;
    } | null;
  }>;
  nitDetails: {
    memoNumber: number;
    memoDate: Date | string;
  };
  ApprovedActionPlanDetails: {
    activityDescription: string;
    activityCode: string;
  };
  AwardofContract: {
    workodermenonumber: string | null;
    workordeermemodate: Date | string | null;
    workorderdetails: Array<{
      Bidagency: {
        agencydetails: {
          name: string;
          contactDetails: string | null;
        } | null;
      } | null;
    }>;
  } | null;
};

type PrayerType =
  | "BILL_PRAYER"
  | "EMD_REFUND"
  | "SECURITY_MONEY_RELEASE"
  | "OTHER_PRAYER";

const PRAYER_TYPES = [
  {
    value: "BILL_PRAYER",
    label: "Bill Payment Prayer",
    icon: Receipt,
    description: "Generate prayer for bill payment processing",
    color: "bg-blue-500",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    value: "SECURITY_MONEY_RELEASE",
    label: "Security Money Release",
    icon: Shield,
    description: "Generate prayer for security deposit release",
    color: "bg-emerald-500",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    value: "EMD_REFUND",
    label: "EMD Refund Request",
    icon: FileCheck,
    description: "Generate prayer for earnest money deposit refund",
    color: "bg-amber-500",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    value: "OTHER_PRAYER",
    label: "Other Prayer Types",
    icon: FileText,
    description: "Additional prayer templates coming soon",
    color: "bg-slate-500",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
    disabled: true,
  },
];

interface PrintPrayerClientProps {
  worklist: WorkDetail[];
  groupedByAgency: Record<string, WorkDetail[]>;
  agencyNames: string[];
}

/* ================= UTILITIES ================= */

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

/* ================= COMPONENT ================= */

export default function PrintPrayerClient({
  groupedByAgency,
  agencyNames,
}: PrintPrayerClientProps) {
  const [selectedPrayerType, setSelectedPrayerType] =
    useState<PrayerType>("BILL_PRAYER");
  const [selectedAgency, setSelectedAgency] = useState("");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("works");

  const selectedWorks = selectedAgency
    ? groupedByAgency[selectedAgency] || []
    : [];

  let filteredWorks = selectedWorks;

  if (selectedPrayerType === "BILL_PRAYER") {
    // Exclude works whose bills are already paid
    filteredWorks = filteredWorks.filter(
      (work) => work.workStatus
    );
  }

  if (selectedPrayerType === "SECURITY_MONEY_RELEASE") {
    // Exclude works where security deposit has already been paid/released
    filteredWorks = filteredWorks.filter(
      (work) =>
        work.paymentDetails[0]?.securityDeposit?.paymentstatus !== "paid"
    );
  }

  const totalWorksCount = filteredWorks.length;
  const eligibleWorksCount = filteredWorks.filter(
    (work) =>
      work.AwardofContract?.workorderdetails?.[0]?.Bidagency?.agencydetails
  ).length;

  const isPrayerTypeAvailable =
    selectedPrayerType === "BILL_PRAYER" ||
    selectedPrayerType === "SECURITY_MONEY_RELEASE" ||
    selectedPrayerType === "EMD_REFUND";

  const selectedPrayerTypeData = PRAYER_TYPES.find(
    (type) => type.value === selectedPrayerType
  );

  /* ================= RENDER ================= */

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* HEADER SECTION */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Prayer Document Generator
            </h1>
            <p className="text-slate-600 mt-2">
              Generate formal prayer documents for contract management processes
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            <FileDigit className="h-3.5 w-3.5 mr-1.5" />
            {agencyNames.length} Contractors
          </Badge>
        </div>
        <Separator />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDEBAR - CONTROLS */}
        <div className="lg:col-span-1 space-y-6">
          {/* PRAYER TYPE SELECTION CARD */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Document Type
              </CardTitle>
              <CardDescription>
                Select the type of prayer document to generate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium text-slate-700">
                  Prayer Category
                </Label>
                <Select
                  value={selectedPrayerType}
                  onValueChange={(v) => setSelectedPrayerType(v as PrayerType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select prayer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRAYER_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          disabled={type.disabled}
                          className="py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-md ${type.color} bg-opacity-10`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">
                                {type.label}
                              </p>
                              <p className="text-xs text-slate-500">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* PRAYER TYPE BADGE */}
              {selectedPrayerTypeData && (
                <div
                  className={`p-3 rounded-lg ${selectedPrayerTypeData.badgeColor} border`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded ${selectedPrayerTypeData.color} bg-opacity-20`}
                    >
                      {selectedPrayerTypeData.icon && (
                        <selectedPrayerTypeData.icon className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedPrayerTypeData.label}
                      </p>
                      <p className="text-xs opacity-90">
                        {selectedPrayerTypeData.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CONTRACTOR SELECTION CARD */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5 text-emerald-600" />
                Contractor Selection
              </CardTitle>
              <CardDescription>
                Choose a contractor to view their awarded works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium text-slate-700">
                  Select Contractor
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-11"
                      disabled={!isPrayerTypeAvailable}
                    >
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-slate-500" />
                        <span
                          className={
                            selectedAgency ? "font-medium" : "text-slate-500"
                          }
                        >
                          {selectedAgency || "Choose contractor..."}
                        </span>
                      </div>
                      <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search contractor..." />
                      <CommandList className="max-h-60">
                        <CommandEmpty className="py-6 text-center text-slate-500">
                          No contractor found
                        </CommandEmpty>
                        <CommandGroup>
                          {agencyNames.map((agency) => (
                            <CommandItem
                              key={agency}
                              value={agency}
                              onSelect={() => {
                                setSelectedAgency(agency);
                                setOpen(false);
                              }}
                              className="py-3"
                            >
                              <Building className="mr-3 h-4 w-4 text-slate-400" />
                              <span className="font-medium">{agency}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* STATS */}
              {selectedAgency && (
                <div className="space-y-3">
                  <Separator />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 font-medium">
                        Total Works
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {totalWorksCount}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">
                        Eligible
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {eligibleWorksCount}
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(eligibleWorksCount / totalWorksCount) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-slate-500 text-center">
                    {Math.round((eligibleWorksCount / totalWorksCount) * 100)}%
                    works are eligible
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QUICK ACTIONS */}
          {selectedAgency && isPrayerTypeAvailable && (
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5 text-violet-600" />
                  Batch Actions
                </CardTitle>
                <CardDescription>
                  Generate documents for multiple works
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={eligibleWorksCount === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate All Eligible ({eligibleWorksCount})
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-2">
          {/* EMPTY STATE */}
          {!selectedAgency && isPrayerTypeAvailable && (
            <Card className="border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Building className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No Contractor Selected
              </h3>
              <p className="text-slate-500 text-center max-w-sm mb-6">
                Please select a contractor from the sidebar to view their
                awarded works and generate prayer documents.
              </p>
              <Badge variant="outline" className="text-sm">
                {agencyNames.length} contractors available
              </Badge>
            </Card>
          )}

          {/* SELECTED PRAYER NOT AVAILABLE */}
          {selectedAgency && !isPrayerTypeAvailable && (
            <Card className="border-2 border-dashed border-amber-200 bg-amber-50/50 h-full flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-amber-700 mb-2">
                Prayer Type Unavailable
              </h3>
              <p className="text-amber-600 text-center max-w-sm mb-6">
                The selected prayer type is currently under development and will
                be available soon.
              </p>
              <Button
                variant="outline"
                onClick={() => setSelectedPrayerType("BILL_PRAYER")}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                Switch to Bill Prayer
              </Button>
            </Card>
          )}

          {/* WORKS TABLE */}
          {selectedAgency && isPrayerTypeAvailable && (
            <Card className="border shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-300" />
                      Awarded Works
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      {selectedAgency} • {filteredWorks.length} works
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm font-medium">
                    {selectedPrayerTypeData?.label}
                  </Badge>
                </div>
              </CardHeader>

              <Tabs
                defaultValue="works"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="px-6 pt-4">
                  <TabsList className="grid grid-cols-2 w-64">
                    <TabsTrigger value="works" className="text-sm">
                      <FileDigit className="h-3.5 w-3.5 mr-2" />
                      Works List
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="text-sm">
                      <Banknote className="h-3.5 w-3.5 mr-2" />
                      Summary
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="works" className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="w-12 text-center">#</TableHead>
                          <TableHead className="min-w-[300px]">
                            Work Description
                          </TableHead>
                          <TableHead>NIT Details</TableHead>
                          <TableHead>Work Order</TableHead>
                          {selectedPrayerType === "SECURITY_MONEY_RELEASE" && (
                            <>
                              <TableHead>Completion</TableHead>
                              <TableHead>Security Amt</TableHead>
                            </>
                          )}
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWorks.map((work, i) => {
                          const nitDate = new Date(work.nitDetails.memoDate);
                          const woDate = work.AwardofContract
                            ?.workordeermemodate
                            ? new Date(work.AwardofContract.workordeermemodate)
                            : null;

                          const agency =
                            work.AwardofContract?.workorderdetails?.[0]
                              ?.Bidagency?.agencydetails;

                          const emdAmount = Math.round(
                            (work.finalEstimateAmount * 2) / 100
                          );

                          const isEligible = agency && woDate;

                          return (
                            <TableRow
                              key={work.id}
                              className={`
                                ${!isEligible ? "opacity-60" : ""}
                                hover:bg-slate-50 transition-colors
                              `}
                            >
                              <TableCell className="font-medium text-center">
                                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-sm">
                                  {i + 1}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div>
                                  <p className="font-medium text-slate-900 line-clamp-2">
                                    {`${work.ApprovedActionPlanDetails.activityDescription} -${work.ApprovedActionPlanDetails.activityCode}`}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-normal"
                                    >
                                      SL: {work.workslno}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs font-normal"
                                    >
                                      <Banknote className="h-3 w-3 mr-1" />
                                      {formatCurrency(work.finalEstimateAmount)}
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <ShowNitDetails
                                  nitdetails={work.nitDetails.memoNumber}
                                  memoDate={nitDate}
                                  workslno={work.workslno}
                                />
                              </TableCell>

                              <TableCell>
                                {woDate ? (
                                  <div className="space-y-1">
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
                                      {work.AwardofContract?.workodermenonumber}
                                      /{gpcode}/{woDate.getFullYear()}
                                    </Badge>
                                    <p className="text-xs text-slate-500">
                                      {formatDate(woDate)}
                                    </p>
                                  </div>
                                ) : (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Missing
                                  </Badge>
                                )}
                              </TableCell>

                              {selectedPrayerType ===
                                "SECURITY_MONEY_RELEASE" && (
                                <>
                                  <TableCell>
                                    {work.completionDate ? (
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                                        <span className="text-sm font-medium">
                                          {formatDate(
                                            new Date(work.completionDate)
                                          )}
                                        </span>
                                      </div>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        <Clock className="h-3 w-3 mr-1" />
                                        Pending
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {work.paymentDetails[0]?.securityDeposit
                                      ?.securityDepositAmt ? (
                                      <div className="font-medium">
                                        {formatCurrency(
                                          work.paymentDetails[0].securityDeposit
                                            .securityDepositAmt
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 text-sm">
                                        N/A
                                      </span>
                                    )}
                                  </TableCell>
                                </>
                              )}

                              <TableCell className="text-center">
                                {isEligible ? (
                                  <PrintPrayerDocument
                                    completionDate={
                                      selectedPrayerType === "BILL_PRAYER"
                                        ? null
                                        : work.completionDate
                                    }
                                    securityDepositAmount={
                                      selectedPrayerType ===
                                      "SECURITY_MONEY_RELEASE"
                                        ? work.paymentDetails[0]?.securityDeposit
                                            ?.securityDepositAmt ?? null
                                        : null
                                    }
                                    emdAmount={emdAmount}
                                    prayerType={selectedPrayerType}
                                    workName={
                                      work.ApprovedActionPlanDetails
                                        .activityDescription
                                    }
                                    activityCode={
                                      work.ApprovedActionPlanDetails
                                        .activityCode
                                    }
                                    nitNumber={`${
                                      work.nitDetails.memoNumber
                                    }/DGP/${nitDate.getFullYear()}`}
                                    nitDate={nitDate}
                                    workSlNo={work.workslno.toString()}
                                    contractorName={agency.name}
                                    contractorAddress={
                                      agency.contactDetails || ""
                                    }
                                    workOrderNumber={`${
                                      work.AwardofContract?.workodermenonumber
                                    }/${gpcode}/${woDate.getFullYear()}`}
                                    workOrderDate={woDate}
                                  />
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs cursor-not-allowed"
                                  >
                                    Incomplete Data
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="summary" className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Receipt className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Total Works
                            </p>
                            <p className="text-2xl font-bold">
                              {filteredWorks.length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Eligible for {selectedPrayerTypeData?.label}
                            </p>
                            <p className="text-2xl font-bold text-emerald-700">
                              {eligibleWorksCount}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* TABLE FOOTER */}
              <div className="border-t px-6 py-3 bg-slate-50">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>{eligibleWorksCount} eligible works</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                      <span>
                        {filteredWorks.length - eligibleWorksCount} with
                        incomplete data
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-3.5 w-3.5" />
                    <span>Ready to generate</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* FOOTER NOTES */}
      <div className="text-center text-sm text-slate-500 pt-4 border-t">
        <p>
          Prayer documents are generated in PDF format. Ensure all required
          information is complete before generation.
        </p>
        <p className="mt-1 text-xs">
          For assistance, contact the contract management department.
        </p>
      </div>
    </div>
  );
}
