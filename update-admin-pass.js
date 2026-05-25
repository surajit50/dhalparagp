const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const prisma = new PrismaClient();
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.update({
    where: { email: "admin3@dhalparagp.in" },
    data: {
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });
  console.log("Updated user:", user.email, "role:", user.role);
}

main().catch(console.error).finally(() => process.exit(0));
