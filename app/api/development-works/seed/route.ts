import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

import { auth } from "@/auth";

// POST: Seed initial estimate types and schedule rates
export async function POST(request: NextRequest) {
  try {
    const session = await  auth()
    
    if (!session?.user || session.user.role !== 'superadmin') {
      return NextResponse.json({ error: "Unauthorized - Super admin only" }, { status: 401 });
    }

    // Check if estimate types already exist
    const existingTypes = await db.estimateType.count();
    if (existingTypes > 0) {
      return NextResponse.json({ error: "Estimate types already seeded" }, { status: 409 });
    }

    // Define initial estimate types
    const estimateTypes = [
      {
        name: "Road Construction",
        code: "road",
        description: "Road construction and infrastructure projects",
        icon: "🛣️",
        color: "bg-yellow-100 text-yellow-800",
        dimensionFields: {
          required: ["length", "width", "depth"],
          optional: [],
          units: ["M"]
        }
      },
      {
        name: "Building Construction",
        code: "building",
        description: "Building and structural construction projects",
        icon: "🏢",
        color: "bg-blue-100 text-blue-800",
        dimensionFields: {
          required: ["length", "width", "depth"],
          optional: [],
          units: ["M"]
        }
      },
      {
        name: "Solar Pump Installation",
        code: "solar-pump",
        description: "Solar-powered pumping systems and renewable energy",
        icon: "☀️",
        color: "bg-green-100 text-green-800",
        dimensionFields: {
          required: ["capacity"],
          optional: [],
          units: ["HP"]
        }
      },
      {
        name: "Water Chiller System",
        code: "water-chiller",
        description: "HVAC and cooling system installations",
        icon: "❄️",
        color: "bg-cyan-100 text-cyan-800",
        dimensionFields: {
          required: ["capacity"],
          optional: [],
          units: ["TR"]
        }
      },
      {
        name: "General Civil Work",
        code: "civil-work",
        description: "Miscellaneous civil engineering projects",
        icon: "🏗️",
        color: "bg-purple-100 text-purple-800",
        dimensionFields: {
          required: ["length", "width"],
          optional: ["depth"],
          units: ["M"]
        }
      }
    ];

    // Define schedule rates for each type
    const scheduleRatesData = {
      road: [
        { code: "12.a", description: "Earth work in excavation of foundation of structures as per drawing and technical specification", unit: "M³", rate: 119.27, category: "Earthwork" },
        { code: "24A", description: "Sand filing in foundation trenches and at the back of abutments, wing-walls etc.", unit: "M³", rate: 487.41, category: "Earthwork" },
        { code: "47Q", description: "Supplying and laying Polythene Sheet (150 gm./sq.m) over damp proof course", unit: "M²", rate: 24.06, category: "Waterproofing" },
        { code: "332/16", description: "Providing and laying Design Mix concrete for plain reinforced concrete work", unit: "M³", rate: 5668.27, category: "Concrete" },
        { code: "424G(f)", description: "Hire and labour charges for shuttering with centering and necessary staging", unit: "M²", rate: 205.00, category: "Formwork" },
        { code: "434A(a)", description: "Reinforcement for reinforced concrete work in all sorts of structures", unit: "MT", rate: 55541.69, category: "Steel" },
        { code: "189/(h)", description: "Plaster (to wall, floor, ceiling etc.) with sand and cement mortar", unit: "M²", rate: 141.00, category: "Finishing" }
      ],
      building: [
        { code: "B-001", description: "Excavation for foundation in ordinary soil", unit: "Cum", rate: 145.50, category: "Earthwork" },
        { code: "B-002", description: "Brick work in cement mortar 1:6 (1 cement : 6 sand)", unit: "Cum", rate: 8250.00, category: "Masonry" },
        { code: "B-003", description: "RCC work M20 grade with coarse aggregates", unit: "Cum", rate: 6500.00, category: "Concrete" },
        { code: "B-004", description: "Steel reinforcement Fe 415", unit: "Kg", rate: 75.00, category: "Steel" },
        { code: "B-005", description: "Brick work in cement mortar 1:4 for super structure", unit: "Cum", rate: 8500.00, category: "Masonry" },
        { code: "B-006", description: "Plastering with cement mortar 1:4", unit: "Sqm", rate: 280.00, category: "Finishing" },
        { code: "B-007", description: "PCC M15 grade for foundation", unit: "Cum", rate: 4500.00, category: "Concrete" }
      ],
      "solar-pump": [
        { code: "SP-001", description: "Solar Panel 320W Monocrystalline", unit: "Nos", rate: 12000.00, category: "Solar Equipment" },
        { code: "SP-002", description: "Solar Pump Controller 3HP", unit: "Nos", rate: 25000.00, category: "Control Equipment" },
        { code: "SP-003", description: "Submersible Pump 3HP", unit: "Nos", rate: 35000.00, category: "Pump Equipment" },
        { code: "SP-004", description: "MS Structure for Panel Mounting", unit: "Kg", rate: 85.00, category: "Structure" },
        { code: "SP-005", description: "Excavation for pump installation", unit: "Cum", rate: 250.00, category: "Civil Work" },
        { code: "SP-006", description: "PVC Pipe 110mm for delivery", unit: "Rmt", rate: 850.00, category: "Piping" },
        { code: "SP-007", description: "Electrical Installation & Wiring", unit: "Lot", rate: 15000.00, category: "Electrical" }
      ],
      "water-chiller": [
        { code: "WC-001", description: "Water Chiller Unit 10 TR", unit: "Nos", rate: 150000.00, category: "Equipment" },
        { code: "WC-002", description: "Chilled Water Pump", unit: "Nos", rate: 25000.00, category: "Pump" },
        { code: "WC-003", description: "Cooling Tower 15 TR", unit: "Nos", rate: 75000.00, category: "Equipment" },
        { code: "WC-004", description: "Insulated Copper Piping", unit: "Rmt", rate: 450.00, category: "Piping" },
        { code: "WC-005", description: "Electrical Panel & Controls", unit: "Nos", rate: 35000.00, category: "Electrical" },
        { code: "WC-006", description: "Concrete Foundation for Equipment", unit: "Cum", rate: 5500.00, category: "Civil Work" },
        { code: "WC-007", description: "Installation & Commissioning", unit: "Lot", rate: 50000.00, category: "Installation" }
      ],
      "civil-work": [
        { code: "CW-001", description: "Excavation in ordinary soil", unit: "Cum", rate: 145.50, category: "Earthwork" },
        { code: "CW-002", description: "PCC M15 grade for foundation", unit: "Cum", rate: 4500.00, category: "Concrete" },
        { code: "CW-003", description: "RCC M25 grade", unit: "Cum", rate: 6800.00, category: "Concrete" },
        { code: "CW-004", description: "Brick work in cement mortar 1:6", unit: "Cum", rate: 8250.00, category: "Masonry" },
        { code: "CW-005", description: "Steel reinforcement Fe 500", unit: "Kg", rate: 85.50, category: "Steel" },
        { code: "CW-006", description: "Plastering with cement mortar", unit: "Sqm", rate: 280.00, category: "Finishing" },
        { code: "CW-007", description: "Waterproofing membrane", unit: "Sqm", rate: 450.00, category: "Waterproofing" }
      ]
    };

    // Create estimate types and their schedule rates
    const results = [];
    for (const type of estimateTypes) {
      // Create estimate type
      const createdType = await db.estimateType.create({
        data: type
      });

      // Create schedule rates for this type
      const rates = scheduleRatesData[type.code as keyof typeof scheduleRatesData] || [];
      const createdRates = await db.scheduleRate.createMany({
        data: rates.map(rate => ({
          ...rate,
          estimateTypeId: createdType.id
        }))
      });

      results.push({
        estimateType: createdType,
        scheduleRatesCount: createdRates.count
      });
    }

    return NextResponse.json({
      message: "Initial estimate types and schedule rates seeded successfully",
      results
    }, { status: 201 });

  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

