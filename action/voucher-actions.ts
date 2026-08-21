"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Temporary auth mock until I check how auth works
const currentUser = async () => {
    // try to use next-auth session
    try {
        const { auth } = await import("@/auth");
        const session = await auth();
        return session?.user;
    } catch {
        return { id: undefined };
    }
}

export const createVoucher = async (data: any) => {
  try {
    const user = await currentUser();
    
    // Auto generate voucher ID if not provided
    const voucherDate = data.voucherDate ? new Date(data.voucherDate) : new Date();
    const year = voucherDate.getFullYear().toString().slice(-2);
    const nextYear = (voucherDate.getFullYear() + 1).toString().slice(-2);
    const prefix = `${year}${nextYear}R`; // e.g., 2526R
    
    // Get last voucher to increment ID
    const lastVoucher = await db.voucher.findFirst({
      where: {
        voucherId: {
          startsWith: prefix
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let newSequence = 1;
    if (lastVoucher && lastVoucher.voucherId) {
      const lastSeq = parseInt(lastVoucher.voucherId.replace(prefix, ''));
      if (!isNaN(lastSeq)) {
        newSequence = lastSeq + 1;
      }
    }
    
    const voucherId = `${prefix}${newSequence.toString().padStart(6, '0')}`;
    const voucherNo = data.voucherNo || `XXXXXXXXXXX`;

    // Create AccountHead if not exists or use existing
    let accountHeadId = data.accountHeadId;
    if (!accountHeadId && data.headOfAccount && data.accountCode) {
       const existingHead = await db.accountHead.findUnique({
          where: { accountCode: data.accountCode }
       });
       if (existingHead) {
          accountHeadId = existingHead.id;
       } else {
          const newHead = await db.accountHead.create({
             data: {
                headOfAccount: data.headOfAccount,
                accountCode: data.accountCode,
                description: data.accountCodeDesc || "",
                nationalAccountCode: data.nationalAccountCode || ""
             }
          });
          accountHeadId = newHead.id;
       }
    }

    const newVoucher = await db.voucher.create({
      data: {
        voucherType: data.voucherType || "CREDIT",
        voucherId,
        voucherNo,
        voucherDate,
        accountHeadId,
        receivedFrom: data.receivedFrom,
        address: data.address,
        description: data.description,
        amount: parseFloat(data.amount),
        amountInWords: data.amountInWords,
        allotmentNo: data.allotmentNo,
        drawnOn: data.drawnOn,
        enteredById: user?.id
      }
    });

    revalidatePath("/(protected)/vouchers", "page");
    return { success: "Voucher generated successfully!", data: newVoucher };
  } catch (error) {
    console.error("Voucher creation error:", error);
    return { error: "Failed to create voucher." };
  }
};

export const getVouchers = async () => {
   try {
      const vouchers = await db.voucher.findMany({
         orderBy: { createdAt: 'desc' },
         include: { accountHead: true, enteredBy: true }
      });
      return { data: vouchers };
   } catch (error) {
      return { error: "Failed to fetch vouchers." };
   }
};

export const getVoucherById = async (id: string) => {
   try {
      const voucher = await db.voucher.findUnique({
         where: { id },
         include: { accountHead: true, enteredBy: true, verifiedBy: true }
      });
      if (!voucher) return { error: "Voucher not found" };
      return { data: voucher };
   } catch (error) {
      return { error: "Failed to fetch voucher." };
   }
};
