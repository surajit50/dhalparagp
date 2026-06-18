"use server";

import { biderdetailsValidationSchema } from "@/components/form/AddBidder";
import {
  AddTechnicalDetailsSchema,
  AddTechnicalDetailsSchemaType,
} from "@/schema/tender-management-schema";
import { TenderStatus } from "@prisma/client";

import { currentUser } from "@/lib/auth";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
// Helper to detect Next.js redirect errors without relying on internal imports
function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in (error as any) &&
    typeof (error as any).digest === "string" &&
    (error as any).digest.startsWith("NEXT_REDIRECT")
  );
}
import { redirect } from "next/navigation";
import { z } from "zod";
import { NitBookValidationSchema } from "@/schema";
export const bookNitNumber = async (
  values: z.infer<typeof NitBookValidationSchema>
): Promise<{ success?: string; error?: string }> => {
  try {
    // Parse and validate the form data
    const validatedData = NitBookValidationSchema.parse({
      tendermemonumber: values.tendermemonumber,
      tendermemodate: values.tendermemodate,
      tender_pulishing_Date: values.tender_pulishing_Date,
      tender_document_Download_from: values.tender_document_Download_from,
      tender_start_time_from: values.tender_start_time_from,
      tender_end_date_time_from: values.tender_end_date_time_from,
      tender_techinical_bid_opening_date:
        values.tender_techinical_bid_opening_date,
      tender_financial_bid_opening_date:
        values.tender_financial_bid_opening_date,
      tender_place_opening_bids: values.tender_place_opening_bids,
      tender_vilidity_bids: values.tender_vilidity_bids,
      supplynit: values.supplynit,
      supplyitemname: values.supplyitemname,
      nitCount: values.nitCount,
      nitMode: values.nitMode,
      percentageofworkvaluerequired: values.percentageofworkvaluerequired,
      termsTemplateIds: values.termsTemplateIds || [],
    });

    // Check if the NIT number already exists in the same year
    const existingNit = await db.nitDetails.findFirst({
      where: {
        AND: [
          { memoNumber: parseInt(validatedData.tendermemonumber) },
          {
            memoDate: {
              gte: new Date(validatedData.tendermemodate.getFullYear(), 0, 1),
              lte: new Date(validatedData.tendermemodate.getFullYear(), 11, 31),
            },
          },
        ],
      },
    });

    if (existingNit) {
      return { error: "NIT memo number already exists for this year" };
    }

    // Create a new NIT in the database
    await db.nitDetails.create({
      data: {
        memoNumber: parseInt(validatedData.tendermemonumber),
        memoDate: validatedData.tendermemodate,
        publishingDate: validatedData.tender_pulishing_Date,
        documentDownloadFrom: validatedData.tender_document_Download_from,
        startTime: validatedData.tender_start_time_from,
        endTime: validatedData.tender_end_date_time_from,
        technicalBidOpeningDate:
          validatedData.tender_techinical_bid_opening_date,
        financialBidOpeningDate:
          validatedData.tender_financial_bid_opening_date,
        placeOfOpeningBids: validatedData.tender_place_opening_bids,
        bidValidity: parseInt(validatedData.tender_vilidity_bids),
        isSupply: validatedData.supplynit,
        supplyitemname: validatedData.supplyitemname || null,
        nitCount: validatedData.nitCount,
        nitMode: validatedData.nitMode,
        percentageofworkvaluerequired: validatedData.percentageofworkvaluerequired,
        termsTemplateIds: validatedData.termsTemplateIds || [],
      },
    });

    revalidatePath("/admindashboard/manage-tender/view", 'page');
    return { success: "Tender Booked Successfully" };
  } catch (error: unknown) {
    console.error("Error creating tender:", error);
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      const errorMessages = zodError.errors.map((err: z.ZodIssue) => err.message);
      return { error: errorMessages.join(", ") };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create tender. Please try again." };
  }
};

