import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const session = await auth();
    console.log("Session:", session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Request body:", body);
    const {
      workOrderId,
      cancelReason,
      remarks,
      documents,
    } = body;

    if (!workOrderId || !cancelReason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First, find the work order details with related data
    const workOrderDetail = await db.workorderdetails.findUnique({
      where: { id: workOrderId },
      include: {
        Bidagency: {
          include: {
            WorksDetail: true,
            agencydetails: true,
          },
        },
      },
    });

    console.log("Work Order Detail:", JSON.stringify(workOrderDetail, null, 2));

    if (!workOrderDetail) {
      return NextResponse.json(
        { error: "Work order not found" },
        { status: 404 }
      );
    }

    // Create work order cancellation record
    const cancellation = await db.workOrderCancellation.create({
      data: {
        workOrderId,
        cancelReason,
        cancelledBy: session.user.id,
        remarks,
        documents,
        status: "PENDING",
      },
    });

    console.log("Cancellation record created:", cancellation);

    // Update work status
    const bidAgency = workOrderDetail.Bidagency;
    console.log("Bid Agency:", bidAgency);

    // Type guard to check if bidAgency is an array
    const isBidAgencyArray = (value: any): value is any[] => {
      return Array.isArray(value) && value.length > 0;
    };
    
    if (bidAgency && isBidAgencyArray(bidAgency) && bidAgency[0]?.WorksDetail?.id) {
      console.log("Updating work status for ID:", bidAgency[0].WorksDetail.id);
      
      await db.worksDetail.update({
        where: {
          id: bidAgency[0].WorksDetail.id,
        },
        data: {
          workStatus: "approved",
          tenderStatus: "FinancialEvaluation",
        },
      });
      console.log("Work status updated successfully");
    } else {
      console.log("Could not update work status - missing data:", {
        hasBidAgency: !!bidAgency,
        isArray: isBidAgencyArray(bidAgency),
        hasFirstElement: isBidAgencyArray(bidAgency) && !!bidAgency[0],
        hasWorksDetail: isBidAgencyArray(bidAgency) && !!bidAgency[0]?.WorksDetail,
        hasId: isBidAgencyArray(bidAgency) && !!bidAgency[0]?.WorksDetail?.id
      });
    }

    // Delete the work order details and award of contract
    console.log("Deleting work order details for ID:", workOrderId);
    await db.workorderdetails.delete({
      where: {
        id: workOrderId,
      },
    });

    // Delete the award of contract if it exists
    if (workOrderDetail.awardofContractId) {
      console.log("Deleting award of contract for ID:", workOrderDetail.awardofContractId);
      await db.awardofContract.delete({
        where: {
          id: workOrderDetail.awardofContractId,
        },
      });
    }

    // Revalidate the page
    revalidatePath("/admindashboard/manage-tender/cancel-work-order");

    return NextResponse.json({
      success: true,
      message: "Work order cancelled successfully",
      data: cancellation,
    });
  } catch (error) {
    console.error("Work order cancellation error:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: "Failed to cancel work order" },
      { status: 500 }
    );
  }
} 
