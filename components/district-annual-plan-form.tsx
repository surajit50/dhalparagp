"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

// TypeScript interfaces
interface PopulationData {
  male: number;
  female: number;
  total: number;
}

interface PopulationByCategory {
  scheduledTribes: PopulationData;
  scheduledCastes: PopulationData;
  minorities: PopulationData;
  others: PopulationData;
  total: PopulationData;
}

interface PopulationByAge {
  category: string;
  age0to4: PopulationData;
  age5to9: PopulationData;
  age10to14: PopulationData;
  age15to19: PopulationData;
  age20to49: PopulationData;
  age50to59: PopulationData;
  age60to79: PopulationData;
  age80plus: PopulationData;
  disabled: PopulationData;
}

interface WorkerData {
  category: string;
  mainWorker: PopulationData;
  marginalWorker: PopulationData;
  nonWorker: PopulationData;
}

interface BasicInfo {
  name: string;
  subDivision: string;
  policeStations: { name: string; contact: string }[];
  gramPanchayats: number;
  postOffices: number;
  banglaSahayataKendras: number;
  bankBranches: number;
  customerServiceCentres: number;
  parliamentaryConstituency: string[];
  assemblyConstituency: string[];
  area: number;
  waterBodiesPercentage: number;
  distanceFromDistrict: number;
  selfHelpGroups: { number: number; members: number };
  lgdCode: string;
}

interface EducationalInstitution {
  gramPanchayat: string;
  shishuShikshaKendra: number;
  primarySchool: number;
  primaryMadrasah: number;
  juniorHighSchool: number;
  juniorHighMadrasah: number;
  madhyamikShikshaKendra: number;
  highSchool: number;
  highMadrasah: number;
  higherSecondarySchool: number;
  higherSecondaryMadrasah: number;
  girlsSchool: string;
  iti: number;
  polytechnic: number;
  degreeCollege: string;
  girlsCollege: string;
  engineeringCollege: number;
  nursingCollege: number;
  university: number;
  womensUniversity: number;
  managementInstitution: string;
  otherInstitution: string;
}

interface HealthCentre {
  gramPanchayat: string;
  subCentre: number;
  communityHealthCentre: number;
  suswasthyaKendra: number;
  primaryHealthCentre: number;
  blockPrimaryHealthCentre: number;
  ruralHospital: number;
  subDivisionalHospital: number;
  districtHospital: number;
  stateGeneralHospital: number;
  superSpecialtyHospital: number;
  privateHospital: number;
  privateNursingHome: number;
  otherCentre: string;
}

interface OtherInfrastructure {
  gramPanchayat: string;
  icdscentres: number;
  deepTubewells: number;
  streetTaps: number;
  pipedWaterConnections: number;
  fairPriceShops: number;
  governmentLibraries: number;
  privateLibraries: number;
}

interface RoadNetwork {
  gramPanchayat: string;
  nationalHighway: number;
  stateHighway: number;
  pmgsy: number;
  pathashreeRastashree: number;
  municipalRoad: number;
  zillaParishadRoad: number;
  panchayatSamitiRoad: number;
  gramPanchayatRoad: number;
  otherRoad: number;
}

interface LandUsePattern {
  gramPanchayat: string;
  singleCropped: number;
  doubleCropped: number;
  tripleCropped: number;
  croppingIntensity: number;
  fallowLand: number;
  wasteLand: number;
  otherLand: number;
}

interface Topography {
  gramPanchayat: string;
  mountain: number;
  valley: number;
  plain: number;
  waterBodies: number;
}

interface ForestArea {
  gramPanchayat: string;
  reservedForest: number;
  protectedForest: number;
  unclassedStateForest: number;
  others: number;
  totalForestArea: number;
  forestAndTreeCover: number;
}

interface WaterResources {
  gramPanchayat: string;
  river: number;
  stream: number;
  canal: number;
  drainage: number;
  dam: number;
  lake: number;
  pond: number;
  arsenicAffected: boolean;
  fluorideAffected: boolean;
}

interface DepartmentData {
  department: string;
  parameter: string;
  value: string | number;
}

interface FinancialScheme {
  slNo: number;
  sector: string;
  name: string;
  stateAmount: number;
  ownResources: number;
  total: number;
  beneficiaries: number;
  targetGroup: string;
}

interface SectorOutlay {
  sector: string;
  ownResources2024: number;
  ownResources2025: number;
  stateResources2024: number;
  stateResources2025: number;
  total2024: number;
  total2025: number;
}

interface FormData {
  basicInfo: BasicInfo;
  populationByCategory: PopulationByCategory;
  populationByAge: PopulationByAge[];
  workerData: WorkerData[];
  educationalInstitutions: EducationalInstitution[];
  healthCentres: HealthCentre[];
  otherInfrastructure: OtherInfrastructure[];
  roadNetwork: RoadNetwork[];
  landUsePattern: LandUsePattern[];
  topography: Topography[];
  forestArea: ForestArea[];
  waterResources: WaterResources[];
  developmentScenario: DepartmentData[];
  developmentStrategies: {
    sector: string;
    department: string;
    problem: string;
    intervention: string;
  }[];
  keyInterventions: { sector: string; intervention: string }[];
  majorSchemes: FinancialScheme[];
  sectorOutlay: SectorOutlay[];
  districtSchemes: FinancialScheme[];
  districtOutlay: { sector: string; outlay2024: number; outlay2025: number }[];
}

