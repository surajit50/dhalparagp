 "use server";
 
 import { revalidatePath } from "next/cache";
 import { db } from "@/lib/db";
 import { currentUser, createNotification } from "@/lib/auth";
 import { ZodError } from "zod";
 import {
   LinkageApplicationStatus,
   LinkageValidationStatus,
   LinkageOwnershipStatus,
   RenewalStatus,
   DisputeStatus,
 } from "@prisma/client";
 import { 
   CreateLinkageApplicationSchema, 
   ValidateApplicationSchema, 
   VerifyOwnershipSchema, 
   IssueCertificateSchema, 
   CreateRenewalSchema, 
   CreateDisputeSchema,
   BeneficiaryInput
 } from "@/lib/linkage-validation";
 
 type ActionResult<T = unknown> = {
   success: boolean;
   message?: string;
   error?: string;
   data?: T;
 };
 
type BeneficiaryTreeInput = {
  name: string;
  relation: string;
 
  gender?: 'male' | 'female' | 'other';
  livingStatus?: 'alive' | 'dead';
  children?: BeneficiaryTreeInput[];
};

function mapBeneficiaryInputToTreeNodes(
  beneficiaries: BeneficiaryInput[]
): BeneficiaryTreeInput[] {
  return beneficiaries.map((b) => ({
    name: b.name,
    relation: b.relation,
    gender: b.gender,
    livingStatus: b.livingStatus,
    children: Array.isArray(b.children)
      ? mapBeneficiaryInputToTreeNodes(b.children as BeneficiaryInput[])
      : [],
  }));
}

/**
 * Consolidate beneficiary creation logic
 */
async function createBeneficiariesRecursively(
  tx: any,
  parentId: string | undefined,
  nodes: BeneficiaryTreeInput[],
  target: { type: 'application' | 'certificate', id: string }
) {
  for (const node of nodes) {
    const data: any = {
      name: node.name,
      relation: node.relation,
      
      gender: node.gender,
      livingStatus: node.livingStatus,
      parentId,
    };

    if (target.type === 'application') {
      data.applicationId = target.id;
    } else {
      data.certificateId = target.id;
    }

    const created = await (target.type === 'application' 
      ? tx.linkageApplicationBeneficiary.create({ data })
      : tx.linkageBeneficiary.create({ data })
    );

    if (node.children && node.children.length > 0) {
      await createBeneficiariesRecursively(tx, created.id, node.children, target);
    }
  }
}

async function copyApplicationBeneficiariesToCertificate(
  tx: any,
  applicationId: string,
  certificateId: string
) {
  const appBeneficiaries = await tx.linkageApplicationBeneficiary.findMany({
    where: { applicationId },
    orderBy: { createdAt: "asc" },
  });

  if (appBeneficiaries.length === 0) return;

  const byParent = new Map<string | null, any[]>();
  for (const beneficiary of appBeneficiaries) {
    const key = beneficiary.parentId ?? null;
    const group = byParent.get(key);
    if (group) {
      group.push(beneficiary);
    } else {
      byParent.set(key, [beneficiary]);
    }
  }

  const createFromParent = async (
    oldParentId: string | null,
    newParentId?: string
  ) => {
    const children = byParent.get(oldParentId) ?? [];
    for (const item of children) {
      const created = await tx.linkageBeneficiary.create({
        data: {
          name: item.name,
          relation: item.relation,
          age: item.age,
          gender: item.gender,
          livingStatus: item.livingStatus,
          parentId: newParentId,
          certificateId,
        },
      });
      await createFromParent(item.id, created.id);
    }
  };

  await createFromParent(null);
}

