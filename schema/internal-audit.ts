import { z } from "zod";

export const pastObservationSchema = z.object({
  type: z.string(),
  totalFindings: z.coerce.number().default(0),
  findingsResolved: z.coerce.number().default(0),
  findingsPending: z.coerce.number().default(0),
});

export const pendingComplianceSchema = z.object({
  slNo: z.coerce.number().optional(),
  reportNoAndYear: z.string().default(""),
  findingNo: z.string().default(""),
  description: z.string().default(""),
  type: z.string().default(""),
  importance: z.string().default("High"),
  amount: z.string().default("0"),
  actionToBeTaken: z.string().default(""),
});

export const reportSummarySchema = z.object({
  findingNo: z.string().default(""),
  area: z.string().default(""),
  title: z.string().default(""),
  type: z.string().default("Financial"),
  importance: z.string().default("High"),
  amount: z.string().default("0"),
});

export const observationSchema = z.object({
  findingNo: z.string().default(""),
  type: z.string().default("Financial finding"), // Financial finding | Procedural finding | Documentary finding
  title: z.string().default(""),
  area: z.string().default(""),
  importance: z.string().default("High"),
  description: z.string().default(""),
  correctiveAction: z.string().default(""),
  gpResponse: z.string().default(""),
});

export const gpMembersSchema = z.object({
  maleElected: z.coerce.number().default(0),
  femaleElected: z.coerce.number().default(0),
  maleExOfficio: z.coerce.number().default(0),
  femaleExOfficio: z.coerce.number().default(0),
});

export const upaSamitiSchema = z.object({
  name: z.string(),
  directMembers: z.coerce.number().default(0),
  designatedMembers: z.coerce.number().default(0),
  sanchalakName: z.string().default(""),
  meetingsHeld: z.coerce.number().default(0),
});

export const gpStaffSchema = z.object({
  designation: z.string(),
  maleName: z.string().default(""),
  femaleName: z.string().default(""),
  salary: z.string().default(""),
});

export const fundUsageSchema = z.object({
  tiedFund: z.coerce.number().default(0),
  untiedFund: z.coerce.number().default(0),
  amountUtilised: z.coerce.number().default(0),
  percentageUtilised: z.coerce.number().default(0),
});

export const procurementItemSchema = z.object({
  slNo: z.coerce.number().default(1),
  fund: z.string().default(""),
  nitNo: z.string().default(""),
  nitDate: z.string().default(""),
  activityName: z.string().default(""),
  typeOfProcurement: z.string().default("Works"),
  typeOfWork: z.string().default("Roads"),
  estimatedValue: z.coerce.number().default(0),
  contractValue: z.coerce.number().default(0),
  contractDate: z.string().default(""),
  billValue: z.coerce.number().default(0),
  planPlusValue: z.coerce.number().default(0),
  sample: z.string().default("N"),
});

export const otherExpenditureItemSchema = z.object({
  slNo: z.coerce.number().default(1),
  fund: z.string().default(""),
  voucherNo: z.string().default(""),
  voucherDate: z.string().default(""),
  expenditureType: z.string().default(""),
  description: z.string().default(""),
  amount: z.coerce.number().default(0),
  sample: z.string().default("N"),
});

export const osrTaxSchema = z.object({
  noOfAssesses: z.coerce.number().default(0),
  arrears: z.coerce.number().default(0),
  currentYearDemand: z.coerce.number().default(0),
  totalReceivable: z.coerce.number().default(0),
  arrearsCollected: z.coerce.number().default(0),
  cyDemandCollected: z.coerce.number().default(0),
  totalCollection: z.coerce.number().default(0),
  pendingAmount: z.coerce.number().default(0),
});

export const otherInfoStatsSchema = z.object({
  totalPopulation: z.coerce.number().default(0),
  deathCertificatesIssued: z.coerce.number().default(0),
  birthCertificatesIssued: z.coerce.number().default(0),
  tradeLicencesIssued: z.coerce.number().default(0),
});

