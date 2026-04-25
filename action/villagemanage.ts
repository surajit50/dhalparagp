"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function addSansad(formData: FormData) {
  const sansadname = formData.get("sansadname") as string;
  const sansadnumber = formData.get("sansadnumber") as string;

  try {
    // Check if a Sansad with the same sansadnumber already exists
    const existingSansad = await db.sansad.findFirst({
      where: {
        sansadnumber,
      },
    });

    if (existingSansad) {
      return { success: false, message: "Sansad number must be unique" };
    }

    // Create a new Sansad
    await db.sansad.create({
      data: {
        sansadname,
        sansadnumber,
      },
    });

    // Revalidate the path to update the frontend
    revalidatePath("/employeedashboard/village/sansad", 'page');

    return { success: true, message: "Sansad added successfully" };
  } catch (error) {
    console.error("Error adding Sansad:", error);
    return { success: false, message: "Failed to add Sansad" };
  }
}

export async function updateSansad(formData: FormData) {
  const id = formData.get("id") as string;
  const sansadname = formData.get("sansadname") as string;
  const sansadnumber = formData.get("sansadnumber") as string;

  try {
    await db.sansad.update({
      where: { id },
      data: { sansadname, sansadnumber },
    });
    revalidatePath("/employeedashboard/village/sansad", 'page');
    return { success: true, message: "Sansad updated successfully" };
  } catch (error) {
    console.error("Error updating Sansad:", error);
    return { success: false, message: "Failed to update Sansad" };
  }
}

export async function deleteSansad(formData: FormData) {
  const id = formData.get("id") as string;

  try {
    await db.sansad.delete({
      where: { id },
    });
    revalidatePath("/employeedashboard/village/sansad", 'page');
    return { success: true, message: "Sansad deleted successfully" };
  } catch (error) {
    console.error("Error deleting Sansad:", error);
    return { success: false, message: "Failed to delete Sansad" };
  }
}

export async function getSansadList() {
  try {
    return await db.sansad.findMany();
  } catch (error) {
    console.error("Error fetching Sansad list:", error);
    return [];
  }
}

export async function addMouzaname(formData: FormData) {
  const name = formData.get("name") as string;
  const jlno = formData.get("jlno") as string;
  const totalHouseholdsStr = formData.get("totalHouseholds") as string;
  const totalHouseholds = totalHouseholdsStr ? parseInt(totalHouseholdsStr) : undefined;

  try {
    const existing = await db.mouzaname.findFirst({
      where: { jlno },
      select: { id: true },
    });
    if (existing) {
      return {
        success: false,
        message: "J.L. No. already exists",
      };
    }

    await db.mouzaname.create({ data: { name, jlno, totalHouseholds } });

    revalidatePath("/employeedashboard/village/mouza", 'page');
    return { success: true, message: "Mouza added successfully" };
  } catch (error) {
    console.error("Error adding Mouza:", error);
    return { success: false, message: "Failed to add Mouza" };
  }
}

export async function addPopulation(formData: FormData) {
  const mouzaId = formData.get("mouzaId") as string;
  const male = parseInt(formData.get("male") as string);
  const female = parseInt(formData.get("female") as string);
  const st = parseInt(formData.get("st") as string);
  const sc = parseInt(formData.get("sc") as string);
  const obc = parseInt(formData.get("obc") as string);
  const other = parseInt(formData.get("other") as string);
  const hindu = parseInt(formData.get("hindu") as string);
  const muslim = parseInt(formData.get("muslim") as string);
  const christian = parseInt(formData.get("christian") as string);
  const otherReligion = parseInt(formData.get("otherReligion") as string);

  try {
    const data: any = {
      mouzaId,
      male,
      female,
      st,
      sc,
      obc,
      other,
      hindu,
      muslim,
      christian,
      otherReligion,
    };
    await db.population.create({
      data,
    });
    revalidatePath("/employeedashboard/village/population", 'page');
    return { success: true, message: "Population details added successfully" };
  } catch (error) {
    console.error("Error adding population details:", error);
    return { success: false, message: "Failed to add population details" };
  }
}

export async function addMember(formData: FormData) {
  const data: any = {};
  formData.forEach((value, key) => {
    if (key === "dob") {
      data[key] = new Date(value as string);
    } else if (key === "mouzaIds") {
      try {
        data[key] = JSON.parse(value as string);
      } catch (e) {
        if (value) data[key] = (value as string).split(",").filter(Boolean);
      }
    } else {
      data[key] = value;
    }
  });

  try {
    await db.member.create({
      data: data,
    });
    revalidatePath("/employeedashboard/village/member", "page");
    return { success: true, message: "Member added successfully" };
  } catch (error) {
    console.error("Error adding member:", error);
    return { success: false, message: "Failed to add member" };
  }
}

