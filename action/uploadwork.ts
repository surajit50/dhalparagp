"use server";

import { db } from "@/lib/db";
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

// Single creation – skip if activityCode already exists
export async function createschme(values: z.infer<typeof actionplanschema>) {
  console.log(values);

  try {
    // Check for duplicate activityCode
    const existing = await db.approvedActionPlanDetails.findUnique({
      where: { activityCode: values.activityCode },
    });

    if (existing) {
      console.log(`Skipping duplicate activityCode: ${values.activityCode}`);
      return { skipped: true, activityCode: values.activityCode };
    }

    // Create new record with all fields including fundType
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
        fundType: values.fundType,
      },
    });
    return { skipped: false, scheme };
  } catch (error) {
    console.error("Error in createschme:", error);
    throw error;
  }
}

// Bulk create – returns summary of created, skipped, duplicates, errors
export const createbulkschme = async (
  value: z.infer<typeof actionplanschema>[]
) => {
  const results = {
    total: value.length,
    created: 0,
    skipped: 0,
    duplicates: [] as string[],
    errors: [] as { activityCode: string; error: any }[],
  };

  for (const item of value) {
    try {
      const result = await createschme(item);
      if (result.skipped) {
        results.skipped++;
        results.duplicates.push(item.activityCode);
      } else {
        results.created++;
      }
    } catch (error) {
      results.errors.push({ activityCode: item.activityCode, error });
    }
  }

  return results;
};

// Vendor registration (unchanged)
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
    const existingVendor = await db.agencyDetails.findFirst({
      where: { name },
    });

    if (existingVendor) {
      return { error: "Vendor with this name already exists" };
    }

    const newVendor = await db.agencyDetails.create({
      data: {
        name,
        email,
        mobileNumber,
        gst,
        pan,
        tin,
        contactDetails: postalAddress,
        agencyType,
        proprietorName,
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

// Bulk vendor creation (unchanged)
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
