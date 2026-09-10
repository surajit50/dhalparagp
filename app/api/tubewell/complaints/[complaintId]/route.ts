// app/api/tubewell/complaints/[complaintId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET - Get single complaint
export async function GET(req: NextRequest, { params }: { params: { complaintId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const complaint = await prisma.tubeWellComplaint.findUnique({
      where: { complaintId: params.complaintId },
      include: {
        tubeWell: true,
        category: true,
        photos: true,
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error('[COMPLAINT_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaint' },
      { status: 500 }
    );
  }
}

// PUT - Update complaint
export async function PUT(req: NextRequest, { params }: { params: { complaintId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'staff', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const complaint = await prisma.tubeWellComplaint.update({
      where: { complaintId: params.complaintId },
      data: body,
      include: {
        tubeWell: true,
        category: true,
      },
    });

    // Create audit log
    await prisma.tubeWellAuditLog.create({
      data: {
        tubeWellId: complaint.tubeWellId,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        action: 'Updated',
        recordType: 'Complaint',
        recordId: complaint.id,
        description: `Complaint ${complaint.complaintId} updated by ${session.user.name}`,
      },
    });

    return NextResponse.json(complaint);
  } catch (error) {
    console.error('[COMPLAINT_PUT]', error);
    return NextResponse.json(
      { error: 'Failed to update complaint' },
      { status: 500 }
    );
  }
}
