"use client";

import { useMemo } from "react";
import { addYears, getYear, differenceInYears } from "date-fns";
import { formatDate } from "@/utils/utils";
import { gpname, gpaddress } from "@/constants/gpinfor";

// Define the structure of the lease data
export interface PondLease {
  id: string;
  leasePartyName: string;
  leasePartyFatherName?: string;
  leasePartyAddressLine1?: string;
  leasePartyAddressLine2?: string;
  leasePartyCity?: string;
  leasePartyPin?: string;
  leasePartyMobile: string;
  pond: {
    name: string;
    location: string;
  };
  leaseStartDate: string | Date;
  leaseEndDate: string | Date;
  leaseAmountYearly: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  lastNoticeDate?: string | Date;
  noticeCount?: number;
  isReprint?: boolean;
}

interface PondLeaseNoticePrintProps {
  lease: PondLease;
  noticeType: "REMINDER" | "EXPIRY";
}

export function PondLeaseNoticePrint({
  lease,
  noticeType,
}: PondLeaseNoticePrintProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const leaseStartDate = new Date(lease.leaseStartDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const leaseEndDate = new Date(lease.leaseEndDate);

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  // If isReprint is true, we display the exact noticeCount, otherwise we add 1 for the upcoming notice
  const currentNoticeCount = lease.isReprint ? (lease.noticeCount || 1) : ((lease.noticeCount || 0) + 1);


  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }),
    [],
  );

  const yearWisePending = useMemo(() => {
    const totalAmount = Number(lease.totalAmount) || 0;
    let remainingPaidAmount = Number(lease.paidAmount) || 0;

    let totalYears = differenceInYears(leaseEndDate, leaseStartDate);
    if (totalYears <= 0) {
      totalYears = 1;
    }

    const yearlyAmount = totalYears > 0 ? totalAmount / totalYears : 0;

    const result: Record<string, number> = {};

    for (let i = 0; i < totalYears; i++) {
      const yearStart = addYears(leaseStartDate, i);
      const paidForYear = Math.min(remainingPaidAmount, yearlyAmount);
      remainingPaidAmount -= paidForYear;

      const pending = yearlyAmount - paidForYear;

      if (pending > 0.01) {
        result[getYear(yearStart)] = pending;
      }
    }

    return result;
  }, [lease, leaseStartDate, leaseEndDate]);

  const noticeContent = useMemo(() => {
    if (noticeType === "REMINDER") {
      return `This is a formal reminder regarding the outstanding payment for your lease of pond ${lease.pond.name}. The total pending amount is ${currencyFormatter.format(lease.pendingAmount)}. Kindly clear the dues at the earliest to avoid further action.`;
    } else {
      return `This notice is to inform you that your lease for pond ${lease.pond.name} will expire on ${formatDate(leaseEndDate)}. Please contact the Gram Panchayat office for renewal procedures.`;
    }
  }, [noticeType, lease, leaseEndDate, currencyFormatter]);

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm max-h-[60vh] overflow-y-auto text-sm">
      {/* Header */}
      <div className="text-center mb-6 border-b pb-4">
        <h2 className="font-bold text-lg uppercase">{gpname}</h2>
        <p className="text-xs text-muted-foreground">{gpaddress}</p>
      </div>

      {/* Notice Info */}
      <div className="flex justify-between mb-6 text-xs font-semibold">
        <span>
          Memo No: GP/Lease/{getYear(lease.isReprint && lease.lastNoticeDate ? new Date(lease.lastNoticeDate) : new Date())}/{lease.id.slice(-4)}
        </span>
        <span>Date: {formatDate(lease.isReprint && lease.lastNoticeDate ? new Date(lease.lastNoticeDate) : new Date())}</span>
      </div>

      {/* Recipient */}
      <div className="mb-6">
        <p className="font-bold">{lease.leasePartyName}</p>
        {lease.leasePartyFatherName && (
          <p>S/O - {lease.leasePartyFatherName}</p>
        )}
        {lease.leasePartyAddressLine1 && <p>{lease.leasePartyAddressLine1}</p>}
        {lease.leasePartyAddressLine2 && <p>{lease.leasePartyAddressLine2}</p>}
        {lease.leasePartyCity && <p>Dist - {lease.leasePartyCity}</p>}
        {lease.leasePartyPin && <p>PIN - {lease.leasePartyPin}</p>}
      </div>

      {/* Subject */}
      <div className="mb-6 font-bold underline underline-offset-4 text-center">
        Subject:{" "}
        {noticeType === "REMINDER"
          ? `${getOrdinal(currentNoticeCount)} Reminder for Outstanding Lease Payment`
          : `${getOrdinal(currentNoticeCount)} Intimation of Lease Agreement Expiry`}
      </div>

      {/* Body */}
      <div className="mb-8 leading-relaxed">
        <p>Dear Sir/Madam,</p>
        <p className="mt-2 indent-8">{noticeContent}</p>
        <p className="mt-4">
          This is for your information and necessary action.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-12 text-right">
        <p>Sincerely,</p>
        <div className="mt-10">
          <p className="font-bold">Pradhan</p>
          <p className="text-xs">{gpname}</p>
        </div>
      </div>
    </div>
  );
}