export const internalAuditReportSchema = z.object({
  reportNo: z.string().min(1, "Report No is required"),
  financialYear: z.string().min(1, "Financial Year is required"),
  quarter: z.string().min(1, "Quarter is required"), // Q1 | Q2 | Q3 | Q4
  
  // Auditee's Profile
  gpName: z.string().default("Dhalpara Gram Panchayat"),
  blockAndDistrict: z.string().default("Hilli, Dakshin Dinajpur"),
  riskCategory: z.string().default("Low"),
  gpAddressAndPhone: z.string().default("Vill & P.O - Dhalpara, P.S - Hilli, Dist - Dakshin Dinajpur, Mob: 9733230635"),

  // Auditor's Profile
  auditPartyMembers: z.string().default(""),
  auditPartyContact: z.string().default(""),
  auditPartyEmail: z.string().default(""),

  // Audit Profile
  auditPeriod: z.string().default(""),
  auditDuration: z.string().default(""),
  totalFindings: z.coerce.number().default(0),

  // Tables / Lists
  pastObservations: z.array(pastObservationSchema).default([]),
  pendingCompliances: z.array(pendingComplianceSchema).default([]),
  reportSummaries: z.array(reportSummarySchema).default([]),
  observations: z.array(observationSchema).default([]),

  // Additional Information
  gpMembersCount: gpMembersSchema.default({
    maleElected: 0,
    femaleElected: 0,
    maleExOfficio: 0,
    femaleExOfficio: 0,
  }),
  upaSamitiDetails: z.array(upaSamitiSchema).default([
    { name: "Artha O Parikalpana", directMembers: 0, designatedMembers: 0, sanchalakName: "", meetingsHeld: 0 },
    { name: "Krishi O Pranisampad Bikas", directMembers: 0, designatedMembers: 0, sanchalakName: "", meetingsHeld: 0 },
    { name: "Siksha O Janasasthya", directMembers: 0, designatedMembers: 0, sanchalakName: "", meetingsHeld: 0 },
    { name: "Nari, Sishu Unnayan O Samaj Kalyan", directMembers: 0, designatedMembers: 0, sanchalakName: "", meetingsHeld: 0 },
    { name: "Shilpa O Parikathama", directMembers: 0, designatedMembers: 0, sanchalakName: "", meetingsHeld: 0 },
  ]),
  gpStaffDetails: z.array(gpStaffSchema).default([
    { designation: "Executive Assistant", maleName: "", femaleName: "", salary: "" },
    { designation: "Secretary", maleName: "", femaleName: "", salary: "" },
    { designation: "Nirman Sahayak", maleName: "", femaleName: "", salary: "" },
    { designation: "Sahayak (1)", maleName: "", femaleName: "", salary: "" },
    { designation: "Sahayak (2)", maleName: "", femaleName: "", salary: "" },
    { designation: "Gram Panchayat Karmee (2 Nos)", maleName: "", femaleName: "", salary: "" },
  ]),
  fundUsage: fundUsageSchema.default({
    tiedFund: 0,
    untiedFund: 0,
    amountUtilised: 0,
    percentageUtilised: 0,
  }),
  procurementList: z.array(procurementItemSchema).default([]),
  otherExpenditureList: z.array(otherExpenditureItemSchema).default([]),
  propertyTaxOSR: osrTaxSchema.default({
    noOfAssesses: 0,
    arrears: 0,
    currentYearDemand: 0,
    totalReceivable: 0,
    arrearsCollected: 0,
    cyDemandCollected: 0,
    totalCollection: 0,
    pendingAmount: 0,
  }),
  tradeLicenceOSR: osrTaxSchema.default({
    noOfAssesses: 0,
    arrears: 0,
    currentYearDemand: 0,
    totalReceivable: 0,
    arrearsCollected: 0,
    cyDemandCollected: 0,
    totalCollection: 0,
    pendingAmount: 0,
  }),
  otherInfoStats: otherInfoStatsSchema.default({
    totalPopulation: 0,
    deathCertificatesIssued: 0,
    birthCertificatesIssued: 0,
    tradeLicencesIssued: 0,
  }),

  auditorDesignation: z.string().default("Internal Audit Officer"),
  auditorOfficeAddress: z.string().default("Office of the Block Development Officer, Hilli"),
  status: z.string().default("Draft"),
});

export type InternalAuditReportInput = z.infer<typeof internalAuditReportSchema>;
