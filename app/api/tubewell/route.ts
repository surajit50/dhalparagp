// app/api/tubewell/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { generateTubeWellAssetId } from '@/lib/tubewell/asset-id-generator';
import { authOptions } from '@/lib/auth';

// GET - List all tube wells with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const village = searchParams.get('village');
    const mouza = searchParams.get('mouza');
    const ward = searchParams.get('ward');
    const verification = searchParams.get('verification');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {
      isDeleted: false,
    };

    if (status) where.functionalStatus = status;
    if (village) where.villageId = village;
    if (mouza) where.mouzaId = mouza;
    if (ward) where.wardId = ward;
    if (verification) where.verificationStatus = verification;

    if (search) {
      where.OR = [
        { assetId: { contains: search, mode: 'insensitive' } },
        { tubeWellNumber: { contains: search, mode: 'insensitive' } },
        { landmark: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tubeWells, total] = await Promise.all([
      prisma.tubeWell.findMany({
        where,
        skip,
        take: limit,
        include: {
          type: true,
          status: true,
          waterQualityStatus: true,
          caretaker: true,
          _count: {
            select: {
              photos: true,
              inspections: true,
              complaints: true,
              repairs: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tubeWell.count({ where }),
    ]);

    return NextResponse.json({
      data: tubeWells,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[TUBEWELL_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch tube wells' },
      { status: 500 }
    );
  }
}

// POST - Create new tube well
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'staff') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Generate asset ID
    const assetId = await generateTubeWellAssetId();

    const tubeWell = await prisma.tubeWell.create({
      data: {
        assetId,
        tubeWellNumber: body.tubeWellNumber,
        panchayatId: body.panchayatId,
        villageId: body.villageId,
        mouzaId: body.mouzaId,
        wardId: body.wardId,
        sansadId: body.sansadId,
        habitationId: body.habitationId,
        landmark: body.landmark,
        typeId: body.typeId,
        schemSourceId: body.schemSourceId,
        installationYear: body.installationYear,
        installationAgency: body.installationAgency,
        depth: body.depth,
        diameter: body.diameter,
        platformAvailable: body.platformAvailable || false,
        drainageAvailable: body.drainageAvailable || false,
        soakPitAvailable: body.soakPitAvailable || false,
        statusId: body.statusId,
        waterQualityStatusId: body.waterQualityStatusId,
        functionalStatus: body.functionalStatus,
        waterAvailable: body.waterAvailable,
        waterAvailabilityLevel: body.waterAvailabilityLevel,
        seasonalAvailability: body.seasonalAvailability || false,
        approximateUsersPerDay: body.approximateUsersPerDay,
        approximateHouseholdsServed: body.approximateHouseholdsServed,
        drinkingWaterUse: body.drinkingWaterUse !== false,
        otherDomesticUse: body.otherDomesticUse || false,
        latitude: body.latitude,
        longitude: body.longitude,
        gpsAccuracy: body.gpsAccuracy,
        gpsTimestamp: body.gpsTimestamp,
        surveyedBy: session.user.id,
        nearestHouseholdName: body.nearestHouseholdName,
        nearestHouseholdDistance: body.nearestHouseholdDistance,
        nearestHouseholdPhone: body.nearestHouseholdPhone,
        caretakerId: body.caretakerId,
        publicInstitutionNearby: body.publicInstitutionNearby || false,
        schoolNearby: body.schoolNearby || false,
        anganwadiNearby: body.anganwadiNearby || false,
        otherPublicFacilityNearby: body.otherPublicFacilityNearby,
        verificationStatus: 'Draft',
        isDraft: true,
      },
      include: {
        type: true,
        status: true,
      },
    });

    // Create audit log
    await prisma.tubeWellAuditLog.create({
      data: {
        tubeWellId: tubeWell.id,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        action: 'Created',
        recordType: 'TubeWell',
        recordId: tubeWell.id,
        description: `Tube well ${tubeWell.assetId} created by ${session.user.name}`,
      },
    });

    return NextResponse.json(tubeWell, { status: 201 });
  } catch (error) {
    console.error('[TUBEWELL_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create tube well' },
      { status: 500 }
    );
  }
}
