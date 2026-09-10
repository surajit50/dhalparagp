// app/api/tubewell/reports/complaints/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { generateCSVContent, formatExportDate } from '@/lib/tubewell/export-helpers';
import { authOptions } from '@/lib/auth';

// GET - Generate complaint report
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const format = req.nextUrl.searchParams.get('format') || 'csv';
    const status = req.nextUrl.searchParams.get('status');
    const priority = req.nextUrl.searchParams.get('priority');

    const where: any = { isDeleted: false };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const complaints = await prisma.tubeWellComplaint.findMany({
      where,
      include: {
        tubeWell: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const reportData = complaints.map((complaint, index) => ({
      slNo: index + 1,
      complaintId: complaint.complaintId,
      assetId: complaint.tubeWell.assetId,
      category: complaint.category.name,
      description: complaint.description,
      status: complaint.status,
      priority: complaint.priority,
      complaintDate: formatExportDate(complaint.createdAt),
      assignedTo: complaint.assignedTo || '-',
      resolvedDate: formatExportDate(complaint.resolvedDate),
      remarks: complaint.assignmentRemarks || '-',
    }));

    if (format === 'csv') {
      const headers = [
        'slNo',
        'complaintId',
        'assetId',
        'category',
        'description',
        'status',
        'priority',
        'complaintDate',
        'assignedTo',
        'resolvedDate',
        'remarks',
      ];
      const csv = generateCSVContent(reportData, headers);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="complaint_report.csv"',
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
    console.error('[COMPLAINT_REPORT]', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
