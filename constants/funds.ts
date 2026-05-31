export const STATUTORY_FUNDS = [
  {
    category: "(A) GRANTS, CONTRIBUTION AVAILABLE FROM THE CENTRAL OR THE STATE GOVERNMENT OR THE ZILLA PARISHAD/ PANCHAYAT SAMITI",
    funds: [
      "MGNREGS",
      "15th CFC",
      "16th CFC",   // added
      "17th CFC",   // added
      "5th SFC",
      "6th SFC",    // added
      "7th SFC",    // added
      "PBG-CFC",
      "UBUP",
      "MNB/SBM",
      "CHCMI/NRHM",
      "NRLM",
      "APAS Fund",
      "Sahay Fund",
      "Hariyali",
      "VWSC",
      "PUP",
      "Strengthening Rural Decentralization",
      "BRGF",
      "SWM",
      "ITDP",
      "RKVY",
      "Samabathy",
      "BADF",
      "Panchayat Samity Fund",
      "Zilla Parishad Fund",
      "Grant for Five Year Plan (5YP)",
      "Gram Panchayat Staff Salary",
      "Honorarium of Prodhan",
      "Honorarium of Upa-Prodhan",
      "Honorarium of Sanchalaks",
      "FTA of General Members (including PS Members)",
      "Allowance of Tax Collector",
      "SSA",
      "PSP",
      "RGSA",
      "PHED",
      "Vector Borne Disease",
      "Siliguri Mahakuma Parishad",
      "NSAP",
      "PMAY-G",
      "SHC",
      "Contingency",
    ],
  },
  {
    category: "(B) OWN SOURCES REVENUE LIKE TAX, RATE, FEES, TOLLS, DONATION ETC.",
    funds: [
      "Own Fund",
      "Land & House Tax",
      "Trade Registration Fees",
      "Sale of Old Structure",
      "RTI Fees",
      "Sales of Forms",
      "Rent From Shops/Buildings",
      "Mobile Tower Installtion Fees",
      "Mutation",
      "Building Plan Sanction",
      "Others Receipt",
      "Any Other Sourcess Not Specied Above",
    ],
  },
  {
    category: "(C) OTHER RECEIPTS/ EXPENDITURE",
    funds: ["BEUP", "MPLAD", "PBG-IBRD", "MDF"],
  },
  {
    category: "(D) LOANS/ ADVANCE/DEPOSITS",
    funds: [
      "Earnest Money",
      "Security Deposit",
      "PROFLAL",
      "Income Tax (IT)",
      "STDs/Goods & Service Tax (GST)",
      "Labour Welfare Cess",
      "Royalty",
    ],
  },
  {
    category: "(E) INTEREST ON DEPOSITS IN BANK/POST OFFICE",
    funds: ["INTEREST ON DEPOSITS IN BANK/POST OFFICE"],
  },
  {
    category: "(F) MISC. RECEIPT, IF ANY, NOT CLASSIFIED ABOVE",
    funds: ["MISC. RECEIPT, IF ANY, NOT CLASSIFIED ABOVE"],
  },
];

export const FLAT_STATUTORY_FUNDS = STATUTORY_FUNDS.flatMap((cat) => cat.funds);

