import React from "react";
import DigitalCertificateForm from "@/components/digital-certificate/DigitalCertificateForm";
import { FilePlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "New Digital Certificate Application | Admin Portal",
  description: "Staff and Admin counter application entry for Digital Birth / Death Certificate.",
};

export default function AdminNewDigitalCertificatePage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admindashboard/manage-digital-certificate">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FilePlus className="w-6 h-6 text-primary" /> New Certificate Application (Office Entry)
            </h1>
            <p className="text-xs text-muted-foreground">
              Register a new walk-in or offline application for Digital Birth or Death Certificate.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border p-4 sm:p-8 max-w-4xl mx-auto">
        <DigitalCertificateForm
          isAdmin={true}
          onSuccessRedirectUrl="/admindashboard/manage-digital-certificate"
        />
      </div>
    </div>
  );
}
