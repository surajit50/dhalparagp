"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { getActiveTubewellLaborRates } from "./tubewell-labor-rate";

// ==========================================
// HELPERS
// ==========================================

function getYear() {
  return new Date().getFullYear();
}

/**
 * Extract the next serial number from the last numbered document,
 * e.g. "DGP-TW/WO/2025/003" → 4
 */
function nextSerial(lastNumber: string | null | undefined): number {
  if (!lastNumber) return 1;
  const last = parseInt(lastNumber.split("/").pop() ?? "0", 10);
  return isNaN(last) ? 1 : last + 1;
}

// ==========================================
// MISTRI ACTIONS
// ==========================================

export async function createMistri(data: {
  name: string;
  mobileNumber?: string;
  address?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}) {
  const newMistri = await db.mistri.create({ data });
  revalidateTag("mistris", 'max');
  revalidatePath("/admindashboard/tubewell/mistri", 'page');
  return newMistri;
}

export async function updateMistri(
  id: string,
  data: {
    name: string;
    mobileNumber?: string;
    address?: string;
    isActive?: boolean;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  }
) {
  const updated = await db.mistri.update({ where: { id }, data });
  revalidateTag("mistris", 'max');
  revalidatePath("/admindashboard/tubewell/mistri", 'page');
  return updated;
}

export const getMistris = unstable_cache(
  async () =>
    db.mistri.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ["mistris"],
  { tags: ["mistris"] }
);

// ==========================================
// MATERIAL & STOCK ACTIONS
// ==========================================

export async function createTubewellMaterial(data: {
  name: string;
  bengaliName?: string;
  unit: string;
  rate: number;
  stock?: number;
}) {
  const material = await db.tubewellMaterial.create({
    data: {
      ...data,
      stockLogs: data.stock
        ? {
            create: {
              transactionType: "IN",
              quantity: data.stock,
              rate: data.rate,
              remarks: "Initial Stock",
            },
          }
        : undefined,
    },
  });
  revalidateTag("materials", 'max');
  revalidatePath("/admindashboard/tubewell/materials", 'page');
  return material;
}

export async function updateTubewellMaterial(
  id: string,
  data: { name: string; bengaliName?: string; unit: string; rate: number; isActive?: boolean }
) {
  const updated = await db.tubewellMaterial.update({ where: { id }, data });
  revalidateTag("materials", 'max');
  revalidatePath("/admindashboard/tubewell/materials", 'page');
  return updated;
}

export async function addStockToMaterial(
  materialId: string,
  quantity: number,
  rate: number,
  remarks: string
) {
  // Single update merges stock increment + log creation — one round-trip
  const updatedMaterial = await db.tubewellMaterial.update({
    where: { id: materialId },
    data: {
      stock: { increment: quantity },
      stockLogs: {
        create: { transactionType: "IN", quantity, rate, remarks },
      },
    },
  });
  revalidateTag("materials", 'max');
  revalidatePath("/admindashboard/tubewell/materials", 'page');
  return updatedMaterial;
}

export async function getTubewellMaterials() {
  return db.tubewellMaterial.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function getStockLogs(materialId?: string) {
  return db.tubewellStockLog.findMany({
    where: materialId ? { materialId } : undefined,
    include: { material: true },
    orderBy: { createdAt: "desc" },
  });
}

// ==========================================
// REPAIR REQUEST ACTIONS
// ==========================================

// ==========================================
// REPAIR REQUEST ACTIONS (FIXED)
// ==========================================

export async function submitRepairRequest(data: {
  citizenName: string;
  mobileNumber?: string;
  address: string;
  problemDetails?: string;
  mouza: string;
}) {
  const request = await db.tubewellRepairRequest.create({ data });

  // ✅ Correct revalidation
  revalidateTag("repair-requests", 'max');
  revalidatePath("/admindashboard/tubewell/requests");

  return request;
}

export async function updateRepairRequestStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "WORK_ORDER_ISSUED" | "COMPLETED" | "REJECTED"
) {
  const updated = await db.tubewellRepairRequest.update({
    where: { id },
    data: { status },
  });

  // ✅ Correct revalidation
  revalidateTag("repair-requests", 'max' );
  revalidatePath("/admindashboard/tubewell/requests");

  return updated;
}

