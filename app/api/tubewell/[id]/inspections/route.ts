// app/api/tubewell/[id]/inspections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET - List inspections for a tube well
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [inspections, total] = await Promise.all([
      prisma.tubeWellInspection.findMany({
        where: {
          tubeWellId: params.id,
          isDeleted: false,
        },
        include: {
          photos: {
            where: { isDeleted: false },
          },
          assessments: true,
        },
        orderBy: { inspectionDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tubeWellInspection.count({
        where: {
          tubeWellId: params.id,
          isDeleted: false,
        },
      }),
    ]);

    return NextResponse.json({
      data: inspections,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[TUBEWELL_INSPECTIONS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch inspections' },
      { status: 500 }
    );
  }
}

// POST - Create new inspection
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'staff', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Verify tube well exists
    const tubeWell = await prisma.tubeWell.findUnique({
      where: { id: params.id },
    });

    if (!tubeWell) {
      return NextResponse.json({ error: 'Tube well not found' }, { status: 404 });
    }

    const inspection = await prisma.tubeWellInspection.create({
      data: {
        tubeWellId: params.id,
        inspectionDate: body.inspectionDate || new Date(),
        inspectorId: session.user.id,
        inspectorName: session.user.name || 'Unknown',
        latitude: body.latitude,
        longitude: body.longitude,
        accuracy: body.accuracy,
        functionalStatus: body.functionalStatus,
        waterAvailable: body.waterAvailable,
        waterLevel: body.waterLevel,
        cleanliness: body.cleanliness,
        repairRequired: body.repairRequired || false,
        priority: body.priority,
        remarks: body.remarks,
        nextActionRequired: body.nextActionRequired || false,
        nextAction: body.nextAction,
      },
      include: {
        photos: true,
        assessments: true,
      },
    });

    // Update tube well status if inspection shows different status
    if (body.functionalStatus !== tubeWell.functionalStatus) {
      await prisma.tubeWell.update({
        where: { id: params.id },
        data: {
          functionalStatus: body.functionalStatus,
          lastStatusUpdate: new Date(),
        },
      });
    }

    // Create audit log
    await prisma.tubeWellAuditLog.create({
      data: {
        tubeWellId: params.id,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        action: 'Inspected',
        recordType: 'Inspection',
        recordId: inspection.id,
        description: `Inspection conducted by ${session.user.name} for tube well ${tubeWell.assetId}`,
      },
    });

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error('[TUBEWELL_INSPECTION_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create inspection' },
      { status: 500 }
    );
  }
}