export async function getMouzaList() {
  try {
    return await db.mouzaname.findMany();
  } catch (error) {
    console.error("Error fetching mouza list:", error);
    return [];
  }
}

export async function addVoterSummary(formData: FormData) {
  const mouzaIdsStr = formData.get("mouzaIds") as string;
  let mouzaIds: string[] = [];
  try {
    mouzaIds = JSON.parse(mouzaIdsStr);
  } catch(e) {
    if(mouzaIdsStr) mouzaIds = mouzaIdsStr.split(',').filter(Boolean);
  }

  const pollingStationNo = formData.get("pollingStationNo") as string;
  const pollingStationName = formData.get("pollingStationName") as string;

  const data: any = { 
    pollingStationNo: pollingStationNo || "", 
    pollingStationName: pollingStationName || "",
    mouzaIds: mouzaIds
  };

  ["totalMaleVoter", "totalFemaleVoter", "scMaleVoter", "scFemaleVoter", "stMaleVoter", "stFemaleVoter", "obcMaleVoter", "obcFemaleVoter", "genMaleVoter", "genFemaleVoter"].forEach(field => {
    data[field] = parseInt(formData.get(field) as string) || 0;
  });

  try {
    await db.voterSummary.create({ data });
    revalidatePath("/employeedashboard/village/voter", 'page');
    return { success: true, message: "Voter summary added successfully" };
  } catch (error) {
    console.error("Error adding voter summary:", error);
    return { success: false, message: "Failed to add voter summary" };
  }
}

export async function addToiletSummary(formData: FormData) {
  const mouzaId = formData.get("mouzaId") as string;
  const totalHousehold = parseInt(formData.get("totalHousehold") as string) || 0;
  const toiletAvailable = parseInt(formData.get("toiletAvailable") as string) || 0;
  const toiletNotAvailable = parseInt(formData.get("toiletNotAvailable") as string) || 0;

  try {
    const data: any = { mouzaId, totalHousehold, toiletAvailable, toiletNotAvailable };
    await db.toiletSummary.create({
      data
    });
    revalidatePath("/employeedashboard/village/toilet", 'page');
    return { success: true, message: "Toilet summary added successfully" };
  } catch (error) {
    console.error("Error adding toilet summary:", error);
    return { success: false, message: "Failed to add toilet summary" };
  }
}

export async function addWaterSummary(formData: FormData) {
  const mouzaId = formData.get("mouzaId") as string;
  const data: any = { mouzaId };

  ["tapWater", "handPump", "well", "pond", "other"].forEach(field => {
    data[field] = parseInt(formData.get(field) as string) || 0;
  });

  try {
    await db.waterSummary.create({ data });
    revalidatePath("/employeedashboard/village/water", 'page');
    return { success: true, message: "Water summary added successfully" };
  } catch (error) {
    console.error("Error adding water summary:", error);
    return { success: false, message: "Failed to add water summary" };
  }
}


export async function addPopulationSummary(formData: FormData) {
  const mouzaId = formData.get("mouzaId") as string;
  const data: any = { mouzaId };

  ["totalMale", "totalFemale", "scMale", "scFemale", "stMale", "stFemale", "obcMale", "obcFemale", "genMale", "genFemale"].forEach(field => {
    data[field] = parseInt(formData.get(field) as string) || 0;
  });

  try {
    await db.populationSummary.create({ data });
    revalidatePath("/employeedashboard/village/population-summary", 'page');
    return { success: true, message: "Population summary added successfully" };
  } catch (error) {
    console.error("Error adding population summary:", error);
    return { success: false, message: "Failed to add population summary" };
  }
}

export async function updateMouza(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const jlno = formData.get("jlno") as string;
  const totalHouseholdsStr = formData.get("totalHouseholds") as string;
  const totalHouseholds = totalHouseholdsStr ? parseInt(totalHouseholdsStr) : undefined;
  
  try {
    const current = await db.mouzaname.findUnique({
      where: { id },
      select: { jlno: true },
    });
    if (!current) {
      return { success: false, message: "Mouza not found" };
    }

    await db.mouzaname.updateMany({
      where: { jlno: current.jlno },
      data: { name, jlno, totalHouseholds },
    });
    revalidatePath("/employeedashboard/village/mouza", 'page');
    revalidatePath("/employeedashboard/village/view", 'page');
    return { success: true, message: "Mouza updated successfully" };
  } catch (error) {
    console.error("Error updating Mouza:", error);
    return { success: false, message: "Failed to update Mouza" };
  }
}