// ✅ FIXED: removed wrong filter (THIS WAS YOUR MAIN BUG)
export const getRepairRequests = unstable_cache(
  async () =>
    db.tubewellRepairRequest.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ["repair-requests"],
  { tags: ["repair-requests"] }
);


// ==========================================
// WORK ORDER ACTIONS
// ==========================================

export async function createWorkOrder(data: {
  requestId?: string;
  mistriId: string;
  materials: { materialId: string; quantity: number; rate: number }[];
}) {
  if (!data.materials || data.materials.length === 0) {
    throw new Error("Add at least one material before issuing work order.");
  }

  const year = getYear();

  // Find the highest serial BEFORE the transaction to keep the tx short
  const lastOrder = await db.tubewellWorkOrder.findFirst({
    where: { orderNumber: { startsWith: `DGP-TW/WO/${year}/` } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },   // ⚡ only fetch what we need
  });

  const orderNumber = `DGP-TW/WO/${year}/${String(nextSerial(lastOrder?.orderNumber)).padStart(3, "0")}`;

  const order = await db.$transaction(
    async (tx) => {
      // Check for duplicate work order on same request
      if (data.requestId) {
        const existing = await tx.tubewellWorkOrder.findFirst({
          where: { requestId: data.requestId },
          select: { id: true },
        });
        if (existing) throw new Error("Work order already exists.");
      }

      // Create work order
      const order = await tx.tubewellWorkOrder.create({
        data: {
          orderNumber,
          requestId: data.requestId ?? null,
          mistriId: data.mistriId,
        },
      });

      // Bulk-create order materials in one query
      await tx.tubewellOrderMaterial.createMany({
        data: data.materials.map((m) => ({
          workOrderId: order.id,
          materialId: m.materialId,
          quantity: m.quantity,
          rate: m.rate,
        })),
      });

      // Parallel: decrement stock + log for every material simultaneously
      await Promise.all(
        data.materials.map((m) =>
          tx.tubewellMaterial.update({
            where: { id: m.materialId },
            data: {
              stock: { decrement: m.quantity },
              stockLogs: {
                create: {
                  transactionType: "OUT",
                  quantity: m.quantity,
                  rate: m.rate,
                  remarks: `Issued for Work Order ${orderNumber}`,
                  referenceId: order.id,
                },
              },
            },
          })
        )
      );

      if (data.requestId) {
        await tx.tubewellRepairRequest.update({
          where: { id: data.requestId },
          data: { status: "WORK_ORDER_ISSUED" },
        });
      }

      return order;
    },
    { timeout: 15000, maxWait: 10000 }
  );

  // Revalidate outside transaction
  revalidateTag("materials", 'max');
  revalidateTag("repair-requests", 'max');
  revalidatePath("/admindashboard/tubewell/work-orders", 'page');
  revalidatePath("/admindashboard/tubewell/work-orders/create", 'page');
  revalidatePath("/admindashboard/tubewell/requests", 'page');

  return order;
}

export async function addMaterialToWorkOrder(
  workOrderId: string,
  materialId: string,
  quantity: number
) {
  // Fetch material + work order in parallel — one fewer sequential round-trip
  const [material, order] = await Promise.all([
    db.tubewellMaterial.findUnique({ where: { id: materialId } }),
    db.tubewellWorkOrder.findUnique({ where: { id: workOrderId }, select: { id: true, orderNumber: true } }),
  ]);

  if (!material) throw new Error("Material not found");
  if (!order) throw new Error("Work order not found");
  if (material.stock < quantity) throw new Error(`Not enough stock. Only ${material.stock} left.`);

  const result = await db.$transaction(async (tx) => {
    const orderMaterial = await tx.tubewellOrderMaterial.create({
      data: { workOrderId, materialId, quantity, rate: material.rate },
    });

    // Merge stock decrement + log into a single update
    await tx.tubewellMaterial.update({
      where: { id: materialId },
      data: {
        stock: { decrement: quantity },
        stockLogs: {
          create: {
            transactionType: "OUT",
            quantity,
            rate: material.rate,
            remarks: `Issued for Work Order ${order.orderNumber}`,
            referenceId: order.id,
          },
        },
      },
    });

    return orderMaterial;
  });

  revalidateTag("materials", 'max');
  revalidatePath("/admindashboard/tubewell/work-orders", 'page');
  revalidatePath("/admindashboard/tubewell/materials", 'page');
  return result;
}

