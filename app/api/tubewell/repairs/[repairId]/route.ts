// app/api/tubewell/repairs/[repairId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET - Get single repair
export async function GET(req: NextRequest, { params }: { params: { repairId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repair = await prisma.tubeWellRepair.findUnique({
      where: { repairId: params.repairId },
      include: {
        tubeWell: true,
        category: true,
        photos: {
          where: { isDeleted: false },
        },
      },
    });

    if (!repair) {
      return NextResponse.json({ error: 'Repair not found' }, { status: 404 });
    }

    return NextResponse.json(repair);
  } catch (error) {
    console.error('[REPAIR_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch repair' },
      { status: 500 }
    );
  }
}

// PUT - Update repair
export async function PUT(req: NextRequest, { params }: { params: { repairId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'staff', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const repair = await prisma.tubeWellRepair.update({
      where: { repairId: params.repairId },
      data: body,
      include: {
        tubeWell: true,
        category: true,
      },
    });

    // If repair is completed, update tube well status
    if (body.completionStatus === 'Completed') {
      await prisma.tubeWell.update({
        where: { id: repair.tubeWellId },
        data: {
          functionalStatus: 'Functional',
          lastStatusUpdate: new Date(),
        },
      });
    }

    // Create audit log
    await prisma.tubeWellAuditLog.create({
      data: {
        tubeWellId: repair.tubeWellId,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        action: 'Updated',
        recordType: 'Repair',
        recordId: repair.id,
        description: `Repair ${repair.repairId} updated by ${session.user.name}`,
      },
    });

    return NextResponse.json(repair);
  } catch (error) {
    console.error('[REPAIR_PUT]', error);
    return NextResponse.json(
      { error: 'Failed to update repair' },
      { status: 500 }
    );
  }
}