async function generateLinkageApplicationNo(): Promise<string> {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const latestApplication = await db.linkageApplication.findFirst({
    where: {
      createdAt: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let sequenceNumber = 1;
  if (latestApplication && latestApplication.applicationNo) {
    const match = latestApplication.applicationNo.match(/\/(\d+)$/);
    if (match) {
      sequenceNumber = parseInt(match[1], 10) + 1;
    } else {
      const matchOld = latestApplication.applicationNo.match(/-(\d+)$/);
      if (matchOld) {
        sequenceNumber = parseInt(matchOld[1], 10) + 1;
      } else {
        const count = await db.linkageApplication.count({
          where: {
            createdAt: {
              gte: new Date(currentYear, 0, 1),
              lt: new Date(currentYear + 1, 0, 1),
            },
          },
        });
        sequenceNumber = count + 1;
      }
    }
  }

  return `ACK/LNK/${currentYear}/${sequenceNumber.toString().padStart(4, "0")}`;
}

export async function createLinkageApplication(rawInput: any): Promise<ActionResult> {
  const user = await currentUser();
  if (!user?.id) throw new Error("User not authenticated");
  const userId = user.id;

  try {
    const validated = CreateLinkageApplicationSchema.parse(rawInput);
    const input = validated;

    // Check duplicate entry except REJECTED status
    const existingApplication = await db.linkageApplication.findFirst({
      where: {
        AND: [
          {
            applicantName: {
              equals: input.applicantName.trim(),
              mode: "insensitive" as const,
            },
          },
          ...(input.linkedEntityName ? [{
            linkedEntityName: {
              equals: input.linkedEntityName.trim(),
              mode: "insensitive" as const,
            },
          }] : []),
          {
            status: {
              not: LinkageApplicationStatus.REJECTED,
            },
          },
        ],
      },
    });

    if (existingApplication) {
      return {
        success: false,
        error: "Duplicate entry found",
      };
    }

    return await db.$transaction(async (tx) => {
      const applicationNo = input.applicationNo || await generateLinkageApplicationNo();

      const exists = await tx.linkageApplication.findUnique({
        where: { applicationNo },
      });
      if (exists) {
        throw new Error("Application number already exists");
      }

      // Add user mapping if the schema supports it. Assuming standard userId field setup in schema:
      const appData = {
        applicationNo,
        applicantName: input.applicantName,
        applicantPhone: input.applicantPhone,
        applicantEmail: input.applicantEmail,
        applicantAddress: input.applicantAddress,
        applicantVillage: input.applicantVillage,
        applicantPostOffice: input.applicantPostOffice,
        applicantBlock: input.applicantBlock,
        applicantDistrict: input.applicantDistrict,
        applicantState: input.applicantState,
        linkageType: input.linkageType,
        linkageCategory: input.linkageCategory,
        linkageReason: input.linkageReason,
        linkedEntityName: input.linkedEntityName,
        linkedEntityAddress: input.linkedEntityAddress,
        documents: input.documents || [],
        status: LinkageApplicationStatus.VALIDATION_PENDING,
        submittedAt: new Date(),
      };

      const app = await tx.linkageApplication.create({
        data: appData,
      });

      if (input.beneficiariesTree && input.beneficiariesTree.length > 0) {
        await createBeneficiariesRecursively(tx, undefined, input.beneficiariesTree, { type: 'application', id: app.id });
      } else if (input.beneficiaries && input.beneficiaries.length > 0) {
        const hasNestedChildren = input.beneficiaries.some(
          (b: BeneficiaryInput) => Array.isArray(b.children) && b.children.length > 0
        );

        if (hasNestedChildren) {
          const nodes = mapBeneficiaryInputToTreeNodes(input.beneficiaries);
          await createBeneficiariesRecursively(tx, undefined, nodes, { type: 'application', id: app.id });
        } else {
          for (const b of input.beneficiaries) {
            await tx.linkageApplicationBeneficiary.create({
              data: {
                name: b.name,
                relation: b.relation,
                gender: b.gender,
                livingStatus: b.livingStatus,
                parentId: b.parentId || undefined,
                applicationId: app.id,
              },
            });
          }
        }
      }

       const finalApp = await tx.linkageApplication.findUnique({
         where: { id: app.id }
       });

       await createNotification(
         userId,
         `Your Linkage application has been successfully created with acknowledgment number ${applicationNo}.`
       );

       revalidatePath("/admindashboard/manage-linkage/application", 'page');
       return { success: true, message: applicationNo, data: finalApp };
     }, {
       maxWait: 5000,
       timeout: 20000,
     });
   } catch (error: any) {
     console.error("Error creating Linkage Application:", error);
     
     if (error instanceof ZodError) {
       return { success: false, error: "Validation error" };
     }
     
     return { success: false, error: error.message || "Failed to create application" };
   }
 }
 
 export async function listLinkageApplications(params?: {
   status?: LinkageApplicationStatus;
 }): Promise<ActionResult> {
   try {
     const where = params?.status ? { status: params.status } : {};
     const items = await db.linkageApplication.findMany({
       where,
       orderBy: { createdAt: "desc" },
     });
     return { success: true, data: items };
   } catch (error: any) {
     return { success: false, error: "Failed to fetch applications" };
   }
 }

 export async function getLinkageCertificateDetails(id: string): Promise<ActionResult> {
   try {
     const cert = await db.linkageCertificate.findUnique({
       where: { id },
       include: {
         application: {
           include: {
             linkageApplicationBeneficiaries: { orderBy: { createdAt: "asc" } },
           },
         },
         beneficiaries: { orderBy: { createdAt: "asc" } },
       },
     });

     if (!cert) return { success: false, error: "Certificate not found" };

     return { success: true, data: cert };
   } catch (error: any) {
     console.error("Error fetching linkage certificate details:", error);
     return { success: false, error: "Failed to fetch certificate details" };
   }
 }
 
 export async function validateApplication(rawInput: any): Promise<ActionResult> {
   try {
     const validated = ValidateApplicationSchema.safeParse(rawInput);
     if (!validated.success) {
       return { success: false, error: validated.error.errors[0].message };
     }
     const input = validated.data;

     return await db.$transaction(async (tx) => {
       const validation = await tx.linkageDocumentValidation.upsert({
         where: { applicationId: input.applicationId },
         create: {
           applicationId: input.applicationId,
           validatorName: input.validatorName,
           validationDate: new Date(),
           findings: input.findings,
           status: input.approved
             ? LinkageValidationStatus.APPROVED
             : LinkageValidationStatus.REJECTED,
          rejectionReason: input.approved ? null : input.findings || null,
         },
         update: {
           validatorName: input.validatorName,
           validationDate: new Date(),
           findings: input.findings,
           status: input.approved
             ? LinkageValidationStatus.APPROVED
             : LinkageValidationStatus.REJECTED,
          rejectionReason: input.approved ? null : input.findings || null,
         },
       });

       await tx.linkageApplication.update({
         where: { id: input.applicationId },
         data: {
           status: input.approved
             ? LinkageApplicationStatus.OWNERSHIP_PENDING
             : LinkageApplicationStatus.REJECTED,
          validatedAt: input.approved ? new Date() : null,
          rejectedReason: input.approved ? null : input.findings || null,
         },
       });

       revalidatePath("/admindashboard/manage-linkage/validate", 'page');
       return { success: true, message: "Validation updated", data: validation };
     });
   } catch (error: any) {
     return { success: false, error: "Failed to update validation" };
   }
 }
 
 export async function verifyOwnership(rawInput: any): Promise<ActionResult> {
   try {
     const validated = VerifyOwnershipSchema.safeParse(rawInput);
     if (!validated.success) {
       return { success: false, error: validated.error.errors[0].message };
     }
     const input = validated.data;

     return await db.$transaction(async (tx) => {
       const ownership = await tx.linkageOwnershipVerification.upsert({
         where: { applicationId: input.applicationId },
         create: {
           applicationId: input.applicationId,
           officerName: input.officerName,
           verificationDate: new Date(),
           remarks: input.remarks,
           ownershipConfirmed: input.confirmed,
           status: input.confirmed
             ? LinkageOwnershipStatus.VERIFIED
             : LinkageOwnershipStatus.REJECTED,
          rejectionReason: input.confirmed ? null : input.remarks || null,
         },
         update: {
           officerName: input.officerName,
           verificationDate: new Date(),
           remarks: input.remarks,
           ownershipConfirmed: input.confirmed,
           status: input.confirmed
             ? LinkageOwnershipStatus.VERIFIED
             : LinkageOwnershipStatus.REJECTED,
          rejectionReason: input.confirmed ? null : input.remarks || null,
         },
       });

       await tx.linkageApplication.update({
         where: { id: input.applicationId },
         data: {
           status: input.confirmed
             ? LinkageApplicationStatus.OWNERSHIP_VERIFIED
             : LinkageApplicationStatus.REJECTED,
          ownershipVerifiedAt: input.confirmed ? new Date() : null,
          rejectedReason: input.confirmed ? null : input.remarks || null,
         },
       });

       revalidatePath("/admindashboard/manage-linkage/ownership", 'page');
       return { success: true, message: "Ownership updated", data: ownership };
     });
   } catch (error: any) {
     return { success: false, error: "Failed to update ownership" };
   }
 }
 
 export async function issueLinkageCertificate(rawInput: any): Promise<ActionResult> {
   try {
     const validated = IssueCertificateSchema.safeParse(rawInput);
     if (!validated.success) {
       return { success: false, error: validated.error.errors[0].message };
     }
     const input = validated.data;

     return await db.$transaction(async (tx) => {
       const exists = await tx.linkageCertificate.findUnique({
         where: { certificateNo: input.certificateNo },
       });
       if (exists) {
         throw new Error("Certificate number already exists");
       }

       const cert = await tx.linkageCertificate.create({
         data: {
           applicationId: input.applicationId,
           certificateNo: input.certificateNo,
           memoNo: input.memoNo,
           referenceNo: input.referenceNo,
           certificateType: input.certificateType,
           certificateBody: input.certificateBody,
           issueDate: new Date(),
           conditions: input.conditions || [],
           signedBy: input.signedBy,
           signedDesignation: input.signedDesignation,
         },
       });

      if (input.beneficiariesTree && input.beneficiariesTree.length > 0) {
        await createBeneficiariesRecursively(tx, undefined, input.beneficiariesTree, { type: 'certificate', id: cert.id });
      } else if (input.beneficiaries && input.beneficiaries.length > 0) {
        const hasNestedChildren = input.beneficiaries.some(
          (b: BeneficiaryInput) => Array.isArray(b.children) && b.children.length > 0
        );

        if (hasNestedChildren) {
          const nodes = mapBeneficiaryInputToTreeNodes(input.beneficiaries);
          await createBeneficiariesRecursively(tx, undefined, nodes, { type: 'certificate', id: cert.id });
        } else {
          for (const b of input.beneficiaries) {
            await tx.linkageBeneficiary.create({
              data: {
                name: b.name,
                relation: b.relation,
                gender: b.gender,
                livingStatus: b.livingStatus,
                parentId: b.parentId || undefined,
                certificateId: cert.id,
              },
            });
          }
        }
      } else {
        // Auto-copy from application while preserving parent-child hierarchy
        await copyApplicationBeneficiariesToCertificate(
          tx,
          input.applicationId,
          cert.id
        );
       }

       await tx.linkageApplication.update({
         where: { id: input.applicationId },
        data: {
          status: LinkageApplicationStatus.ISSUED,
          approvedAt: new Date(),
          rejectedReason: null,
        },
       });

       revalidatePath("/admindashboard/manage-linkage/issue", 'page');
       return { success: true, message: "Certificate issued", data: cert };
     });
   } catch (error: any) {
     return { success: false, error: error.message || "Failed to issue certificate" };
   }
 }
 
 export async function createRenewal(rawInput: any): Promise<ActionResult> {
   try {
     const validated = CreateRenewalSchema.safeParse(rawInput);
     if (!validated.success) {
       return { success: false, error: validated.error.errors[0].message };
     }
     const input = validated.data;

     const renewal = await db.linkageRenewal.create({
       data: {
         certificateId: input.certificateId,
         renewalDate: new Date(),
         newExpiryDate: input.newExpiryDate,
         renewalReason: input.renewalReason,
         status: RenewalStatus.PENDING,
         processedBy: input.processedBy,
       },
     });
     revalidatePath("/admindashboard/manage-linkage/renew", 'page');
     return { success: true, message: "Renewal created", data: renewal };
   } catch (error: any) {
     return { success: false, error: "Failed to create renewal" };
   }
 }
 
 export async function createDispute(rawInput: any): Promise<ActionResult> {
   try {
     const validated = CreateDisputeSchema.safeParse(rawInput);
     if (!validated.success) {
       return { success: false, error: validated.error.errors[0].message };
     }
     const input = validated.data;

     const dispute = await db.linkageDispute.create({
       data: {
         certificateId: input.certificateId,
         raisedByName: input.raisedByName,
         raisedByPhone: input.raisedByPhone,
         reason: input.reason,
         status: DisputeStatus.PENDING,
       },
     });
     revalidatePath("/admindashboard/manage-linkage/disputes", 'page');
     return { success: true, message: "Dispute created", data: dispute };
   } catch (error: any) {
     return { success: false, error: "Failed to create dispute" };
   }
 }
 
