import { db } from "./lib/db";

async function main() {
  const year = new Date().getFullYear().toString();
  
  const allCerts = await db.landConversionCertificate.findMany({
    select: { memoNumber: true }
  });
  console.log("All certs lengths:");
  for (const c of allCerts) {
    console.log(`"${c.memoNumber}" length:`, c.memoNumber.length);
  }

  const containsCert = await db.landConversionCertificate.findFirst({
    where: { memoNumber: { contains: `DGP(LC)` } },
  });
  console.log("containsCert:", containsCert?.memoNumber);
  
  const endsWithCert = await db.landConversionCertificate.findFirst({
    where: { memoNumber: { endsWith: `/DGP(LC)/${year}` } },
  });
  console.log("endsWithCert:", endsWithCert?.memoNumber);

}
main().catch(console.error).finally(() => process.exit(0));
