// app/api/tubewell/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET - Dashboard statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const village = req.nextUrl.searchParams.get('village');
    const mouza = req.nextUrl.searchParams.get('mouza');
    const ward = req.nextUrl.searchParams.get('ward');

    const where: any = { isDeleted: false };
    if (village) where.villageId = village;
    if (mouza) where.mouzaId = mouza;
    if (ward) where.wardId = ward;

    // Get all statistics concurrently
    const [totalTubeWells, functional, partiallyFunctional, nonFunctional, underRepair, waterAvailable, complaintsPending, repairsThisMonth, totalExpenditure] =
      await Promise.all([
        prisma.tubeWell.count({ where }),
        prisma.tubeWell.count({
          where: { ...where, functionalStatus: 'Functional' },
        }),
        prisma.tubeWell.count({
          where: { ...where, functionalStatus: 'Partially Functional' },
        }),
        prisma.tubeWell.count({
          where: { ...where, functionalStatus: 'Non-Functional' },
        }),
        prisma.tubeWell.count({
          where: { ...where, functionalStatus: 'Under Repair' },
        }),
        prisma.tubeWell.count({
          where: { ...where, waterAvailable: true },
        }),
        prisma.tubeWellComplaint.count({
          where: {
            tubeWell: where,
            status: { in: ['Submitted', 'Verified', 'Assigned', 'In Progress'] },
          },
        }),
        prisma.tubeWellRepair.count({
          where: {
            tubeWell: where,
            repairDate: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            },
          },
        }),
        prisma.tubeWellRepair.aggregate({
          where: {
            tubeWell: where,
            completionStatus: 'Completed',
          },
          _sum: { actualCost: true },
        }),
      ]);

    // Get status breakdown
    const statusBreakdown = await prisma.tubeWell.groupBy({
      by: ['functionalStatus'],
      where,
      _count: true,
    });

    // Get complaint breakdown
    const complaintBreakdown = await prisma.tubeWellComplaint.groupBy({
      by: ['status'],
      where: {
        tubeWell: where,
        isDeleted: false,
      },
      _count: true,
    });

    // Get mouza-wise breakdown
    const mouzaBreakdown = await prisma.tubeWell.groupBy({
      by: ['mouzaId'],
      where,
      _count: true,
    });

    return NextResponse.json({
      summary: {
        totalTubeWells,
        functional,
        partiallyFunctional,
        nonFunctional,
        underRepair,
        waterAvailable,
        complaintsPending,
        repairsThisMonth,
        maintenanceCost: totalExpenditure._sum.actualCost || 0,
      },
      statusBreakdown,
      complaintBreakdown,
      mouzaBreakdown,
    });
  } catch (error) {
    console.error('[TUBEWELL_DASHBOARD]', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
