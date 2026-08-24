const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$runCommandRaw({
      update: 'ApprovedActionPlanDetails',
      updates: [
        {
          q: { $or: [{ createdAt: null }, { createdAt: { $exists: false } }] },
          u: { $set: { createdAt: { $date: new Date().toISOString() } } },
          multi: true,
        },
      ],
    });
    console.log('Fixed ApprovedActionPlanDetails records:', JSON.stringify(result));
  } catch (error) {
    console.error('Error updating:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