const NitUpdateValidationSchema = z.object({
  id: z.string().nonempty("NIT ID is required"),
  tendermemonumber: z.string().nonempty("Tender Reference Number is required"),
  tendermemodate: z.coerce.date(),
  tender_pulishing_Date: z.coerce.date(),
  tender_document_Download_from: z.coerce.date(),
  tender_start_time_from: z.coerce.date(),
  tender_end_date_time_from: z.coerce.date(),
  tender_techinical_bid_opening_date: z.coerce.date(),
  tender_financial_bid_opening_date: z.coerce.date().optional(),
  tender_place_opening_bids: z
    .string()
    .nonempty("Place for Opening Bids is required"),
  tender_vilidity_bids: z.string().nonempty("Validity of Bids is required"),
  supplynit: z.boolean().optional(),
  nitMode: z.enum(["ONLINE", "MANUAL"]).default("ONLINE"),
});

export async function updateNitNumber(
  formData: FormData
): Promise<{ success?: string; error?: string }> {
  try {
    // Parse and validate the form data
    const validatedData = NitUpdateValidationSchema.parse({
      id: formData.get("id"),
      tendermemonumber: formData.get("tendermemonumber"),
      tendermemodate: formData.get("tendermemodate"),
      tender_pulishing_Date: formData.get("tender_pulishing_Date"),
      tender_document_Download_from: formData.get(
        "tender_document_Download_from"
      ),
      tender_start_time_from: formData.get("tender_start_time_from"),
      tender_end_date_time_from: formData.get("tender_end_date_time_from"),
      tender_techinical_bid_opening_date: formData.get(
        "tender_techinical_bid_opening_date"
      ),
      tender_financial_bid_opening_date: formData.get(
        "tender_financial_bid_opening_date"
      ),
      tender_place_opening_bids: formData.get("tender_place_opening_bids"),
      tender_vilidity_bids: formData.get("tender_vilidity_bids"),
      supplynit: formData.get("supplynit") === "on",
      nitMode: formData.get("nitMode"),
    });

    // Update the NIT in the database
    await db.nitDetails.update({
      where: { id: validatedData.id },
      data: {
        memoNumber: parseInt(validatedData.tendermemonumber),
        memoDate: validatedData.tendermemodate,
        publishingDate: validatedData.tender_pulishing_Date,
        documentDownloadFrom: validatedData.tender_document_Download_from,
        startTime: validatedData.tender_start_time_from,
        endTime: validatedData.tender_end_date_time_from,
        technicalBidOpeningDate:
          validatedData.tender_techinical_bid_opening_date,
        financialBidOpeningDate:
          validatedData.tender_financial_bid_opening_date,
        placeOfOpeningBids: validatedData.tender_place_opening_bids,
        bidValidity: parseInt(validatedData.tender_vilidity_bids),
        isSupply: validatedData.supplynit,
        nitMode: validatedData.nitMode,
      },
    });

    // Revalidate the NITs page to reflect the changes
    revalidatePath("/admindashboard/manage-tender/view", 'page');

    return { success: "Tender Updated Successfully" };
  } catch (error: unknown) {
    console.error("Error updating NIT:", error);
    if (error instanceof z.ZodError) {
      // Handle validation errors
      const zodError = error as z.ZodError;
      const errorMessages = zodError.errors.map((err: z.ZodIssue) => err.message);
      return { error: errorMessages.join(", ") };
    }
    return { error: "Error in Updating Tender" };
  }
}

export const fetchWork = async () => {
  try {
    const work = await db.approvedActionPlanDetails.findMany({
      where: {
        isPublish: false,
      },
    });

    return work;
  } catch (error) {
    console.error("Error fetching work:", error);
  }
};

export const getAgencyDetails = async () => {
  try {
    const agency = await db.agencyDetails.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return agency;
  } catch (error) {
    console.log(error);
  }
};

