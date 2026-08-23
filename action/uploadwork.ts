"use server";

import { db } from "@/lib/db";
import { actionplanschema } from "@/schema/actionplan";
import * as z from "zod";
import { vendorSchema } from "@/schema/venderschema";
import { Prisma } from "@prisma/client";

type VendorSchemaType = z.infer<typeof vendorSchema>;

export async function fetchallApproveActionPlanDetails() {
  try {
    const schme = await db.approvedActionPlanDetails.findMany({
      where: {
        isPublish: false,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return schme;
  } catch (error) {
    console.error("Error fetching action plans:", error);
    throw new Error("Failed to fetch action plans");
  }
}

// Enhanced single creation with better error handling
export async function createschme(values: z.infer<typeof actionplanschema>) {
  try {
    // Validate input
    const validated = actionplanschema.safeParse(values);
    if (!validated.success) {
      throw new Error(`Validation failed: ${validated.error.message}`);
    }

    // Check for duplicate activityCode with transaction
    const existing = await db.$transaction(async (tx) => {
      return await tx.approvedActionPlanDetails.findUnique({
        where: { activityCode: validated.data.activityCode },
      });
    });

    if (existing) {
      console.log(`Skipping duplicate activityCode: ${validated.data.activityCode}`);
      return { 
        skipped: true, 
        activityCode: validated.data.activityCode,
        reason: "Duplicate activity code"
      };
    }

    // Create new record
    const scheme = await db.$transaction(async (tx) => {
      return await tx.approvedActionPlanDetails.create({
        data: {
          financialYear: validated.data.financialYear,
          themeName: validated.data.themeName,
          activityCode: validated.data.activityCode,
          activityName: validated.data.activityName,
          activityDescription: validated.data.activityDescription,
          activityFor: validated.data.activityFor,
          sector: validated.data.sector,
          locationofAsset: validated.data.locationofAsset,
          estimatedCost: validated.data.estimatedCost,
          totalduration: validated.data.totalduration,
          schemeName: validated.data.schemeName,
          generalFund: validated.data.generalFund,
          scFund: validated.data.scFund,
          stFund: validated.data.stFund,
          fundType: validated.data.fundType,
          upasamiti: validated.data.upasamiti,
          focusArea: validated.data.focusArea,
          workType: validated.data.workType,
          componentType: validated.data.componentType,
          gramSansad: validated.data.gramSansad,
          sdgs: validated.data.sdgs,
          beneficiariesSC: validated.data.beneficiariesSC,
          beneficiariesST: validated.data.beneficiariesST,
          beneficiariesGen: validated.data.beneficiariesGen,
          unitType: validated.data.unitType,
          totalUnit: validated.data.totalUnit,
          implementedBy: validated.data.implementedBy,
          remarks: validated.data.remarks,
        },
      });
    });

    return { 
      skipped: false, 
      scheme,
      activityCode: validated.data.activityCode
    };
  } catch (error) {
    console.error("Error in createschme:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { 
          skipped: true, 
          activityCode: values.activityCode,
          reason: "Duplicate entry"
        };
      }
    }
    throw error;
  }
}

// Enhanced bulk create with better error handling and logging
export const createbulkschme = async (
  value: z.infer<typeof actionplanschema>[]
) => {
  const results = {
    total: value.length,
    created: 0,
    skipped: 0,
    duplicates: [] as { activityCode: string; reason: string }[],
    errors: [] as { activityCode: string; error: string }[],
    details: [] as { activityCode: string; status: 'created' | 'skipped' | 'error'; message: string }[],
  };

  // Process items in batches to avoid overwhelming the database
  const BATCH_SIZE = 50;
  
  for (let i = 0; i < value.length; i += BATCH_SIZE) {
    const batch = value.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(async (item) => {
      try {
        const result = await createschme(item);
        if (result.skipped) {
          results.skipped++;
          results.duplicates.push({ 
            activityCode: item.activityCode, 
            reason: result.reason || "Duplicate" 
          });
          results.details.push({
            activityCode: item.activityCode,
            status: 'skipped',
            message: result.reason || "Duplicate activity code"
          });
        } else {
          results.created++;
          results.details.push({
            activityCode: item.activityCode,
            status: 'created',
            message: "Successfully created"
          });
        }
      } catch (error: any) {
        results.errors.push({ 
          activityCode: item.activityCode, 
          error: error.message || "Unknown error" 
        });
        results.details.push({
          activityCode: item.activityCode,
          status: 'error',
          message: error.message || "Unknown error"
        });
      }
    });

    await Promise.all(batchPromises);
  }

  // Log summary
  console.log(`Bulk upload summary: ${results.created} created, ${results.skipped} skipped, ${results.errors.length} errors`);

  return results;
};

// Get upload statistics
export async function getUploadStats() {
  try {
    const total = await db.approvedActionPlanDetails.count();
    const recent = await db.approvedActionPlanDetails.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        activityCode: true,
        activityName: true,
        createdAt: true
      }
    });
    
    return {
      total,
      recent
    };
  } catch (error) {
    console.error("Error getting upload stats:", error);
    return null;
  }
}

// Vendor registration with improvements
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
      where: { 
        OR: [
          { name },
          { email },
          { pan }
        ]
      },
    });

    if (existingVendor) {
      return { 
        error: "Vendor with this name, email, or PAN already exists" 
      };
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
      success: `${agencyType === "FARM" ? "Farm" : "Vendor"} registered successfully`, 
      vendor: newVendor 
    };
  } catch (error) {
    console.error("Error in vendorSchemaAction:", error);
    return { error: "An unexpected error occurred while adding the vendor" };
  }
}

// Bulk vendor creation with improvements
export async function createBulkAgency(values: VendorSchemaType[]) {
  const results = {
    total: values.length,
    created: 0,
    skipped: 0,
    errors: [] as { vendor: string; error: string }[],
    details: [] as { vendor: string; status: 'created' | 'skipped' | 'error'; message: string }[]
  };

  for (const vendor of values) {
    try {
      const result = await vendorSchemaAction(vendor);
      if (result.error) {
        results.skipped++;
        results.errors.push({ vendor: vendor.name, error: result.error });
        results.details.push({
          vendor: vendor.name,
          status: 'skipped',
          message: result.error
        });
      } else {
        results.created++;
        results.details.push({
          vendor: vendor.name,
          status: 'created',
          message: result.success || "Created successfully"
        });
      }
    } catch (error: any) {
      results.errors.push({ vendor: vendor.name, error: error.message });
      results.details.push({
        vendor: vendor.name,
        status: 'error',
        message: error.message
      });
    }
  }

  return results;
}