// Dummy data generator
const generateDummyData = (): FormData => ({
  basicInfo: {
    name: "Hili Block",
    subDivision: "Dakshin Dinajpur",
    policeStations: [{ name: "Hili PS", contact: "03242-255100" }],
    gramPanchayats: 5,
    postOffices: 4,
    banglaSahayataKendras: 3,
    bankBranches: 8,
    customerServiceCentres: 15,
    parliamentaryConstituency: ["Balurghat"],
    assemblyConstituency: ["Balurghat"],
    area: 285.5,
    waterBodiesPercentage: 8.5,
    distanceFromDistrict: 15,
    selfHelpGroups: { number: 450, members: 5400 },
    lgdCode: "109217",
  },
  populationByCategory: {
    scheduledTribes: { male: 12500, female: 11800, total: 24300 },
    scheduledCastes: { male: 18200, female: 17500, total: 35700 },
    minorities: { male: 8500, female: 8200, total: 16700 },
    others: { male: 85800, female: 82500, total: 168300 },
    total: { male: 125000, female: 120000, total: 245000 },
  },
  populationByAge: [
    {
      category: "Scheduled Tribes",
      age0to4: { male: 1250, female: 1180, total: 2430 },
      age5to9: { male: 1375, female: 1298, total: 2673 },
      age10to14: { male: 1500, female: 1416, total: 2916 },
      age15to19: { male: 1625, female: 1534, total: 3159 },
      age20to49: { male: 5000, female: 4720, total: 9720 },
      age50to59: { male: 1000, female: 944, total: 1944 },
      age60to79: { male: 625, female: 590, total: 1215 },
      age80plus: { male: 125, female: 118, total: 243 },
      disabled: { male: 250, female: 236, total: 486 },
    },
    {
      category: "Scheduled Castes",
      age0to4: { male: 1820, female: 1750, total: 3570 },
      age5to9: { male: 2002, female: 1925, total: 3927 },
      age10to14: { male: 2184, female: 2100, total: 4284 },
      age15to19: { male: 2366, female: 2275, total: 4641 },
      age20to49: { male: 7280, female: 7000, total: 14280 },
      age50to59: { male: 1456, female: 1400, total: 2856 },
      age60to79: { male: 910, female: 875, total: 1785 },
      age80plus: { male: 182, female: 175, total: 357 },
      disabled: { male: 364, female: 350, total: 714 },
    },
  ],
  workerData: [
    {
      category: "Scheduled Tribes",
      mainWorker: { male: 8750, female: 4720, total: 13470 },
      marginalWorker: { male: 1875, female: 2360, total: 4235 },
      nonWorker: { male: 1875, female: 4720, total: 6595 },
    },
    {
      category: "Scheduled Castes",
      mainWorker: { male: 12740, female: 7000, total: 19740 },
      marginalWorker: { male: 2730, female: 3500, total: 6230 },
      nonWorker: { male: 2730, female: 7000, total: 9730 },
    },
  ],
  educationalInstitutions: [
    {
      gramPanchayat: "Bankura I",
      shishuShikshaKendra: 2,
      primarySchool: 8,
      primaryMadrasah: 1,
      juniorHighSchool: 3,
      juniorHighMadrasah: 0,
      madhyamikShikshaKendra: 1,
      highSchool: 2,
      highMadrasah: 0,
      higherSecondarySchool: 1,
      higherSecondaryMadrasah: 0,
      girlsSchool: "Classes VI-X",
      iti: 1,
      polytechnic: 0,
      degreeCollege: "Arts, Science",
      girlsCollege: "Arts",
      engineeringCollege: 0,
      nursingCollege: 0,
      university: 0,
      womensUniversity: 0,
      managementInstitution: "None",
      otherInstitution: "Teacher Training Institute",
    },
    {
      gramPanchayat: "Chhatna",
      shishuShikshaKendra: 1,
      primarySchool: 6,
      primaryMadrasah: 2,
      juniorHighSchool: 2,
      juniorHighMadrasah: 1,
      madhyamikShikshaKendra: 0,
      highSchool: 1,
      highMadrasah: 1,
      higherSecondarySchool: 0,
      higherSecondaryMadrasah: 0,
      girlsSchool: "None",
      iti: 0,
      polytechnic: 0,
      degreeCollege: "None",
      girlsCollege: "None",
      engineeringCollege: 0,
      nursingCollege: 0,
      university: 0,
      womensUniversity: 0,
      managementInstitution: "None",
      otherInstitution: "None",
    },
  ],
  healthCentres: [
    {
      gramPanchayat: "Bankura I",
      subCentre: 3,
      communityHealthCentre: 1,
      suswasthyaKendra: 2,
      primaryHealthCentre: 1,
      blockPrimaryHealthCentre: 1,
      ruralHospital: 0,
      subDivisionalHospital: 0,
      districtHospital: 0,
      stateGeneralHospital: 0,
      superSpecialtyHospital: 0,
      privateHospital: 2,
      privateNursingHome: 4,
      otherCentre: "Ayurvedic Dispensary",
    },
    {
      gramPanchayat: "Chhatna",
      subCentre: 2,
      communityHealthCentre: 0,
      suswasthyaKendra: 1,
      primaryHealthCentre: 1,
      blockPrimaryHealthCentre: 0,
      ruralHospital: 0,
      subDivisionalHospital: 0,
      districtHospital: 0,
      stateGeneralHospital: 0,
      superSpecialtyHospital: 0,
      privateHospital: 1,
      privateNursingHome: 2,
      otherCentre: "None",
    },
  ],
  otherInfrastructure: [
    {
      gramPanchayat: "Bankura I",
      icdscentres: 8,
      deepTubewells: 45,
      streetTaps: 25,
      pipedWaterConnections: 1200,
      fairPriceShops: 6,
      governmentLibraries: 2,
      privateLibraries: 1,
    },
    {
      gramPanchayat: "Chhatna",
      icdscentres: 6,
      deepTubewells: 35,
      streetTaps: 18,
      pipedWaterConnections: 800,
      fairPriceShops: 4,
      governmentLibraries: 1,
      privateLibraries: 0,
    },
  ],
  roadNetwork: [
    {
      gramPanchayat: "Bankura I",
      nationalHighway: 12.5,
      stateHighway: 8.2,
      pmgsy: 15.6,
      pathashreeRastashree: 22.3,
      municipalRoad: 0,
      zillaParishadRoad: 18.7,
      panchayatSamitiRoad: 25.4,
      gramPanchayatRoad: 35.8,
      otherRoad: 12.1,
    },
    {
      gramPanchayat: "Chhatna",
      nationalHighway: 0,
      stateHighway: 6.8,
      pmgsy: 12.4,
      pathashreeRastashree: 18.9,
      municipalRoad: 0,
      zillaParishadRoad: 14.2,
      panchayatSamitiRoad: 20.1,
      gramPanchayatRoad: 28.6,
      otherRoad: 8.7,
    },
  ],
  landUsePattern: [
    {
      gramPanchayat: "Bankura I",
      singleCropped: 1250,
      doubleCropped: 850,
      tripleCropped: 120,
      croppingIntensity: 145,
      fallowLand: 180,
      wasteLand: 95,
      otherLand: 205,
    },
    {
      gramPanchayat: "Chhatna",
      singleCropped: 980,
      doubleCropped: 650,
      tripleCropped: 80,
      croppingIntensity: 138,
      fallowLand: 140,
      wasteLand: 75,
      otherLand: 160,
    },
  ],
  topography: [
    {
      gramPanchayat: "Bankura I",
      mountain: 45,
      valley: 120,
      plain: 2580,
      waterBodies: 155,
    },
    {
      gramPanchayat: "Chhatna",
      mountain: 35,
      valley: 95,
      plain: 2100,
      waterBodies: 125,
    },
  ],
  forestArea: [
    {
      gramPanchayat: "Bankura I",
      reservedForest: 450,
      protectedForest: 280,
      unclassedStateForest: 120,
      others: 85,
      totalForestArea: 935,
      forestAndTreeCover: 1150,
    },
    {
      gramPanchayat: "Chhatna",
      reservedForest: 320,
      protectedForest: 200,
      unclassedStateForest: 90,
      others: 60,
      totalForestArea: 670,
      forestAndTreeCover: 820,
    },
  ],
  waterResources: [
    {
      gramPanchayat: "Bankura I",
      river: 2,
      stream: 5,
      canal: 3,
      drainage: 8,
      dam: 0,
      lake: 1,
      pond: 45,
      arsenicAffected: false,
      fluorideAffected: true,
    },
    {
      gramPanchayat: "Chhatna",
      river: 1,
      stream: 3,
      canal: 2,
      drainage: 6,
      dam: 0,
      lake: 0,
      pond: 35,
      arsenicAffected: false,
      fluorideAffected: false,
    },
  ],
  developmentScenario: [
    {
      department: "Agricultural Marketing",
      parameter: "Functioning of Krishak Bazar",
      value: "Satisfactorily functioning",
    },
    {
      department: "Agricultural Marketing",
      parameter: "Cold storage capacity (MT)",
      value: 2500,
    },
    {
      department: "Agriculture",
      parameter: "KCC Coverage - Eligible farmers",
      value: 8500,
    },
    {
      department: "Agriculture",
      parameter: "KCC Coverage - KCC issued",
      value: 5525,
    },
    {
      department: "Agriculture",
      parameter: "Production of vegetables (Metric Ton)",
      value: 12500,
    },
    {
      department: "Health and Family Welfare",
      parameter: "Persons covered under Swasthya Sathi",
      value: 85000,
    },
    {
      department: "Health and Family Welfare",
      parameter: "Institutional delivery - Total delivery",
      value: 2450,
    },
    {
      department: "Health and Family Welfare",
      parameter: "Institutional delivery - Institutional delivery",
      value: 2254,
    },
    {
      department: "School Education",
      parameter: "Enrolment in classes I-IV - Girls",
      value: 8500,
    },
    {
      department: "School Education",
      parameter: "Enrolment in classes I-IV - Boys",
      value: 9200,
    },
    {
      department: "Panchayats and Rural Development",
      parameter: "Number of Job Card holder household",
      value: 15000,
    },
    {
      department: "Panchayats and Rural Development",
      parameter: "Number of persondays generated",
      value: 125000,
    },
  ],
  developmentStrategies: [
    {
      sector: "Agriculture & Allied",
      department: "Agriculture",
      problem: "Low irrigation coverage (45%)",
      intervention: "Install 50 new tube wells in FY 2025-26",
    },
    {
      sector: "Health & Welfare",
      department: "Health and Family Welfare",
      problem: "High maternal mortality rate",
      intervention: "Establish 5 new maternal health centers",
    },
    {
      sector: "Education",
      department: "School Education",
      problem: "Low digital literacy",
      intervention: "Digital classroom initiative for 50 schools",
    },
    {
      sector: "Infrastructure",
      department: "Public Works",
      problem: "Poor road connectivity",
      intervention: "Road widening project for NH-12",
    },
  ],
  keyInterventions: [
    {
      sector: "Agriculture & Allied",
      intervention: "Farmer training programs on modern techniques",
    },
    {
      sector: "Health & Welfare",
      intervention: "Mobile health units for remote areas",
    },
    { sector: "Education", intervention: "Teacher training on digital tools" },
    {
      sector: "Infrastructure",
      intervention: "Rural connectivity improvement",
    },
  ],
  majorSchemes: [
    {
      slNo: 1,
      sector: "Agriculture & Allied",
      name: "Bangla Krishi Sech Yojana",
      stateAmount: 150,
      ownResources: 25,
      total: 175,
      beneficiaries: 2500,
      targetGroup: "SC/ST",
    },
    {
      slNo: 2,
      sector: "Infrastructure",
      name: "Pathashree-Rastashree",
      stateAmount: 200,
      ownResources: 50,
      total: 250,
      beneficiaries: 1800,
      targetGroup: "General",
    },
    {
      slNo: 3,
      sector: "Health & Welfare",
      name: "Swasthya Sathi",
      stateAmount: 120,
      ownResources: 15,
      total: 135,
      beneficiaries: 3200,
      targetGroup: "General",
    },
    {
      slNo: 4,
      sector: "Education",
      name: "Kanyashree Prakalpa",
      stateAmount: 80,
      ownResources: 10,
      total: 90,
      beneficiaries: 1500,
      targetGroup: "General",
    },
    {
      slNo: 5,
      sector: "Rural Development",
      name: "Karmashree Prakalpa",
      stateAmount: 180,
      ownResources: 30,
      total: 210,
      beneficiaries: 4000,
      targetGroup: "SC/ST/OBC",
    },
  ],
  sectorOutlay: [
    {
      sector: "Agriculture & Allied",
      ownResources2024: 45,
      ownResources2025: 55,
      stateResources2024: 280,
      stateResources2025: 350,
      total2024: 325,
      total2025: 405,
    },
    {
      sector: "Health & Welfare",
      ownResources2024: 35,
      ownResources2025: 40,
      stateResources2024: 220,
      stateResources2025: 280,
      total2024: 255,
      total2025: 320,
    },
    {
      sector: "Infrastructure",
      ownResources2024: 60,
      ownResources2025: 75,
      stateResources2024: 350,
      stateResources2025: 420,
      total2024: 410,
      total2025: 495,
    },
    {
      sector: "Education",
      ownResources2024: 25,
      ownResources2025: 30,
      stateResources2024: 180,
      stateResources2025: 220,
      total2024: 205,
      total2025: 250,
    },
    {
      sector: "Rural Development",
      ownResources2024: 40,
      ownResources2025: 50,
      stateResources2024: 300,
      stateResources2025: 380,
      total2024: 340,
      total2025: 430,
    },
  ],
  districtSchemes: [
    {
      slNo: 1,
      sector: "Agriculture & Allied",
      name: "District Agriculture Development",
      stateAmount: 0,
      ownResources: 0,
      total: 500,
      beneficiaries: 5000,
      targetGroup: "General",
    },
    {
      slNo: 2,
      sector: "Health & Welfare",
      name: "District Health Mission",
      stateAmount: 0,
      ownResources: 0,
      total: 400,
      beneficiaries: 8000,
      targetGroup: "General",
    },
  ],
  districtOutlay: [
    { sector: "Agriculture & Allied", outlay2024: 450, outlay2025: 550 },
    { sector: "Health & Welfare", outlay2024: 380, outlay2025: 450 },
    { sector: "Infrastructure", outlay2024: 600, outlay2025: 750 },
    { sector: "Education", outlay2024: 320, outlay2025: 400 },
  ],
});

