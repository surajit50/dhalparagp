"use client";

import { FileText } from "lucide-react";
import LandConversionApplicationForm from "@/components/form/LandConversionApplicationForm";
import LandConversionLayout from "../components/LandConversionLayout";

export default function LandConversionApplicationPage() {
  return (
    <LandConversionLayout
      title="Land Conversion NOC - New Application"
      description="Fill out the form below to apply for land conversion NOC."
      icon={FileText}
    >
      <LandConversionApplicationForm />
    </LandConversionLayout>
  );
}
