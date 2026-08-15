/**
 * migrate-earnest-money.js
 *
 * One-time migration script to backfill all existing EarnestMoneyRegister
 * records with:
 *   1. registerStatus  — derived from legacy paymentstatus field
 *   2. amountReceived  — defaulted to earnestMoneyAmount if missing
 *   3. originalEarnestMoneyAmount — preserved copy of earnestMoneyAmount
 *   4. originalTenderAmount — fetched from related bidagency.biddingAmount / worksDetail.finalEstimateAmount
 *   5. nitNumber, nitDate, nameOfWork — fetched from related nitDetails / ApprovedActionPlanDetails
 *   6. bidderAgencyName, bidderAddress, tenderMode — fetched from related agencydetails / nitDetails
 *   7. workOrderMemoNumber, workOrderMemoDate, workOrderId — fetched from related workorderdetails
 *   8. receiptDate — synced from paymentDate if receiptDate is missing
 *
 * Usage:
 *   node scripts/migrate-earnest-money.js
 *
 * Run ONCE after deploying the updated Earnest Money Register module.
 * Safe to re-run — already-migrated records are skipped (dry-run output shown).
 */

const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

// All existing records are treated as RECEIVED (fully paid / collected).
const FORCE_STATUS = "RECEIVED";
const FORCE_LEGACY_STATUS = "paid";

function formatAgencyName(agency) {
  if (!agency?.name) return "Unknown Agency";
  if (agency.agencyType === "FARM" && agency.proprietorName) {
    return `${agency.name} (${agency.proprietorName})`;
  }
  return agency.name;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Earnest Money Register — Migration Script");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("");

  // Fetch all EMD records with full relations
  console.log("📋 Fetching all EarnestMoneyRegister records...");

  const allRecords = await db.earnestMoneyRegister.findMany({
    include: {
      bidderName: {
        include: {
          agencydetails: true,
          earnestMoneyRegister: false,
          workorderdetails: {
            include: {
              awardofcontractdetails: true,
            },
          },
          WorksDetail: {
            include: {
              nitDetails: true,
              ApprovedActionPlanDetails: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  console.log(`✅ Found ${allRecords.length} total record(s).\n`);

  if (allRecords.length === 0) {
    console.log("ℹ️  No records to migrate. Exiting.");
    return;
  }

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const record of allRecords) {
    const bidAgency = record.bidderName;
    const work = bidAgency?.WorksDetail;
    const nit = work?.nitDetails;
    const workOrder = bidAgency?.workorderdetails?.[0];
    const agency = bidAgency?.agencydetails;

    // ── Derive registerStatus from legacy paymentstatus ──────────────────
    const derivedStatus = mapLegacyStatusToRegisterStatus(record.paymentstatus);

    // ── Check what needs updating ────────────────────────────────────────
    const alreadyReceived =
      record.registerStatus === "RECEIVED" && record.paymentstatus === "unpaid";

    const needsNitNumber = !record.nitNumber && nit?.memoNumber;
    const needsNitDate = !record.nitDate && nit?.memoDate;
    const needsNameOfWork =
      !record.nameOfWork && work?.ApprovedActionPlanDetails?.activityDescription;
    const needsBidderAgencyName = !record.bidderAgencyName && agency;
    const needsBidderAddress = !record.bidderAddress && agency?.contactDetails;
    const needsTenderMode = !record.tenderMode && nit?.nitMode;
    const needsWorkOrderInfo =
      !record.workOrderMemoNumber &&
      workOrder?.awardofcontractdetails?.workodermenonumber;
    const needsOriginalAmounts =
      !record.originalEarnestMoneyAmount || !record.originalTenderAmount;
    const needsAmountReceived =
      !record.amountReceived && record.earnestMoneyAmount;
    const needsReceiptDate =
      !record.receiptDate && record.paymentDate;

    const hasAnythingToUpdate =
      !alreadyReceived ||
      needsNitNumber ||
      needsNitDate ||
      needsNameOfWork ||
      needsBidderAgencyName ||
      needsBidderAddress ||
      needsTenderMode ||
      needsWorkOrderInfo ||
      needsOriginalAmounts ||
      needsAmountReceived ||
      needsReceiptDate;

    if (!hasAnythingToUpdate) {
      console.log(
        `  ⏭️  SKIP  [${record.id}]  ${record.bidderAgencyName || "Unknown"} — already RECEIVED + fully migrated`
      );
      skippedCount++;
      continue;
    }

    // ── Build the update payload ─────────────────────────────────────────
    const updateData = {
      // Always force RECEIVED regardless of previous status
      registerStatus: FORCE_STATUS,
      paymentstatus: FORCE_LEGACY_STATUS,
    };

    if (needsNitNumber) {
      updateData.nitNumber = nit.memoNumber;
    }

    if (needsNitDate) {
      updateData.nitDate = nit.memoDate;
    }

    if (needsNameOfWork) {
      updateData.nameOfWork = work.ApprovedActionPlanDetails.activityDescription;
    }

    if (needsBidderAgencyName) {
      updateData.bidderAgencyName = formatAgencyName(agency);
    }

    if (needsBidderAddress && agency.contactDetails) {
      updateData.bidderAddress = agency.contactDetails;
    }

    if (needsTenderMode) {
      updateData.tenderMode = nit.nitMode;
    }

    if (needsWorkOrderInfo) {
      updateData.workOrderId = workOrder.id;
      updateData.workOrderMemoNumber =
        workOrder.awardofcontractdetails.workodermenonumber;
      updateData.workOrderMemoDate =
        workOrder.awardofcontractdetails.workordeermemodate;
    }

    if (needsOriginalAmounts) {
      if (!record.originalEarnestMoneyAmount) {
        updateData.originalEarnestMoneyAmount = record.earnestMoneyAmount;
      }
      if (!record.originalTenderAmount) {
        updateData.originalTenderAmount =
          bidAgency?.biddingAmount || work?.finalEstimateAmount || record.earnestMoneyAmount;
      }
    }

    if (needsAmountReceived) {
      updateData.amountReceived = record.earnestMoneyAmount;
    }

    if (needsReceiptDate) {
      updateData.receiptDate = record.paymentDate;
    }

    // ── Apply update ─────────────────────────────────────────────────────
    try {
      await db.earnestMoneyRegister.update({
        where: { id: record.id },
        data: updateData,
      });

      const agencyLabel =
        updateData.bidderAgencyName ||
        record.bidderAgencyName ||
        agency?.name ||
        record.id;

      const previousStatus = record.registerStatus || record.paymentstatus || "unknown";

      console.log(
        `  ✅ MIGRATED  [${record.id}]  ${agencyLabel}\n` +
        `              Status: ${previousStatus} → RECEIVED\n` +
        `              Fields updated: ${Object.keys(updateData).join(", ")}`
      );

      migratedCount++;
    } catch (err) {
      console.error(
        `  ❌ ERROR  [${record.id}]  ${agency?.name || record.id}:`,
        err.message
      );
      errorCount++;
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Migration Complete");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  ✅ Migrated : ${migratedCount}`);
  console.log(`  ⏭️  Skipped  : ${skippedCount} (already up-to-date)`);
  console.log(`  ❌ Errors   : ${errorCount}`);
  console.log("═══════════════════════════════════════════════════════════════");

  if (errorCount > 0) {
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
