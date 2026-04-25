// action/availability.ts
"use server";

import { ServiceType } from "@prisma/client";

export const getAvailableSlots = async (
  serviceType: ServiceType,
  date: Date
) => {
  try {
    const params = new URLSearchParams({
      serviceType,
      date: date.toISOString(),
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/availability?${params}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch availability");
    }

    return response.json();
  } catch (error) {
    console.error(error);
    return { success: false, data: 0 };
  }
};
