import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

import { auth } from "@/auth";

// GET: Fetch development projects
export async function GET(request: NextRequest) {
  try {
    const session = await  auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estimateTypeId = searchParams.get('estimateTypeId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');

    let whereClause: any = {};

    if (estimateTypeId) {
      whereClause.estimateTypeId = estimateTypeId;
    }

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { activityCode: { contains: search, mode: 'insensitive' } },
        { contractor: { contains: search, mode: 'insensitive' } }
      ];
    }

    const projects = await db.developmentProject.findMany({
      where: whereClause,
      include: {
        estimateType: {
          select: {
            name: true,
            code: true,
            icon: true,
            color: true
          }
        },
        _count: {
          select: {
            workItems: true,
            measurements: true,
            billAbstracts: true,
            progressUpdates: true,
            milestones: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      ...(limit && { take: parseInt(limit) })
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create new development project
export async function POST(request: NextRequest) {
  try {
    const session = await  auth()
    
    if (!session?.user || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name,
      location,
      estimateTypeId,
      activityCode,
      contractor,
      engineerInCharge,
      dimensions,
      estimatedCost,
      sanctionedAmount,
      additionalCharges,
      startDate,
      endDate
    } = body;

    // Validate required fields
    if (!name || !location || !estimateTypeId) {
      return NextResponse.json({ 
        error: "Name, location, and estimateTypeId are required" 
      }, { status: 400 });
    }

    const project = await db.developmentProject.create({
      data: {
        name,
        location,
        estimateTypeId,
        activityCode,
        contractor,
        engineerInCharge,
        dimensions: dimensions || null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost.toString()) : 0,
        sanctionedAmount: sanctionedAmount ? parseFloat(sanctionedAmount.toString()) : 0,
        additionalCharges: additionalCharges || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: session.user.id
      },
      include: {
        estimateType: {
          select: {
            name: true,
            code: true,
            icon: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update development project
export async function PUT(request: NextRequest) {
  try {
    const session = await  auth()
    
    if (!session?.user || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      id,
      name,
      location,
      activityCode,
      contractor,
      engineerInCharge,
      dimensions,
      estimatedCost,
      sanctionedAmount,
      spentAmount,
      additionalCharges,
      startDate,
      endDate,
      physicalProgress,
      financialProgress,
      status
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (activityCode !== undefined) updateData.activityCode = activityCode;
    if (contractor !== undefined) updateData.contractor = contractor;
    if (engineerInCharge !== undefined) updateData.engineerInCharge = engineerInCharge;
    if (dimensions !== undefined) updateData.dimensions = dimensions;
    if (estimatedCost !== undefined) updateData.estimatedCost = parseFloat(estimatedCost.toString());
    if (sanctionedAmount !== undefined) updateData.sanctionedAmount = parseFloat(sanctionedAmount.toString());
    if (spentAmount !== undefined) updateData.spentAmount = parseFloat(spentAmount.toString());
    if (additionalCharges !== undefined) updateData.additionalCharges = additionalCharges;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (physicalProgress !== undefined) updateData.physicalProgress = parseFloat(physicalProgress.toString());
    if (financialProgress !== undefined) updateData.financialProgress = parseFloat(financialProgress.toString());
    if (status !== undefined) updateData.status = status;

    const project = await db.developmentProject.update({
      where: { id },
      data: updateData,
      include: {
        estimateType: {
          select: {
            name: true,
            code: true,
            icon: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
