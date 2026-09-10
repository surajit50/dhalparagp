// app/api/tubewell/[id]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST - Verify tube well survey
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, remarks } = await req.json();

    if (!['Verified', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const tubeWell = await prisma.tubeWell.update({
      where: { id: params.id },
      data: {
        verificationStatus: status,
        verifiedBy: session.user.id,
        verificationDate: new Date(),
        verificationRemarks: remarks,
        isDraft: false,
      },
    });

    // Create audit log
    await prisma.tubeWellAuditLog.create({
      data: {
        tubeWellId: tubeWell.id,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        action: status === 'Verified' ? 'Verified' : 'Rejected',
        recordType: 'TubeWell',
        recordId: tubeWell.id,
        description: `Tube well ${tubeWell.assetId} ${status === 'Verified' ? 'verified' : 'rejected'} by ${session.user.name}`,
      },
    });

    return NextResponse.json(tubeWell);
  } catch (error) {
    console.error('[TUBEWELL_VERIFY]', error);
    return NextResponse.json(
      { error: 'Failed to verify tube well' },
      { status: 500 }
    );
  }
}
