import { z } from "zod";

export const TubewellSurveySchema = z.object({
  tubewellNo: z.string().optional(),
  tubewellType: z.enum(["MARK_II", "ORDINARY", "SUBMERSIBLE", "MINI_PIPED"], {
    required_error: "Tubewell type is required",
  }),
  condition: z.enum(["WORKING", "DEFECTIVE", "ABANDONED"], {
    required_error: "Condition is required",
  }),
  landmark: z.string().min(3, "Landmark must be at least 3 characters"),
  latitude: z.number({
    required_error: "GPS coordinates are required",
    invalid_type_error: "Latitude must be a number",
  }),
  longitude: z.number({
    required_error: "GPS coordinates are required",
    invalid_type_error: "Longitude must be a number",
  }),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
});

export type TubewellSurveyInput = z.infer<typeof TubewellSurveySchema>;

export const TubewellRegisterSchema = z.object({
  tubewellNo: z.string().optional(),
  tubewellType: z.enum(["MARK_II", "ORDINARY", "SUBMERSIBLE", "MINI_PIPED"]),
  condition: z.enum(["WORKING", "DEFECTIVE", "ABANDONED"]),
  mouza: z.string().min(1, "Mouza is required"),
  sansad: z.string().optional(),
  ward: z.string().optional(),
  landmark: z.string().min(1, "Landmark is required"),
  latitude: z.number(),
  longitude: z.number(),
  installYear: z.number().optional(),
  remarks: z.string().optional(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
});

export type TubewellRegisterInput = z.infer<typeof TubewellRegisterSchema>;
