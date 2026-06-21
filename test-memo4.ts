import { db } from "./lib/db";

async function generateMemoNumber() {
  const year = new Date().getFullYear().toString()

  // Format: 001/DGP(LC)/2026  — sequential within the current year
  const maxCert = await db.landConversionCertificate.findFirst({
    where: { memoNumber: { endsWith: `/DGP\\(LC\\)/${year}` } },
    orderBy: { memoNumber: "desc" },
    select: { memoNumber: true },
  })

  const last = maxCert?.memoNumber?.split("/")[0] || "000"
  const next = (parseInt(last, 10) + 1).toString().padStart(3, "0")

  return `${next}/DGP(LC)/${year}`
}

generateMemoNumber().then(console.log).catch(console.error).finally(() => process.exit(0));





