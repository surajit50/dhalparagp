// app/api/tubewell/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET - Get single tube well
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tubeWell = await prisma.tubeWell.findUnique({
      where: { id: params.id },
      include: {
        type: true,
        status: true,
        waterQualityStatus: true,
        schemeSource: true,
        caretaker: true,
        photos: {
          where: { isDeleted: false },
          orderBy: { uploadDate: 'desc' },
        },
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 5,
          include: {
            photos: true,
            assessments: true,
          },
        },
        complaints: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        repairs: {
          where: { isDeleted: false },
          orderBy: { repairDate: 'desc' },
          take: 5,
        },
        qrCode: true,
        _count: {
          select: {
            photos: true,
            inspections: true,
            complaints: true,
            repairs: true,
          },
        },
      },
    });

    if (!tubeWell) {
      return NextResponse.json({ error: 'Tube well not found' }, { status: 404 });
    }

    return NextResponse.json(tubeWell);
  } catch (error) {
    console.error('[TUBEWELL_GET_ID]', error);
    return NextResponse.json(
      { error: 'Failed to fetch tube well' },
      { status: 500 }
    );
  }
}

// PUT - Update tube well
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'staff', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Get previous data for audit log
    const previousData = await prisma.tubeWell.findUnique({
      where: { id: params.id },
    });

    if (!previousData) {
      return NextResponse.json({ error: 'Tube well not found' }, { status: 404 });
    }

    const tubeWell = await prisma.tubeWell.update({
      where: { id: params.id },
      data: body,
      include: {
        type: true,
        status: true,
      },
    });

    // Create audit log
    await prisma.tubeWellAuditLog.create({
      data: {
        tubeWellId: tubeWell.id,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        action: 'Updated',
        recordType: 'TubeWell',
        recordId: tubeWell.id,
        description: `Tube well ${tubeWell.assetId} updated by ${session.user.name}`,
        previousValue: JSON.stringify(previousData),
        newValue: JSON.stringify(body),
      },
    });

    return NextResponse.json(tubeWell);
  } catch (error) {
    console.error('[TUBEWELL_PUT]', error);
    return NextResponse.json(
      { error: 'Failed to update tube well' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete tube well
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tubeWell = await prisma.tubeWell.update({
      where: { id: params.id },
      data: { isDeleted: true },
    });

    // Create audit log
    await prisma.tubeWellAuditLog.create({
      data: {
        tubeWellId: tubeWell.id,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        action: 'Deleted',
        recordType: 'TubeWell',
        recordId: tubeWell.id,
        description: `Tube well ${tubeWell.assetId} deleted by ${session.user.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TUBEWELL_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete tube well' },
      { status: 500 }
    );
  }
}
