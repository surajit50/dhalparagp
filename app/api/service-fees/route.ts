import { NextResponse } from 'next/server';
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Fetch service fees from database
    const serviceFees = await db.serviceFee.findMany({
      select: {
        serviceType: true,
        amount: true,
        
      },
    })

   

      return NextResponse.json({
        success: true,
        fees: serviceFees,
        message: "Service fees retrieved successfully",
      })
    
  } catch (error) {
    console.error("Service fees fetch error:", error)
   
  }
}