export async function removeMaterialFromWorkOrder(orderMaterialId: string) {
  const orderMaterial = await db.tubewellOrderMaterial.findUnique({
    where: { id: orderMaterialId },
    include: { workOrder: { select: { id: true, orderNumber: true } } },
  });

  if (!orderMaterial) throw new Error("Order material not found");

  await db.$transaction(
    async (tx) => {
      // Merge stock restore + log into a single update, then delete
      await tx.tubewellMaterial.update({
        where: { id: orderMaterial.materialId },
        data: {
          stock: { increment: orderMaterial.quantity },
          stockLogs: {
            create: {
              transactionType: "IN",
              quantity: orderMaterial.quantity,
              rate: orderMaterial.rate,
              remarks: `Restored from Work Order ${orderMaterial.workOrder.orderNumber}`,
              referenceId: orderMaterial.workOrderId,
            },
          },
        },
      });

      await tx.tubewellOrderMaterial.delete({ where: { id: orderMaterialId } });
    },
    { timeout: 15000 }
  );

  revalidateTag("materials", 'max');
  revalidatePath("/admindashboard/tubewell/work-orders", 'page');
  return true;
}

export async function deleteWorkOrder(id: string) {
  const workOrder = await db.tubewellWorkOrder.findUnique({
    where: { id },
    include: { materials: true },
  });

  if (!workOrder) throw new Error("Work order not found");

  await db.$transaction(
    async (tx) => {
      // Parallel: restore stock + create logs for all materials simultaneously
      await Promise.all(
        workOrder.materials.map((m) =>
          tx.tubewellMaterial.update({
            where: { id: m.materialId },
            data: {
              stock: { increment: m.quantity },
              stockLogs: {
                create: {
                  transactionType: "IN",
                  quantity: m.quantity,
                  rate: m.rate,
                  remarks: `Stock restored from deleted Work Order ${workOrder.orderNumber}`,
                  referenceId: workOrder.id,
                },
              },
            },
          })
        )
      );

      // Delete order materials + optionally reset request status in parallel
      await Promise.all([
        tx.tubewellOrderMaterial.deleteMany({ where: { workOrderId: id } }),
        workOrder.requestId
          ? tx.tubewellRepairRequest.update({
              where: { id: workOrder.requestId },
              data: { status: "APPROVED" },
            })
          : Promise.resolve(),
      ]);

      await tx.tubewellWorkOrder.delete({ where: { id } });
    },
    { timeout: 20000 }
  );

  revalidateTag("materials", 'max');
  revalidateTag("work-orders", 'max');
  revalidateTag("repair-requests", 'max');
  revalidatePath("/admindashboard/tubewell/work-orders", 'page');
  revalidatePath("/admindashboard/tubewell/requests", 'page');
  return true;
}

export async function updateWorkOrderStatus(
  id: string,
  status: "ISSUED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
  masterRollData?: {
    nameOfPlace: string;
    villageSansad: string;
    items: { workType: string; quantity: number }[];
  }
) {
  const data: Record<string, unknown> = { status };

  if (status === "COMPLETED") {
    data.completionDate = new Date();

    if (masterRollData) {
      // Fetch rates first, then create master roll entry + update status in parallel
      const activeRates = await getActiveTubewellLaborRates();

      let total = 0;
      const itemsToCreate = masterRollData.items.map((item) => {
        const rate = activeRates[item.workType] ?? 0;
        const itemTotal = item.quantity * rate;
        total += itemTotal;
        return { workType: item.workType, quantity: item.quantity, rate, total: itemTotal };
      });

      // Run master roll creation + work order status update in parallel
      const [, updated] = await Promise.all([
        db.tubewellMasterRollEntry.create({
          data: {
            workOrderId: id,
            nameOfPlace: masterRollData.nameOfPlace,
            villageSansad: masterRollData.villageSansad,
            total,
            items: { create: itemsToCreate },
          },
        }),
        db.tubewellWorkOrder.update({ where: { id }, data }),
      ]);

      revalidateTag("work-orders", 'max');
      revalidatePath("/admindashboard/tubewell/work-orders", 'page');
      return updated;
    }
  }

  const updated = await db.tubewellWorkOrder.update({ where: { id }, data });
  revalidateTag("work-orders", 'max');
  revalidatePath("/admindashboard/tubewell/work-orders", 'page');
  return updated;
}

