// app/api/tubewell/reports/repairs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { generateCSVContent, formatExportDate, formatCurrency } from '@/lib/tubewell/export-helpers';
import { authOptions } from '@/lib/auth';

// GET - Generate repair report
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const format = req.nextUrl.searchParams.get('format') || 'csv';
    const status = req.nextUrl.searchParams.get('status');
    const startDate = req.nextUrl.searchParams.get('startDate');
    const endDate = req.nextUrl.searchParams.get('endDate');

    const where: any = { isDeleted: false };
    if (status) where.completionStatus = status;

    if (startDate || endDate) {
      where.repairDate = {};
      if (startDate) where.repairDate.gte = new Date(startDate);
      if (endDate) where.repairDate.lte = new Date(endDate);
    }

    const repairs = await prisma.tubeWellRepair.findMany({
      where,
      include: {
        tubeWell: true,
        category: true,
      },
      orderBy: { repairDate: 'desc' },
    });

    const reportData = repairs.map((repair, index) => ({
      slNo: index + 1,
      repairId: repair.repairId,
      assetId: repair.tubeWell.assetId,
      problem: repair.problem,
      category: repair.category.name,
      estimatedCost: formatCurrency(repair.estimatedCost),
      actualCost: formatCurrency(repair.actualCost),
      repairDate: formatExportDate(repair.repairDate),
      completionDate: formatExportDate(repair.completionDate),
      status: repair.completionStatus,
      remarks: repair.remarks || '-',
    }));

    if (format === 'csv') {
      const headers = [
        'slNo',
        'repairId',
        'assetId',
        'problem',
        'category',
        'estimatedCost',
        'actualCost',
        'repairDate',
        'completionDate',
        'status',
        'remarks',
      ];
      const csv = generateCSVContent(reportData, headers);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="repair_report.csv"',
        },
      });
    } else if (format === 'json') {
      return NextResponse.json(reportData);
    }

    return NextResponse.json(
      { error: 'Unsupported format. Use csv or json' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[REPAIR_REPORT]', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
