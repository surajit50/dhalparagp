import LegalHeirCertificateForm from '@/components/LegalHeirCertificateForm'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import {
  Gender,
  MaritialStatus,
  LivingStatus,
  WarishApplicationStatus,
} from "@prisma/client";

import { WarishApplicationProps, WarishDetailProps } from '@/types'




const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const application = await db.warishApplication.findUnique({
    where: { id },
    include: {
      warishDetails: true
    }
  }) as WarishApplicationProps | null

  if (!application) {
    notFound()
  }
  // Build the tree structure for warishDetails
  const warishDetailsMap = new Map<string, WarishDetailProps>()
  application.warishDetails.forEach(detail => {
    warishDetailsMap.set(detail.id, { ...detail, children: [] })
  })

  const rootWarishDetails: WarishDetailProps[] = []
  warishDetailsMap.forEach(detail => {
    if (detail.parentId) {
      const parent = warishDetailsMap.get(detail.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(detail)
      }
    } else {
      rootWarishDetails.push(detail)
    }
  })


  return (
    <div><LegalHeirCertificateForm application={application} rootWarishDetails={rootWarishDetails} /></div>
  )
}

export default page
