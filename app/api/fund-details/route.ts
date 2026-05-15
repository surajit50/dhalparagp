import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const calculateBalances = (fund: any, security: { tied: number; untied: number } = { tied: 0, untied: 0 }) => {
  const unspentBalanceTied = (fund.openingBalanceTied + fund.directReceiptTied + fund.autoReceiptTied) - fund.expenditureTied;
  const unspentBalanceUntied = (fund.openingBalanceUntied + fund.directReceiptUntied + fund.autoReceiptUntied) - fund.expenditureUntied;
  const unspentBalanceTotal = unspentBalanceTied + unspentBalanceUntied;
  
  const availableBalanceTied = unspentBalanceTied - security.tied;
  const availableBalanceUntied = unspentBalanceUntied - security.untied;
  const availableBalanceTotal = availableBalanceTied + availableBalanceUntied;

  return {
    ...fund,
    unspentBalanceTied,
    unspentBalanceUntied,
    unspentBalanceTotal,
    availableBalanceTied,
    availableBalanceUntied,
    availableBalanceTotal,
    securityHeldTied: security.tied,
    securityHeldUntied: security.untied,
    securityHeldTotal: security.tied + security.untied,
  };
};

async function getSecurityMap() {
  const unpaidSecurity = await db.secrutityDeposit.findMany({
    where: { paymentstatus: "unpaid" },
    include: {
      PaymentDetails: {
        include: {
          WorksDetail: {
            include: {
              ApprovedActionPlanDetails: true
            }
          }
        }
      }
    }
  });

  const securityMap: Record<string, { tied: number; untied: number }> = {};
  unpaidSecurity.forEach(deposit => {
    const details = deposit.PaymentDetails?.[0]?.WorksDetail?.ApprovedActionPlanDetails;
    if (details) {
      const scheme = details.schemeName;
      const type = details.fundType?.toLowerCase() || "";
      if (!securityMap[scheme]) securityMap[scheme] = { tied: 0, untied: 0 };
      if (type.includes("untied")) securityMap[scheme].untied += deposit.securityDepositAmt;
      else securityMap[scheme].tied += deposit.securityDepositAmt;
    }
  });
  return securityMap;
}

export async function GET(req: NextRequest) {
  try {
    const [funds, securityMap] = await Promise.all([
      db.fundAvailability.findMany({ orderBy: { createdAt: "desc" } }),
      getSecurityMap()
    ]);
    
    const calculatedFunds = funds.map(fund => calculateBalances(fund, securityMap[fund.schemeName]));
    return NextResponse.json(calculatedFunds);
  } catch (error) {
    console.error("Error fetching fund details:", error);
    return NextResponse.json({ error: "Failed to fetch fund details" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, schemeName, openingBalanceTied, openingBalanceUntied, directReceiptTied, directReceiptUntied, autoReceiptTied, autoReceiptUntied, expenditureTied, expenditureUntied } = body;

    const aT = parseFloat(openingBalanceTied) || 0;
    const aU = parseFloat(openingBalanceUntied) || 0;
    const bT = parseFloat(directReceiptTied) || 0;
    const bU = parseFloat(directReceiptUntied) || 0;
    const cT = parseFloat(autoReceiptTied) || 0;
    const cU = parseFloat(autoReceiptUntied) || 0;
    const dT = parseFloat(expenditureTied) || 0;
    const dU = parseFloat(expenditureUntied) || 0;

    const fund = await db.fundAvailability.create({
      data: {
        year,
        schemeName,
        openingBalanceTied: aT,
        openingBalanceUntied: aU,
        openingBalanceTotal: aT + aU,
        directReceiptTied: bT,
        directReceiptUntied: bU,
        directReceiptTotal: bT + bU,
        autoReceiptTied: cT,
        autoReceiptUntied: cU,
        autoReceiptTotal: cT + cU,
        expenditureTied: dT,
        expenditureUntied: dU,
        expenditureTotal: dT + dU,
      },
    });

    const securityMap = await getSecurityMap();
    return NextResponse.json(calculateBalances(fund, securityMap[schemeName]));
  } catch (error) {
    console.error("Error creating fund detail:", error);
    return NextResponse.json({ error: "Failed to create fund detail" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, year, schemeName, openingBalanceTied, openingBalanceUntied, directReceiptTied, directReceiptUntied, autoReceiptTied, autoReceiptUntied, expenditureTied, expenditureUntied } = body;

    const aT = parseFloat(openingBalanceTied) || 0;
    const aU = parseFloat(openingBalanceUntied) || 0;
    const bT = parseFloat(directReceiptTied) || 0;
    const bU = parseFloat(directReceiptUntied) || 0;
    const cT = parseFloat(autoReceiptTied) || 0;
    const cU = parseFloat(autoReceiptUntied) || 0;
    const dT = parseFloat(expenditureTied) || 0;
    const dU = parseFloat(expenditureUntied) || 0;

    const fund = await db.fundAvailability.update({
      where: { id },
      data: {
        year,
        schemeName,
        openingBalanceTied: aT,
        openingBalanceUntied: aU,
        openingBalanceTotal: aT + aU,
        directReceiptTied: bT,
        directReceiptUntied: bU,
        directReceiptTotal: bT + bU,
        autoReceiptTied: cT,
        autoReceiptUntied: cU,
        autoReceiptTotal: cT + cU,
        expenditureTied: dT,
        expenditureUntied: dU,
        expenditureTotal: dT + dU,
      },
    });

    const securityMap = await getSecurityMap();
    return NextResponse.json(calculateBalances(fund, securityMap[schemeName]));
  } catch (error) {
    console.error("Error updating fund detail:", error);
    return NextResponse.json({ error: "Failed to update fund detail" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing fund ID" }, { status: 400 });
    await db.fundAvailability.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete fund detail" }, { status: 500 });
  }
}
