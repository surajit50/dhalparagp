"use client";
import { TenderStatus } from "@prisma/client";
import { useState } from "react";
import type { workdetailstype } from "@/types/worksdetails";
import { formatDate } from "@/utils/utils";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateWorkStatus } from "@/action/updateWorkStatus";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { gpcode } from "@/constants/gpinfor";
// Define a custom type that extends ColumnDef
type CustomColumnDef<T> = ColumnDef<T> & {
  label?: string;
};

export const columns: CustomColumnDef<workdetailstype>[] = [
  {
    accessorKey: "id",
    header: "SL No.",
    label: "SL No.",
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "block",
    header: "Block",
    label: "Block",
    cell: () => "Hili",
  },
  {
    id: "gp",
    header: "GP",
    label: "GP",
    cell: () => "DHALPARA",
  },
  {
    id: "schemeType",
    header: "Scheme Type (Main/ Supplementory)",
    label: "Scheme Type (Main/ Supplementory)",
    cell: () => "Main",
  },
  {
    id: "schemeId",
    header: "Scheme ID",
    label: "Scheme ID",
    cell: ({ row }) =>
      row.original?.ApprovedActionPlanDetails?.activityCode || "N/A",
  },
  {
    id: "schemeName",
    header: "Scheme Name",
    label: "Scheme Name",
    cell: ({ row }) =>
      row.original?.ApprovedActionPlanDetails?.activityDescription || "N/A",
  },
  {
    id: "fundType",
    header: "Fund type (Untied/Tied)",
    label: "Fund type (Untied/Tied)",
    cell: ({ row }) =>
      row.original?.ApprovedActionPlanDetails?.fundType || "N/A",
  },
  {
    id: "meetingResolutionDone",
    header: "Meeting resolution Done(YES/NO)",
    label: "Meeting resolution Done(YES/NO)",
    cell: () => "N/A",
  },
  {
    id: "meetingDate",
    header: "Meeting Date(If Done)",
    label: "Meeting Date(If Done)",
    cell: () => "N/A",
  },
  {
    accessorKey: "finalEstimateAmount",
    header: "Estimated Amount(Rs.)",
    label: "Estimated Amount(Rs.)",
  },
  {
    id: "nitNumber",
    header: "NIT Number",
    label: "NIT Number",
    cell: ({ row }) => row.original?.nitDetails?.memoNumber || "N/A",
  },
  {
    id: "nitDone",
    header: "NIT Done(YES/NO)",
    label: "NIT Done(YES/NO)",
    cell: ({ row }) => (row.original?.nitDetails ? "YES" : "NO"),
  },
  {
    id: "nitDate",
    header: "NIT Date(IF Done)",
    label: "NIT Date(IF Done)",
    cell: ({ row }) => {
      const date =
        row.original?.nitDetails?.publishingDate ||
        row.original?.nitDetails?.memoDate;
      return date ? formatDate(date) : "N/A";
    },
  },
  {
    id: "nitAmount",
    header: "NIT Amount(Rs.)",
    label: "NIT Amount(Rs.)",
    cell: ({ row }) => row.original?.finalEstimateAmount || "N/A",
  },
  {
    id: "technicalBidOpenDate",
    header: "Technicial BID Open Date",
    label: "Technicial BID Open Date",
    cell: ({ row }) =>
      row.original?.nitDetails?.technicalBidOpeningDate
        ? formatDate(row.original.nitDetails.technicalBidOpeningDate)
        : "N/A",
  },
  {
    id: "financialBidOpenDate",
    header: "Financial BID Open Date",
    label: "Financial BID Open Date",
    cell: ({ row }) =>
      row.original?.nitDetails?.financialBidOpeningDate
        ? formatDate(row.original.nitDetails.financialBidOpeningDate)
        : "N/A",
  },
  {
    id: "workOrderDone",
    header: "Work Order Done(YES/NO)",
    label: "Work Order Done(YES/NO)",
    cell: ({ row }) => (row.original?.AwardofContract ? "YES" : "NO"),
  },
  {
    id: "workOrderDate",
    header: "Work Order Date(IF Done)",
    label: "Work Order Date(IF Done)",
    cell: ({ row }) =>
      row.original?.AwardofContract?.workordeermemodate
        ? formatDate(row.original.AwardofContract.workordeermemodate)
        : "N/A",
  },
  {
    id: "workOrderAmount",
    header: "Work Order Amount(Rs.)",
    label: "Work Order Amount(Rs.)",
    cell: ({ row }) =>
      row.original?.AwardofContract?.workorderdetails?.[0]?.Bidagency
        ?.biddingAmount || "N/A",
  },
  {
    id: "layoutDone",
    header: "Layout Done(YES/NO)",
    label: "Layout Done(YES/NO)",
    cell: ({ row }) => (row.original?.workCommencementDate ? "YES" : "NO"),
  },
  {
    accessorKey: "workStatus",
    header: "Status Of Work(Starting/ Ongoing/Complete)",
    label: "Status Of Work(Starting/ Ongoing/Complete)",
    cell: ({ row }) => row.original?.workStatus || "N/A",
  },
  {
    id: "raBillPayment",
    header: "RA Bill Payment(YES/NO) (If Applicable)",
    label: "RA Bill Payment(YES/NO) (If Applicable)",
    cell: ({ row }) => {
      const raBills = row.original?.paymentDetails?.filter(
        (p) => !p.isfinalbill
      );
      return raBills && raBills.length > 0 ? "YES" : "NO";
    },
  },
  {
    id: "raBillPaymentDate",
    header: "RA Bill Payment Date(If YES)",
    label: "RA Bill Payment Date(If YES)",
    cell: ({ row }) => {
      const raBills = row.original?.paymentDetails?.filter(
        (p) => !p.isfinalbill
      );
      return raBills && raBills.length > 0
        ? formatDate(raBills[0].billPaymentDate)
        : "N/A";
    },
  },
  {
    id: "raBillAmount",
    header: "RA Bill Amount(If YES)(Rs.)",
    label: "RA Bill Amount(If YES)(Rs.)",
    cell: ({ row }) => {
      const raBills = row.original?.paymentDetails?.filter(
        (p) => !p.isfinalbill
      );
      return raBills && raBills.length > 0
        ? raBills.reduce((acc, curr) => acc + curr.grossBillAmount, 0)
        : "N/A";
    },
  },
  {
    id: "finalBillPayment",
    header: "Final Bill Payment(YES/NO)",
    label: "Final Bill Payment(YES/NO)",
    cell: ({ row }) => {
      const finalBills = row.original?.paymentDetails?.filter(
        (p) => p.isfinalbill
      );
      return finalBills && finalBills.length > 0 ? "YES" : "NO";
    },
  },
  {
    id: "finalBillPaymentDate",
    header: "Final Bill Payment Date(If YES)",
    label: "Final Bill Payment Date(If YES)",
    cell: ({ row }) => {
      const finalBills = row.original?.paymentDetails?.filter(
        (p) => p.isfinalbill
      );
      return finalBills && finalBills.length > 0
        ? formatDate(finalBills[0].billPaymentDate)
        : "N/A";
    },
  },
  {
    id: "finalBillAmount",
    header: "Final Bill Amount(If YES)(Rs.)",
    label: "Final Bill Amount(If YES)(Rs.)",
    cell: ({ row }) => {
      const finalBills = row.original?.paymentDetails?.filter(
        (p) => p.isfinalbill
      );
      return finalBills && finalBills.length > 0
        ? finalBills[0].grossBillAmount
        : "N/A";
    },
  },
  {
    id: "workCompletionDate",
    header: "Work Completion Date",
    label: "Work Completion Date",
    cell: ({ row }) => {
      const date =
        row.original?.completionDate ||
        row.original?.paymentDetails?.find((p) => p.isfinalbill)
          ?.workcompletaitiondate;
      return date ? formatDate(date) : "N/A";
    },
  },
  {
    id: "sdMoneyReleased",
    header: "SD Money Released (YES/NO)",
    label: "SD Money Released (YES/NO)",
    cell: ({ row }) => {
      const finalBill = row.original?.paymentDetails?.find((p) => p.isfinalbill);
      if (!finalBill) return "N/A";
      // We don't have securityDeposit included in paymentDetails in fetchworkdetailsbyfilters yet!
      // We will need to include it in the action.
      // For now, if we can read it:
      return finalBill.securityDeposit?.paymentstatus === "paid" ? "YES" : "NO";
    },
  },
  {
    id: "sdMoneyReleasedDate",
    header: "SD Money Released Date(If YES)",
    label: "SD Money Released Date(If YES)",
    cell: ({ row }) => {
      const finalBill = row.original?.paymentDetails?.find((p) => p.isfinalbill);
      if (!finalBill || !finalBill.securityDeposit?.paymentDate) return "N/A";
      return formatDate(finalBill.securityDeposit.paymentDate);
    },
  },
  {
    id: "agencyName",
    header: "Agency Name",
    label: "Agency Name",
    cell: ({ row }) =>
      row.original?.AwardofContract?.workorderdetails?.[0]?.Bidagency
        ?.agencydetails?.name || "N/A",
  },
  {
    id: "proprietorName",
    header: "Proprietor Name",
    label: "Proprietor Name",
    cell: ({ row }) =>
      row.original?.AwardofContract?.workorderdetails?.[0]?.Bidagency
        ?.agencydetails?.proprietorName || "N/A",
  },
  {
    id: "proprietorContactNumber",
    header: "Proprietor Contact Number",
    label: "Proprietor Contact Number",
    cell: ({ row }) =>
      row.original?.AwardofContract?.workorderdetails?.[0]?.Bidagency
        ?.agencydetails?.mobileNumber || "N/A",
  },
  {
    id: "remarks",
    header: "Remarks",
    label: "Remarks",
    cell: ({ row }) =>
      row.original?.ApprovedActionPlanDetails?.remarks || "N/A",
  },
];
