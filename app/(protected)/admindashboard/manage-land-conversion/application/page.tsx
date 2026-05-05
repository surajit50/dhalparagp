"use client";

import { FileText } from "lucide-react";
import LandConversionApplicationForm from "@/components/form/LandConversionApplicationForm";
import LandConversionLayout from "../components/LandConversionLayout";
import { useSession } from "next-auth/react";

export default function LandConversionApplicationPage() {
  const { data: session } = useSession();
  const isAdminOrSuperAdmin = session?.user?.role
    ? ["admin", "superadmin"].includes(session.user.role as string)
    : false;

  return (
    <LandConversionLayout
      title="Land Conversion NOC - New Application"
      description="Fill out the form below to apply for land conversion NOC."
      icon={FileText}
    >
      <LandConversionApplicationForm
        isAdminOrSuperAdmin={isAdminOrSuperAdmin}
      />
    </LandConversionLayout>
  );
}