export const getAgencyDetailsById = async (agencyid: string) => {
  try {
    const agency = await db.agencyDetails.findUnique({
      where: {
        id: agencyid,
      },
      select: {
        name: true,
        contactDetails:true
      },
    });

    return agency;
  } catch (error) {
    console.log(error);
  }
};
export const addBiderDetails = async (
  values: z.infer<typeof biderdetailsValidationSchema>,
  worksDetailId: string
) => {
  const { bidderdetails } = values; // bidderdetails is an array of agencyDetailsId

  try {
    const stage = await db.worksDetail.findFirst({
      where: {
        id: worksDetailId,
        tenderStatus: { notIn: ["published", "TechnicalBidOpening"] },
      },
    });

    if (stage !== null) {
      return { error: "Invalid Tender" };
    }

    // Check if any of the bidders already exist
    const existingBidders = await db.bidagency.findMany({
      where: {
        agencyDetailsId: { in: bidderdetails }, // Check if any selected IDs already exist
        worksDetailId,
      },
      select: { agencyDetailsId: true },
    });

    const existingBidderIds = new Set(
      existingBidders.map((b: { agencyDetailsId: string }) => b.agencyDetailsId)
    );

    // Filter out already existing bidders
    const newBidders = bidderdetails.filter((id: string) => !existingBidderIds.has(id));

    if (newBidders.length === 0) {
      return { error: "All selected bidders already exist" };
    }

    // Insert new bidders
    const bidders = await db.bidagency.createMany({
      data: newBidders.map((agencyDetailsId: string) => ({
        agencyDetailsId,
        worksDetailId,
      })),
    });

    await db.worksDetail.update({
      where: { id: worksDetailId },
      data: { tenderStatus: "TechnicalBidOpening" },
    });

    console.log("Bidders added successfully:", bidders);
    revalidatePath("/admindashboard/manage-tender/addbidderdetails", 'page');
    return {
      success: `${newBidders.length} bidder(s) added successfully`,
      bidders,
    };
  } catch (error: unknown) {
    console.error("Error creating bidders:", error);
    return { error: "Failed to add bidders" };
  }
};

export async function removeBiddingAgency(workId: string, agencyId: string) {}

export const updatebitvalue = async (data: FormData) => {
  const agenid = data.get("agencyid") as string;
  const biddingamount = data.get("biddingamount") as string;
  try {
    const amt = parseInt(biddingamount);
    if (Number.isNaN(amt)) return false;
    const agg = await db.bidagency.update({
      where: {
        id: agenid,
      },
      data: {
        biddingAmount: amt,
      },
    });

    const wid = agg.worksDetailId;

    if (!wid) {
      return false;
    }

    await db.worksDetail.update({
      where: {
        id: wid,
      },
      data: {
        tenderStatus: "TechnicalBidOpening",
      },
    });
  } catch (error: unknown) {
    console.log(error);
  }
};

export async function sentforTechnicalevelution(formData: FormData) {
  const workid = formData.get("workid") as string;

  if (!workid) {
    throw new Error("Work ID is missing.");
  }

  try {
    await db.worksDetail.update({
      where: { id: workid },
      data: { tenderStatus: "TechnicalEvaluation" },
    });

    // Revalidate the page that displays the work details
    revalidatePath(`/admindashboard/manage-tender/addbidderdetails`);

    // Redirect to the manage tender page
    redirect("/admindashboard/manage-tender/addbidderdetails");
  } catch (error: unknown) {
    // Preserve redirect errors
    if (isNextRedirectError(error)) {
      throw error;
    }

    throw new Error("Failed to update tender status");
  }
}

