import { db } from '@/lib/db'
import WarishGenerateListClient from '@/components/WarishGenerateListClient'

export default async function Page() {
  const applications = await db.warishApplication.findMany({
    where: {
      warishApplicationStatus: { in: ["approved", "renewed"] },
      WarishDocument: { none: { documentType: "WarishCertificate" } },
    },
    include: { warishDetails: true },
    orderBy: { updatedAt: 'desc' },
  })

  return <WarishGenerateListClient applications={applications as any} />
}

