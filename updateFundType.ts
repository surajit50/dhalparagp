import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting backfill for fundType...");

  const allPlans = await prisma.approvedActionPlanDetails.findMany();
  let updatedCount = 0;

  for (const plan of allPlans) {
    let fundType = "Untied";
    if (
      (plan.sector === "Sanitation" || plan.sector === "Drinking water") &&
      plan.schemeName === "15th CFC"
    ) {
      fundType = "Tied";
    }

    await prisma.approvedActionPlanDetails.update({
      where: { id: plan.id },
      data: { fundType },
    });
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
