import React from "react";
import DigitalCertificateForm from "@/components/digital-certificate/DigitalCertificateForm";
import { FileBadge2 } from "lucide-react";

export const metadata = {
  title: "Apply for Digital Birth & Death Certificate | Dhalpara GP",
  description: "Official online application for issue of Digital Birth / Death Certificate in No. 3 Dhalpara Gram Panchayat.",
};

export default function DigitalCertificateApplyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto  space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center bg-blue-100/80 text-blue-700 px-5 py-2.5 rounded-2xl mb-2 shadow-sm">
            <FileBadge2 className="h-7 w-7 mr-2.5" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Application for Digital Certificate
            </h1>
          </div>
          <p className="text-base font-medium text-foreground">
            No. 3 Dhalpara Gram Panchayat, Block – Hili, Dakshin Dinajpur
          </p>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            Submit your application for verification of records and issuance of official Digital Birth or Death Certificate. You will be able to print your official application form immediately.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 border border-border/60">
          <DigitalCertificateForm
            isAdmin={false}
            onSuccessRedirectUrl="/dashboard/digital-certificate/status"
          />
        </div>

        {/* Footer info */}
        <footer className="text-center text-xs text-muted-foreground pt-4 space-y-1">
          <p>Office of the Sub-Registrar of Births & Deaths &bull; No. 3 Dhalpara Gram Panchayat</p>
          <p>Ensure all registration details provided match your existing hospital or GP records for faster verification.</p>
        </footer>
      </div>
    </div>
  );
}
