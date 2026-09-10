// app/api/tubewell/[id]/nearby/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { findNearbyTubeWells } from '@/lib/tubewell/duplicate-detector';
import { authOptions } from '@/lib/auth';

// GET - Find nearby tube wells
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tubeWell = await prisma.tubeWell.findUnique({
      where: { id: params.id },
    });

    if (!tubeWell || !tubeWell.latitude || !tubeWell.longitude) {
      return NextResponse.json(
        { error: 'Tube well not found or no GPS coordinates' },
        { status: 404 }
      );
    }

    const radius = parseInt(req.nextUrl.searchParams.get('radius') || '30');
    const nearby = await findNearbyTubeWells(tubeWell.latitude, tubeWell.longitude, radius);

    return NextResponse.json({ nearby, count: nearby.length });
  } catch (error) {
    console.error('[TUBEWELL_NEARBY]', error);
    return NextResponse.json(
      { error: 'Failed to find nearby tube wells' },
      { status: 500 }
    );
  }
}
