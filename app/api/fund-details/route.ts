import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const calculateBalances = (fund: any) => {
  const unspentBalanceTied = (fund.openingBalanceTied + fund.directReceiptTied + fund.autoReceiptTied) - fund.expenditureTied;
  const unspentBalanceUntied = (fund.openingBalanceUntied + fund.directReceiptUntied + fund.autoReceiptUntied) - fund.expenditureUntied;
  const unspentBalanceTotal = (fund.openingBalanceTotal + fund.directReceiptTotal + fund.autoReceiptTotal) - fund.expenditureTotal;
  
  return {
    ...fund,
    unspentBalanceTied,
    unspentBalanceUntied,
    unspentBalanceTotal,
  };
};

export async function GET(req: NextRequest) {
  try {
    const funds = await db.fundAvailability.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    const calculatedFunds = funds.map(calculateBalances);
    return NextResponse.json(calculatedFunds);
  } catch (error) {
    console.error("Error fetching fund details:", error);
    return NextResponse.json(
      { error: "Failed to fetch fund details" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      year, 
      schemeName, 
      openingBalanceTied,
      openingBalanceUntied,
      directReceiptTied,
      directReceiptUntied,
      autoReceiptTied,
      autoReceiptUntied,
      expenditureTied,
      expenditureUntied
    } = body;

    if (!year || !schemeName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    return NextResponse.json(calculateBalances(fund));
  } catch (error) {
    console.error("Error creating fund detail:", error);
    return NextResponse.json(
      { error: "Failed to create fund detail" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      id,
      year, 
      schemeName, 
      openingBalanceTied,
      openingBalanceUntied,
      directReceiptTied,
      directReceiptUntied,
      autoReceiptTied,
      autoReceiptUntied,
      expenditureTied,
      expenditureUntied
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing fund ID" },
        { status: 400 }
      );
    }

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

    return NextResponse.json(calculateBalances(fund));
  } catch (error) {
    console.error("Error updating fund detail:", error);
    return NextResponse.json(
      { error: "Failed to update fund detail" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing fund ID" },
        { status: 400 }
      );
    }

    await db.fundAvailability.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting fund detail:", error);
    return NextResponse.json(
      { error: "Failed to delete fund detail" },
      { status: 500 }
    );
  }
}
