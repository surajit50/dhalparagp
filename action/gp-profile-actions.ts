"use server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const DEFAULT_UPA_SAMITIS = [
  "Artha O Parikalpana",
  "Krishi O Pranisampad Bikas",
  "Sikkha O Janasasthya",
  "Nari, Sishu Unnayan O Samaj Kalyan",
  "Shilpa O Parikathama",
];

const DEFAULT_GP_STAFF = [
  "Executive Assistant",
  "Secretary",
  "Nirman Sahayak",
  "Sahayak (1)",
  "Sahayak (2)",
  "Gram Panchayat Karmee (2 Nos)",
];

// --- 1. GP Member Stats Actions ---

export async function getGpMemberStats() {
  try {
    let stats = await db.gpMemberStats.findFirst();
    if (!stats) {
      stats = await db.gpMemberStats.create({
        data: {
          maleElected: 0,
          femaleElected: 0,
          maleExOfficio: 0,
          femaleExOfficio: 0,
        },
      });
    }
    return { success: true, data: stats };
  } catch (error: any) {
    console.error("Error fetching GP member stats:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch GP member stats",
      data: {
        maleElected: 0,
        femaleElected: 0,
        maleExOfficio: 0,
        femaleExOfficio: 0,
      },
    };
  }
}

export async function saveGpMemberStats(data: {
  maleElected: number;
  femaleElected: number;
  maleExOfficio: number;
  femaleExOfficio: number;
}) {
  try {
    const existing = await db.gpMemberStats.findFirst();
    let stats;
    if (existing) {
      stats = await db.gpMemberStats.update({
        where: { id: existing.id },
        data: {
          maleElected: data.maleElected ?? 0,
          femaleElected: data.femaleElected ?? 0,
          maleExOfficio: data.maleExOfficio ?? 0,
          femaleExOfficio: data.femaleExOfficio ?? 0,
        },
      });
    } else {
      stats = await db.gpMemberStats.create({
        data: {
          maleElected: data.maleElected ?? 0,
          femaleElected: data.femaleElected ?? 0,
          maleExOfficio: data.maleExOfficio ?? 0,
          femaleExOfficio: data.femaleExOfficio ?? 0,
        },
      });
    }

    revalidatePath("/admindashboard/reports/internal-audit");
    return { success: true, data: stats };
  } catch (error: any) {
    console.error("Error saving GP member stats:", error);
    return {
      success: false,
      error: error.message || "Failed to save GP member stats",
    };
  }
}

// --- 2. Upa-Samiti Actions ---

export async function getGpUpaSamitis() {
  try {
    let list = await db.gpUpaSamiti.findMany({
      orderBy: { orderIndex: "asc" },
    });

    if (list.length === 0) {
      // Seed default list
      const seedData = DEFAULT_UPA_SAMITIS.map((name, index) => ({
        name,
        directMembers: 0,
        designatedMembers: 0,
        sanchalakName: "",
        meetingsHeld: 0,
        orderIndex: index,
      }));

      await db.gpUpaSamiti.createMany({ data: seedData });
      list = await db.gpUpaSamiti.findMany({
        orderBy: { orderIndex: "asc" },
      });
    }

    return { success: true, data: list };
  } catch (error: any) {
    console.error("Error fetching GP Upa-Samitis:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch Upa-Samitis",
      data: [],
    };
  }
}

export async function saveGpUpaSamitis(
  items: Array<{
    id?: string;
    name: string;
    directMembers?: number;
    designatedMembers?: number;
    sanchalakName?: string;
    meetingsHeld?: number;
  }>
) {
  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.id) {
        await db.gpUpaSamiti.update({
          where: { id: item.id },
          data: {
            name: item.name,
            directMembers: item.directMembers ?? 0,
            designatedMembers: item.designatedMembers ?? 0,
            sanchalakName: item.sanchalakName ?? "",
            meetingsHeld: item.meetingsHeld ?? 0,
            orderIndex: i,
          },
        });
      } else {
        const existingByName = await db.gpUpaSamiti.findFirst({
          where: { name: item.name },
        });

        if (existingByName) {
          await db.gpUpaSamiti.update({
            where: { id: existingByName.id },
            data: {
              directMembers: item.directMembers ?? 0,
              designatedMembers: item.designatedMembers ?? 0,
              sanchalakName: item.sanchalakName ?? "",
              meetingsHeld: item.meetingsHeld ?? 0,
              orderIndex: i,
            },
          });
        } else {
          await db.gpUpaSamiti.create({
            data: {
              name: item.name,
              directMembers: item.directMembers ?? 0,
              designatedMembers: item.designatedMembers ?? 0,
              sanchalakName: item.sanchalakName ?? "",
              meetingsHeld: item.meetingsHeld ?? 0,
              orderIndex: i,
            },
          });
        }
      }
    }

    revalidatePath("/admindashboard/reports/internal-audit");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving GP Upa-Samitis:", error);
    return {
      success: false,
      error: error.message || "Failed to save Upa-Samitis",
    };
  }
}

