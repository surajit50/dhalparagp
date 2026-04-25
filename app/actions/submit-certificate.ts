'use server'

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { generateCertificateNumber } from "@/lib/utils"
import { revalidatePath } from "next/cache"

interface FamilyMember {
  id?: string
  name: string
  relation: string
  age?: number | null
  occupation?: string | null
  children?: FamilyMember[]
  parentId?: string | null
}

interface CertificateFormData {
  ancestorName: string
  casteCategory: string
  village: string
  postOffice: string
  block: string
  district: string
  state: string
  applicantName: string
  applicantPhone: string
  applicantEmail?: string
  applicantAddress: string
  familyMembers: FamilyMember[]
}

async function createFamilyMemberWithChildren(
  member: FamilyMember,
  certificateId: string,
  parentId: string | null = null
): Promise<void> {
  try {
    // Create the current family member
    const familyMember = await db.familyMember.create({
      data: {
        name: member.name,
        relation: member.relation,
       
        parentId: parentId,
        certificateId: certificateId,
      },
    });

    // Recursively create children if they exist
    if (member.children && Array.isArray(member.children) && member.children.length > 0) {
      for (const child of member.children) {
        await createFamilyMemberWithChildren(child, certificateId, familyMember.id);
      }
    }
  } catch (error) {
    console.error('Error creating family member:', error);
    throw error;
  }
}

async function validateCertificateData(data: CertificateFormData): Promise<boolean> {
  // Required fields validation
  const requiredFields = [
    'ancestorName',
    'casteCategory',
    'village',
    'postOffice',
    'block',
    'district',
    'state',
    'applicantName',
    'applicantPhone',
    'applicantAddress'
  ];

  for (const field of requiredFields) {
    if (!data[field as keyof CertificateFormData]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate family members
  if (!Array.isArray(data.familyMembers) || data.familyMembers.length === 0) {
    throw new Error('At least one family member is required');
  }

  return true;
}

export async function submitCertificate(
  formData: CertificateFormData, 
  action: 'draft' | 'submit' = 'draft'
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Validate form data
    await validateCertificateData(formData);

    // Generate unique certificate number
    const certificateNo = generateCertificateNumber();

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
        applicantEmail: formData.applicantEmail || null,
        applicantAddress: formData.applicantAddress,
        status: action === 'submit' ? 'FIELD_ENQUIRY_PENDING' : 'DRAFT',
        userId: session.user.id,
      },
    });

    // Create family members with their hierarchical structure
    if (formData.familyMembers.length > 0) {
      for (const member of formData.familyMembers) {
        await createFamilyMemberWithChildren(member, certificate.id);
      }
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
      });
    }

    revalidatePath('/certificates');
    return { 
      success: true, 
      certificateId: certificate.id,
      message: action === 'submit' 
        ? 'Certificate submitted successfully' 
        : 'Draft saved successfully'
    };

  } catch (error) {
    console.error('Certificate submission error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit certificate'
    };
  }
}