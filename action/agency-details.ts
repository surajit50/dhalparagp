"use server";
import { db } from "@/lib/db";
import * as z from "zod";
import { vendorSchema } from "@/schema/venderschema";
type VendorSchemaType = z.infer<typeof vendorSchema>;
export const deteteagency = async (id: string) => {
  try {
    await db.agencyDetails.delete({
      where: {
        id: id,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateAgencyDetails = async (
  data: VendorSchemaType,
  id: string
) => {
  try {
    const validatedschema = vendorSchema.safeParse(data);

    if (!validatedschema.success) {
      return { error: "somthing went wrong" };
    }

    const { name, gst, tin, postalAddress, mobileNumber, email, pan, agencyType, proprietorName } =
      validatedschema.data;
    await db.agencyDetails.update({
      where: {
        id: id,
      },
      data: {
        name,
        gst,
        tin,
        mobileNumber,
        email,
        pan,
        contactDetails: postalAddress,
        agencyType,
        proprietorName,
      },
    });
    return { success: "Vendor Update successfully" };
  } catch (error) {
    console.log(error);
    return { error: "Somthing went wrong" };
  }
};