// --- 3. GP Staff Actions ---

export async function getGpStaffList() {
  try {
    let list = await db.gpStaff.findMany({
      orderBy: { orderIndex: "asc" },
    });

    if (list.length === 0) {
      // Seed default staff designations
      const seedData = DEFAULT_GP_STAFF.map((designation, index) => ({
        designation,
        maleName: "",
        femaleName: "",
        salary: "",
        orderIndex: index,
      }));

      await db.gpStaff.createMany({ data: seedData });
      list = await db.gpStaff.findMany({
        orderBy: { orderIndex: "asc" },
      });
    }

    return { success: true, data: list };
  } catch (error: any) {
    console.error("Error fetching GP Staff list:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch GP Staff list",
      data: [],
    };
  }
}

export async function saveGpStaffList(
  items: Array<{
    id?: string;
    designation: string;
    maleName?: string;
    femaleName?: string;
    salary?: string;
  }>
) {
  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.id) {
        await db.gpStaff.update({
          where: { id: item.id },
          data: {
            designation: item.designation,
            maleName: item.maleName ?? "",
            femaleName: item.femaleName ?? "",
            salary: item.salary ?? "",
            orderIndex: i,
          },
        });
      } else {
        const existingByDesig = await db.gpStaff.findFirst({
          where: { designation: item.designation },
        });

        if (existingByDesig) {
          await db.gpStaff.update({
            where: { id: existingByDesig.id },
            data: {
              maleName: item.maleName ?? "",
              femaleName: item.femaleName ?? "",
              salary: item.salary ?? "",
              orderIndex: i,
            },
          });
        } else {
          await db.gpStaff.create({
            data: {
              designation: item.designation,
              maleName: item.maleName ?? "",
              femaleName: item.femaleName ?? "",
              salary: item.salary ?? "",
              orderIndex: i,
            },
          });
        }
      }
    }

    revalidatePath("/admindashboard/reports/internal-audit");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving GP Staff list:", error);
    return {
      success: false,
      error: error.message || "Failed to save GP Staff list",
    };
  }
}

// --- 4. Master Helper to Fetch Saved GP Profile Details ---

export async function getOrSeedDefaultGpDetails() {
  try {
    const [memberRes, samitiRes, staffRes] = await Promise.all([
      getGpMemberStats(),
      getGpUpaSamitis(),
      getGpStaffList(),
    ]);

    const gpMembersCount = {
      maleElected: memberRes.data.maleElected,
      femaleElected: memberRes.data.femaleElected,
      maleExOfficio: memberRes.data.maleExOfficio,
      femaleExOfficio: memberRes.data.femaleExOfficio,
    };

    const upaSamitiDetails = samitiRes.data.map((item) => ({
      name: item.name,
      directMembers: item.directMembers,
      designatedMembers: item.designatedMembers,
      sanchalakName: item.sanchalakName || "",
      meetingsHeld: item.meetingsHeld,
    }));

    const gpStaffDetails = staffRes.data.map((item) => ({
      designation: item.designation,
      maleName: item.maleName || "",
      femaleName: item.femaleName || "",
      salary: item.salary || "",
    }));

    return {
      success: true,
      data: {
        gpMembersCount,
        upaSamitiDetails,
        gpStaffDetails,
      },
    };
  } catch (error: any) {
    console.error("Error getting combined GP profile details:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch GP profile details",
      data: null,
    };
  }
}
