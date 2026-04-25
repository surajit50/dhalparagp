import type { WarishFormValuesType } from "@/schema/warishSchema"

export const defaultValues: WarishFormValuesType = {
  reportingDate: new Date(),
  applicantName: "",
  applicantMobileNumber: "",
  nameOfDeceased: "",
  dateOfDeath: undefined as unknown as Date,

  gender: "male",
  maritialStatus: "unmarried",
  fatherName: "",
  spouseName: "",
  villageName: "",
  postOffice: "",
  relationwithdeceased: "",
  warishDetails: [
    {
      name: "",
      gender: "",
      relation: "Son",
      livingStatus: "alive",
      husbandName: "",
      maritialStatus: "unmarried",
      children: [],
    },
  ],
}