export const addtechnicaldetailsofagency = async (
  values: z.infer<typeof AddTechnicalDetailsSchema>,
  bidagencyid: string
) => {
  try {
    const {
      credencial,
      declaration,
      validityofdocument,
      byelow,
      pfregistrationupdatechalan,
      machinary,
      qualify,
      remarks,
    } = values;

    // Find the specific bid agency
    const existingBidAgency = await db.bidagency.findUnique({
      where: {
        id: bidagencyid,
      },
    });

    // If no bid agency is found
    if (!existingBidAgency) {
      return { error: "Invalid bid agency" };
    }

    // Create the credencial record
    const credencialRecord = await db.credencial.create({
      data: {
        sixtyperamtput: credencial.sixtyperamtput || false,
        workorder: credencial?.workorder || false,
        paymentcertificate: credencial?.paymentcertificate || false,
        comcertificat: credencial?.comcertificat || false,
      },
    });

    // Create the validityofdocument record
    const validityofdocumentRecord = await db.validityofdocument.create({
      data: {
        itreturn: validityofdocument?.itreturn || false,
        gst: validityofdocument?.gst || false,
        tradelicence: validityofdocument?.tradelicence || false,
        ptax: validityofdocument?.ptax || false,
      },
    });

    // Create the technical evaluation document
    const technicalDocument = await db.technicalEvelutiondocument.create({
      data: {
        remarks: remarks || null, // Set default value if needed
        declaration: declaration || false, // Default value if needed
        byelow: byelow || false, // Default value if needed
        pfregistrationupdatechalan: pfregistrationupdatechalan || false, // Default value if needed
        machinary: machinary || false, // Default value if needed
        qualify: qualify || false, // Default value if needed

        // Link the newly created records
        credencial: {
          connect: { id: credencialRecord.id },
        },
        validityofdocument: {
          connect: { id: validityofdocumentRecord.id },
        },

        // Link to the existing bid agency
        bidagencyId: existingBidAgency.id, // Assuming this is the correct way to link
      },
    });

    await db.bidagency.update({
      where: {
        id: existingBidAgency.id,
      },
      data: {
        technicalEvelutiondocumentId: technicalDocument.id,
      },
    });
    revalidatePath(`/admindashboard/manage-tender/addtechnicaldetails/`);
    return { success: "value Insert Succefully" };
  } catch (error: unknown) {
    console.error("Error creating technical evaluation document:", error);
    return {
      error:
        "An error occurred while creating the technical evaluation document",
    };
  }
};

export const sentforfinanicalbidadd = async (data: FormData) => {
  const workid = data.get("workid") as string;

  try {
    const updatedWork = await db.worksDetail.update({
      where: {
        id: workid,
      },
      data: {
        tenderStatus: "FinancialBidOpening",
      },
    });
    redirect("/admindashboard/manage-tender/addtechnicaldetails");
  } catch (error: unknown) {
    if (isNextRedirectError(error)) {
      throw error;
    }
  }
};

// CORRECTED FUNCTION - Only updates status when ALL bids are entered
export const addFinancialDetails = async (
  agencyid: string,
  bidamount: string,
  tenderid: string
) => {
  try {
    // Find the work associated with the tender ID
    const work = await db.worksDetail.findUnique({
      where: {
        id: tenderid,
      },
    });

    // If no work found, return error message
    if (!work) {
      return { error: "Invalid tender ID" };
    }

    // Validate bid amount - use parseFloat instead of parseInt for decimal values
    const floatBid = parseFloat(bidamount);
    if (isNaN(floatBid)) {
      return { error: "Invalid bidding amount" };
    }

    // Update the bidding amount for the agency
    const updatedAgency = await db.bidagency.update({
      where: {
        id: agencyid,
      },
      data: {
        biddingAmount: floatBid,
      },
    });

    // Check if ALL agencies have bidding amounts now
    const allAgencies = await db.bidagency.findMany({
      where: {
        worksDetailId: tenderid,
      },
    });

    const allBidsEntered = allAgencies.every(agency => agency.biddingAmount !== null);

    // Only update tender status if ALL bids are entered
    if (allBidsEntered) {
      await db.worksDetail.update({
        where: {
          id: tenderid,
        },
        data: {
          tenderStatus: "FinancialEvaluation",
        },
      });
    }

    revalidatePath(`/admindashboard/manage-tender/addfinanicaldetails`);
    revalidatePath(`/admindashboard/manage-tender/addbidderdetails/${tenderid}`);
    revalidatePath(`/admindashboard/manage-tender/addfinanicaldetails`);
    return { 
      success: "Bid amount updated successfully",
      allBidsCompleted: allBidsEntered 
    };
  } catch (error: unknown) {
    console.log(error);
    return { error: "An error occurred while updating financial details" };
  }
};

export async function deleteBidder(formData: FormData) {
  const agencyId = formData.get("agencyId");
  const workId = formData.get("workId");

  if (!agencyId || !workId) {
    throw new Error("Missing required fields");
  }

  if (typeof agencyId !== "string" || typeof workId !== "string") {
    throw new Error("Invalid input types");
  }

  try {
    await db.bidagency.delete({
      where: {
        id: agencyId,
      },
    });

    revalidatePath(`/admindashboard/manage-tender/addbidderdetails/${workId}`);
  } catch (error: unknown) {
    console.error("Failed to delete bidder:", error);
    throw new Error("Failed to delete bidder. Please try again.");
  }
}

