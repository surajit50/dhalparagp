const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  const d = await db.approvedActionPlanDetails.findMany();
  console.log(d.length, 'records');
  if (d.length > 0) {
    console.log('Years:', [...new Set(d.map(x=>x.financialYear))]);
    console.log('Schemes:', [...new Set(d.map(x=>x.schemeName))]);
  }
}

main().finally(() => db.$disconnect());
