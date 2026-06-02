import { db } from "./lib/db";

async function main() {
  const year = new Date().getFullYear().toString();
  console.log("Year:", year);
  
  const allCerts = await db.landConversionCertificate.findMany({
    select: { memoNumber: true }
  });
  console.log("All certs:", allCerts);

  const maxCert = await db.landConversionCertificate.findFirst({
    where: { memoNumber: { endsWith: `/DGP(LC)/${year}` } },
    orderBy: { memoNumber: "desc" },
    select: { memoNumber: true },
  });
  console.log("maxCert:", maxCert);

  const last = maxCert?.memoNumber?.split("/")[0] || "000";
  const next = (parseInt(last, 10) + 1).toString().padStart(3, "0");
  const result = `${next}/DGP(LC)/${year}`;
  console.log("Next generated:", result);
}

main().catch(console.error).finally(() => process.exit(0));
