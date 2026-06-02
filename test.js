const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const input = '095/DGP/(LH)/2025';
  const escaped = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const apps = await prisma.warishApplication.findMany({
    where: { warishRefNo: { contains: escaped, mode: 'insensitive' } },
    select: { id: true, warishRefNo: true }
  });
  console.log("Results for escaped search:", apps);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
