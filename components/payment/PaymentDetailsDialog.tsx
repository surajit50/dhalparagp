"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/utils/utils";

interface PaymentDetailsDialogProps {
  payment: {
    id: string;
    grossBillAmount: number;
    lessIncomeTax?: { incomeTaaxAmount?: number } | null;
    lessLabourWelfareCess?: { labourWelfarecessAmt?: number } | null;
    lessTdsCgst?: { tdscgstAmt?: number } | null;
    lessTdsSgst?: { tdsSgstAmt?: number } | null;
    securityDeposit?: { securityDepositAmt?: number } | null;
    netAmt: number;
    billPaymentDate: Date | string;
    eGramVoucher: string | null;
    eGramVoucherDate: Date | string | null;
    gpmsVoucherNumber: string | null;
    gpmsVoucherDate: Date | string | null;
    mbrefno: string | null;
    billType: string | null;
    workcompletaitiondate: Date | string | null;
    WorksDetail: {
      ApprovedActionPlanDetails: {
        activityDescription: string;
      } | null;
    } | null;
  };
}

export const PaymentDetailsDialog = ({
  payment,
}: PaymentDetailsDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Detailed information about this payment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">Work Name:</p>
            <p className="text-sm">
              {payment.WorksDetail?.ApprovedActionPlanDetails
                ?.activityDescription || "N/A"}
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">Gross Bill Amount:</p>
            <p className="text-sm">{formatCurrency(payment.grossBillAmount)}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">Less Income Tax:</p>
            <p className="text-sm">
              {formatCurrency(payment.lessIncomeTax?.incomeTaaxAmount ?? 0)}
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">Less Labour Welfare Cess:</p>
            <p className="text-sm">
              {formatCurrency(
                payment.lessLabourWelfareCess?.labourWelfarecessAmt ?? 0,
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">Less TDS CGST:</p>
            <p className="text-sm">
              {formatCurrency(payment.lessTdsCgst?.tdscgstAmt ?? 0)}
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">Less TDS SGST:</p>
            <p className="text-sm">
              {formatCurrency(payment.lessTdsSgst?.tdsSgstAmt ?? 0)}
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">Security Deposit:</p>
            <p className="text-sm">
              {formatCurrency(payment.securityDeposit?.securityDepositAmt ?? 0)}
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">Net Amount:</p>
            <p className="text-sm">{formatCurrency(payment.netAmt)}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">Bill Payment Date:</p>
            <p className="text-sm">
              {formatDate(payment.billPaymentDate as any)}
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">E-Gram Voucher:</p>
            <p className="text-sm">{payment.eGramVoucher || "N/A"}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">E-Gram Voucher Date:</p>
            <p className="text-sm">
              {payment.eGramVoucherDate
                ? formatDate(payment.eGramVoucherDate as any)
                : "N/A"}
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">GPMS Voucher Number:</p>
            <p className="text-sm">{payment.gpmsVoucherNumber || "N/A"}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">GPMS Voucher Date:</p>
            <p className="text-sm">
              {payment.gpmsVoucherDate
                ? formatDate(payment.gpmsVoucherDate as any)
                : "N/A"}
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">MB Ref No:</p>
            <p className="text-sm">{payment.mbrefno || "N/A"}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">Bill Type:</p>
            <p className="text-sm">{payment.billType || "N/A"}</p>
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <p className="text-sm font-medium">Work Completion Date:</p>
            <p className="text-sm">
              {payment.workcompletaitiondate
                ? formatDate(payment.workcompletaitiondate as any)
                : "N/A"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
