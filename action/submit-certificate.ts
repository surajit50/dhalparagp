'use server'

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { generateCertificateNumber } from "@/lib/utils"
import { revalidatePath } from "next/cache"

export async function submitCertificate(formData: {
  ancestorName: string
  casteCategory: string
  village: string
  postOffice: string
  block: string
  district: string
  state: string
  applicantName: string
  applicantPhone: string
  applicantEmail: string
  applicantAddress: string
  familyMembers: Array<{
    id: string
    name: string
    relation: string
    age?: number
    occupation?: string
    children: any[]
  }>
}, action: 'draft' | 'submit' = 'draft') {
  try {
    const session = await auth()
    if (!session?.user) {
      throw new Error("Unauthorized")
    }

    // Generate unique certificate number
    const certificateNo = generateCertificateNumber()

    // Create certificate
    const certificate = await db.familyLineageCertificate.create({
      data: {
        certificateNo,
        ancestorName: formData.ancestorName,
        casteCategory: formData.casteCategory,
        village: formData.village,
        postOffice: formData.postOffice,
        block: formData.block,
        district: formData.district,
        state: formData.state,
        applicantName: formData.applicantName,
        applicantPhone: formData.applicantPhone,
        applicantEmail: formData.applicantEmail,
        applicantAddress: formData.applicantAddress,
        status: action === 'submit' ? 'FIELD_ENQUIRY_PENDING' : 'DRAFT',
        userId: session.user.id,
      },
    })

    // Helper function to create family members recursively
    const createFamilyMembers = async (
      members: any[],
      parentId: string | null = null
    ) => {
      const createdMembers = [];

      for (const member of members) {
        const familyMember = await db.familyMember.create({
          data: {
            name: member.name,
            relation: member.relation,
           
           
            parentId: parentId,
            certificateId: certificate.id,
          },
        });

        // Recursively create children if they exist
        if (member.children && member.children.length > 0) {
          await createFamilyMembers(member.children, familyMember.id);
        }

        createdMembers.push(familyMember);
      }

      return createdMembers;
    }

    // Create family members starting with root level members
    if (formData.familyMembers && formData.familyMembers.length > 0) {
      await createFamilyMembers(formData.familyMembers)
    }

    // Create field enquiry record if submitting
    if (action === 'submit') {
      await db.fieldEnquiry.create({
        data: {
          certificateId: certificate.id,
          enquiryOfficer: 'Pending Assignment',
          enquiryDate: new Date(),
          findings: '',
          recommendations: '',
          status: 'PENDING',
          witnessNames: [],
          documentsVerified: [],
          communityVerified: false,
        },
      })
    }

    revalidatePath('/certificates', 'page')
    return { success: true, certificateId: certificate.id }

  } catch (error) {
    console.error('Certificate submission error:', error)
    return { success: false, error: 'Failed to submit certificate' }
  }
}