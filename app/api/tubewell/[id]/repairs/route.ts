// app/api/tubewell/[id]/repairs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { generateRepairId } from '@/lib/tubewell/asset-id-generator';
import { authOptions } from '@/lib/auth';

// GET - List repairs for a tube well
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

    if (status) where.completionStatus = status;

    const [repairs, total] = await Promise.all([
      prisma.tubeWellRepair.findMany({
        where,
        include: {
          category: true,
          photos: {
            where: { isDeleted: false },
          },
        },
        orderBy: { repairDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tubeWellRepair.count({ where }),
    ]);

    // Calculate total expenditure
    const expenditure = repairs.reduce((sum, repair) => sum + repair.actualCost, 0);

    return NextResponse.json({
      data: repairs,
      totalExpenditure: expenditure,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[TUBEWELL_REPAIRS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch repairs' },
      { status: 500 }
    );
  }
}

// POST - Create new repair
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

    const repairId = await generateRepairId();

    const repair = await prisma.tubeWellRepair.create({
      data: {
        repairId,
        tubeWellId: params.id,
        categoryId: body.categoryId,
        complaintId: body.complaintId,
        problem: body.problem,
        repairType: body.repairType,
        estimatedCost: body.estimatedCost || 0,
        actualCost: body.actualCost || 0,
        materialsUsed: body.materialsUsed,
        staffResponsible: body.staffResponsible || session.user.id,
        contractorVendor: body.contractorVendor,
        repairDate: body.repairDate || new Date(),
        completionStatus: 'Pending',
        remarks: body.remarks,
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
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        action: 'Repaired',
        recordType: 'Repair',
        recordId: repair.id,
        description: `Repair ${repairId} initiated for tube well ${tubeWell.assetId}`,
      },
    });

    return NextResponse.json(repair, { status: 201 });
  } catch (error) {
    console.error('[TUBEWELL_REPAIR_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create repair' },
      { status: 500 }
    );
  }
}
