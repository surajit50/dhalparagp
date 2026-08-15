/**
 * check-emd-eligibility.js
 * Diagnostic script — shows all bidders eligible for EMD entries,
 * including why some may be blocked.
 *
 * Usage: node scripts/check-emd-eligibility.js
 */

const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  EMD Eligibility Diagnostic");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // 1. Total bidagency count
  const totalBidders = await db.bidagency.count();
  console.log(`Total Bidagency records : ${totalBidders}`);

  // 2. Bidders with a linked WorksDetail
  const biddersWithWork = await db.bidagency.count({
    where: { WorksDetail: { isNot: null } },
  });
  console.log(`Bidders with WorksDetail: ${biddersWithWork}`);

  // 3. Bidders on MANUAL NITs
  const manualBidders = await db.bidagency.count({
    where: {
      WorksDetail: { is: { nitDetails: { nitMode: "MANUAL" } } },
    },
  });
  console.log(`Manual NIT bidders      : ${manualBidders}`);

  // 4. Bidders on ONLINE NITs
  const onlineBidders = await db.bidagency.count({
    where: {
      WorksDetail: { is: { nitDetails: { nitMode: "ONLINE" } } },
    },
  });
  console.log(`Online NIT bidders      : ${onlineBidders}`);

  // 5. Online NIT bidders WITH Work Order (eligible)
  const onlineEligible = await db.bidagency.count({
    where: {
      workorderdetails: { some: {} },
      WorksDetail: { is: { nitDetails: { nitMode: "ONLINE" } } },
    },
  });
  console.log(`Online NIT + WO issued  : ${onlineEligible} (eligible)`);

  // 6. Online NIT bidders WITHOUT Work Order (blocked)
  const onlineBlocked = await db.bidagency.count({
    where: {
      workorderdetails: { none: {} },
      WorksDetail: { is: { nitDetails: { nitMode: "ONLINE" } } },
    },
  });
  console.log(`Online NIT + no WO      : ${onlineBlocked} (BLOCKED — WO not issued)\n`);

  // 7. Existing EMD entries
  const existingEmd = await db.earnestMoneyRegister.count();
  console.log(`Existing EMD entries    : ${existingEmd}`);

  // 8. Eligible but no EMD entry yet
  const eligibleBidders = await db.bidagency.findMany({
    where: {
      earnestMoneyRegister: { none: {} },
      OR: [
        { WorksDetail: { is: { nitDetails: { nitMode: "MANUAL" } } } },
        {
          workorderdetails: { some: {} },
          WorksDetail: { is: { nitDetails: { nitMode: "ONLINE" } } },
        },
      ],
    },
    include: {
      agencydetails: true,
      workorderdetails: { include: { awardofcontractdetails: true } },
      WorksDetail: { include: { nitDetails: true, ApprovedActionPlanDetails: true } },
    },
  });

  console.log(`\n📋 Eligible for new EMD entry: ${eligibleBidders.length}`);

  if (eligibleBidders.length === 0) {
    console.log("\n  ℹ️  No eligible bidders found. Possible reasons:");
    console.log("     • No Bidagency records exist yet");
    console.log("     • All eligible bidders already have EMD entries");
    console.log("     • Online NIT bidders don't have a Work Order issued yet");
  } else {
    console.log("\n  Eligible Bidders:");
    eligibleBidders.forEach((b, i) => {
      const nit = b.WorksDetail?.nitDetails;
      const agency = b.agencydetails;
      const hasWO = b.workorderdetails.length > 0;
      console.log(`\n  [${i + 1}] ${agency?.name || "Unknown"}`);
      console.log(`       NIT No  : ${nit?.memoNumber ?? "N/A"}`);
      console.log(`       NIT Mode: ${nit?.nitMode ?? "N/A"}`);
      console.log(`       Work    : ${b.WorksDetail?.ApprovedActionPlanDetails?.activityDescription ?? "N/A"}`);
      console.log(`       WO      : ${hasWO ? "✅ Issued" : "❌ Not issued"}`);
      console.log(`       EMD Amt : ₹${b.WorksDetail?.earnestMoneyFee?.toLocaleString("en-IN") ?? 0}`);
    });
  }

  console.log("\n═══════════════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
