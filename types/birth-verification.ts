// types/birth-verification.ts
import { z } from "zod";
import { birthVerificationReportSchema } from "@/schema/birth-verification-report";

export type BirthVerificationReport = z.infer<typeof birthVerificationReportSchema>;
