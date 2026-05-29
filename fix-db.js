const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { mobileNumber: null }
  });
  
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { mobileNumber: `NULL_${user.id}` }
    });
  }
  console.log(`Fixed ${users.length} users with null mobile numbers.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