export const getWorkOrders = unstable_cache(
  async () =>
    db.tubewellWorkOrder.findMany({
      include: {
        mistri: true,
        request: true,
        materials: { include: { material: true } },
        masterRollEntries: { include: { items: true } },
      },
      orderBy: { issueDate: "desc" },
    }),
  
);

// ==========================================
// BILLING (MUSTOR) ACTIONS
// ==========================================

export async function generateBill(workOrderIds: string | string[]) {
  const ids = Array.isArray(workOrderIds) ? workOrderIds : [workOrderIds];
  const year = getYear();

  // Run serial lookup + order fetch in parallel before the transaction
  const [lastBill, orders] = await Promise.all([
    db.tubewellBill.findFirst({
      where: { billNumber: { startsWith: `DGP-TW/BILL/${year}/` } },
      orderBy: { billNumber: "desc" },
      select: { billNumber: true },
    }),
    db.tubewellWorkOrder.findMany({
      where: { id: { in: ids } },
      select: {
        mustiAmount: true,
        materials: { select: { quantity: true, rate: true } },
      },
    }),
  ]);

  const billNumber = `DGP-TW/BILL/${year}/${String(nextSerial(lastBill?.billNumber)).padStart(3, "0")}`;

  // Compute totals in JS — no extra DB round-trip inside the transaction
  let totalMaterialCost = 0;
  let totalLaborCost = 0;
  for (const order of orders) {
    totalMaterialCost += order.materials.reduce((a, m) => a + m.quantity * m.rate, 0);
    totalLaborCost += order.mustiAmount;
  }

  const result = await db.tubewellBill.create({
    data: {
      billNumber,
      totalMaterialCost,
      totalLaborCost,
      netAmount: totalMaterialCost + totalLaborCost,
      workOrders: { connect: ids.map((id) => ({ id })) },
    },
  });

  revalidateTag("bills", 'max');
  revalidatePath("/admindashboard/tubewell/bills", 'page');
  revalidatePath("/admindashboard/tubewell/bills/create", 'page');
  return result;
}

export const getBills = unstable_cache(
  async () =>
    db.tubewellBill.findMany({
      include: {
        workOrders: {
          select: {
            orderNumber: true,
            mistri: { select: { name: true } },
            request: { select: { citizenName: true } },
          },
        },
      },
      orderBy: { billDate: "desc" },
    }),
  ["bills"],
  { tags: ["bills"] }
);

// ==========================================
// MASTER ROLL ACTIONS
// ==========================================

export async function addMasterRollEntry(
  workOrderId: string,
  data: {
    nameOfPlace: string;
    villageSansad: string;
    items: { workType: string; quantity: number }[];
  }
) {
  const activeRates = await getActiveTubewellLaborRates();

  let total = 0;
  const itemsToCreate = data.items.map((item) => {
    const rate = activeRates[item.workType] ?? 0;
    const itemTotal = item.quantity * rate;
    total += itemTotal;
    return { workType: item.workType, quantity: item.quantity, rate, total: itemTotal };
  });

  const entry = await db.tubewellMasterRollEntry.create({
    data: {
      workOrderId,
      nameOfPlace: data.nameOfPlace,
      villageSansad: data.villageSansad,
      total,
      items: { create: itemsToCreate },
    },
  });

  revalidatePath("/admindashboard/tubewell/work-orders", 'page');
  revalidatePath(`/admindashboard/tubewell/work-orders/${workOrderId}`, 'page');
  return entry;
}

export async function removeMasterRollEntry(id: string, workOrderId: string) {
  await db.tubewellMasterRollEntry.delete({ where: { id } });
  revalidatePath("/admindashboard/tubewell/work-orders", 'page');
  revalidatePath(`/admindashboard/tubewell/work-orders/${workOrderId}`, 'page');
  return true;
}

export async function getMasterRollEntries(workOrderId: string) {
  return db.tubewellMasterRollEntry.findMany({
    where: { workOrderId },
    include: { items: true },
    orderBy: { id: "asc" },
  });
}

// ==========================================
// STOCK ADJUSTMENT ACTIONS
// ==========================================