// Excel export function - Single Sheet
const exportToExcel = (data: FormData) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Create comprehensive single sheet data
  const reportData = [
    // Header
    ["DISTRICT ANNUAL PLAN 2025-26"],
    [""],

    // Basic Information Section
    ["1A. PROFILE OF THE BLOCK/MUNICIPALITY"],
    [""],
    ["Basic Information"],
    ["Name of Block/Municipality", data.basicInfo.name],
    ["Sub-Division", data.basicInfo.subDivision],
    ["LGD Code", data.basicInfo.lgdCode],
    ["Area (Sq. Km.)", data.basicInfo.area],
    ["Distance from District HQ (Km)", data.basicInfo.distanceFromDistrict],
    ["Water Bodies Percentage", data.basicInfo.waterBodiesPercentage + "%"],
    ["Number of Gram Panchayats", data.basicInfo.gramPanchayats],
    ["Number of Post Offices", data.basicInfo.postOffices],
    ["Number of Bangla Sahayata Kendras", data.basicInfo.banglaSahayataKendras],
    ["Number of Bank Branches", data.basicInfo.bankBranches],
    [
      "Parliamentary Constituency",
      data.basicInfo.parliamentaryConstituency.join(", "),
    ],
    ["Assembly Constituency", data.basicInfo.assemblyConstituency.join(", ")],
    ["Self Help Groups - Number", data.basicInfo.selfHelpGroups.number],
    ["Self Help Groups - Members", data.basicInfo.selfHelpGroups.members],
    [""],

    // Police Stations
    ["Police Stations"],
    ["Police Station", "Contact Number"],
    ...data.basicInfo.policeStations.map((ps) => [ps.name, ps.contact]),
    [""],

    // Population Summary
    ["Population Summary (Census 2011)"],
    ["Category", "Male", "Female", "Total"],
    [
      "Scheduled Tribes",
      data.populationByCategory.scheduledTribes.male,
      data.populationByCategory.scheduledTribes.female,
      data.populationByCategory.scheduledTribes.total,
    ],
    [
      "Scheduled Castes",
      data.populationByCategory.scheduledCastes.male,
      data.populationByCategory.scheduledCastes.female,
      data.populationByCategory.scheduledCastes.total,
    ],
    [
      "Minorities",
      data.populationByCategory.minorities.male,
      data.populationByCategory.minorities.female,
      data.populationByCategory.minorities.total,
    ],
    [
      "Others",
      data.populationByCategory.others.male,
      data.populationByCategory.others.female,
      data.populationByCategory.others.total,
    ],
    [
      "TOTAL POPULATION",
      data.populationByCategory.total.male,
      data.populationByCategory.total.female,
      data.populationByCategory.total.total,
    ],
    [""],

    // Infrastructure Summary
    ["1B. INFRASTRUCTURE SUMMARY"],
    [""],
    ["Educational Institutions by Gram Panchayat"],
    [
      "Gram Panchayat",
      "Primary Schools",
      "High Schools",
      "Higher Secondary",
      "ITI",
      "Degree Colleges",
    ],
    ...data.educationalInstitutions.map((inst) => [
      inst.gramPanchayat,
      inst.primarySchool + inst.primaryMadrasah,
      inst.highSchool + inst.highMadrasah,
      inst.higherSecondarySchool + inst.higherSecondaryMadrasah,
      inst.iti,
      inst.degreeCollege !== "None" ? 1 : 0,
    ]),
    [""],

    ["Health Centers by Gram Panchayat"],
    [
      "Gram Panchayat",
      "Sub-Centres",
      "Primary Health Centres",
      "Community Health Centres",
      "Private Hospitals",
    ],
    ...data.healthCentres.map((health) => [
      health.gramPanchayat,
      health.subCentre,
      health.primaryHealthCentre + health.blockPrimaryHealthCentre,
      health.communityHealthCentre,
      health.privateHospital + health.privateNursingHome,
    ]),
    [""],

    ["Other Infrastructure by Gram Panchayat"],
    [
      "Gram Panchayat",
      "ICDS Centres",
      "Deep Tubewells",
      "Piped Water Connections",
      "Fair Price Shops",
    ],
    ...data.otherInfrastructure.map((infra) => [
      infra.gramPanchayat,
      infra.icdscentres,
      infra.deepTubewells,
      infra.pipedWaterConnections,
      infra.fairPriceShops,
    ]),
    [""],

    ["Road Network Summary (Length in Km)"],
    [
      "Gram Panchayat",
      "National Highway",
      "State Highway",
      "PMGSY",
      "Pathashree-Rastashree",
      "Other Roads",
      "Total",
    ],
    ...data.roadNetwork.map((road) => [
      road.gramPanchayat,
      road.nationalHighway,
      road.stateHighway,
      road.pmgsy,
      road.pathashreeRastashree,
      road.municipalRoad +
        road.zillaParishadRoad +
        road.panchayatSamitiRoad +
        road.gramPanchayatRoad +
        road.otherRoad,
      road.nationalHighway +
        road.stateHighway +
        road.pmgsy +
        road.pathashreeRastashree +
        road.municipalRoad +
        road.zillaParishadRoad +
        road.panchayatSamitiRoad +
        road.gramPanchayatRoad +
        road.otherRoad,
    ]),
    [""],

    // Natural Resources
    ["1C. NATURAL RESOURCES SUMMARY"],
    [""],
    ["Land Use Pattern (Area in Hectare)"],
    [
      "Gram Panchayat",
      "Single Cropped",
      "Double Cropped",
      "Triple Cropped",
      "Cropping Intensity %",
      "Total Agricultural Land",
    ],
    ...data.landUsePattern.map((land) => [
      land.gramPanchayat,
      land.singleCropped,
      land.doubleCropped,
      land.tripleCropped,
      land.croppingIntensity,
      land.singleCropped + land.doubleCropped + land.tripleCropped,
    ]),
    [""],

    ["Forest Area Summary (Area in Hectare)"],
    [
      "Gram Panchayat",
      "Reserved Forest",
      "Protected Forest",
      "Total Forest Area",
      "Forest & Tree Cover",
    ],
    ...data.forestArea.map((forest) => [
      forest.gramPanchayat,
      forest.reservedForest,
      forest.protectedForest,
      forest.totalForestArea,
      forest.forestAndTreeCover,
    ]),
    [""],

    ["Water Resources Summary"],
    ["Gram Panchayat", "Rivers", "Ponds", "Canals", "Water Quality Issues"],
    ...data.waterResources.map((water) => [
      water.gramPanchayat,
      water.river,
      water.pond,
      water.canal,
      (water.arsenicAffected ? "Arsenic " : "") +
        (water.fluorideAffected ? "Fluoride" : "") || "None",
    ]),
    [""],

    // Development Scenario
    ["1D. DEVELOPMENT SCENARIO 2024-25"],
    [""],
    ["Key Development Indicators"],
    ["Department", "Parameter", "Value/Status"],
    ...data.developmentScenario.map((scenario) => [
      scenario.department,
      scenario.parameter,
      scenario.value,
    ]),
    [""],

    ["Development Strategies for 2025-26"],
    ["Sector", "Problem/Challenge", "Proposed Intervention"],
    ...data.developmentStrategies.map((strategy) => [
      strategy.sector,
      strategy.problem,
      strategy.intervention,
    ]),
    [""],

    // Financial Information
    ["2A. MAJOR SCHEMES (LOCAL BODY) 2025-26"],
    [""],
    [
      "Sl. No.",
      "Sector",
      "Scheme Name",
      "State Amount (₹ Lakh)",
      "Own Resources (₹ Lakh)",
      "Total (₹ Lakh)",
      "Beneficiaries",
      "Target Group",
    ],
    ...data.majorSchemes.map((scheme) => [
      scheme.slNo,
      scheme.sector,
      scheme.name,
      scheme.stateAmount,
      scheme.ownResources,
      scheme.total,
      scheme.beneficiaries,
      scheme.targetGroup,
    ]),
    [""],

    ["2B. FINANCIAL OUTLAY SUMMARY (LOCAL BODY)"],
    [""],
    [
      "Sector",
      "Own Resources 2024-25",
      "Own Resources 2025-26",
      "State Resources 2024-25",
      "State Resources 2025-26",
      "Total 2024-25",
      "Total 2025-26",
    ],
    ...data.sectorOutlay.map((outlay) => [
      outlay.sector,
      outlay.ownResources2024,
      outlay.ownResources2025,
      outlay.stateResources2024,
      outlay.stateResources2025,
      outlay.total2024,
      outlay.total2025,
    ]),
    [
      "TOTAL",
      data.sectorOutlay.reduce((sum, item) => sum + item.ownResources2024, 0),
      data.sectorOutlay.reduce((sum, item) => sum + item.ownResources2025, 0),
      data.sectorOutlay.reduce((sum, item) => sum + item.stateResources2024, 0),
      data.sectorOutlay.reduce((sum, item) => sum + item.stateResources2025, 0),
      data.sectorOutlay.reduce((sum, item) => sum + item.total2024, 0),
      data.sectorOutlay.reduce((sum, item) => sum + item.total2025, 0),
    ],
    [""],

    // District Level Information
    ["3A. MAJOR SCHEMES (DISTRICT LEVEL) 2025-26"],
    [""],
    [
      "Sl. No.",
      "Sector",
      "Scheme Name",
      "Financial Outlay (₹ Lakh)",
      "Beneficiaries",
      "Target Group",
    ],
    ...data.districtSchemes.map((scheme) => [
      scheme.slNo,
      scheme.sector,
      scheme.name,
      scheme.total,
      scheme.beneficiaries,
      scheme.targetGroup,
    ]),
    [""],

    ["3B. DISTRICT LEVEL FINANCIAL OUTLAY"],
    [""],
    ["Sector", "Outlay 2024-25 (₹ Lakh)", "Outlay 2025-26 (₹ Lakh)"],
    ...data.districtOutlay.map((outlay) => [
      outlay.sector,
      outlay.outlay2024,
      outlay.outlay2025,
    ]),
    [
      "TOTAL",
      data.districtOutlay.reduce((sum, item) => sum + item.outlay2024, 0),
      data.districtOutlay.reduce((sum, item) => sum + item.outlay2025, 0),
    ],
    [""],

    // Summary Statistics
    ["SUMMARY STATISTICS"],
    [""],
    ["Key Metrics", "Value"],
    [
      "Total Population",
      data.populationByCategory.total.total.toLocaleString(),
    ],
    ["Total Area (Sq. Km.)", data.basicInfo.area],
    [
      "Population Density (per Sq. Km.)",
      Math.round(data.populationByCategory.total.total / data.basicInfo.area),
    ],
    [
      "Total Educational Institutions",
      data.educationalInstitutions.reduce(
        (sum, inst) =>
          sum +
          inst.primarySchool +
          inst.highSchool +
          inst.higherSecondarySchool,
        0
      ),
    ],
    [
      "Total Health Centers",
      data.healthCentres.reduce(
        (sum, health) =>
          sum +
          health.subCentre +
          health.primaryHealthCentre +
          health.communityHealthCentre,
        0
      ),
    ],
    [
      "Total Road Length (Km)",
      data.roadNetwork.reduce(
        (sum, road) =>
          sum +
          road.nationalHighway +
          road.stateHighway +
          road.pmgsy +
          road.pathashreeRastashree +
          road.otherRoad,
        0
      ),
    ],
    [
      "Total Forest Area (Hectare)",
      data.forestArea.reduce((sum, forest) => sum + forest.totalForestArea, 0),
    ],
    [
      "Total Agricultural Land (Hectare)",
      data.landUsePattern.reduce(
        (sum, land) =>
          sum + land.singleCropped + land.doubleCropped + land.tripleCropped,
        0
      ),
    ],
    [
      "Total Financial Outlay 2025-26 (₹ Lakh)",
      data.sectorOutlay.reduce((sum, item) => sum + item.total2025, 0),
    ],
    ["Self Help Groups", data.basicInfo.selfHelpGroups.number],
    ["SHG Members", data.basicInfo.selfHelpGroups.members],
    [""],

    ["Report Generated On", new Date().toLocaleDateString()],
    ["Report Generated At", new Date().toLocaleTimeString()],
  ];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(reportData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 30 }, // Column A - Labels
    { wch: 20 }, // Column B - Values
    { wch: 15 }, // Column C
    { wch: 15 }, // Column D
    { wch: 15 }, // Column E
    { wch: 15 }, // Column F
    { wch: 15 }, // Column G
    { wch: 20 }, // Column H
  ];
  worksheet["!cols"] = columnWidths;

  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "District Annual Plan 2025-26"
  );

  // Generate Excel file and download
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `District_Annual_Plan_2025-26_${data.basicInfo.name.replace(
    /\s+/g,
    "_"
  )}_SingleSheet.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const DistrictAnnualPlanForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [activeSection, setActiveSection] = useState("1A");

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setFormData(generateDummyData());
    }, 500);
  }, []);

  if (!formData) {
    return <div className="text-center py-10">Loading data...</div>;
  }

  const sections = [
    { id: "1A", title: "1A. Profile of Block/Municipality" },
    { id: "1B", title: "1B. Basic Infrastructure" },
    { id: "1C", title: "1C. Natural Resources" },
    { id: "1D", title: "1D. Development Scenario" },
    { id: "2A", title: "2A. Major Schemes (Local Body)" },
    { id: "2B", title: "2B. Financial Outlay (Local Body)" },
    { id: "3A", title: "3A. Major Schemes (District)" },
    { id: "3B", title: "3B. Financial Outlay (District)" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">
          District Annual Plan 2025-26
        </h1>
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "outline"}
                onClick={() => setActiveSection(section.id)}
                className="text-sm"
              >
                {section.title}
              </Button>
            ))}
          </div>
          <Button
            onClick={() => exportToExcel(formData)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            📊 Export to Excel
          </Button>
        </div>
      </div>

      {activeSection === "1A" && <Section1A data={formData} />}
      {activeSection === "1B" && <Section1B data={formData} />}
      {activeSection === "1C" && <Section1C data={formData} />}
      {activeSection === "1D" && <Section1D data={formData} />}
      {activeSection === "2A" && <Section2A data={formData} />}
      {activeSection === "2B" && <Section2B data={formData} />}
      {activeSection === "3A" && <Section3A data={formData} />}
      {activeSection === "3B" && <Section3B data={formData} />}
    </div>
  );
};

// Section 1A: Profile of Block/Municipality
const Section1A: React.FC<{ data: FormData }> = ({ data }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>1A. Profile of the Block/Municipality</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">(a) Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">
                Name of the Block/Municipality
              </label>
              <div className="p-2 bg-gray-100 rounded">
                {data.basicInfo.name}
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Sub-Division</label>
              <div className="p-2 bg-gray-100 rounded">
                {data.basicInfo.subDivision}
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">LGD Code</label>
              <div className="p-2 bg-gray-100 rounded">
                {data.basicInfo.lgdCode}
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Area (Sq. Km.)</label>
              <div className="p-2 bg-gray-100 rounded">
                {data.basicInfo.area}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Police Stations</h4>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Police Station</th>
                  <th className="border p-2">Contact Number</th>
                </tr>
              </thead>
              <tbody>
                {data.basicInfo.policeStations.map((ps, index) => (
                  <tr key={index}>
                    <td className="border p-2">{ps.name}</td>
                    <td className="border p-2">{ps.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <StatCard
              title="Gram Panchayats"
              value={data.basicInfo.gramPanchayats}
            />
            <StatCard title="Post Offices" value={data.basicInfo.postOffices} />
            <StatCard
              title="Bangla Sahayata Kendras"
              value={data.basicInfo.banglaSahayataKendras}
            />
            <StatCard
              title="Bank Branches"
              value={data.basicInfo.bankBranches}
            />
          </div>
        </div>

        {/* Human Resources */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            (d) Human Resources (Census of India, 2011)
          </h3>

          {/* Part-I: Population by Category */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">
              Part-I: Block/Municipality level information
            </h4>
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Category</th>
                  <th className="border p-2">No. of Household</th>
                  <th className="border p-2" colSpan={3}>
                    Population
                  </th>
                  <th className="border p-2" colSpan={3}>
                    0-6 Year Population
                  </th>
                  <th className="border p-2" colSpan={3}>
                    Literate Population
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border p-1"></th>
                  <th className="border p-1"></th>
                  <th className="border p-1">Male</th>
                  <th className="border p-1">Female</th>
                  <th className="border p-1">Total</th>
                  <th className="border p-1">Male</th>
                  <th className="border p-1">Female</th>
                  <th className="border p-1">Total</th>
                  <th className="border p-1">Male</th>
                  <th className="border p-1">Female</th>
                  <th className="border p-1">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">Scheduled Tribes</td>
                  <td className="border p-2">4860</td>
                  <td className="border p-2">
                    {data.populationByCategory.scheduledTribes.male}
                  </td>
                  <td className="border p-2">
                    {data.populationByCategory.scheduledTribes.female}
                  </td>
                  <td className="border p-2">
                    {data.populationByCategory.scheduledTribes.total}
                  </td>
                  <td className="border p-2">2430</td>
                  <td className="border p-2">2298</td>
                  <td className="border p-2">4728</td>
                  <td className="border p-2">8750</td>
                  <td className="border p-2">7080</td>
                  <td className="border p-2">15830</td>
                </tr>
                <tr>
                  <td className="border p-2">Scheduled Castes</td>
                  <td className="border p-2">7140</td>
                  <td className="border p-2">
                    {data.populationByCategory.scheduledCastes.male}
                  </td>
                  <td className="border p-2">
                    {data.populationByCategory.scheduledCastes.female}
                  </td>
                  <td className="border p-2">
                    {data.populationByCategory.scheduledCastes.total}
                  </td>
                  <td className="border p-2">3570</td>
                  <td className="border p-2">3325</td>
                  <td className="border p-2">6895</td>
                  <td className="border p-2">12740</td>
                  <td className="border p-2">10500</td>
                  <td className="border p-2">23240</td>
                </tr>
                <tr>
                  <td className="border p-2">Minorities</td>
                  <td className="border p-2">3340</td>
                  <td className="border p-2">
                    {data.populationByCategory.minorities.male}
                  </td>
                  <td className="border p-2">
                    {data.populationByCategory.minorities.female}
                  </td>
                  <td className="border p-2">
                    {data.populationByCategory.minorities.total}
                  </td>
                  <td className="border p-2">1670</td>
                  <td className="border p-2">1558</td>
                  <td className="border p-2">3228</td>
                  <td className="border p-2">5950</td>
                  <td className="border p-2">4920</td>
                  <td className="border p-2">10870</td>
                </tr>
                <tr>
                  <td className="border p-2">Others</td>
                  <td className="border p-2">33660</td>
                  <td className="border p-2">
                    {data.populationByCategory.others.male}
                  </td>
                  <td className="border p-2">
                    {data.populationByCategory.others.female}
                  </td>
                  <td className="border p-2">
                    {data.populationByCategory.others.total}
                  </td>
                  <td className="border p-2">16830</td>
                  <td className="border p-2">15675</td>
                  <td className="border p-2">32505</td>
                  <td className="border p-2">60060</td>
                  <td className="border p-2">49500</td>
                  <td className="border p-2">109560</td>
                </tr>
                <tr className="font-semibold">
                  <td className="border p-2">Total</td>
                  <td className="border p-2">49000</td>
                  <td className="border p-2">
                    {data.populationByCategory.total.male}
                  </td>
                  <td className="border p-2">
                    {data.populationByCategory.total.female}
                  </td>
                  <td className="border p-2">
                    {data.populationByCategory.total.total}
                  </td>
                  <td className="border p-2">24500</td>
                  <td className="border p-2">22856</td>
                  <td className="border p-2">47356</td>
                  <td className="border p-2">87500</td>
                  <td className="border p-2">72000</td>
                  <td className="border p-2">159500</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Part-II: Age-wise Population */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">
              Part-II: Age-wise Population Distribution
            </h4>
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Category</th>
                  <th className="border p-2" colSpan={3}>
                    0-4 Year Population
                  </th>
                  <th className="border p-2" colSpan={3}>
                    5-9 Year Population
                  </th>
                  <th className="border p-2" colSpan={3}>
                    10-14 Year Population
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border p-1"></th>
                  <th className="border p-1">Male</th>
                  <th className="border p-1">Female</th>
                  <th className="border p-1">Total</th>
                  <th className="border p-1">Male</th>
                  <th className="border p-1">Female</th>
                  <th className="border p-1">Total</th>
                  <th className="border p-1">Male</th>
                  <th className="border p-1">Female</th>
                  <th className="border p-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.populationByAge.map((ageData, index) => (
                  <tr key={index}>
                    <td className="border p-2">{ageData.category}</td>
                    <td className="border p-2">{ageData.age0to4.male}</td>
                    <td className="border p-2">{ageData.age0to4.female}</td>
                    <td className="border p-2">{ageData.age0to4.total}</td>
                    <td className="border p-2">{ageData.age5to9.male}</td>
                    <td className="border p-2">{ageData.age5to9.female}</td>
                    <td className="border p-2">{ageData.age5to9.total}</td>
                    <td className="border p-2">{ageData.age10to14.male}</td>
                    <td className="border p-2">{ageData.age10to14.female}</td>
                    <td className="border p-2">{ageData.age10to14.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Part-V: Worker Data */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Part-V: Worker Classification</h4>
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Category</th>
                  <th className="border p-2" colSpan={3}>
                    Main Worker
                  </th>
                  <th className="border p-2" colSpan={3}>
                    Marginal Worker
                  </th>
                  <th className="border p-2" colSpan={3}>
                    Non-Worker
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border p-1"></th>
                  <th className="border p-1">Male</th>
                  <th className="border p-1">Female</th>
                  <th className="border p-1">Total</th>
                  <th className="border p-1">Male</th>
                  <th className="border p-1">Female</th>
                  <th className="border p-1">Total</th>
                  <th className="border p-1">Male</th>
                  <th className="border p-1">Female</th>
                  <th className="border p-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.workerData.map((worker, index) => (
                  <tr key={index}>
                    <td className="border p-2">{worker.category}</td>
                    <td className="border p-2">{worker.mainWorker.male}</td>
                    <td className="border p-2">{worker.mainWorker.female}</td>
                    <td className="border p-2">{worker.mainWorker.total}</td>
                    <td className="border p-2">{worker.marginalWorker.male}</td>
                    <td className="border p-2">
                      {worker.marginalWorker.female}
                    </td>
                    <td className="border p-2">
                      {worker.marginalWorker.total}
                    </td>
                    <td className="border p-2">{worker.nonWorker.male}</td>
                    <td className="border p-2">{worker.nonWorker.female}</td>
                    <td className="border p-2">{worker.nonWorker.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Part-VI: Gram Panchayat/Ward level information */}
          <div>
            <h4 className="font-medium mb-2">
              Part-VI: Gram Panchayat/Ward level information
            </h4>
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Gram Panchayat/Ward</th>
                  <th className="border p-2">No. of Household</th>
                  <th className="border p-2" colSpan={3}>
                    Population
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border p-1"></th>
                  <th className="border p-1"></th>
                  <th className="border p-1">Male</th>
                  <th className="border p-1">Female</th>
                  <th className="border p-1">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">Bankura I</td>
                  <td className="border p-2">6500</td>
                  <td className="border p-2">16250</td>
                  <td className="border p-2">15600</td>
                  <td className="border p-2">31850</td>
                </tr>
                <tr>
                  <td className="border p-2">Chhatna</td>
                  <td className="border p-2">5200</td>
                  <td className="border p-2">13000</td>
                  <td className="border p-2">12480</td>
                  <td className="border p-2">25480</td>
                </tr>
                <tr>
                  <td className="border p-2">Mejhia</td>
                  <td className="border p-2">4800</td>
                  <td className="border p-2">12000</td>
                  <td className="border p-2">11520</td>
                  <td className="border p-2">23520</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Section 1B: Basic Infrastructure
const Section1B: React.FC<{ data: FormData }> = ({ data }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>1B. Basic Infrastructure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Educational Institutions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            (a) Educational Institutions
          </h3>

          {/* Part-I */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">
              Part-I: Gram Panchayat/Ward level information
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Gram Panchayat/Ward</th>
                    <th className="border p-2">Shishu Shiksha Kendra</th>
                    <th className="border p-2">Primary School</th>
                    <th className="border p-2">Primary Madrasah</th>
                    <th className="border p-2">Junior High School</th>
                    <th className="border p-2">Junior High Madrasah</th>
                    <th className="border p-2">Madhyamik Shiksha Kendra</th>
                    <th className="border p-2">High School</th>
                    <th className="border p-2">High Madrasah</th>
                  </tr>
                </thead>
                <tbody>
                  {data.educationalInstitutions.map((inst, index) => (
                    <tr key={index}>
                      <td className="border p-2">{inst.gramPanchayat}</td>
                      <td className="border p-2">{inst.shishuShikshaKendra}</td>
                      <td className="border p-2">{inst.primarySchool}</td>
                      <td className="border p-2">{inst.primaryMadrasah}</td>
                      <td className="border p-2">{inst.juniorHighSchool}</td>
                      <td className="border p-2">{inst.juniorHighMadrasah}</td>
                      <td className="border p-2">
                        {inst.madhyamikShikshaKendra}
                      </td>
                      <td className="border p-2">{inst.highSchool}</td>
                      <td className="border p-2">{inst.highMadrasah}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Part-II */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">
              Part-II: Higher Educational Institutions
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Gram Panchayat/Ward</th>
                    <th className="border p-2">Higher Secondary School</th>
                    <th className="border p-2">Higher Secondary Madrasah</th>
                    <th className="border p-2">Girls&apos; School</th>
                    <th className="border p-2">ITI</th>
                    <th className="border p-2">Polytechnic</th>
                    <th className="border p-2">Degree College</th>
                    <th className="border p-2">Girls&apos; College</th>
                  </tr>
                </thead>
                <tbody>
                  {data.educationalInstitutions.map((inst, index) => (
                    <tr key={index}>
                      <td className="border p-2">{inst.gramPanchayat}</td>
                      <td className="border p-2">
                        {inst.higherSecondarySchool}
                      </td>
                      <td className="border p-2">
                        {inst.higherSecondaryMadrasah}
                      </td>
                      <td className="border p-2">{inst.girlsSchool}</td>
                      <td className="border p-2">{inst.iti}</td>
                      <td className="border p-2">{inst.polytechnic}</td>
                      <td className="border p-2">{inst.degreeCollege}</td>
                      <td className="border p-2">{inst.girlsCollege}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Health Centres */}
        <div>
          <h3 className="text-lg font-semibold mb-4">(b) Health Centres</h3>

          {/* Part-I */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">
              Part-I: Primary Health Infrastructure
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Gram Panchayat/Ward</th>
                    <th className="border p-2">Sub-Centre</th>
                    <th className="border p-2">Community Health Centre</th>
                    <th className="border p-2">Suswasthya Kendra</th>
                    <th className="border p-2">Primary Health Centre</th>
                    <th className="border p-2">Block Primary Health Centre</th>
                    <th className="border p-2">Rural Hospital</th>
                  </tr>
                </thead>
                <tbody>
                  {data.healthCentres.map((health, index) => (
                    <tr key={index}>
                      <td className="border p-2">{health.gramPanchayat}</td>
                      <td className="border p-2">{health.subCentre}</td>
                      <td className="border p-2">
                        {health.communityHealthCentre}
                      </td>
                      <td className="border p-2">{health.suswasthyaKendra}</td>
                      <td className="border p-2">
                        {health.primaryHealthCentre}
                      </td>
                      <td className="border p-2">
                        {health.blockPrimaryHealthCentre}
                      </td>
                      <td className="border p-2">{health.ruralHospital}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Part-II */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">
              Part-II: Secondary and Private Health Infrastructure
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Gram Panchayat/Ward</th>
                    <th className="border p-2">Sub-Divisional Hospital</th>
                    <th className="border p-2">District Hospital</th>
                    <th className="border p-2">State General Hospital</th>
                    <th className="border p-2">Super Specialty Hospital</th>
                    <th className="border p-2">Private Hospital</th>
                    <th className="border p-2">Private Nursing Home</th>
                    <th className="border p-2">Any Other Centre</th>
                  </tr>
                </thead>
                <tbody>
                  {data.healthCentres.map((health, index) => (
                    <tr key={index}>
                      <td className="border p-2">{health.gramPanchayat}</td>
                      <td className="border p-2">
                        {health.subDivisionalHospital}
                      </td>
                      <td className="border p-2">{health.districtHospital}</td>
                      <td className="border p-2">
                        {health.stateGeneralHospital}
                      </td>
                      <td className="border p-2">
                        {health.superSpecialtyHospital}
                      </td>
                      <td className="border p-2">{health.privateHospital}</td>
                      <td className="border p-2">
                        {health.privateNursingHome}
                      </td>
                      <td className="border p-2">{health.otherCentre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Other Infrastructure */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            (c) Other Infrastructure
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Gram Panchayat/Ward</th>
                  <th className="border p-2">Number of ICDS Centres</th>
                  <th className="border p-2" colSpan={3}>
                    Drinking Water
                  </th>
                  <th className="border p-2">Number of Fair Price Shops</th>
                  <th className="border p-2" colSpan={2}>
                    Libraries
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border p-1"></th>
                  <th className="border p-1"></th>
                  <th className="border p-1">Deep Tubewells</th>
                  <th className="border p-1">Street Taps</th>
                  <th className="border p-1">Piped Water Connections</th>
                  <th className="border p-1"></th>
                  <th className="border p-1">Government</th>
                  <th className="border p-1">Private</th>
                </tr>
              </thead>
              <tbody>
                {data.otherInfrastructure.map((infra, index) => (
                  <tr key={index}>
                    <td className="border p-2">{infra.gramPanchayat}</td>
                    <td className="border p-2">{infra.icdscentres}</td>
                    <td className="border p-2">{infra.deepTubewells}</td>
                    <td className="border p-2">{infra.streetTaps}</td>
                    <td className="border p-2">
                      {infra.pipedWaterConnections}
                    </td>
                    <td className="border p-2">{infra.fairPriceShops}</td>
                    <td className="border p-2">{infra.governmentLibraries}</td>
                    <td className="border p-2">{infra.privateLibraries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Roads Network */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            (d) Roads Network (length in Km.)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Gram Panchayat/Ward</th>
                  <th className="border p-2">National Highway</th>
                  <th className="border p-2">State Highway</th>
                  <th className="border p-2">PMGSY</th>
                  <th className="border p-2">Pathashree-Rastashree</th>
                  <th className="border p-2">Municipal Road</th>
                  <th className="border p-2">Zilla Parishad</th>
                  <th className="border p-2">Panchayat Samiti</th>
                  <th className="border p-2">Gram Panchayat</th>
                  <th className="border p-2">Other Road</th>
                </tr>
              </thead>
              <tbody>
                {data.roadNetwork.map((road, index) => (
                  <tr key={index}>
                    <td className="border p-2">{road.gramPanchayat}</td>
                    <td className="border p-2">{road.nationalHighway}</td>
                    <td className="border p-2">{road.stateHighway}</td>
                    <td className="border p-2">{road.pmgsy}</td>
                    <td className="border p-2">{road.pathashreeRastashree}</td>
                    <td className="border p-2">{road.municipalRoad}</td>
                    <td className="border p-2">{road.zillaParishadRoad}</td>
                    <td className="border p-2">{road.panchayatSamitiRoad}</td>
                    <td className="border p-2">{road.gramPanchayatRoad}</td>
                    <td className="border p-2">{road.otherRoad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Section 1C: Natural Resources
const Section1C: React.FC<{ data: FormData }> = ({ data }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>1C. Natural Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Land Use Pattern */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            (a) Land Use Pattern (Area in Hectare)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Gram Panchayat</th>
                  <th className="border p-2">Single Cropped Land</th>
                  <th className="border p-2">Double Cropped Land</th>
                  <th className="border p-2">Triple Cropped Land</th>
                  <th className="border p-2">Cropping Intensity</th>
                  <th className="border p-2">Fallow Land</th>
                  <th className="border p-2">Waste Land</th>
                  <th className="border p-2">Other Land</th>
                </tr>
              </thead>
              <tbody>
                {data.landUsePattern.map((land, index) => (
                  <tr key={index}>
                    <td className="border p-2">{land.gramPanchayat}</td>
                    <td className="border p-2">{land.singleCropped}</td>
                    <td className="border p-2">{land.doubleCropped}</td>
                    <td className="border p-2">{land.tripleCropped}</td>
                    <td className="border p-2">{land.croppingIntensity}%</td>
                    <td className="border p-2">{land.fallowLand}</td>
                    <td className="border p-2">{land.wasteLand}</td>
                    <td className="border p-2">{land.otherLand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Topography */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            (b) Topography of Land Surface (Area in Hectare)
          </h3>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Gram Panchayat/Ward</th>
                <th className="border p-2">Mountain</th>
                <th className="border p-2">Valley</th>
                <th className="border p-2">Plain</th>
                <th className="border p-2">Water Bodies</th>
              </tr>
            </thead>
            <tbody>
              {data.topography.map((topo, index) => (
                <tr key={index}>
                  <td className="border p-2">{topo.gramPanchayat}</td>
                  <td className="border p-2">{topo.mountain}</td>
                  <td className="border p-2">{topo.valley}</td>
                  <td className="border p-2">{topo.plain}</td>
                  <td className="border p-2">{topo.waterBodies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Forest Area */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            (c) Forest Area (Area in Hectare)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Gram Panchayat/Ward</th>
                  <th className="border p-2">Reserved Forest</th>
                  <th className="border p-2">Protected Forest</th>
                  <th className="border p-2">Unclassed State Forest</th>
                  <th className="border p-2">Others</th>
                  <th className="border p-2">Total Forest Area</th>
                  <th className="border p-2">
                    Area under Forest and Tree Cover
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.forestArea.map((forest, index) => (
                  <tr key={index}>
                    <td className="border p-2">{forest.gramPanchayat}</td>
                    <td className="border p-2">{forest.reservedForest}</td>
                    <td className="border p-2">{forest.protectedForest}</td>
                    <td className="border p-2">
                      {forest.unclassedStateForest}
                    </td>
                    <td className="border p-2">{forest.others}</td>
                    <td className="border p-2">{forest.totalForestArea}</td>
                    <td className="border p-2">{forest.forestAndTreeCover}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <strong>Note:</strong>
            </p>
            <p>
              * Reserved Forest: An area notified under the provisions of the
              Indian Forest Act, 1927 having full degree of protection.
            </p>
            <p>
              # Protected Forest: An area notified under the provisions of the
              Indian Forest Act, 1927 or other State Forest Acts, having limited
              degree of protection.
            </p>
            <p>
              $ Unclassed State Forest: An area recorded as forest but not
              included in reserved or protected forest category.
            </p>
            <p>
              @ Others: Includes private protected forests, tea garden forests
              and other private forests.
            </p>
          </div>
        </div>

        {/* Water Resources */}
        <div>
          <h3 className="text-lg font-semibold mb-4">(d) Water Resources</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Gram Panchayat/Ward</th>
                  <th className="border p-2">River</th>
                  <th className="border p-2">Stream</th>
                  <th className="border p-2">Canal</th>
                  <th className="border p-2">Drainage</th>
                  <th className="border p-2">Dam</th>
                  <th className="border p-2">Lake</th>
                  <th className="border p-2">Pond</th>
                  <th className="border p-2" colSpan={2}>
                    Water Quality
                  </th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border p-1" colSpan={8}></th>
                  <th className="border p-1">Arsenic Affected Area</th>
                  <th className="border p-1">Fluoride Affected Area</th>
                </tr>
              </thead>
              <tbody>
                {data.waterResources.map((water, index) => (
                  <tr key={index}>
                    <td className="border p-2">{water.gramPanchayat}</td>
                    <td className="border p-2">{water.river}</td>
                    <td className="border p-2">{water.stream}</td>
                    <td className="border p-2">{water.canal}</td>
                    <td className="border p-2">{water.drainage}</td>
                    <td className="border p-2">{water.dam}</td>
                    <td className="border p-2">{water.lake}</td>
                    <td className="border p-2">{water.pond}</td>
                    <td className="border p-2">
                      {water.arsenicAffected ? "Yes" : "No"}
                    </td>
                    <td className="border p-2">
                      {water.fluorideAffected ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Section 1D: Development Scenario
const Section1D: React.FC<{ data: FormData }> = ({ data }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>1D. Development Scenario and Upcoming Strategies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Development Scenario 2024-25 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            (a) Development Scenario in 2024-25
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Department</th>
                  <th className="border p-2">Parameter</th>
                  <th className="border p-2">Value/Status</th>
                </tr>
              </thead>
              <tbody>
                {data.developmentScenario.map((scenario, index) => (
                  <tr key={index}>
                    <td className="border p-2">{scenario.department}</td>
                    <td className="border p-2">{scenario.parameter}</td>
                    <td className="border p-2">{scenario.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Development Strategies */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            (b) Development Strategies for 2025-26
          </h3>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Sector</th>
                <th className="border p-2">Department</th>
                <th className="border p-2">Problem/Challenge Area</th>
                <th className="border p-2">Proposed Intervention</th>
              </tr>
            </thead>
            <tbody>
              {data.developmentStrategies.map((strategy, index) => (
                <tr key={index}>
                  <td className="border p-2">{strategy.sector}</td>
                  <td className="border p-2">{strategy.department}</td>
                  <td className="border p-2">{strategy.problem}</td>
                  <td className="border p-2">{strategy.intervention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key Interventions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            (c) Other Key Interventions Required
          </h3>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Sector</th>
                <th className="border p-2">Intervention</th>
              </tr>
            </thead>
            <tbody>
              {data.keyInterventions.map((intervention, index) => (
                <tr key={index}>
                  <td className="border p-2">{intervention.sector}</td>
                  <td className="border p-2">{intervention.intervention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Section 2A: Major Schemes (Local Body)
const Section2A: React.FC<{ data: FormData }> = ({ data }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>
          2A. Five Major Schemes (in terms of financial outlay) to be taken up
          during 2025-26
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Sl. No.</th>
                <th className="border p-2">Sector</th>
                <th className="border p-2">Name of the Scheme</th>
                <th className="border p-2" colSpan={4}>
                  Financial Outlay for the Scheme
                </th>
                <th className="border p-2">Persons to be benefitted</th>
                <th className="border p-2">
                  Primarily targeted towards which population group
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border p-1" colSpan={3}></th>
                <th className="border p-1" colSpan={2}>
                  Resource from State Govt.
                </th>
                <th className="border p-1">Own Resources (Rs. in Lakh)</th>
                <th className="border p-1">Total (Rs. in Lakh)</th>
                <th className="border p-1" colSpan={2}></th>
              </tr>
              <tr className="bg-gray-50">
                <th className="border p-1" colSpan={3}></th>
                <th className="border p-1">Department</th>
                <th className="border p-1">Amount (Rs. in Lakh)</th>
                <th className="border p-1" colSpan={4}></th>
              </tr>
            </thead>
            <tbody>
              {data.majorSchemes.map((scheme, index) => (
                <tr key={index}>
                  <td className="border p-2">{scheme.slNo}</td>
                  <td className="border p-2">{scheme.sector}</td>
                  <td className="border p-2">{scheme.name}</td>
                  <td className="border p-2">{scheme.sector}</td>
                  <td className="border p-2">{scheme.stateAmount}</td>
                  <td className="border p-2">{scheme.ownResources}</td>
                  <td className="border p-2">{scheme.total}</td>
                  <td className="border p-2">{scheme.beneficiaries}</td>
                  <td className="border p-2">{scheme.targetGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Section 2B: Financial Outlay (Local Body)
const Section2B: React.FC<{ data: FormData }> = ({ data }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>
          2B. Total Financial Outlay of the Local Body (of all schemes): [Rs. in
          Lakh]
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Sl. No.</th>
                <th className="border p-2">Sector</th>
                <th className="border p-2" colSpan={2}>
                  Local Bodies Own Resources
                </th>
                <th className="border p-2" colSpan={2}>
                  Resources provided by the State Government
                </th>
                <th className="border p-2" colSpan={2}>
                  Total
                </th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border p-1" colSpan={2}></th>
                <th className="border p-1">2024-25</th>
                <th className="border p-1">2025-26</th>
                <th className="border p-1">2024-25</th>
                <th className="border p-1">2025-26</th>
                <th className="border p-1">2024-25</th>
                <th className="border p-1">2025-26</th>
              </tr>
            </thead>
            <tbody>
              {data.sectorOutlay.map((outlay, index) => (
                <tr key={index}>
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{outlay.sector}</td>
                  <td className="border p-2">{outlay.ownResources2024}</td>
                  <td className="border p-2">{outlay.ownResources2025}</td>
                  <td className="border p-2">{outlay.stateResources2024}</td>
                  <td className="border p-2">{outlay.stateResources2025}</td>
                  <td className="border p-2">{outlay.total2024}</td>
                  <td className="border p-2">{outlay.total2025}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-100">
                <td className="border p-2" colSpan={2}>
                  Total
                </td>
                <td className="border p-2">
                  {data.sectorOutlay.reduce(
                    (sum, item) => sum + item.ownResources2024,
                    0
                  )}
                </td>
                <td className="border p-2">
                  {data.sectorOutlay.reduce(
                    (sum, item) => sum + item.ownResources2025,
                    0
                  )}
                </td>
                <td className="border p-2">
                  {data.sectorOutlay.reduce(
                    (sum, item) => sum + item.stateResources2024,
                    0
                  )}
                </td>
                <td className="border p-2">
                  {data.sectorOutlay.reduce(
                    (sum, item) => sum + item.stateResources2025,
                    0
                  )}
                </td>
                <td className="border p-2">
                  {data.sectorOutlay.reduce(
                    (sum, item) => sum + item.total2024,
                    0
                  )}
                </td>
                <td className="border p-2">
                  {data.sectorOutlay.reduce(
                    (sum, item) => sum + item.total2025,
                    0
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Section 3A: Major Schemes (District Level)
const Section3A: React.FC<{ data: FormData }> = ({ data }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>
          3A. Five Major Schemes (District Level) to be taken up during 2025-26
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Sl. No.</th>
                <th className="border p-2">Sector</th>
                <th className="border p-2">Name of the Scheme</th>
                <th className="border p-2">
                  Financial Outlay for the Scheme (Rs. in Lakh)
                </th>
                <th className="border p-2">Persons to be benefitted</th>
                <th className="border p-2">
                  Primarily targeted towards which population group
                  [SC/ST/OBC/General]
                </th>
              </tr>
            </thead>
            <tbody>
              {data.districtSchemes.map((scheme, index) => (
                <tr key={index}>
                  <td className="border p-2">{scheme.slNo}</td>
                  <td className="border p-2">{scheme.sector}</td>
                  <td className="border p-2">{scheme.name}</td>
                  <td className="border p-2">{scheme.total}</td>
                  <td className="border p-2">{scheme.beneficiaries}</td>
                  <td className="border p-2">{scheme.targetGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Section 3B: Financial Outlay (District Level)
const Section3B: React.FC<{ data: FormData }> = ({ data }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>
          3B. Total Financial Outlay of the District Level Department (of all
          schemes): [Rs. in Lakh]
        </CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Sl. No.</th>
              <th className="border p-2">Sector</th>
              <th className="border p-2">Outlay for 2024-25</th>
              <th className="border p-2">Outlay for 2025-26</th>
            </tr>
          </thead>
          <tbody>
            {data.districtOutlay.map((outlay, index) => (
              <tr key={index}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{outlay.sector}</td>
                <td className="border p-2">{outlay.outlay2024}</td>
                <td className="border p-2">{outlay.outlay2025}</td>
              </tr>
            ))}
            <tr className="font-semibold bg-gray-100">
              <td className="border p-2" colSpan={2}>
                Total
              </td>
              <td className="border p-2">
                {data.districtOutlay.reduce(
                  (sum, item) => sum + item.outlay2024,
                  0
                )}
              </td>
              <td className="border p-2">
                {data.districtOutlay.reduce(
                  (sum, item) => sum + item.outlay2025,
                  0
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

// Reusable StatCard component
const StatCard: React.FC<{ title: string; value: string | number }> = ({
  title,
  value,
}) => (
  <div className="border rounded p-4 text-center bg-gray-50">
    <h3 className="font-medium text-gray-700 text-sm">{title}</h3>
    <p className="text-xl font-bold mt-2">{value}</p>
  </div>
);

export default DistrictAnnualPlanForm;
