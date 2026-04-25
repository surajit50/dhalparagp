"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BirthCertificateForm } from "./components/BirthCertificateForm";
import { DeathCertificateForm } from "./components/DeathCertificateForm";
import { KrishakBandhuForm } from "./components/KrishakBandhuForm";
import { DomicileVerificationReport } from "./components/DomicileCertificateForm";

type ReportType = "birth" | "death" | "domicile" | "krishak";

export default function EnquiryReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("domicile");
  const [department, setDepartment] = useState<string>("BDO");

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gram Panchayat Enquiry Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <Select value={reportType} onValueChange={(v: ReportType) => setReportType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domicile">Domicile Verification</SelectItem>
                  <SelectItem value="birth">Birth Certificate</SelectItem>
                  <SelectItem value="death">Death Certificate</SelectItem>
                  <SelectItem value="krishak">Krishak Bandhu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department to Send</label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDO">Block Development Office (BDO)</SelectItem>
                  <SelectItem value="Health">Health Department</SelectItem>
                  <SelectItem value="Education">Education Department</SelectItem>
                  <SelectItem value="Agriculture">Agriculture Department</SelectItem>
                  <SelectItem value="Revenue">Revenue Department</SelectItem>
                  <SelectItem value="Police">Police Department</SelectItem>
                  <SelectItem value="SocialWelfare">Social Welfare Department</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">Selected: {reportType.toUpperCase()} → {department}</p>
        </CardContent>
      </Card>

      {reportType === "domicile" && <DomicileVerificationReport />}
      {reportType === "birth" && <BirthCertificateForm />} 
      {reportType === "death" && <DeathCertificateForm />} 
      {reportType === "krishak" && <KrishakBandhuForm />} 
    </div>
  );
}
