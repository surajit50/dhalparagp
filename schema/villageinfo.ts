import * as z from "zod";

export const villainfoSchema = z.object({
  villageName: z.string().nonempty("Village name is required"),
  villageJlno: z.string().nonempty("Village JL number is required"),
  totalHousehold: z
    .number()
    .int()
    .positive("Total household must be a positive integer"),
  population: z.object({
    male: z
      .number()
      .int()
      .nonnegative("Male population must be a non-negative integer"),
    female: z
      .number()
      .int()
      .nonnegative("Female population must be a non-negative integer"),
  }),
  totalvoter: z.object({
    male: z
      .number()
      .int()
      .nonnegative("Male voters must be a non-negative integer"),
    female: z
      .number()
      .int()
      .nonnegative("Female voters must be a non-negative integer"),
  }),
  sansadNo: z.string().nonempty("Sansad number is required"),
});

export const populationSchema = z.object({
  villageId: z.string().nonempty("Please select a village"),
  male: z.coerce.number().int().nonnegative("Must be a non-negative number"),
  female: z.coerce.number().int().nonnegative("Must be a non-negative number"),
  st: z.coerce.number().int().nonnegative("Must be a non-negative number"),
  sc: z.coerce.number().int().nonnegative("Must be a non-negative number"),
  obc: z.coerce.number().int().nonnegative("Must be a non-negative number"),
  other: z.coerce.number().int().nonnegative("Must be a non-negative number"),
  hindu: z.coerce.number().int().nonnegative("Must be a non-negative number"),
  muslim: z.coerce.number().int().nonnegative("Must be a non-negative number"),
  christian: z.coerce
    .number()
    .int()
    .nonnegative("Must be a non-negative number"),
  otherReligion: z.coerce
    .number()
    .int()
    .nonnegative("Must be a non-negative number"),
});
