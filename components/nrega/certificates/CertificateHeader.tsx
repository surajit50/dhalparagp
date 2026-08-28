"use client";

import React from "react";

interface CertificateHeaderProps {
  certificateNumber: number;
  title: string;
  subtitle?: string;
}

export default function CertificateHeader({
  certificateNumber,
  title,
  subtitle = "Viksit Bharat – Guarantee for Rozgar and Ajeevika Mission (Gramin)",
}: CertificateHeaderProps) {
  return (
    <div className="text-center mb-6 print:mb-4">
      <p className="text-sm font-semibold tracking-wide uppercase text-muted-foreground print:text-black">
        {subtitle}
      </p>
      <div className="mt-3 border-b-2 border-black pb-2">
        <h1 className="text-base font-bold uppercase tracking-wider print:text-black">
          CERTIFICATE-{certificateNumber}
        </h1>
        <h2 className="text-sm font-bold uppercase mt-1 print:text-black">
          {title}
        </h2>
      </div>
    </div>
  );
}
