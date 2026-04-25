"use server";

import { db } from "@/lib/db";
import {
  PollingDetailsType,
  pollingDetailsSchema,
} from "@/schema/pollingDetailsSchema";
import { revalidateTag } from "next/cache";

export const addPollingdetails = async (values: PollingDetailsType) => {
  const validateField = pollingDetailsSchema.safeParse(values);
  if (!validateField.success) {
    return { error: "Invalid fields !" };
  }

  const { pollingdetailsname, pollingdetailsno, malevoter, femalevoter } =
    validateField.data;

  try {
    const pdetails = await db.pollingDetails.create({
      data: {
        pollingdetailsname,
        pollingdetailsno: parseInt(pollingdetailsno),
        malevoter: parseInt(malevoter),
        femalevoter: parseInt(femalevoter),
        financialYear: new Date().getFullYear().toString(),
      },
    });

    console.log(pdetails);
    revalidateTag("/admindashboard/pollingdetails", 'max');
    return { success: "Polling Details Add Sucessfully" };
  } catch (error) {
    return { error: "something went wrong" };
  }
};

export const editPollingdetails = async (
  values: PollingDetailsType,
  id: string
) => {
  const validateField = pollingDetailsSchema.safeParse(values);
  if (!validateField.success) {
    return { error: "Invalid fields !" };
  }

  const { pollingdetailsname, pollingdetailsno, malevoter, femalevoter } =
    validateField.data;

  try {
    const pdetails = await db.pollingDetails.update({
      where: { id },
      data: {
        pollingdetailsname,
        pollingdetailsno: parseInt(pollingdetailsno),
        malevoter: parseInt(malevoter),
        femalevoter: parseInt(femalevoter),
      },
    });

    console.log(pdetails);
    return { success: "Polling Details Edit  Sucessfully" };
  } catch (error) {
    console.log(error);
    return { error: "something went wrong" };
  }
};

export const deletePollingdetails = async (id: string) => {
  try {
    const data = await db.pollingDetails.delete({
      where: { id },
    });
    console.log(data);
    revalidateTag("/admindashboard/pollingdetails", 'max');

    return { success: "Date Delete sucefully" };
  } catch (error) {
    console.log(error);
  }
};

export const fetchPollingdetailsbyId = async (id: string) => {
  try {
    const data = await db.pollingDetails.findUnique({
      where: { id },
    });

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getPollingDetailsList = async () => {
  try {
    const data = await db.pollingDetails.findMany({
      orderBy: { pollingdetailsno: "asc" },
    });
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};
