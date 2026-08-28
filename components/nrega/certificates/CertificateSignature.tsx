"use client";

import React from "react";

interface CertificateSignatureProps {
  designation?: string;
  block?: string;
  date?: string;
}

export default function CertificateSignature({
  designation = "Block Development Officer",
  block,
  date,
}: CertificateSignatureProps) {
  return (
    <div className="mt-10 print:mt-6">
      <div className="flex justify-end">
        <div className="text-right space-y-4 min-w-[250px]">
          <p className="text-sm font-medium border-b border-dashed border-gray-400 pb-1 print:text-black">
            Signature &amp; Seal
          </p>
          <div className="space-y-1 text-sm print:text-black">
            <p>
              <span className="font-medium">Date:</span>{" "}
              {date || "________________________"}
            </p>
            <p className="font-semibold">{designation}</p>
            {block && (
              <p>
                <span className="font-medium">Block:</span> {block}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
