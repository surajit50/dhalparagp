import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schema
const EditBidSchema = z.object({
  bidId: z.string().min(1, 'Bid ID is required'),
  newAmount: z.number().positive('Amount must be positive'),
  workId: z.string().min(1, 'Work ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validation = EditBidSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { bidId, newAmount, workId } = validation.data;

    // Check if the work exists and is in the correct status
    const work = await db.worksDetail.findUnique({
      where: { id: workId },
      select: { tenderStatus: true }
    });

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      );
    }

    if (work.tenderStatus !== 'FinancialEvaluation') {
      return NextResponse.json(
        { error: 'Work is not in financial evaluation status' },
        { status: 400 }
      );
    }

    // Update the bid amount
    const updatedBid = await db.bidagency.update({
      where: { id: bidId },
      data: { biddingAmount: newAmount },
      include: {
        agencydetails: true,
      },
    });

    if (!updatedBid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bid amount updated successfully',
      bid: {
        id: updatedBid.id,
        biddingAmount: updatedBid.biddingAmount,
        agencyName: updatedBid.agencydetails?.name,
      },
    });

  } catch (error) {
    console.error('Error updating bid:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
