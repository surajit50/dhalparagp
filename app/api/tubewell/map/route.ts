// app/api/tubewell/map/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface MapMarker {
  id: string;
  assetId: string;
  latitude: number;
  longitude: number;
  functionalStatus: string;
  statusColor: string;
  households: number | null;
}

// GET - Get all tube wells for map display
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const village = searchParams.get('village');
    const mouza = searchParams.get('mouza');
    const ward = searchParams.get('ward');
    const status = searchParams.get('status');

    const where: any = {
      isDeleted: false,
      latitude: { not: null },
      longitude: { not: null },
    };

    if (village) where.villageId = village;
    if (mouza) where.mouzaId = mouza;
    if (ward) where.wardId = ward;
    if (status) where.functionalStatus = status;

    const tubeWells = await prisma.tubeWell.findMany({
      where,
      select: {
        id: true,
        assetId: true,
        latitude: true,
        longitude: true,
        functionalStatus: true,
        approximateHouseholdsServed: true,
        status: {
          select: {
            color: true,
          },
        },
      },
    });

    const markers: MapMarker[] = tubeWells.map((tw) => ({
      id: tw.id,
      assetId: tw.assetId,
      latitude: tw.latitude!,
      longitude: tw.longitude!,
      functionalStatus: tw.functionalStatus,
      statusColor: tw.status?.color || '#6B7280',
      households: tw.approximateHouseholdsServed,
    }));

    return NextResponse.json({
      markers,
      count: markers.length,
    });
  } catch (error) {
    console.error('[TUBEWELL_MAP]', error);
    return NextResponse.json(
      { error: 'Failed to fetch map data' },
      { status: 500 }
    );
  }
}
