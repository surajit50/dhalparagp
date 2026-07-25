
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PondSchema, PondFormValues } from "./schema";
import { buildPondDbData } from "@/lib/utils/pond-lease";

export async function getPonds() {
  try {
    const ponds = await db.pond.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        leases: {
          where: { status: "ACTIVE" },
        },
      },
    });
    return ponds;
  } catch (error) {
    console.error("Failed to fetch ponds:", error);
    throw new Error("Failed to fetch ponds.");
  }
}

export async function createPond(values: PondFormValues) {
  const validated = PondSchema.parse(values);
  
  await db.pond.create({
    data: buildPondDbData(validated),
  });

  revalidatePath("/admindashboard/register/ponds");
  revalidatePath("/admindashboard/register/pond-lease");
}

export async function updatePond(id: string, values: PondFormValues) {
  const validated = PondSchema.parse(values);

  const existing = await db.pond.findUnique({
    where: { id },
    include: { leases: { where: { status: "ACTIVE" } } },
  });

  if (!existing) {
    throw new Error("Pond not found");
  }

  if (validated.pondType === "PUBLIC" && existing.leases.length > 0) {
    throw new Error("Cannot mark as public pond while an active lease exists.");
  }

  if (validated.pondType === "LEASEABLE" && existing.pondType === "PUBLIC") {
    const hasPublicPayments = await db.pondPublicPayment.count({
      where: { pondId: id },
    });

    if (hasPublicPayments > 0) {
      throw new Error(
        "Cannot change to leasable pond while public collection records exist.",
      );
    }
  }
  
  await db.pond.update({
    where: { id },
    data: buildPondDbData(validated),
  });

  revalidatePath("/admindashboard/register/ponds");
  revalidatePath("/admindashboard/register/pond-lease");
}

export async function deletePond(id: string) {
  // Check if pond has any leases before deleting
  const pond = await db.pond.findUnique({
    where: { id },
    include: {
      leases: true,
      publicPayments: true,
    },
  });

  if (pond?.leases.length) {
    throw new Error("Cannot delete pond with existing leases.");
  }

  if (pond?.publicPayments.length) {
    throw new Error("Cannot delete pond with public collection records.");
  }

  await db.pond.delete({
    where: { id },
  });

  revalidatePath("/admindashboard/register/ponds");
  revalidatePath("/admindashboard/register/pond-lease");
}

export async function verifyPond(id: string) {
  const pond = await db.pond.findUnique({
    where: { id },
  });

  if (!pond) {
    throw new Error("Pond not found");
  }

  await db.pond.update({
    where: { id },
    data: { isVerified: true },
  });

  revalidatePath("/admindashboard/register/ponds");
  revalidatePath("/admindashboard/register/pond-lease");
}
