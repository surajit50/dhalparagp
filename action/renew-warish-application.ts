"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { gpcode } from "@/constants/gpinfor";
export async function getLatestMemoNumber(year: number): Promise<number> {
  if (year < 1900 || year > 9999 || !Number.isInteger(year)) {
    throw new Error("Invalid year: must be a 4-digit integer between 1900 and 9999");
  }

  const latestMemo = await db.warishApplication.findFirst({
    where: { warishRefNo: { endsWith: `/${year}` } },
    orderBy: { warishRefNo: "desc" },
    select: { warishRefNo: true },
  });

  if (!latestMemo?.warishRefNo) return 0;

  const parts = latestMemo.warishRefNo.split("/");
  const numberPart = parseInt(parts[0], 10);

  if (parts.length !== 4 || isNaN(numberPart)) {
    throw new Error(`Invalid memo number format: ${latestMemo.warishRefNo}`);
  }

  return numberPart;
}

export async function renewWarishApplication(id: string) {
  const today = new Date();
  const currentYear = today.getFullYear();

  try {
    await db.$transaction(async (tx) => {
      const latestMemoNumber = await getLatestMemoNumber(currentYear);
      const newMemoNumber = latestMemoNumber + 1;

      const newWarishRefNo = `${newMemoNumber
        .toString()
        .padStart(3, "0")}/${gpcode}/(LH)/${currentYear}`;

      const renewdate = new Date(today);
      renewdate.setMonth(renewdate.getMonth() + 6);

      await tx.warishApplication.update({
        where: { id },
        data: {
          warishRefNo: newWarishRefNo,
          warishRefDate: today,
          renewdate,
          approvalYear: currentYear.toString(),
          warishApplicationStatus: "renewed",
        },
      });

      await tx.warishDocument.deleteMany({ where: { warishId: id } });
    });

    revalidatePath("/admindashboard/manage-warish/generate", 'page');
    revalidatePath("/admindashboard/manage-warish/renew", 'page');

    return { success: true, message: "Application renewed successfully" };
  } catch (error) {
    console.error("Failed to renew application:", error);
    return { success: false, message: `Failed to renew application` };
  }
}
