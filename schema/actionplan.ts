import * as z from "zod";
import { UpasamitiName } from "@prisma/client";

export const actionplanschema = z.object({
  financialYear: z.string().min(4, {
    message: "Financial year must be at least 4 characters.",
  }),
  themeName: z.string().min(2, {
    message: "Theme name must be at least 2 characters.",
  }),
  activityCode: z.string().min(1, {
    message: "Activity code is required",
  }),
  activityName: z.string().min(2, {
    message: "Activity name must be at least 2 characters.",
  }),
  activityDescription: z.string().min(10, {
    message: "Activity description must be at least 10 characters.",
  }),
  activityFor: z.string().min(2, {
    message: "Activity for must be at least 2 characters.",
  }),
  sector: z.string().min(2, {
    message: "Sector must be at least 2 characters.",
  }),
  locationofAsset: z.string().min(2, {
    message: "Location of asset must be at least 2 characters.",
  }),
  estimatedCost: z.number().int().positive({
    message: "Estimated cost must be a positive number",
  }),
  totalduration: z.string().min(2, {
    message: "Total duration must be at least 2 characters.",
  }),
  schemeName: z.string().min(2, {
    message: "Scheme name must be at least 2 characters.",
  }),
  generalFund: z.number().int().nonnegative({
    message: "General fund must be a non-negative number",
  }),
  scFund: z.number().int().nonnegative({
    message: "SC fund must be a non-negative number",
  }),
  stFund: z.number().int().nonnegative({
    message: "ST fund must be a non-negative number",
  }),
  fundType: z.enum(["Tied", "Untied"], {
    required_error: "Please select a fund type",
    invalid_type_error: "Fund type must be Tied or Untied",
  }),
  upasamiti: z.nativeEnum(UpasamitiName).optional(),
  focusArea: z.string().optional(),
  workType: z.string().optional(),
  componentType: z.string().optional(),
  gramSansad: z.string().optional(),
  sdgs: z.string().optional(),
  beneficiariesSC: z.coerce.number().int().nonnegative().default(0),
  beneficiariesST: z.coerce.number().int().nonnegative().default(0),
  beneficiariesGen: z.coerce.number().int().nonnegative().default(0),
  unitType: z.string().optional(),
  totalUnit: z.coerce.number().int().nonnegative().default(0),
  implementedBy: z.string().optional(),
  remarks: z.string().optional(),
});

export type ActionPlanDetailsProps = z.infer<typeof actionplanschema>;
