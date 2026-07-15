const { PrismaClient } = require("@prisma/client");
const { addYears } = require("date-fns");

const db = new PrismaClient();

async function main() {
  console.log("Fetching all pond leases...");
  const leases = await db.pondLease.findMany();

  console.log(`Found ${leases.length} leases. Processing...`);

  let updatedCount = 0;

  for (const lease of leases) {
    const startDate = new Date(lease.leaseStartDate);
    const newEndDate = addYears(startDate, 3);
    
    // Check if end date is different
    if (lease.leaseEndDate.getTime() !== newEndDate.getTime()) {
      console.log(`Updating lease ID: ${lease.id} - End Date from ${lease.leaseEndDate.toISOString()} to ${newEndDate.toISOString()}`);
      
      // If we are strictly changing to a 3-year term, their total amount might have been based on 1 year.
      // But since they just changed the form so `leaseAmountYearly` in the database holds `Total Amount / leaseYears`,
      // we need to decide if we scale the total amount.
      // If `totalAmount` == `leaseAmountYearly`, then it was a 1-year lease before. If we change it to 3 years,
      // the `totalAmount` should probably be `leaseAmountYearly * 3`.
      // Let's just update the leaseEndDate first as requested to keep things simple, unless they explicitly want financial recalcs.
      
      await db.pondLease.update({
        where: { id: lease.id },
        data: {
          leaseEndDate: newEndDate
        }
      });
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} leases to 3-year durations.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
