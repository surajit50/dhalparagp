// app/api/warish/submit-enquiry-report/route.ts
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { createNotification, currentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    

    const formData = await request.formData();
    const report = formData.get('report') as string;
    const applicationId = formData.get('applicationId') as string;
const userid = formData.get("userId") as string
    if (!report || !applicationId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate report length
    if (report.length > 1000) {
      return NextResponse.json(
        { success: false, message: "Report exceeds maximum length of 1000 characters" },
        { status: 400 }
      );
    }

    // Check if the application exists
    const existingApplication = await db.warishApplication.findUnique({
      where: { id: applicationId }
    });

    if (!existingApplication) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // Update the WarishApplication
    const updatedApplication = await db.warishApplication.update({
      where: { id: applicationId },
      data: {
        fieldreportRemark: report,
        warishApplicationStatus: "pending",
      },
    });

   
   
    revalidatePath(`/employeedashboard/warish/view-assigned/`);

    return NextResponse.json({
      success: true,
      message: "Enquiry report submitted successfully",
  
    });
    
  } catch (error) {
    console.error("Error submitting enquiry report:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error 
          ? error.message 
          : "An unknown error occurred" 
      },
      { status: 500 }
    );
  }
}

