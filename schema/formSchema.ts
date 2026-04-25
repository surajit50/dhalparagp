
import { z } from "zod"

export const formSchema = z
  .object({
    grossBillAmount: z.preprocess(
      (value) => Number(value) || 0,
      z.number().min(0, "Gross bill amount must be a positive number"),
    ),
    lessIncomeTax: z.preprocess(
      (value) => Number(value) || 0,
      z.number().min(0, "Income tax must be a positive number"),
    ),
    lessLabourWelfareCess: z.preprocess(
      (value) => Number(value) || 0,
      z.number().min(0, "Labour Welfare Cess must be a positive number"),
    ),
    lessTdsCgst: z.preprocess(
      (value) => Number(value) || 0,
      z.number().min(0, "TDS CGST must be a positive number"),
    ),
    lessTdsSgst: z.preprocess(
      (value) => Number(value) || 0,
      z.number().min(0, "TDS SGST must be a positive number"),
    ),
    securityDeposit: z.preprocess(
      (value) => Number(value) || 0,
      z.number().min(0, "Security deposit must be a positive number"),
    ),
    billPaymentDate: z.preprocess(
      (value) => (value ? new Date(value as string) : undefined),
      z.date(),
    ),
    eGramVoucher: z.string().min(1, "eGram Voucher must not be empty"),
    eGramVoucherDate: z.preprocess(
      (value) => (value ? new Date(value as string) : undefined),
      z.date(),
    ),
    mbrefno: z.string().min(1, "MB Reference must not be empty"),
    gpmsVoucherNumber: z.string().min(1, "GPMS Voucher Number must not be empty"),
    gpmsVoucherDate: z.preprocess(
      (value) => (value ? new Date(value as string) : undefined),
      z.date(),
    ),
    billType: z.enum(["1st RA", "2nd RA", "3rd RA", "Final Bill"]),
    netAmount: z.preprocess(
      (value) => Number(value) || 0,
      z.number().min(0, "Net amount must be a positive number"),
    ),
    workcompletaitiondate: z.preprocess(
      (value) => (value ? new Date(value as string) : undefined),
      z.date().optional(),
    ),
  })
  .refine(
    (data) => {
      if (data.billType === "Final Bill" && !data.workcompletaitiondate) {
        return false
      }
      return true
    },
    {
      message: "Work completion date is required for Final Bill",
      path: ["workcompletaitiondate"],
    },
  )

export type FormValues = z.infer<typeof formSchema>
