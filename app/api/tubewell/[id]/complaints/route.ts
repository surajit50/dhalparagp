// app/api/tubewell/[id]/complaints/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { generateComplaintId } from '@/lib/tubewell/asset-id-generator';
import { authOptions } from '@/lib/auth';

// GET - List complaints for a tube well
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const status = req.nextUrl.searchParams.get('status');

    const where: any = {
      tubeWellId: params.id,
      isDeleted: false,
    };

    if (status) where.status = status;

    const [complaints, total] = await Promise.all([
      prisma.tubeWellComplaint.findMany({
        where,
        include: {
          category: true,
          photos: {
            where: { isDeleted: false },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tubeWellComplaint.count({ where }),
    ]);

    return NextResponse.json({
      data: complaints,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[TUBEWELL_COMPLAINTS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

// POST - Create new complaint
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);

    // Verify tube well exists
    const tubeWell = await prisma.tubeWell.findUnique({
      where: { id: params.id },
    });

    if (!tubeWell) {
      return NextResponse.json({ error: 'Tube well not found' }, { status: 404 });
    }

    const complaintId = await generateComplaintId();

    const complaint = await prisma.tubeWellComplaint.create({
      data: {
        complaintId,
        tubeWellId: params.id,
        categoryId: body.categoryId,
        complainantName: body.complainantName,
        complainantPhone: body.complainantPhone,
        complainantEmail: body.complainantEmail,
        complainantAddress: body.complainantAddress,
        description: body.description,
        priority: body.priority || 'Medium',
        status: 'Submitted',
        location: body.location,
        isPublic: body.isPublic !== false,
      },
      include: {
        category: true,
        photos: true,
      },
    });

    // Create audit log
    await prisma.tubeWellAuditLog.create({
      data: {
        tubeWellId: params.id,
        userId: session?.user?.id || 'system',
        userName: body.complainantName,
        action: 'Complained',
        recordType: 'Complaint',
        recordId: complaint.id,
        description: `Complaint ${complaintId} filed for tube well ${tubeWell.assetId}`,
      },
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error('[TUBEWELL_COMPLAINT_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create complaint' },
      { status: 500 }
    );
  }
}
