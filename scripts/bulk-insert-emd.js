/**
 * bulk-insert-emd.js
 *
 * Bulk-creates EarnestMoneyRegister entries for ALL eligible bidders
 * who don't have one yet. Sets every entry to RECEIVED status.
 *
 * Eligibility rules:
 *   - MANUAL NIT: all bidders eligible
 *   - ONLINE NIT: only bidders with a Work Order issued
 *
 * Usage: node scripts/bulk-insert-emd.js
 */

const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

function formatAgencyName(agency) {
  if (!agency?.name) return "Unknown Agency";
  if (agency.agencyType === "FARM" && agency.proprietorName) {
    return `${agency.name} (${agency.proprietorName})`;
  }
  return agency.name;
}

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Earnest Money Register — Bulk Insert Script");
  console.log("  Status: RECEIVED for all eligible bidders");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Fetch all eligible bidders with no existing EMD entry
  console.log("📋 Fetching eligible bidders...");

  const eligibleBidders = await db.bidagency.findMany({
    where: {
      earnestMoneyRegister: { none: {} },
      OR: [
        {
          WorksDetail: { is: { nitDetails: { nitMode: "MANUAL" } } },
        },
        {
          workorderdetails: { some: {} },
          WorksDetail: { is: { nitDetails: { nitMode: "ONLINE" } } },
        },
      ],
    },
    include: {
      agencydetails: true,
      workorderdetails: {
        include: { awardofcontractdetails: true },
      },
      WorksDetail: {
        include: {
          nitDetails: true,
          ApprovedActionPlanDetails: true,
        },
      },
    },
  });

  console.log(`✅ Found ${eligibleBidders.length} eligible bidder(s) to process.\n`);

  if (eligibleBidders.length === 0) {
    console.log("ℹ️  Nothing to insert. Exiting.");
    return;
  }

  let insertedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const bidder of eligibleBidders) {
    const agency = bidder.agencydetails;
    const work = bidder.WorksDetail;
    const nit = work?.nitDetails;
    const workOrder = bidder.workorderdetails[0];
    const agencyName = formatAgencyName(agency);
    const emdAmount = work?.earnestMoneyFee || 0;

    if (emdAmount <= 0) {
      console.log(`  ⚠️  SKIP  ${agencyName} — EMD amount is 0`);
      skippedCount++;
      continue;
    }

    try {
      await db.earnestMoneyRegister.create({
        data: {
          bidderId: bidder.id,
          earnestMoneyAmount: emdAmount,
          amountReceived: emdAmount,
          originalEarnestMoneyAmount: emdAmount,
          originalTenderAmount: bidder.biddingAmount || work?.finalEstimateAmount || emdAmount,
          registerStatus: "RECEIVED",
          paymentstatus: "paid",
          // NIT details
          nitNumber: nit?.memoNumber ?? null,
          nitDate: nit?.memoDate ?? null,
          nameOfWork: work?.ApprovedActionPlanDetails?.activityDescription ?? null,
          // Bidder details
          bidderAgencyName: agencyName,
          bidderAddress: agency?.contactDetails ?? null,
          tenderMode: nit?.nitMode ?? "MANUAL",
          // Work Order details
          workOrderId: workOrder?.id ?? null,
          workOrderMemoNumber: workOrder?.awardofcontractdetails?.workodermenonumber ?? null,
          workOrderMemoDate: workOrder?.awardofcontractdetails?.workordeermemodate ?? null,
        },
      });

      console.log(
        `  ✅ [${insertedCount + 1}] ${agencyName}` +
          ` | NIT ${nit?.memoNumber ?? "N/A"}` +
          ` | ${nit?.nitMode ?? "MANUAL"}` +
          ` | ₹${emdAmount.toLocaleString("en-IN")}`
      );
      insertedCount++;
    } catch (err) {
      console.error(`  ❌ ERROR for ${agencyName}: ${err.message}`);
      errorCount++;
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  Bulk Insert Complete");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  ✅ Inserted : ${insertedCount}`);
  console.log(`  ⚠️  Skipped  : ${skippedCount} (zero EMD amount)`);
  console.log(`  ❌ Errors   : ${errorCount}`);
  console.log("═══════════════════════════════════════════════════════════════");

  if (errorCount > 0) process.exit(1);
}

main()
  .catch((e) => {
    console.error("Fatal:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
