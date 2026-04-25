
"use server"

import { db } from "@/lib/db"
import {
  populationSchema,
  educationSchema,
  infraSchema,
  healthSchema,
  sanitationSchema,
  waterSchema,
  economicSchema,
  eduInstitutionSchema,
} from "@/schema/villageschema"
import { z } from "zod"

type CoreVillageData = {
  lgdcode: number
  jlno: number
  name: string
  year: string
}

// Define a consistent return type for server actions
type ServerActionResult<T> =
  | { success: true; data: T; message: string }
  | { success: false; errors: any; message: string; code?: string; details?: string }

export async function createVillageInfoWithRelations(
  coreData: CoreVillageData,
  tabKey: string,
  tabData: Record<string, any>,
  isDraft = false,
): Promise<ServerActionResult<any>> {
  console.log("=== Starting createVillageInfoWithRelations ===")
  console.log("Core Data:", coreData)
  console.log("Tab Key:", tabKey)
  console.log("Tab Data:", tabData)
  console.log("isDraft:", isDraft)

  try {
    // Validate core data
    const coreParseResult = z
      .object({
        lgdcode: z.coerce.number().int(),
        jlno: z.coerce.number().int(),
        name: z.string(),
        year: z.string(),
      })
      .safeParse(coreData)

    if (!coreParseResult.success) {
      console.error("Core data validation failed:", coreParseResult.error.flatten())
      return {
        success: false,
        errors: coreParseResult.error.flatten(),
        message: "Core village data validation failed",
      }
    }
    const validatedCoreData = coreParseResult.data

    // Validate tab-specific data
    let parsedTabData: any
    let schemaToUse: z.ZodObject<any>

    switch (tabKey) {
      case "population":
        schemaToUse = populationSchema
        break
      case "education":
        schemaToUse = educationSchema
        break
      case "infrastructure":
        schemaToUse = infraSchema
        break
      case "health":
        schemaToUse = healthSchema
        break
      case "sanitation":
        schemaToUse = sanitationSchema
        break
      case "water":
        schemaToUse = waterSchema
        break
      case "economic":
        schemaToUse = economicSchema
        break
      case "eduInstitution":
        schemaToUse = eduInstitutionSchema
        break
      default:
        console.error("Invalid tabKey provided:", tabKey)
        return {
          success: false,
          errors: { message: "Invalid tab key", details: `Tab key '${tabKey}' is not recognized.` },
          message: "Invalid tab key provided",
        }
    }

    const tabParseResult = schemaToUse.safeParse(tabData)
    if (!tabParseResult.success) {
      console.error(`Tab data validation failed for ${tabKey}:`, tabParseResult.error.flatten())
      return {
        success: false,
        errors: tabParseResult.error.flatten(),
        message: `Validation failed for ${tabKey} data`,
      }
    }
    parsedTabData = tabParseResult.data
    console.log(`Tab data for ${tabKey} validated successfully.`)

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (tx): Promise<ServerActionResult<any>> => {
      console.log("Starting database transaction...")

      // 1. Find or create Year
      console.log("Finding/creating year:", validatedCoreData.year)
      let yearRecord = await tx.yeardatas.findFirst({
        where: { yeardata: validatedCoreData.year },
      })
      if (!yearRecord) {
        console.log("Creating new year record...")
        yearRecord = await tx.yeardatas.create({
          data: { yeardata: validatedCoreData.year },
        })
        console.log("Year created:", yearRecord.id)
      } else {
        console.log("Year found:", yearRecord.id)
      }

      // 2. Find or create the main VillageInfo record
      console.log("Finding or creating VillageInfo record...")
      let villageInfo = await tx.villageInfo.findUnique({
        where: {
          lgdcode_yeardatasId: {
            lgdcode: validatedCoreData.lgdcode,
            yeardatasId: yearRecord.id,
          },
        },
        include: {
          villagePopulation: true,
          VillageEducation: true,
          VillageInfrastructure: true,
          HealthData: true,
          SanitationData: true,
          WaterSupplyData: true,
          EconomicData: true,
          EducationalInstitutionData: true,
        },
      })

      if (!villageInfo) {
        console.log("VillageInfo record not found for this year, creating new one...")
        villageInfo = await tx.villageInfo.create({
          data: {
            lgdcode: validatedCoreData.lgdcode,
            jlno: validatedCoreData.jlno,
            name: validatedCoreData.name,
            yeardatasId: yearRecord.id,
            isDraft: isDraft,
          },
          include: {
            villagePopulation: true,
            VillageEducation: true,
            VillageInfrastructure: true,
            HealthData: true,
            SanitationData: true,
            WaterSupplyData: true,
            EconomicData: true,
            EducationalInstitutionData: true,
          },
        })
        console.log(`New VillageInfo ${villageInfo.id} created successfully.`)
      } else {
        console.log(`VillageInfo record ${villageInfo.id} found, updating core fields...`)
        villageInfo = await tx.villageInfo.update({
          where: { id: villageInfo.id },
          data: {
            name: validatedCoreData.name,
            jlno: validatedCoreData.jlno,
            isDraft: isDraft,
          },
          include: {
            villagePopulation: true,
            VillageEducation: true,
            VillageInfrastructure: true,
            HealthData: true,
            SanitationData: true,
            WaterSupplyData: true,
            EconomicData: true,
            EducationalInstitutionData: true,
          },
        })
        console.log(`VillageInfo ${villageInfo.id} core fields updated successfully.`)
      }

      // 3. Update or create the specific sub-model based on tabKey
      let updatedSubModelId: string | null = null
      switch (tabKey) {
        case "population":
          if (villageInfo.villagePopulationId) {
            console.log("Updating existing population data...")
            await tx.villagePopulation.update({
              where: { id: villageInfo.villagePopulationId },
              data: { ...parsedTabData, isDraft: isDraft },
            })
            updatedSubModelId = villageInfo.villagePopulationId
          } else {
            console.log("Creating new population data...")
            const newRecord = await tx.villagePopulation.create({
              data: { ...parsedTabData, isDraft: isDraft },
            })
            await tx.villageInfo.update({
              where: { id: villageInfo.id },
              data: { villagePopulationId: newRecord.id },
            })
            updatedSubModelId = newRecord.id
          }
          break
        case "education":
          if (villageInfo.VillageEducation) {
            console.log("Updating existing education data...")
            await tx.villageEducation.update({
              where: { id: villageInfo.VillageEducation.id },
              data: { ...parsedTabData, isDraft: isDraft },
            })
            updatedSubModelId = villageInfo.VillageEducation.id
          } else {
            console.log("Creating new education data...")
            const newRecord = await tx.villageEducation.create({
              data: { ...parsedTabData, isDraft: isDraft },
            })
            await tx.villageInfo.update({
              where: { id: villageInfo.id },
              data: { villageEducationId: newRecord.id },
            })
            updatedSubModelId = newRecord.id
          }
          break
        case "infrastructure":
          if (villageInfo.VillageInfrastructure) {
            console.log("Updating existing infrastructure data...")
            await tx.villageInfrastructure.update({
              where: { id: villageInfo.VillageInfrastructure.id },
              data: { ...parsedTabData, isDraft: isDraft },
            })
            updatedSubModelId = villageInfo.VillageInfrastructure.id
          } else {
            console.log("Creating new infrastructure data...")
            const newRecord = await tx.villageInfrastructure.create({
              data: { ...parsedTabData, isDraft: isDraft },
            })
            await tx.villageInfo.update({
              where: { id: villageInfo.id },
              data: { villageInfrastructureId: newRecord.id },
            })
            updatedSubModelId = newRecord.id
          }
          break
        case "health":
          if (villageInfo.HealthData) {
            console.log("Updating existing health data...")
            await tx.healthData.update({
              where: { id: villageInfo.HealthData.id },
              data: { ...parsedTabData, isDraft: isDraft },
            })
            updatedSubModelId = villageInfo.HealthData.id
          } else {
            console.log("Creating new health data...")
            const newRecord = await tx.healthData.create({
              data: { ...parsedTabData, isDraft: isDraft },
            })
            await tx.villageInfo.update({
              where: { id: villageInfo.id },
              data: { healthDataId: newRecord.id },
            })
            updatedSubModelId = newRecord.id
          }
          break
        case "sanitation":
          if (villageInfo.SanitationData) {
            console.log("Updating existing sanitation data...")
            await tx.sanitationData.update({
              where: { id: villageInfo.SanitationData.id },
              data: { ...parsedTabData, isDraft: isDraft },
            })
            updatedSubModelId = villageInfo.SanitationData.id
          } else {
            console.log("Creating new sanitation data...")
            const newRecord = await tx.sanitationData.create({
              data: { ...parsedTabData, isDraft: isDraft },
            })
            await tx.villageInfo.update({
              where: { id: villageInfo.id },
              data: { sanitationDataId: newRecord.id },
            })
            updatedSubModelId = newRecord.id
          }
          break
        case "water":
          if (villageInfo.WaterSupplyData) {
            console.log("Updating existing water supply data...")
            await tx.waterSupplyData.update({
              where: { id: villageInfo.WaterSupplyData.id },
              data: { ...parsedTabData, isDraft: isDraft },
            })
            updatedSubModelId = villageInfo.WaterSupplyData.id
          } else {
            console.log("Creating new water supply data...")
            const newRecord = await tx.waterSupplyData.create({
              data: { ...parsedTabData, isDraft: isDraft },
            })
            await tx.villageInfo.update({
              where: { id: villageInfo.id },
              data: { waterSupplyDataId: newRecord.id },
            })
            updatedSubModelId = newRecord.id
          }
          break
        case "economic":
          if (villageInfo.EconomicData) {
            console.log("Updating existing economic data...")
            await tx.economicData.update({
              where: { id: villageInfo.EconomicData.id },
              data: { ...parsedTabData, isDraft: isDraft },
            })
            updatedSubModelId = villageInfo.EconomicData.id
          } else {
            console.log("Creating new economic data...")
            const newRecord = await tx.economicData.create({
              data: { ...parsedTabData, isDraft: isDraft },
            })
            await tx.villageInfo.update({
              where: { id: villageInfo.id },
              data: { economicDataId: newRecord.id },
            })
            updatedSubModelId = newRecord.id
          }
          break
        case "eduInstitution":
          if (villageInfo.EducationalInstitutionData) {
            console.log("Updating existing educational institution data...")
            await tx.educationalInstitutionData.update({
              where: { id: villageInfo.EducationalInstitutionData.id },
              data: { ...parsedTabData, isDraft: isDraft },
            })
            updatedSubModelId = villageInfo.EducationalInstitutionData.id
          } else {
            console.log("Creating new educational institution data...")
            const newRecord = await tx.educationalInstitutionData.create({
              data: { ...parsedTabData, isDraft: isDraft },
            })
            await tx.villageInfo.update({
              where: { id: villageInfo.id },
              data: { educationalInstitutionDataId: newRecord.id },
            })
            updatedSubModelId = newRecord.id
          }
          break
      }
      console.log("Transaction completed successfully")
      
      return {
        success: true,
        data: villageInfo,
        message: isDraft ? "Draft saved successfully" : "Village information submitted successfully",
      }
    })

    return result
  } catch (error) {
    console.error("=== Error in createVillageInfoWithRelations ===")
    console.error("Error type:", error?.constructor?.name)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
    } else {
      console.error("Error message:", String(error))
    }
    console.error("Full error:", error)

    if (typeof error === "object" && error !== null && "code" in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } }
      if (prismaError.code === "P2002") {
        const targetField = prismaError.meta?.target ? prismaError.meta.target.join(", ") : "unknown field(s)"
        return {
          success: false,
          errors: {
            message: "Duplicate entry detected.",
            details: `A record with the same ${targetField} already exists.`,
            code: prismaError.code,
          },
          message: `Duplicate entry detected: A record with the same ${targetField} already exists.`,
        }
      }
      if (prismaError.code === "P2025") {
        return {
          success: false,
          errors: {
            message: "Record not found",
            details: "Required record was not found in database during update/create operation.",
            code: prismaError.code,
          },
          message: "Record not found during database operation.",
        }
      }
    }

    return {
      success: false,
      errors: {
        message: "Failed to save village info",
        details: error instanceof Error ? error.message : "Unknown error occurred",
        code: typeof error === "object" && error !== null && "code" in error ? (error as any).code : "UNKNOWN_ERROR",
      },
      message: "Failed to save village information due to an unexpected error.",
    }
  }
}

export async function getVillageInfoByYear(lgdcode: number, year: string) {
  try {
    console.log("Fetching village info:", { lgdcode, year })
    const yearRecord = await db.yeardatas.findFirst({
      where: { yeardata: year },
    })
    if (!yearRecord) {
      console.log("Year record not found:", year)
      return null
    }

    const villageInfo = await db.villageInfo.findFirst({
      where: {
        lgdcode,
        yeardatasId: yearRecord.id,
      },
      include: {
        villagePopulation: true,
        VillageEducation: true,
        VillageInfrastructure: true,
        HealthData: true,
        SanitationData: true,
        WaterSupplyData: true,
        EconomicData: true,
        EducationalInstitutionData: true,
      },
    })
    console.log("Village info found:", !!villageInfo)
    return villageInfo
  } catch (error) {
    console.error("Error fetching village info:", error)
    return null
  }
}
