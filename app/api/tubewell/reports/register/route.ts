// app/api/tubewell/reports/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { generateCSVContent, formatExportDate, formatBoolean } from '@/lib/tubewell/export-helpers';
import { authOptions } from '@/lib/auth';

// GET - Generate tube well register report
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const format = req.nextUrl.searchParams.get('format') || 'csv'; // csv, json, pdf
    const village = req.nextUrl.searchParams.get('village');
    const mouza = req.nextUrl.searchParams.get('mouza');

    const where: any = { isDeleted: false, verificationStatus: 'Verified' };
    if (village) where.villageId = village;
    if (mouza) where.mouzaId = mouza;

    const tubeWells = await prisma.tubeWell.findMany({
      where,
      include: {
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1,
        },
        repairs: {
          where: { completionStatus: 'Completed' },
          orderBy: { repairDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const reportData = tubeWells.map((tw, index) => ({
      slNo: index + 1,
      assetId: tw.assetId,
      tubeWellNumber: tw.tubeWellNumber,
      village: tw.villageId,
      mouza: tw.mouzaId,
      ward: tw.wardId,
      landmark: tw.landmark || '-',
      latitude: tw.latitude?.toString() || '-',
      longitude: tw.longitude?.toString() || '-',
      installationYear: tw.installationYear?.toString() || '-',
      functionalStatus: tw.functionalStatus,
      waterAvailable: formatBoolean(tw.waterAvailable),
      householdsServed: tw.approximateHouseholdsServed?.toString() || '-',
      lastInspectionDate: formatExportDate(tw.inspections[0]?.inspectionDate),
      lastRepairDate: formatExportDate(tw.repairs[0]?.repairDate),
      remarks: tw.landmark || '-',
    }));

    if (format === 'csv') {
      const headers = [
        'slNo',
        'assetId',
        'tubeWellNumber',
        'village',
        'mouza',
        'ward',
        'landmark',
        'latitude',
        'longitude',
        'installationYear',
        'functionalStatus',
        'waterAvailable',
        'householdsServed',
        'lastInspectionDate',
        'lastRepairDate',
        'remarks',
      ];
      const csv = generateCSVContent(reportData, headers);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="tube_well_register.csv"',
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
    console.error('[TUBEWELL_REPORT_REGISTER]', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