export const FUND_FULL_NAMES: Record<string, string> = {
  // (A) Central / State / ZP / PS Grants
  MGNREGS: "Mahatma Gandhi National Rural Employment Guarantee Scheme (MGNREGS)",
  "15th CFC": "Central Finance Commission (CFC)",
  "5th SFC": "Performance Based Grant (SFC)",
  "PBG-CFC": "Performance Based Grant (CFC)",
  UBUP: "Uttar Banga Unnayan Parishad (UBUP)",
  "MNB/SBM": "Mission Nirmal Bangla (MNB) / Swachh Bharat Mission",
  "CHCMI/NRHM": "Community Health Care & Management Initiative (CHCMI)/NRHM",
  NRLM: "National Rural Livelihood Mission (NRLM)",
  "APAS Fund": "APAS Fund",
  "Sahay Fund": "Sahay Fund",
  Hariyali: "Hariyali",
  VWSC: "Village Water & Sanitation Committee (VWSC)",
  PUP: "Paschimanchal Unnayan Parishad (PUP)",
  "Strengthening Rural Decentralization": "Strengthening Rural Decentralization",
  BRGF: "Backward Region Grant Fund (BRGF)",
  SWM: "Solid Waste Management (SWM)",
  ITDP: "Integrated Tribal Development Programme (ITDP)",
  RKVY: "Rastriya Krishi Vikash Yojana (RKVY)",
  Samabathy: "Samabathy Programme",
  BADF: "Border Area Development Fund (BADF)",
  "Panchayat Samity Fund": "Panchayat Samity Fund",
  "Zilla Parishad Fund": "Zilla Parishad Fund",
  "Grant for Five Year Plan (5YP)": "Grant for Five Year Plan (5YP)",
  "Gram Panchayat Staff Salary": "Gram Panchayat Staff Salary",
  "Honorarium of Prodhan": "Honorarium of Prodhan",
  "Honorarium of Upa-Prodhan": "Honorarium of Upa-Prodhan",
  "Honorarium of Sanchalaks": "Honorarium of Sanchalaks",
  "FTA of General Members (including PS Members)":
    "FTA of General Members (including PS Members)",
  "Allowance of Tax Collector": "Allowance of Tax Collector",
  SSA: "Sarba Siksha Abhiyan (SSA)",
  PSP: "Panchayat Swasakti Puruskar (PSP)",
  RGSA: "Rastriya Gram Swaraj Yojana (RGSA)",
  PHED: "Public Health Engineering Department (PHED)",
  "Vector Borne Disease": "Vector Borne Disease Control Programme",
  "Siliguri Mahakuma Parishad": "Fund from Siliguri Mahakuma Parishad",
  NSAP: "National Social Assistance Programme (NSAP)",
  "PMAY-G": "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
  SHC: "Soil Health Card (SHC)",
  Contingency: "Contingency",
  // (B) Own Sources
  "Own Fund": "Own Fund",
  "Land & House Tax": "Land & House Tax",
  "Trade Registration Fees": "Trade Registration Fees",
  "Sale of Old Structure": "Sale of Old Structure",
  "RTI Fees": "RTI Fees",
  "Sales of Forms": "Sale of Forms / Tender Form",
  "Rent From Shops/Buildings": "Rent from Shops / Buildings",
  "Mobile Tower Installtion Fees": "Mobile Tower Installation Fees",
  Mutation: "Mutation Fees",
  "Building Plan Sanction": "Building Plan Approval / Sanction",
  "Others Receipt": "Other Receipts",
  "Any Other Sourcess Not Specied Above": "Any Other Sources Not Specified Above",
  // (C) Other Receipts / Expenditure
  BEUP: "Bidhayak Elaka Unnayan Parishad (BEUP)",
  MPLAD: "M.P. Local Area Development Fund (MPLAD)",
  "PBG-IBRD": "Performance Based Grant (ISGPP-II) / PBG-IBRD",
  MDF: "Minority Development Fund (MDF)",
  // (D) Loans / Advance / Deposits
  "Earnest Money": "Earnest Money",
  "Security Deposit": "Security Deposit",
  PROFLAL: "PROFLAL",
  "Income Tax (IT)": "Income Tax (IT) Deduction",
  "STDs/Goods & Service Tax (GST)": "STDs / Goods & Service Tax (GST)",
  "Labour Welfare Cess": "Labour Welfare Cess",
  Royalty: "Royalty",
  // (E) Interest
  "INTEREST ON DEPOSITS IN BANK/POST OFFICE":
    "Interest on Deposits in Bank / Post Office",
  // (F) Misc
  "MISC. RECEIPT, IF ANY, NOT CLASSIFIED ABOVE":
    "Misc. Receipt, if any, not classified above",
};

export const SCHEME_FUNDS = STATUTORY_FUNDS.map((cat) => {
  if (cat.category.startsWith("(B)")) {
    return { category: cat.category, funds: ["Own Fund"] };
  }
  return cat;
});

/**
 * Returns the full display name for a fund key, falling back to the key itself.
 * Supports dynamic matching for numbered CFC and SFC entries
 * (e.g., "16th CFC", "17 CFC", "6th SFC", "7 SFC").
 */
export function getFundDisplayName(key: string): string {
  // First check explicit mapping
  if (FUND_FULL_NAMES[key]) {
    return FUND_FULL_NAMES[key];
  }

  // Handle numbered CFC: e.g., "16th CFC", "16 CFC", "17th CFC"
  const cfcMatch = key.match(/^(\d+)(?:th)?\s+CFC$/i);
  if (cfcMatch) {
    return "Central Finance Commission (CFC)";
  }

  // Handle numbered SFC: e.g., "5th SFC", "6th SFC", "7 SFC"
  const sfcMatch = key.match(/^(\d+)(?:th)?\s+SFC$/i);
  if (sfcMatch) {
    return "Performance Based Grant (SFC)";
  }

  // Fallback: return the original key
  return key;
}
