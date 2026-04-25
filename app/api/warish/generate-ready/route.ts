import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10', 10)))
    const query = (searchParams.get('q') || '').trim()

    const where = {
      warishApplicationStatus: { in: ["approved", "renewed"] as any },
      WarishDocument: { none: { documentType: 'WarishCertificate' } },
      ...(query
        ? {
            OR: [
              { applicantName: { contains: query, mode: 'insensitive' } },
              { nameOfDeceased: { contains: query, mode: 'insensitive' } },
              { warishRefNo: { contains: query, mode: 'insensitive' } },
              { acknowlegment: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    } as any

    const [total, items] = await Promise.all([
      db.warishApplication.count({ where }),
      db.warishApplication.findMany({
        where,
        include: { warishDetails: true },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return NextResponse.json({ total, items, page, pageSize })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
