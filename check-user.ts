import { db } from "./lib/db";

async function main() {
  const user = await db.user.findUnique({
    where: { email: "surajit.shil.shil@gmail.com" },
  });
  console.log("User found:", !!user);
  if (user) {
    console.log("Image length:", user.image?.length);
    console.log("ImageKey length:", user.imageKey?.length);
    console.log("JSON size:", JSON.stringify(user).length);
  }
}
main().catch(console.error).finally(() => process.exit(0));
