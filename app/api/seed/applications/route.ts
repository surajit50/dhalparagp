import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface SeedRequest {
  count?: number;
  clear?: boolean;
}

// Sample data (unchanged)
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

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generateName = () => `${randomItem(firstNames)} ${randomItem(lastNames)}`;
const generatePhone = (index: number) => `${1_000_000_000 + index}`;
const generateDate = (days = 365) => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * days);
  return new Date(now.getTime() - randomDays * 86_400_000);
};

async function seedApplications(count: number) {
  const BATCH = 100;
  for (let i = 0; i < count; i += BATCH) {
    const size = Math.min(BATCH, count - i);
    const data = Array.from({ length: size }, (_, idx) => ({
      applicantName: generateName(),
      mobileNumber: generatePhone(i + idx),   // guarantee uniqueness
      villageName: randomItem(villages),
      deceasedName: generateName(),
      relation: randomItem(relations),
      dateOfDeath: generateDate(),
      status: 'PENDING',
      sanctionAmount: 2000,
    }));

    await prisma.samabyathiApplication.createMany({ data });
    console.log(`Inserted ${i + data.length}/${count}`);
  }
}

export async function POST(req: NextRequest) {
  // Security guard
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: 'Not allowed' }, { status: 403 });
  }

  try {
    const body = (await req.json()) as SeedRequest;
    const count = Math.min(body.count ?? 500, 10_000); // reasonable cap
    const clear = body.clear ?? false;

    if (clear) {
      // Only clear the target table
      await prisma.samabyathiApplication.deleteMany();
    }

    await seedApplications(count);

    return NextResponse.json({
      success: true,
      message: `Created ${count} applications`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Failed to seed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const currentCount = await prisma.samabyathiApplication.count();
  return NextResponse.json({
    message: 'POST { count?: number, clear?: boolean }',
    currentRecords: currentCount,
  });
}
