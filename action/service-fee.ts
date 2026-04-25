"use server";

import { db } from "@/lib/db";
import { ServiceType } from "@prisma/client";

export async function getServiceFee(serviceType: ServiceType) {
  try {
    const fee = await db.serviceFee.findFirst({
      where: {
        serviceType,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, data: fee };
  } catch (error) {
    console.error('Error fetching service fee:', error);
    return { success: false, error: "Failed to fetch service fee" };
  }
} 