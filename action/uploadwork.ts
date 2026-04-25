"use server";

import { db } from "@/lib/db";
import { AgencyDetails, ApprovedActionPlanDetails } from "@prisma/client";
import { actionplanschema } from "@/schema/actionplan";
import * as z from "zod";
import { vendorSchema } from "@/schema/venderschema";

type VendorSchemaType = z.infer<typeof vendorSchema>;
export async function fetchallApproveActionPlanDetails() {
  try {
    const schme = await db.approvedActionPlanDetails.findMany({
      where: {
        isPublish: false,
      },
    });
    return schme;
  } catch (error) {
    console.log(error);
  }
}

export async function createschme(values: z.infer<typeof actionplanschema>) {
  console.log(values);

  try {
    const scheme = await db.approvedActionPlanDetails.create({
      data: {
        financialYear: values.financialYear,
        themeName: values.themeName,
        activityCode: values.activityCode,
        activityName: values.activityName,

        activityDescription: values.activityDescription,

        activityFor: values.activityFor,
        sector: values.sector,
        locationofAsset: values.locationofAsset,
        estimatedCost: values.estimatedCost,
        totalduration: values.totalduration,

        schemeName: values.schemeName,
        generalFund: values.generalFund,
        scFund: values.scFund,
        stFund: values.stFund,
      },
    });
    return scheme;
  } catch (error) {
    console.log(error);
  }
}

export const createbulkschme = async (
  value: z.infer<typeof actionplanschema>[]
) => {
  try {
    for (let warish of value) {
      console.log(warish);
      await createschme(warish);
    }
  } catch (error) {
    console.log(error);
  }
};

export async function vendorSchemaAction(values: VendorSchemaType) {
  const validatedFields = vendorSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid fields!",
      details: validatedFields.error.flatten(),
    };
  }

  const { 
    name, 
    email, 
    mobileNumber, 
    gst, 
    pan, 
    tin, 
    postalAddress,
    agencyType,
    proprietorName 
  } = validatedFields.data;

  try {
    // Check for existing vendor by name
    const existingVendor = await db.agencyDetails.findFirst({
      where: { name },
    });

    if (existingVendor) {
      return { error: "Vendor with this name already exists" };
    }

    // Create new vendor with agency type and proprietor name
    const newVendor = await db.agencyDetails.create({
      data: {
        name,
        email,
        mobileNumber,
        gst,
        pan,
        tin,
        contactDetails: postalAddress,
        agencyType,       // Added agency type
        proprietorName,   // Added proprietor name (will be null for individuals)
      },
    });

    return { 
      success: `${
        agencyType === "FARM" ? "Farm" : "Vendor"
      } registered successfully`, 
      vendor: newVendor 
    };
  } catch (error) {
    console.error("Error in vendorSchemaAction:", error);
    return { error: "An unexpected error occurred while adding the vendor" };
  }
}

export async function createBulkAgency(values: VendorSchemaType[]) {
  const results = [];

  for (const vendor of values) {
    try {
      const result = await vendorSchemaAction(vendor);
      results.push({ vendor: vendor.name, result });
    } catch (error) {
      console.error("Error processing vendor:", vendor.name, error);
      results.push({ vendor: vendor.name, error: "Failed to process vendor" });
    }
  }

  return results;
}
