const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$runCommandRaw({
      count: 'SecrutityDeposit',
    });
    console.log('Count:', result.n);
  } catch (error) {
    console.error('Error updating:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
