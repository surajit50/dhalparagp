// app/api/tubewell/[id]/photos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET - List photos for a tube well
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const photos = await prisma.tubeWellPhoto.findMany({
      where: {
        tubeWellId: params.id,
        isDeleted: false,
      },
      orderBy: { uploadDate: 'desc' },
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error('[TUBEWELL_PHOTOS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// POST - Upload photo
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const photo = await prisma.tubeWellPhoto.create({
      data: {
        tubeWellId: params.id,
        photoType: body.photoType,
        cloudinaryId: body.cloudinaryId,
        secureUrl: body.secureUrl,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('[TUBEWELL_PHOTO_POST]', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
