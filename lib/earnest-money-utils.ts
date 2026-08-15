/**
 * Pure synchronous utility functions for the Earnest Money Register.
 * This file intentionally has NO "use server" directive so these helpers
 * can be imported by both server and client code.
 */

import type {
  EarnestMoneyRegisterEntryStatus,
  EarnestMoneyStatus,
} from "@prisma/client";

export function mapRegisterStatusToLegacyStatus(
  status: EarnestMoneyRegisterEntryStatus
): EarnestMoneyStatus {
  switch (status) {
    case "RECEIVED":
      return "paid";
    case "REFUNDED":
      return "refunded";
    case "FORFEITED":
      return "forfeited";
    case "HELD":
    case "REFUND_DUE":
    case "ADJUSTED":
    default:
      return "pending";
  }
}

export function getEffectiveRegisterStatus(entry: {
  registerStatus?: EarnestMoneyRegisterEntryStatus | null;
  paymentstatus?: EarnestMoneyStatus | null;
}): EarnestMoneyRegisterEntryStatus {
  if (entry.registerStatus) {
    return entry.registerStatus;
  }

  switch (entry.paymentstatus) {
    case "paid":
      return "RECEIVED";
    case "refunded":
      return "REFUNDED";
    case "forfeited":
      return "FORFEITED";
    case "pending":
    default:
      return "HELD";
  }
}
