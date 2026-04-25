import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SeedRequest {
  count?: number;
  clear?: boolean;
}

// Sample Data
const firstNames = [
  "Ramesh", "Suresh", "Rajesh", "Mahesh", "Dinesh", "Prakash",
  "Vikram", "Arun", "Amit", "Ajay", "Sanjay", "Ravi",
];

const lastNames = [
  "Sharma", "Singh", "Patel", "Kumar", "Verma",
  "Gupta", "Yadav", "Joshi", "Sinha", "Mishra",
];

const villages = [
  "Rampur", "Lakshmipur", "Shyampur", "Krishnanagar",
  "Gopalpur", "Haripur", "Sonapur", "Madhavpur",
];

const relations = [
  "Son", "Daughter", "Wife", "Husband",
  "Father", "Mother", "Brother", "Sister",
];

// Helpers
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName() {
  return `${randomItem(firstNames)} ${randomItem(lastNames)}`;
}

function generatePhone() {
  return `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
}

function generateDate(days = 365) {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * days);
  return new Date(now.getTime() - randomDays * 86400000);
}

// MAIN SEED FUNCTION
async function seedApplications(count: number) {
  const batchSize = 100;

  for (let i = 0; i < count; i += batchSize) {
    const batch = Array.from({
      length: Math.min(batchSize, count - i),
    }).map(() => ({
      applicantName: generateName(),
      mobileNumber: generatePhone(),
      villageName: randomItem(villages),
      deceasedName: generateName(),
      relation: randomItem(relations),
      dateOfDeath: generateDate(),

      status: ["PENDING"][
        Math.floor(Math.random() * 3)
      ],

      sanctionAmount: Math.random() > 0.6
        ? Math.floor(Math.random() * 50000) + 1000
        : null,
    }));

    await prisma.samabyathiApplication.createMany({
      data: batch,
    });

    console.log(`Inserted ${i + batch.length}/${count}`);
  }
}

// POST API
export async function POST(req: NextRequest) {
  try {
    const body: SeedRequest = await req.json().catch(() => ({}));

    const count = body.count ?? 500;
    const clear = body.clear ?? false;

    if (clear) {
      await prisma.musterRoll.deleteMany();
      await prisma.samabyathiApplication.deleteMany();
    }

    await seedApplications(count);

    return NextResponse.json({
      success: true,
      message: `${count} applications created`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed data",
      },
      { status: 500 }
    );
  }
}

// GET API (info)
export async function GET() {
  return NextResponse.json({
    message: "POST { count?: number, clear?: boolean }",
  });
}
