import { db } from "./lib/db";

async function main() {
  const year = new Date().getFullYear().toString();
  
  const test1 = await db.landConversionCertificate.findFirst({
    where: { memoNumber: { endsWith: `/DGP(LC)/${year}` } },
  });
  console.log("Without escaping:", test1?.memoNumber);
  
  const test2 = await db.landConversionCertificate.findFirst({
    where: { memoNumber: { endsWith: `/DGP\\(LC\\)/${year}` } },
  });
  console.log("With escaping:", test2?.memoNumber);

}
main().catch(console.error).finally(() => process.exit(0));
