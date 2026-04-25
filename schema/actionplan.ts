import * as z from "zod";
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
  estimatedCost: z.number().int().positive(),
  totalduration: z.string().min(2, {
    message: "Total duration must be at least 2 characters.",
  }),
  schemeName: z.string().min(2, {
    message: "Scheme name must be at least 2 characters.",
  }),
  generalFund: z.number().int().nonnegative(),
  scFund: z.number().int().nonnegative(),
  stFund: z.number().int().nonnegative(),
});

export type ActionPlanDetailsProps = z.infer<typeof actionplanschema>;
