import { z } from "zod";
import { CreateLinkageApplicationSchema } from "@/lib/linkage-validation";

export type LinkageFormValuesType = z.infer<typeof CreateLinkageApplicationSchema>;

export const defaultValues: Partial<LinkageFormValuesType> = {
  applicantName: "",
  applicantPhone: "",
  applicantEmail: "",
  applicantAddress: "",
  applicantVillage: "",
  applicantPostOffice: "",
  applicantBlock: "",
  applicantDistrict: "",
  applicantState: "West Bengal",
  linkageType: "",
  linkageCategory: "",
  linkageReason: "",
  linkedEntityName: "",
  linkedEntityAddress: "",
  documents: [],
  beneficiariesTree: [],
  beneficiaries: [],
};
