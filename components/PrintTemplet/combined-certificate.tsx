"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import WorkorderCertificate from "./Work-order-Certificate";
import PaymentCertificate from "./payment-certificate";
import Completationcertificate from "./completation-certificate";
import { Workorderdetails } from "@/types/tender-manage";
import { CompletationCertificate, PaymentDetilsType } from "@/types";

interface CombinedCertificateProps {
  workOrderDetails: Workorderdetails;
  paymentDetails: PaymentDetilsType;
  completionDetails: CompletationCertificate;
}

export default function CombinedCertificate({
  workOrderDetails,
  paymentDetails,
  completionDetails,
}: CombinedCertificateProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: "Combined-Certificate",
  });

  return (
    <div className="flex flex-col gap-4">
      <div ref={contentRef} className="space-y-8 p-4">
        {/* Work Order Certificate */}
        <div className="page-break">
          <WorkorderCertificate workOrderDetails={workOrderDetails} />
        </div>

        {/* Payment Certificate */}
        <div className="page-break">
          <PaymentCertificate paymentdetails={paymentDetails} />
        </div>

        {/* Completion Certificate */}
        <div className="page-break">
          <Completationcertificate paymentdetails={completionDetails} />
        </div>
      </div>

      <Button
        onClick={() => handlePrint()}
        className="w-full gap-2 bg-primary hover:bg-primary/90"
      >
        <Printer className="w-4 h-4" />
        Print Combined Certificate
      </Button>
    </div>
  );
}
