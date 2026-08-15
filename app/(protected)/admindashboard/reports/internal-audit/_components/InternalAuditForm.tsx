"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, ArrowLeft, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { saveInternalAuditReport, fetchProcurementFromPayments } from "@/action/internal-audit-actions";
import { InternalAuditReportInput } from "@/schema/internal-audit";

interface InternalAuditFormProps {
  initialData?: any;
  reportId?: string;
}

export default function InternalAuditForm({ initialData, reportId }: InternalAuditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingProcurement, setFetchingProcurement] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const defaultValues: InternalAuditReportInput = {
    reportNo: initialData?.reportNo || `IA/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000)}`,
    financialYear: initialData?.financialYear || "2024-2025",
    quarter: initialData?.quarter || "Q1",
    gpName: initialData?.gpName || "Dhalpara Gram Panchayat",
    blockAndDistrict: initialData?.blockAndDistrict || "Hilli, Dakshin Dinajpur",
    riskCategory: initialData?.riskCategory || "Low",
    gpAddressAndPhone: initialData?.gpAddressAndPhone || "Vill & P.O - Dhalpara, P.S - Hilli, Dist - Dakshin Dinajpur, Mob: 9733230635",
    auditPartyMembers: initialData?.auditPartyMembers || "",
    auditPartyContact: initialData?.auditPartyContact || "",
    auditPartyEmail: initialData?.auditPartyEmail || "",
    auditPeriod: initialData?.auditPeriod || "1st Quarter (Apr-Jun)",
    auditDuration: initialData?.auditDuration || "5 Days",
    totalFindings: initialData?.totalFindings || 0,

    pastObservations: initialData?.pastObservations || [
      { type: "Financial- High", totalFindings: 0, findingsResolved: 0, findingsPending: 0 },
      { type: "Procedural- High", totalFindings: 0, findingsResolved: 0, findingsPending: 0 },
      { type: "Procedural- Low", totalFindings: 0, findingsResolved: 0, findingsPending: 0 },
      { type: "Documentary- High", totalFindings: 0, findingsResolved: 0, findingsPending: 0 },
      { type: "Documentary-Low", totalFindings: 0, findingsResolved: 0, findingsPending: 0 },
    ],

    pendingCompliances: initialData?.pendingCompliances || [
      { slNo: 1, reportNoAndYear: "", findingNo: "", description: "", type: "Financial", importance: "High", amount: "0", actionToBeTaken: "" }
    ],

    reportSummaries: initialData?.reportSummaries || [
      { findingNo: "1", area: "Procurement", title: "", type: "Financial", importance: "High", amount: "0" }
    ],

    observations: initialData?.observations || [
      { findingNo: "1", type: "Financial finding", title: "", area: "Procurement", importance: "High", description: "", correctiveAction: "", gpResponse: "" }
    ],

    gpMembersCount: initialData?.gpMembersCount || {
      maleElected: 0,
      femaleElected: 0,
      maleExOfficio: 0,
      femaleExOfficio: 0,
    },

    upaSamitiDetails: initialData?.upaSamitiDetails || [
      { name: "Artha O Parikalpana", directMembers: 0, designatedMembers: 0, sanchalakName: "", meetingsHeld: 0 },
      { name: "Krishi O Pranisampad Bikas", directMembers: 0, designatedMembers: 0, sanchalakName: "", meetingsHeld: 0 },
      { name: "Siksha O Janasasthya", directMembers: 0, designatedMembers: 0, sanchalakName: "", meetingsHeld: 0 },
      { name: "Nari, Sishu Unnayan O Samaj Kalyan", directMembers: 0, designatedMembers: 0, sanchalakName: "", meetingsHeld: 0 },
      { name: "Shilpa O Parikathama", directMembers: 0, designatedMembers: 0, sanchalakName: "", meetingsHeld: 0 },
    ],

    gpStaffDetails: initialData?.gpStaffDetails || [
      { designation: "Executive Assistant", maleName: "", femaleName: "", salary: "" },
      { designation: "Secretary", maleName: "", femaleName: "", salary: "" },
      { designation: "Nirman Sahayak", maleName: "", femaleName: "", salary: "" },
      { designation: "Sahayak (1)", maleName: "", femaleName: "", salary: "" },
      { designation: "Sahayak (2)", maleName: "", femaleName: "", salary: "" },
      { designation: "Gram Panchayat Karmee (2 Nos)", maleName: "", femaleName: "", salary: "" },
    ],

    fundUsage: initialData?.fundUsage || { tiedFund: 0, untiedFund: 0, amountUtilised: 0, percentageUtilised: 0 },

    procurementList: initialData?.procurementList || [
      { slNo: 1, fund: "15th FC", nitNo: "", nitDate: "", activityName: "", typeOfProcurement: "Works", typeOfWork: "Roads", estimatedValue: 0, contractValue: 0, contractDate: "", billValue: 0, planPlusValue: 0, sample: "N" }
    ],

    otherExpenditureList: initialData?.otherExpenditureList || [],

    propertyTaxOSR: initialData?.propertyTaxOSR || {
      noOfAssesses: 0, arrears: 0, currentYearDemand: 0, totalReceivable: 0, arrearsCollected: 0, cyDemandCollected: 0, totalCollection: 0, pendingAmount: 0
    },

    tradeLicenceOSR: initialData?.tradeLicenceOSR || {
      noOfAssesses: 0, arrears: 0, currentYearDemand: 0, totalReceivable: 0, arrearsCollected: 0, cyDemandCollected: 0, totalCollection: 0, pendingAmount: 0
    },

    otherInfoStats: initialData?.otherInfoStats || {
      totalPopulation: 0, deathCertificatesIssued: 0, birthCertificatesIssued: 0, tradeLicencesIssued: 0
    },

    auditorDesignation: initialData?.auditorDesignation || "Internal Audit Officer",
    auditorOfficeAddress: initialData?.auditorOfficeAddress || "Office of the BDO, Hilli",
    status: initialData?.status || "Draft",
  };

  const [formData, setFormData] = useState<InternalAuditReportInput>(defaultValues);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  // Property Tax calculations helper
  const updatePropertyTax = (field: string, val: number) => {
    setFormData((prev: any) => {
      const pTax = { ...prev.propertyTaxOSR, [field]: val };
      const totalReceivable = Number(pTax.arrears || 0) + Number(pTax.currentYearDemand || 0);
      const totalCollection = Number(pTax.arrearsCollected || 0) + Number(pTax.cyDemandCollected || 0);
      const pendingAmount = totalReceivable - totalCollection;
      return {
        ...prev,
        propertyTaxOSR: { ...pTax, totalReceivable, totalCollection, pendingAmount },
      };
    });
  };

  // Trade Licence Tax calculations helper
  const updateTradeLicence = (field: string, val: number) => {
    setFormData((prev: any) => {
      const tLic = { ...prev.tradeLicenceOSR, [field]: val };
      const totalReceivable = Number(tLic.arrears || 0) + Number(tLic.currentYearDemand || 0);
      const totalCollection = Number(tLic.arrearsCollected || 0) + Number(tLic.cyDemandCollected || 0);
      const pendingAmount = totalReceivable - totalCollection;
      return {
        ...prev,
        tradeLicenceOSR: { ...tLic, totalReceivable, totalCollection, pendingAmount },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await saveInternalAuditReport(formData, reportId);
      if (res.success && res.data) {
        setSuccessMessage("Internal Audit Report saved successfully!");
        setTimeout(() => {
          router.push(`/admindashboard/reports/internal-audit/${res.data.id}`);
        }, 1000);
      } else {
        setErrorMessage(res.error || "Failed to save report.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admindashboard/reports/internal-audit")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {reportId ? "Edit Internal Audit Report" : "Prepare Quarterly Internal Audit Report"}
            </h2>
            <p className="text-xs text-gray-500">Annexure 7 Standard Format</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={formData.status}
            onValueChange={(val) => handleInputChange("status", val)}
          >
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Finalized">Finalized</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save & Print Preview
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          {successMessage}
        </div>
      )}

      {/* Multi-Tab Form */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-5 w-full bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="general">1. General Info</TabsTrigger>
          <TabsTrigger value="pastObs">2. Past Observations & Compliance</TabsTrigger>
          <TabsTrigger value="observations">3. Observations & Summary</TabsTrigger>
          <TabsTrigger value="gpDetails">4. GP Staff & Samiti</TabsTrigger>
          <TabsTrigger value="financials">5. Procurement & Revenue</TabsTrigger>
        </TabsList>

        {/* TAB 1: General Info */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Part I: Auditee, Auditor & Audit Profile</CardTitle>
              <CardDescription>Basic quarterly identification metadata</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700">Report No.*</label>
                <Input
                  value={formData.reportNo}
                  onChange={(e) => handleInputChange("reportNo", e.target.value)}
                  placeholder="e.g. IA/2024-25/Q1/01"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Financial Year*</label>
                <Select
                  value={formData.financialYear}
                  onValueChange={(val) => handleInputChange("financialYear", val)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-2024">2023-2024</SelectItem>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                    <SelectItem value="2026-2027">2026-2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Quarter*</label>
                <Select
                  value={formData.quarter}
                  onValueChange={(val) => handleInputChange("quarter", val)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1 (1st Quarter: Apr - Jun)</SelectItem>
                    <SelectItem value="Q2">Q2 (2nd Quarter: Jul - Sep)</SelectItem>
                    <SelectItem value="Q3">Q3 (3rd Quarter: Oct - Dec)</SelectItem>
                    <SelectItem value="Q4">Q4 (4th Quarter: Jan - Mar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Gram Panchayat Name</label>
                <Input
                  value={formData.gpName}
                  onChange={(e) => handleInputChange("gpName", e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Block & District</label>
                <Input
                  value={formData.blockAndDistrict}
                  onChange={(e) => handleInputChange("blockAndDistrict", e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Risk Category of GP</label>
                <Select
                  value={formData.riskCategory}
                  onValueChange={(val) => handleInputChange("riskCategory", val)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-gray-700">Address & Telephone No. of GP</label>
                <Input
                  value={formData.gpAddressAndPhone}
                  onChange={(e) => handleInputChange("gpAddressAndPhone", e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Audit Party Members</label>
                <Input
                  value={formData.auditPartyMembers}
                  onChange={(e) => handleInputChange("auditPartyMembers", e.target.value)}
                  placeholder="Names of auditors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Auditor Contact No.</label>
                <Input
                  value={formData.auditPartyContact}
                  onChange={(e) => handleInputChange("auditPartyContact", e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Auditor Email ID</label>
                <Input
                  value={formData.auditPartyEmail}
                  onChange={(e) => handleInputChange("auditPartyEmail", e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Audit Period</label>
                <Input
                  value={formData.auditPeriod}
                  onChange={(e) => handleInputChange("auditPeriod", e.target.value)}
                  placeholder="e.g. 1st April 2024 to 30th June 2024"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Duration of Audit</label>
                <Input
                  value={formData.auditDuration}
                  onChange={(e) => handleInputChange("auditDuration", e.target.value)}
                  placeholder="e.g. 5 Days"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Total Findings Count</label>
                <Input
                  type="number"
                  value={formData.totalFindings}
                  onChange={(e) => handleInputChange("totalFindings", Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: Past Observations & Compliance */}
        <TabsContent value="pastObs" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Part II: Summary of Past Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.pastObservations.map((obs: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-4 gap-4 items-center bg-gray-50 p-3 rounded-lg border">
                    <span className="font-semibold text-xs text-gray-700">{obs.type}</span>
                    <div>
                      <label className="text-[10px] text-gray-500">Total Findings</label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={obs.totalFindings}
                        onChange={(e) => {
                          const updated = [...formData.pastObservations];
                          updated[idx].totalFindings = Number(e.target.value);
                          handleInputChange("pastObservations", updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Resolved</label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={obs.findingsResolved}
                        onChange={(e) => {
                          const updated = [...formData.pastObservations];
                          updated[idx].findingsResolved = Number(e.target.value);
                          handleInputChange("pastObservations", updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Pending</label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={obs.findingsPending}
                        onChange={(e) => {
                          const updated = [...formData.pastObservations];
                          updated[idx].findingsPending = Number(e.target.value);
                          handleInputChange("pastObservations", updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Part III: Pending Internal and ELA Audit Compliance</CardTitle>
                <CardDescription>Track unresolved findings from previous audits</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  handleInputChange("pendingCompliances", [
                    ...formData.pendingCompliances,
                    { slNo: formData.pendingCompliances.length + 1, reportNoAndYear: "", findingNo: "", description: "", type: "Financial", importance: "High", amount: "0", actionToBeTaken: "" }
                  ]);
                }}
              >
                <Plus className="h-4 w-4" /> Add Compliance Row
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.pendingCompliances.map((item: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-xl bg-white space-y-3 relative">
                  <button
                    type="button"
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                    onClick={() => {
                      const updated = formData.pendingCompliances.filter((_: any, i: number) => i !== idx);
                      handleInputChange("pendingCompliances", updated);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold">Report No & Year</label>
                      <Input
                        className="h-8 text-xs"
                        value={item.reportNoAndYear}
                        onChange={(e) => {
                          const updated = [...formData.pendingCompliances];
                          updated[idx].reportNoAndYear = e.target.value;
                          handleInputChange("pendingCompliances", updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold">Finding No.</label>
                      <Input
                        className="h-8 text-xs"
                        value={item.findingNo}
                        onChange={(e) => {
                          const updated = [...formData.pendingCompliances];
                          updated[idx].findingNo = e.target.value;
                          handleInputChange("pendingCompliances", updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold">Type</label>
                      <Input
                        className="h-8 text-xs"
                        value={item.type}
                        onChange={(e) => {
                          const updated = [...formData.pendingCompliances];
                          updated[idx].type = e.target.value;
                          handleInputChange("pendingCompliances", updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold">Amount (Rs.)</label>
                      <Input
                        className="h-8 text-xs"
                        value={item.amount}
                        onChange={(e) => {
                          const updated = [...formData.pendingCompliances];
                          updated[idx].amount = e.target.value;
                          handleInputChange("pendingCompliances", updated);
                        }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-semibold">Brief Description</label>
                      <Input
                        className="h-8 text-xs"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...formData.pendingCompliances];
                          updated[idx].description = e.target.value;
                          handleInputChange("pendingCompliances", updated);
                        }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-semibold">Action to be taken</label>
                      <Input
                        className="h-8 text-xs"
                        value={item.actionToBeTaken}
                        onChange={(e) => {
                          const updated = [...formData.pendingCompliances];
                          updated[idx].actionToBeTaken = e.target.value;
                          handleInputChange("pendingCompliances", updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Observations & Summary */}
        <TabsContent value="observations" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Part IV: Report Summary Form</CardTitle>
                <CardDescription>High-level audit findings log</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleInputChange("reportSummaries", [
                    ...formData.reportSummaries,
                    { findingNo: `${formData.reportSummaries.length + 1}`, area: "Procurement", title: "", type: "Financial", importance: "High", amount: "0" }
                  ]);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Summary Row
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.reportSummaries.map((item: any, idx: number) => (
                <div key={idx} className="grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded-lg border items-center">
                  <Input
                    placeholder="Finding No"
                    className="h-8 text-xs"
                    value={item.findingNo}
                    onChange={(e) => {
                      const updated = [...formData.reportSummaries];
                      updated[idx].findingNo = e.target.value;
                      handleInputChange("reportSummaries", updated);
                    }}
                  />
                  <Input
                    placeholder="Area (e.g. BOA)"
                    className="h-8 text-xs"
                    value={item.area}
                    onChange={(e) => {
                      const updated = [...formData.reportSummaries];
                      updated[idx].area = e.target.value;
                      handleInputChange("reportSummaries", updated);
                    }}
                  />
                  <Input
                    placeholder="Title"
                    className="h-8 text-xs col-span-2"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...formData.reportSummaries];
                      updated[idx].title = e.target.value;
                      handleInputChange("reportSummaries", updated);
                    }}
                  />
                  <Input
                    placeholder="Amount"
                    className="h-8 text-xs"
                    value={item.amount}
                    onChange={(e) => {
                      const updated = [...formData.reportSummaries];
                      updated[idx].amount = e.target.value;
                      handleInputChange("reportSummaries", updated);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => {
                      const updated = formData.reportSummaries.filter((_: any, i: number) => i !== idx);
                      handleInputChange("reportSummaries", updated);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Part V: Detailed Observations</CardTitle>
                <CardDescription>Record financial, procedural, and documentary findings</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleInputChange("observations", [
                    ...formData.observations,
                    { findingNo: `${formData.observations.length + 1}`, type: "Financial finding", title: "", area: "Procurement", importance: "High", description: "", correctiveAction: "", gpResponse: "" }
                  ]);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Observation Finding
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.observations.map((obs: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-xl bg-white space-y-3 relative">
                  <button
                    type="button"
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                    onClick={() => {
                      const updated = formData.observations.filter((_: any, i: number) => i !== idx);
                      handleInputChange("observations", updated);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold">Category Type</label>
                      <Select
                        value={obs.type}
                        onValueChange={(val) => {
                          const updated = [...formData.observations];
                          updated[idx].type = val;
                          handleInputChange("observations", updated);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Financial finding">Financial finding</SelectItem>
                          <SelectItem value="Procedural finding">Procedural finding</SelectItem>
                          <SelectItem value="Documentary finding">Documentary finding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold">Finding No.</label>
                      <Input
                        className="h-8 text-xs"
                        value={obs.findingNo}
                        onChange={(e) => {
                          const updated = [...formData.observations];
                          updated[idx].findingNo = e.target.value;
                          handleInputChange("observations", updated);
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold">Area</label>
                      <Input
                        className="h-8 text-xs"
                        value={obs.area}
                        onChange={(e) => {
                          const updated = [...formData.observations];
                          updated[idx].area = e.target.value;
                          handleInputChange("observations", updated);
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold">Importance</label>
                      <Select
                        value={obs.importance}
                        onValueChange={(val) => {
                          const updated = [...formData.observations];
                          updated[idx].importance = val;
                          handleInputChange("observations", updated);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[10px] font-semibold">Title</label>
                      <Input
                        className="h-8 text-xs"
                        value={obs.title}
                        onChange={(e) => {
                          const updated = [...formData.observations];
                          updated[idx].title = e.target.value;
                          handleInputChange("observations", updated);
                        }}
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-[10px] font-semibold">Description of Finding</label>
                      <Textarea
                        rows={2}
                        className="text-xs"
                        value={obs.description}
                        onChange={(e) => {
                          const updated = [...formData.observations];
                          updated[idx].description = e.target.value;
                          handleInputChange("observations", updated);
                        }}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-semibold">Corrective Action to be Taken</label>
                      <Textarea
                        rows={2}
                        className="text-xs"
                        value={obs.correctiveAction}
                        onChange={(e) => {
                          const updated = [...formData.observations];
                          updated[idx].correctiveAction = e.target.value;
                          handleInputChange("observations", updated);
                        }}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-semibold">GP Response</label>
                      <Textarea
                        rows={2}
                        className="text-xs"
                        value={obs.gpResponse}
                        onChange={(e) => {
                          const updated = [...formData.observations];
                          updated[idx].gpResponse = e.target.value;
                          handleInputChange("observations", updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: GP Staff & Samiti */}
        <TabsContent value="gpDetails" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>1. Total Number of Members in GP</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold">Directly Elected (Male)</label>
                <Input
                  type="number"
                  value={formData.gpMembersCount.maleElected}
                  onChange={(e) => handleNestedChange("gpMembersCount", "maleElected", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Directly Elected (Female)</label>
                <Input
                  type="number"
                  value={formData.gpMembersCount.femaleElected}
                  onChange={(e) => handleNestedChange("gpMembersCount", "femaleElected", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Ex-Officio (Male)</label>
                <Input
                  type="number"
                  value={formData.gpMembersCount.maleExOfficio}
                  onChange={(e) => handleNestedChange("gpMembersCount", "maleExOfficio", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Ex-Officio (Female)</label>
                <Input
                  type="number"
                  value={formData.gpMembersCount.femaleExOfficio}
                  onChange={(e) => handleNestedChange("gpMembersCount", "femaleExOfficio", Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>2. Details of Upa-Samiti</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const updated = [
                    ...(formData.upaSamitiDetails || []),
                    { name: "", directMembers: 0, designatedMembers: 0, sanchalakName: "", meetingsHeld: 0 },
                  ];
                  handleInputChange("upaSamitiDetails", updated);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Upa-Samiti
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.upaSamitiDetails.map((item: any, idx: number) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-gray-50 border rounded-lg items-center text-xs">
                  <div className="md:col-span-2">
                    <label className="text-[10px] text-gray-500">Upa-Samiti Name</label>
                    <Input
                      placeholder="e.g. Artha O Parikalpana"
                      className="h-8 text-xs font-semibold"
                      value={item.name}
                      onChange={(e) => {
                        const updated = [...formData.upaSamitiDetails];
                        updated[idx].name = e.target.value;
                        handleInputChange("upaSamitiDetails", updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Directly Nominated</label>
                    <Input
                      type="number"
                      className="h-8 text-xs"
                      value={item.directMembers}
                      onChange={(e) => {
                        const updated = [...formData.upaSamitiDetails];
                        updated[idx].directMembers = Number(e.target.value);
                        handleInputChange("upaSamitiDetails", updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Designated Members</label>
                    <Input
                      type="number"
                      className="h-8 text-xs"
                      value={item.designatedMembers}
                      onChange={(e) => {
                        const updated = [...formData.upaSamitiDetails];
                        updated[idx].designatedMembers = Number(e.target.value);
                        handleInputChange("upaSamitiDetails", updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Sanchalak Name</label>
                    <Input
                      className="h-8 text-xs"
                      placeholder="Sanchalak Name"
                      value={item.sanchalakName}
                      onChange={(e) => {
                        const updated = [...formData.upaSamitiDetails];
                        updated[idx].sanchalakName = e.target.value;
                        handleInputChange("upaSamitiDetails", updated);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500">Meetings Held</label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={item.meetingsHeld}
                        onChange={(e) => {
                          const updated = [...formData.upaSamitiDetails];
                          updated[idx].meetingsHeld = Number(e.target.value);
                          handleInputChange("upaSamitiDetails", updated);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 mt-4 h-8 w-8 p-0"
                      onClick={() => {
                        const updated = formData.upaSamitiDetails.filter((_: any, i: number) => i !== idx);
                        handleInputChange("upaSamitiDetails", updated);
                      }}
                      title="Delete Upa-Samiti"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>3. Designation-wise details of GP staff / Employees</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const updated = [
                    ...(formData.gpStaffDetails || []),
                    { designation: "", maleName: "", femaleName: "", salary: "" },
                  ];
                  handleInputChange("gpStaffDetails", updated);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Employee / Staff
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.gpStaffDetails.map((staff: any, idx: number) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 border rounded-lg items-center text-xs">
                  <div>
                    <label className="text-[10px] text-gray-500">Designation</label>
                    <Input
                      placeholder="e.g. Executive Assistant, Tax Collector"
                      className="h-8 text-xs font-semibold"
                      value={staff.designation}
                      onChange={(e) => {
                        const updated = [...formData.gpStaffDetails];
                        updated[idx].designation = e.target.value;
                        handleInputChange("gpStaffDetails", updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Male Name</label>
                    <Input
                      placeholder="Male Name"
                      className="h-8 text-xs"
                      value={staff.maleName}
                      onChange={(e) => {
                        const updated = [...formData.gpStaffDetails];
                        updated[idx].maleName = e.target.value;
                        handleInputChange("gpStaffDetails", updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Female Name</label>
                    <Input
                      placeholder="Female Name"
                      className="h-8 text-xs"
                      value={staff.femaleName}
                      onChange={(e) => {
                        const updated = [...formData.gpStaffDetails];
                        updated[idx].femaleName = e.target.value;
                        handleInputChange("gpStaffDetails", updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Salary (Optional)</label>
                    <Input
                      placeholder="Salary"
                      className="h-8 text-xs"
                      value={staff.salary}
                      onChange={(e) => {
                        const updated = [...formData.gpStaffDetails];
                        updated[idx].salary = e.target.value;
                        handleInputChange("gpStaffDetails", updated);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 mt-4 h-8 w-8 p-0"
                      onClick={() => {
                        const updated = formData.gpStaffDetails.filter((_: any, i: number) => i !== idx);
                        handleInputChange("gpStaffDetails", updated);
                      }}
                      title="Delete Employee"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: Procurement & Revenue */}
        <TabsContent value="financials" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>4. Use of fund in the audit year</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold">Tied Fund (Rs.)</label>
                <Input
                  type="number"
                  value={formData.fundUsage.tiedFund}
                  onChange={(e) => handleNestedChange("fundUsage", "tiedFund", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Untied Fund (Rs.)</label>
                <Input
                  type="number"
                  value={formData.fundUsage.untiedFund}
                  onChange={(e) => handleNestedChange("fundUsage", "untiedFund", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Amount Utilised (Rs.)</label>
                <Input
                  type="number"
                  value={formData.fundUsage.amountUtilised}
                  onChange={(e) => handleNestedChange("fundUsage", "amountUtilised", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Percentage Utilised (%)</label>
                <Input
                  type="number"
                  value={formData.fundUsage.percentageUtilised}
                  onChange={(e) => handleNestedChange("fundUsage", "percentageUtilised", Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>5. Procurement Details</CardTitle>
                <CardDescription>Auto-fetch payment details from database or manually enter items</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={fetchingProcurement}
                  onClick={async () => {
                    setFetchingProcurement(true);
                    try {
                      const res = await fetchProcurementFromPayments(
                        formData.financialYear,
                        formData.quarter
                      );
                      if (res.success) {
                        handleInputChange("procurementList", res.data);
                        if (res.data.length > 0) {
                          setSuccessMessage(
                            `Fetched ${res.data.length} payment record(s) for ${formData.quarter} (${formData.financialYear}).`
                          );
                        } else {
                          setSuccessMessage(
                            `No payment records found for ${formData.quarter} (${formData.financialYear}). Procurement list left blank.`
                          );
                        }
                      } else {
                        setErrorMessage(res.error || "Failed to fetch procurement data.");
                      }
                    } catch (err: any) {
                      setErrorMessage(err.message || "Error fetching payments.");
                    } finally {
                      setFetchingProcurement(false);
                    }
                  }}
                  className="gap-1 text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  {fetchingProcurement ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Auto-Fetch Quarterly Payments
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleInputChange("procurementList", [
                      ...formData.procurementList,
                      { slNo: formData.procurementList.length + 1, fund: "15th FC", nitNo: "", nitDate: "", activityName: "", typeOfProcurement: "Works", typeOfWork: "Roads", estimatedValue: 0, contractValue: 0, contractDate: "", billValue: 0, planPlusValue: 0, sample: "N" }
                    ]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Procurement
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.procurementList.map((item: any, idx: number) => (
                <div key={idx} className="p-3 border rounded-lg bg-gray-50 space-y-2 relative">
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-red-500"
                    onClick={() => {
                      const updated = formData.procurementList.filter((_: any, i: number) => i !== idx);
                      handleInputChange("procurementList", updated);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="grid grid-cols-6 gap-2 text-xs">
                    <Input
                      placeholder="Fund"
                      className="h-8 text-xs"
                      value={item.fund}
                      onChange={(e) => {
                        const updated = [...formData.procurementList];
                        updated[idx].fund = e.target.value;
                        handleInputChange("procurementList", updated);
                      }}
                    />
                    <Input
                      placeholder="NIT No."
                      className="h-8 text-xs"
                      value={item.nitNo}
                      onChange={(e) => {
                        const updated = [...formData.procurementList];
                        updated[idx].nitNo = e.target.value;
                        handleInputChange("procurementList", updated);
                      }}
                    />
                    <Input
                      placeholder="Activity Name"
                      className="h-8 text-xs col-span-2"
                      value={item.activityName}
                      onChange={(e) => {
                        const updated = [...formData.procurementList];
                        updated[idx].activityName = e.target.value;
                        handleInputChange("procurementList", updated);
                      }}
                    />
                    <Input
                      placeholder="Est. Value"
                      type="number"
                      className="h-8 text-xs"
                      value={item.estimatedValue}
                      onChange={(e) => {
                        const updated = [...formData.procurementList];
                        updated[idx].estimatedValue = Number(e.target.value);
                        handleInputChange("procurementList", updated);
                      }}
                    />
                    <Input
                      placeholder="Contract Value"
                      type="number"
                      className="h-8 text-xs"
                      value={item.contractValue}
                      onChange={(e) => {
                        const updated = [...formData.procurementList];
                        updated[idx].contractValue = Number(e.target.value);
                        handleInputChange("procurementList", updated);
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7 & 8. Own Source Revenue (Property Tax & Trade Licence)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-bold text-sm mb-2 text-blue-700">Property Tax</h4>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-gray-500">No. of Assesses</label>
                    <Input
                      type="number"
                      className="h-8"
                      value={formData.propertyTaxOSR.noOfAssesses}
                      onChange={(e) => updatePropertyTax("noOfAssesses", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Arrears (Rs.)</label>
                    <Input
                      type="number"
                      className="h-8"
                      value={formData.propertyTaxOSR.arrears}
                      onChange={(e) => updatePropertyTax("arrears", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">CY Demand (Rs.)</label>
                    <Input
                      type="number"
                      className="h-8"
                      value={formData.propertyTaxOSR.currentYearDemand}
                      onChange={(e) => updatePropertyTax("currentYearDemand", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Arrears Collected (Rs.)</label>
                    <Input
                      type="number"
                      className="h-8"
                      value={formData.propertyTaxOSR.arrearsCollected}
                      onChange={(e) => updatePropertyTax("arrearsCollected", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">CY Demand Collected (Rs.)</label>
                    <Input
                      type="number"
                      className="h-8"
                      value={formData.propertyTaxOSR.cyDemandCollected}
                      onChange={(e) => updatePropertyTax("cyDemandCollected", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold">Total Receivable</label>
                    <Input disabled className="h-8 font-bold bg-gray-100" value={formData.propertyTaxOSR.totalReceivable} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold">Total Collection</label>
                    <Input disabled className="h-8 font-bold bg-gray-100" value={formData.propertyTaxOSR.totalCollection} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold">Pending Amount</label>
                    <Input disabled className="h-8 font-bold text-red-600 bg-gray-100" value={formData.propertyTaxOSR.pendingAmount} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-2 text-green-700">Trade Licence</h4>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-gray-500">No. of Assesses</label>
                    <Input
                      type="number"
                      className="h-8"
                      value={formData.tradeLicenceOSR.noOfAssesses}
                      onChange={(e) => updateTradeLicence("noOfAssesses", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Arrears (Rs.)</label>
                    <Input
                      type="number"
                      className="h-8"
                      value={formData.tradeLicenceOSR.arrears}
                      onChange={(e) => updateTradeLicence("arrears", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">CY Demand (Rs.)</label>
                    <Input
                      type="number"
                      className="h-8"
                      value={formData.tradeLicenceOSR.currentYearDemand}
                      onChange={(e) => updateTradeLicence("currentYearDemand", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Arrears Collected (Rs.)</label>
                    <Input
                      type="number"
                      className="h-8"
                      value={formData.tradeLicenceOSR.arrearsCollected}
                      onChange={(e) => updateTradeLicence("arrearsCollected", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">CY Demand Collected (Rs.)</label>
                    <Input
                      type="number"
                      className="h-8"
                      value={formData.tradeLicenceOSR.cyDemandCollected}
                      onChange={(e) => updateTradeLicence("cyDemandCollected", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold">Total Receivable</label>
                    <Input disabled className="h-8 font-bold bg-gray-100" value={formData.tradeLicenceOSR.totalReceivable} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold">Total Collection</label>
                    <Input disabled className="h-8 font-bold bg-gray-100" value={formData.tradeLicenceOSR.totalCollection} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold">Pending Amount</label>
                    <Input disabled className="h-8 font-bold text-red-600 bg-gray-100" value={formData.tradeLicenceOSR.pendingAmount} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Other Demographics & Certificate Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold">Total Population</label>
                <Input
                  type="number"
                  value={formData.otherInfoStats.totalPopulation}
                  onChange={(e) => handleNestedChange("otherInfoStats", "totalPopulation", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Death Certificates Issued</label>
                <Input
                  type="number"
                  value={formData.otherInfoStats.deathCertificatesIssued}
                  onChange={(e) => handleNestedChange("otherInfoStats", "deathCertificatesIssued", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Birth Certificates Issued</label>
                <Input
                  type="number"
                  value={formData.otherInfoStats.birthCertificatesIssued}
                  onChange={(e) => handleNestedChange("otherInfoStats", "birthCertificatesIssued", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Trade Licences Issued</label>
                <Input
                  type="number"
                  value={formData.otherInfoStats.tradeLicencesIssued}
                  onChange={(e) => handleNestedChange("otherInfoStats", "tradeLicencesIssued", Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