export async function updatetechnicaldetailsofagency(
  data: AddTechnicalDetailsSchemaType,
  agencyId: string
) {}

export async function fetchNitNo(): Promise<
  { memoNumber: string; memoDate: Date }[]
> {
  try {
    const user = await currentUser();
    const loginAgencyId = user?.agencyDetailsId || undefined;

    const nit = await db.nitDetails.findMany({
      where: loginAgencyId
        ? {
            WorksDetail: {
              some: {
                biddingAgencies: {
                  some: {
                    agencyDetailsId: loginAgencyId,
                  },
                },
              },
            },
          }
        : undefined,
      select: {
        memoNumber: true,
        memoDate: true,
      },
      distinct: ["memoNumber"],
    });

    return nit.map((item: { memoNumber: number; memoDate: Date }) => ({
      memoNumber: item.memoNumber.toString(),
      memoDate: new Date(item.memoDate), // Ensure memoDate is a Date object
    }));
  } catch (error: unknown) {
    console.error("Error fetching NIT numbers:", error);
    throw error;
  }
}

export async function fetchworkdetailsbynitno(nitNO: number) {
  try {
    const user = await currentUser();
    const loginAgencyId = user?.agencyDetailsId || undefined;

    const work = await db.worksDetail.findMany({
      where: {
        nitDetails: {
          memoNumber: nitNO,
        },
        ...(loginAgencyId
          ? {
              biddingAgencies: {
                some: {
                  agencyDetailsId: loginAgencyId,
                },
              },
            }
          : {}),
      },
      include: {
        nitDetails: true,
        ApprovedActionPlanDetails: true,
        biddingAgencies: {
          include: {
            agencydetails: true,
            workorderdetails: true,
            technicalEvelution: {
              include: {
                credencial: true,
                validityofdocument: true,
              },
            },
          },
        },
        AwardofContract: {
          include: {
            workorderdetails: {
              include: {
                Bidagency: {
                  include: {
                    agencydetails: true,
                  },
                },
              },
            },
          },
        },
        paymentDetails: true,
      },
    });

    return work; // Return the fetched data
  } catch (error: unknown) {
    console.error("Error fetching work details:", error); // Log the error
    throw new Error("Failed to fetch work details."); // Provide a meaningful error message
  }
}

export const updatenitstatus = async (
  workid: string,
  tenderStatus: TenderStatus
) => {
  try {
    const work = await db.worksDetail.update({
      where: {
        id: workid,
      },
      data: {
        tenderStatus,

        ApprovedActionPlanDetails: {
          update: {
            data: {
              // Cancel → hide publish
              // Any other → show publish
              isPublish: tenderStatus === "Cancelled" ? false : true,
            },
          },
        },
      },
    });

    return work;
  } catch (error) {
    console.error("Error updating tender status:", error);
    throw new Error("Tender status update failed");
  }
};

// Add this in a separate file like actions/delete-nit.ts

export async function deleteNitAction(id: string) {
  if (!id) {
    throw new Error("NIT ID is required");
  }

  const cuser = await currentUser();

  if (!cuser) {
    throw new Error("User not authenticated");
  }
  if (cuser.role !== "admin") {
    throw new Error("User not authorized to delete NIT");
  }
  if (typeof id !== "string") {
    throw new Error("Invalid NIT ID");
  }

  try {
    // First check if NIT exists and has no works
    const nit = await db.nitDetails.findUnique({
      where: { id },
      include: { WorksDetail: true },
    });

    if (!nit) {
      throw new Error("NIT not found");
    }

    if (nit.WorksDetail.length > 0) {
      throw new Error("Cannot delete NIT with existing works");
    }

    // Delete the NIT
    await db.nitDetails.delete({
      where: { id },
    });

    // Revalidate the page to refresh the UI
    revalidatePath("/admindashboard/manage-tender/view", 'page');

    return { success: "NIT deleted successfully" };
  } catch (error: unknown) {
    console.error("Error deleting NIT:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete NIT"
    );
  }
}
