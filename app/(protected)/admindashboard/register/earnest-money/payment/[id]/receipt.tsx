"use client";

import { formatDate } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface ReceiptProps {
  emd: any;
  agencyDetails: any;
  nitDetails: any;
}

export default function Receipt({
  emd,
  agencyDetails,
  nitDetails,
}: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white">
      <div className="flex justify-between items-center mb-8 no-print">
        <div>
          <h1 className="text-2xl font-bold">Payment Receipt</h1>
          <p className="text-muted-foreground">
            Date: {formatDate(new Date())}
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>

      <div className="space-y-6 print:p-0">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Payment Receipt</h1>
          <p className="text-muted-foreground">
            Date: {formatDate(new Date())}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b pb-4">
          <div>
            <p className="text-sm text-muted-foreground">Receipt Number</p>
            <p className="font-medium">EMD-{emd.id.slice(-6)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment Date</p>
            <p className="font-medium">{formatDate(emd.paymentDate)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Payment Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">NIT Number</p>
              <p className="font-medium">{nitDetails?.memoNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Agency Name</p>
              <p className="font-medium">{agencyDetails?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">EMD Amount</p>
              <p className="font-medium">₹{emd.earnestMoneyAmount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium">{emd.paymentMethod}</p>
            </div>
            {emd.paymentMethod === "CHEQUE" && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Cheque Number</p>
                  <p className="font-medium">{emd.chequeNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cheque Date</p>
                  <p className="font-medium">{formatDate(emd.chequeDate)}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium text-green-600">Paid</p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            This is a computer generated receipt and does not require a
            signature.
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            background: white;
          }
          body * {
            visibility: hidden;
          }
          .receipt-content,
          .receipt-content * {
            visibility: visible;
          }
          .receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
          .print\:p-0 {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