export async function getVillageOverview() {
  try {
    const mouzas = await db.mouzaname.findMany({
      include: {
        population: true,
        populationSummary: true,
      },
    });

    const data = mouzas.map((m) => ({
      id: m.id,
      name: m.name,
      jlno: m.jlno,
      householdCount: m.totalHouseholds || 0,
      totalPopulation: m.population.reduce(
        (sum, p) => sum + p.male + p.female,
        0,
      ),
      createdAt: (m as any).createdAt,
      updatedAt: (m as any).updatedAt,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching overview:", error);
    return { success: false, message: "Failed to fetch overview" };
  }
}

export async function getVillageDetails(mouzaId: string) {
  try {
    const where = { mouzaId };

    const [mouza, population, voter, water, toilet] = await Promise.all([
      db.mouzaname.findUnique({ where: { id: mouzaId } }),
      db.population.findFirst({ where }),
      db.voterSummary.findFirst({ where: { mouzaIds: { has: mouzaId } } }),
      db.waterSummary.findFirst({ where }),
      db.toiletSummary.findFirst({ where }),
    ]);

    return {
      success: true,
      data: {
        mouza,
        population,
        voter,
        water,
        toilet,
        households: mouza?.totalHouseholds || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching village details:", error);
    return { success: false, message: "Failed to fetch village details" };
  }
}

export async function deleteMouza(formData: FormData) {
  const id = formData.get("id") as string;
  try {
    const current = await db.mouzaname.findUnique({
      where: { id },
      select: { jlno: true },
    });
    if (!current) {
      return { success: false, message: "Mouza not found" };
    }

    await db.mouzaname.deleteMany({ where: { jlno: current.jlno } });
    revalidatePath("/employeedashboard/village/mouza", 'page');
    revalidatePath("/employeedashboard/village/view", 'page');
    return { success: true, message: "Mouza deleted successfully" };
  } catch (error) {
    console.error("Error deleting Mouza:", error);
    return { success: false, message: "Failed to delete Mouza" };
  }
}

// === MEMBER ===
export async function getMemberList() {
  try {
    return await db.member.findMany();
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

export async function updateMember(formData: FormData) {
  const id = formData.get("id") as string;
  const data: any = {};
  formData.forEach((value, key) => {
    if (key !== "id") {
      if (key === "dob") {
        data[key] = new Date(value as string);
      } else if (key === "mouzaIds") {
        try {
          data[key] = JSON.parse(value as string);
        } catch (e) {
          if (value) data[key] = (value as string).split(",").filter(Boolean);
        }
      } else {
        data[key] = value;
      }
    }
  });

  try {
    await db.member.update({ where: { id }, data });
    revalidatePath("/employeedashboard/village/member", "page");
    return { success: true, message: "Member updated successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to update member" };
  }
}

export async function deleteMember(formData: FormData) {
  const id = formData.get("id") as string;
  try {
    await db.member.delete({ where: { id } });
    revalidatePath("/employeedashboard/village/member", 'page');
    return { success: true, message: "Member deleted successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to delete member" };
  }
}

export async function getWaterSummary(mouzaId: string) {
  try {
    return await db.waterSummary.findFirst({
      where: { mouzaId },
    });
  } catch (error) {
    console.error("Error fetching water summary:", error);
    return null;
  }
}

// === WATER SUMMARY ===
export async function getWaterSummaryList() {
  try {
    return await db.waterSummary.findMany({
      include: { mouza: true }
    });
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

export async function updateWaterSummary(formData: FormData) {
  const id = formData.get("id") as string;
  const data: any = {};
  ["tapWater", "handPump", "well", "pond", "other"].forEach(field => {
    data[field] = parseInt(formData.get(field) as string) || 0;
  });

  try {
    await db.waterSummary.update({ where: { id }, data });
    revalidatePath("/employeedashboard/village/water", 'page');
    return { success: true, message: "Water summary updated successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to update water summary" };
  }
}

export async function deleteWaterSummary(formData: FormData) {
  const id = formData.get("id") as string;
  try {
    await db.waterSummary.delete({ where: { id } });
    revalidatePath("/employeedashboard/village/water", 'page');
    return { success: true, message: "Water summary deleted successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to delete water summary" };
  }
}

export async function getToiletSummary(mouzaId: string) {
  try {
    return await db.toiletSummary.findFirst({
      where: { mouzaId },
    });
  } catch (error) {
    console.error("Error fetching toilet summary:", error);
    return null;
  }
}

// === TOILET SUMMARY ===
export async function getToiletSummaryList() {
  try {
    return await db.toiletSummary.findMany({
      include: { mouza: true }
    });
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

export async function updateToiletSummary(formData: FormData) {
  const id = formData.get("id") as string;
  const totalHousehold = parseInt(formData.get("totalHousehold") as string) || 0;
  const toiletAvailable = parseInt(formData.get("toiletAvailable") as string) || 0;
  const toiletNotAvailable = parseInt(formData.get("toiletNotAvailable") as string) || 0;

  try {
    await db.toiletSummary.update({
      where: { id },
      data: { totalHousehold, toiletAvailable, toiletNotAvailable }
    });
    revalidatePath("/employeedashboard/village/toilet", 'page');
    return { success: true, message: "Toilet summary updated successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to update toilet summary" };
  }
}

export async function deleteToiletSummary(formData: FormData) {
  const id = formData.get("id") as string;
  try {
    await db.toiletSummary.delete({ where: { id } });
    revalidatePath("/employeedashboard/village/toilet", 'page');
    return { success: true, message: "Toilet summary deleted successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to delete toilet summary" };
  }
}

export async function addEducationSummary(formData: FormData) {
  const mouzaId = formData.get("mouzaId") as string;
  const data: any = { mouzaId };

  const fields = [
    "ssk", "anganwadi", "primarySchool", "upperPrimary", "highSchool", 
    "higherSecondary", "madrasah", "juniorHigh", "college", "university", 
    "technicalInstitute", "vocationalCenter", "adultEducationCenter", 
    "libraryCount", "computerCenter"
  ];

  fields.forEach(field => {
    data[field] = parseInt(formData.get(field) as string) || 0;
  });

  try {
    await db.educationSummary.create({ data });
    revalidatePath("/employeedashboard/village/education", 'page');
    return { success: true, message: "Education summary added successfully" };
  } catch (error) {
    console.error("Error adding education summary:", error);
    return { success: false, message: "Failed to add education summary" };
  }
}

export async function updateEducationSummary(formData: FormData) {
  const id = formData.get("id") as string;
  const data: any = {};
  
  const fields = [
    "ssk", "anganwadi", "primarySchool", "upperPrimary", "highSchool", 
    "higherSecondary", "madrasah", "juniorHigh", "college", "university", 
    "technicalInstitute", "vocationalCenter", "adultEducationCenter", 
    "libraryCount", "computerCenter"
  ];

  fields.forEach(field => {
    data[field] = parseInt(formData.get(field) as string) || 0;
  });

  try {
    await db.educationSummary.update({ where: { id }, data });
    revalidatePath("/employeedashboard/village/education", 'page');
    return { success: true, message: "Education summary updated successfully" };
  } catch (error) {
    console.error("Error updating education summary:", error);
    return { success: false, message: "Failed to update education summary" };
  }
}

// === EDUCATION SUMMARY ===
export async function getEducationSummaryList() {
  try {
    return await db.educationSummary.findMany({
      include: { mouza: true }
    });
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}



export async function deleteEducationSummary(formData: FormData) {
  const id = formData.get("id") as string;
  try {
    await db.educationSummary.delete({ where: { id } });
    revalidatePath("/employeedashboard/village/education", 'page');
    return { success: true, message: "Education summary deleted successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to delete education summary" };
  }
}

export async function getVoterSummary(mouzaId: string) {
  try {
    return await db.voterSummary.findFirst({
      where: { mouzaIds: { has: mouzaId } },
    });
  } catch (error) {
    console.error("Error fetching voter summary:", error);
    return null;
  }
}

// === VOTER SUMMARY ===
export async function getVoterSummaryList() {
  try {
    return await db.voterSummary.findMany({
      include: { mouzas: true }
    });
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

export async function updateVoterSummary(formData: FormData) {
  const id = formData.get("id") as string;
  const data: any = {};
  
  const mouzaIdsStr = formData.get("mouzaIds") as string;
  if(mouzaIdsStr) {
    try {
      data.mouzaIds = JSON.parse(mouzaIdsStr);
    } catch(e) {
      data.mouzaIds = mouzaIdsStr.split(',').filter(Boolean);
    }
  }

  const pollingStationNo = formData.get("pollingStationNo") as string;
  if(pollingStationNo !== null) data.pollingStationNo = pollingStationNo || "";

  const pollingStationName = formData.get("pollingStationName") as string;
  if(pollingStationName !== null) data.pollingStationName = pollingStationName || "";

  ["totalMaleVoter", "totalFemaleVoter", "scMaleVoter", "scFemaleVoter", "stMaleVoter", "stFemaleVoter", "obcMaleVoter", "obcFemaleVoter", "genMaleVoter", "genFemaleVoter"].forEach(field => {
    if(formData.has(field)) {
      data[field] = parseInt(formData.get(field) as string) || 0;
    }
  });

  try {
    await db.voterSummary.update({ where: { id }, data });
    revalidatePath("/employeedashboard/village/voter", 'page');
    return { success: true, message: "Voter summary updated successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to update voter summary" };
  }
}

export async function deleteVoterSummary(formData: FormData) {
  const id = formData.get("id") as string;
  try {
    await db.voterSummary.delete({ where: { id } });
    revalidatePath("/employeedashboard/village/voter", 'page');
    return { success: true, message: "Voter summary deleted successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to delete voter summary" };
  }
}

// === POPULATION ===
export async function getPopulationList() {
  try {
    return await db.population.findMany({
      include: { mouza: true }
    });
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

export async function updatePopulation(formData: FormData) {
  const id = formData.get("id") as string;
  const data: any = {};
  ["male", "female", "st", "sc", "obc", "other", "hindu", "muslim", "christian", "otherReligion"].forEach(field => {
    data[field] = parseInt(formData.get(field) as string) || 0;
  });

  try {
    await db.population.update({ where: { id }, data });
    revalidatePath("/employeedashboard/village/population", 'page');
    return { success: true, message: "Population details updated successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to update population details" };
  }
}

export async function deletePopulation(formData: FormData) {
  const id = formData.get("id") as string;
  try {
    await db.population.delete({ where: { id } });
    revalidatePath("/employeedashboard/village/population", 'page');
    return { success: true, message: "Population details deleted successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to delete population details" };
  }
}

// === POPULATION SUMMARY ===
export async function getPopulationSummary(mouzaId: string) {
  try {
    return await db.populationSummary.findFirst({
      where: { mouzaId },
    });
  } catch (error) {
    console.error("Error fetching population summary:", error);
    return null;
  }
}

export async function getPopulationSummaryList() {
  try {
    return await db.populationSummary.findMany({
      include: { mouza: true }
    });
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

export async function updatePopulationSummary(formData: FormData) {
  const id = formData.get("id") as string;
  const data: any = {};
  ["totalMale", "totalFemale", "scMale", "scFemale", "stMale", "stFemale", "obcMale", "obcFemale", "genMale", "genFemale"].forEach(field => {
    data[field] = parseInt(formData.get(field) as string) || 0;
  });

  try {
    await db.populationSummary.update({ where: { id }, data });
    revalidatePath("/employeedashboard/village/population-summary", 'page');
    return { success: true, message: "Population summary updated successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to update population summary" };
  }
}

export async function deletePopulationSummary(formData: FormData) {
  const id = formData.get("id") as string;
  try {
    await db.populationSummary.delete({ where: { id } });
    revalidatePath("/employeedashboard/village/population-summary", 'page');
    return { success: true, message: "Population summary deleted successfully" };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, message: "Failed to delete population summary" };
  }
}


// === EDUCATION SUMMARY ===
// === REPORTS ===
export async function getVillageReportData() {
  try {
    const [
      mouzas,
      population,
      populationSummary,
      voterSummary,
      waterSummary,
      toiletSummary,
      educationSummary,
      members,
      sansads,
    ] = await Promise.all([
      db.mouzaname.findMany({
        orderBy: { name: "asc" },
      }),
      db.population.findMany({
        include: { mouza: true },
      }),
      db.populationSummary.findMany({
        include: { mouza: true },
      }),
      db.voterSummary.findMany({
        include: { mouzas: true },
      }),
      db.waterSummary.findMany({
        include: { mouza: true },
      }),
      db.toiletSummary.findMany({
        include: { mouza: true },
      }),
      db.educationSummary.findMany({
        include: { mouza: true },
      }),
      db.member.findMany(),
      db.sansad.findMany(),
    ]);

    return {
      success: true,
      data: {
        mouzas,
        population,
        populationSummary,
        voterSummary,
        waterSummary,
        toiletSummary,
        educationSummary,
        members,
        sansads,
      },
    };
  } catch (error) {
    console.error("Error fetching report data:", error);
    return { success: false, message: "Failed to fetch report data" };
  }
}

export async function getEducationSummary(mouzaId: string) {
  try {
    return await db.educationSummary.findFirst({
      where: { mouzaId },
    });
  } catch (error) {
    console.error("Error fetching education summary:", error);
    return null;
  }
}