/**
 * Adjust stock for an active (ISSUED / IN_PROGRESS) work order.
 * Each adjustment is either:
 *   type "ADD"    → issue more stock to the order (decrement material stock)
 *   type "RETURN" → return unused stock from the order (increment material stock)
 */
export async function adjustWorkOrderStock(
  workOrderId: string,
  adjustments: {
    orderMaterialId?: string; // existing TubewellOrderMaterial row (for RETURN / partial RETURN)
    materialId: string;
    quantity: number;
    type: "ADD" | "RETURN";
  }[]
) {
  if (!adjustments.length) throw new Error("No adjustments provided.");

  const order = await db.tubewellWorkOrder.findUnique({
    where: { id: workOrderId },
    select: { id: true, orderNumber: true, status: true },
  });
  if (!order) throw new Error("Work order not found.");
  if (order.status === "COMPLETED" || order.status === "CANCELLED")
    throw new Error("Cannot adjust stock for a completed or cancelled work order.");

  // Fetch all involved materials in one query
  const materialIds = [...new Set(adjustments.map((a) => a.materialId))];
  const materials = await db.tubewellMaterial.findMany({
    where: { id: { in: materialIds } },
    select: { id: true, stock: true, rate: true },
  });
  const matMap = Object.fromEntries(materials.map((m) => [m.id, m]));

  // Validate ADD adjustments against available stock
  for (const adj of adjustments) {
    if (adj.type === "ADD") {
      const mat = matMap[adj.materialId];
      if (!mat) throw new Error(`Material not found: ${adj.materialId}`);
      if (mat.stock < adj.quantity)
        throw new Error(
          `Not enough stock for material. Only ${mat.stock} available.`
        );
    }
  }

  await db.$transaction(
    async (tx) => {
      for (const adj of adjustments) {
        const mat = matMap[adj.materialId];
        const rate = mat?.rate ?? 0;

        if (adj.type === "ADD") {
          // Create / increment order material row
          if (adj.orderMaterialId) {
            // increment existing row
            await tx.tubewellOrderMaterial.update({
              where: { id: adj.orderMaterialId },
              data: { quantity: { increment: adj.quantity } },
            });
          } else {
            // add new material row to this work order
            await tx.tubewellOrderMaterial.create({
              data: {
                workOrderId,
                materialId: adj.materialId,
                quantity: adj.quantity,
                rate,
              },
            });
          }

          // Deduct stock + log
          await tx.tubewellMaterial.update({
            where: { id: adj.materialId },
            data: {
              stock: { decrement: adj.quantity },
              stockLogs: {
                create: {
                  transactionType: "OUT",
                  quantity: adj.quantity,
                  rate,
                  remarks: `Additional issue for Work Order ${order.orderNumber}`,
                  referenceId: workOrderId,
                },
              },
            },
          });
        } else {
          // RETURN — give stock back
          if (adj.orderMaterialId) {
            const om = await tx.tubewellOrderMaterial.findUnique({
              where: { id: adj.orderMaterialId },
              select: { quantity: true },
            });
            if (!om) throw new Error("Order material record not found.");
            const newQty = om.quantity - adj.quantity;
            if (newQty < 0)
              throw new Error("Return quantity exceeds issued quantity.");

            if (newQty === 0) {
              await tx.tubewellOrderMaterial.delete({
                where: { id: adj.orderMaterialId },
              });
            } else {
              await tx.tubewellOrderMaterial.update({
                where: { id: adj.orderMaterialId },
                data: { quantity: newQty },
              });
            }
          }

          // Restore stock + log
          await tx.tubewellMaterial.update({
            where: { id: adj.materialId },
            data: {
              stock: { increment: adj.quantity },
              stockLogs: {
                create: {
                  transactionType: "IN",
                  quantity: adj.quantity,
                  rate,
                  remarks: `Returned to stock from Work Order ${order.orderNumber}`,
                  referenceId: workOrderId,
                },
              },
            },
          });
        }
      }
    },
    { timeout: 20000 }
  );

  revalidateTag("materials", 'max');
  revalidateTag("work-orders", 'max');
  revalidatePath("/admindashboard/tubewell/work-orders", 'page');
  revalidatePath("/admindashboard/tubewell/materials", 'page');
  return true;
}
