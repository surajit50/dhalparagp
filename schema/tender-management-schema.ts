import { z } from "zod"

export const serchtenderdocument = z.object({
  tenderID: z.string().optional(),
  workName: z.string().optional(),
  nitRefNo: z.string().optional(),
  agencyName: z.string().optional(),
  documentType: z.enum(["workorder", "scrutinysheet", "agreement"]),
})

export const AddTechnicalDetailsSchema = z
  .object({
    credencial: z.object({
      sixtyperamtput: z.boolean().optional(),
      workorder: z.boolean().optional(),
      paymentcertificate: z.boolean().optional(),
      comcertificat: z.boolean().optional(),
    }),
    validityofdocument: z.object({
      itreturn: z.boolean().optional(),
      gst: z.boolean().optional(),
      ptax: z.boolean().optional(),
      tradelicence: z.boolean().optional(),
    }),
    byelow: z.boolean().optional(),
    pfregistrationupdatechalan: z.boolean().optional(),
    declaration: z.boolean().optional(),
    machinary: z.boolean().optional(),
    qualify: z.boolean(),
    remarks: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.qualify === false && (!data.remarks || data.remarks.trim() === "")) {
        return false
      }
      return true
    },
    {
      message: "Remarks are required when the agency does not qualify",
      path: ["remarks"],
    },
  )

export type AddTechnicalDetailsSchemaType = z.infer<typeof AddTechnicalDetailsSchema>

