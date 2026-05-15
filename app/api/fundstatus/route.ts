import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const getFinancialYear = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const processWorks = (works: any[]) => {
  return works.map((work) => {
    const totalPaid = work.paymentDetails.reduce(
      (sum: number, payment: any) => sum + (payment.grossBillAmount || 0),
      0,
    );
    const estimatedCost = Number(work.finalEstimateAmount) || 0;
    const hasFinalBill = work.paymentDetails.some((p: any) =>
      p.billType.toLowerCase().includes("final bill"),
    );
    const pending = hasFinalBill ? 0 : estimatedCost - totalPaid;
    const financialYear = getFinancialYear(new Date(work.nitDetails.memoDate));

    return {
      ...work,
      totalPaid,
      pending,
      financialYear,
      formattedNit: `NIT-${work.nitDetails.memoNumber
        .toString()
        .padStart(4, "0")}`,
    };
  });
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nit = searchParams.get("nit") || undefined;
    const schemeName = searchParams.get("schemeName") || undefined;
    const fundType = searchParams.get("fundType") || undefined;
    const yearParam = searchParams.get("year");
    const sortBy = searchParams.get("sortBy") || "nit";
    const order = searchParams.get("order") || "asc";

    const currentFY = getFinancialYear(new Date());
    const effectiveYear = yearParam ?? currentFY;
    const [startYear] = effectiveYear.split("-").map(Number);
    const startDate = new Date(startYear, 3, 1); // April 1
    const endDate = new Date(startYear + 1, 2, 31); // March 31

    // Build orderBy
    let orderBy: any = {};
    if (sortBy === "nit") {
      orderBy = { nitDetails: { memoNumber: order } };
    } else if (sortBy === "activityCode") {
      orderBy = { ApprovedActionPlanDetails: { activityCode: order } };
    }

    // Validate and parse NIT number
    let parsedNit: number | undefined = undefined;
    if (nit) {
      parsedNit = Number.parseInt(nit);
      if (isNaN(parsedNit)) {
        return NextResponse.json(
          { error: "Invalid NIT number format" },
          { status: 400 }
        );
      }
    }

    // Fetch filter options with FY filtering
    const [nitOptions, financialYears, schemeNames, fundTypes] = await Promise.all([
      db.nitDetails
        .findMany({
          distinct: ["memoNumber"],
          where: {
            memoDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: { memoNumber: true },
          orderBy: { memoNumber: "asc" },
        })
        .then((nits) =>
          nits
            .map((n) => n.memoNumber?.toString().padStart(4, "0") || "")
            .filter(Boolean),
        ),

      db.nitDetails
        .findMany({
          distinct: ["memoDate"],
          select: { memoDate: true },
        })
        .then((dates) => {
          const years = dates.map((d) => getFinancialYear(new Date(d.memoDate)));
          if (!years.includes(currentFY)) years.push(currentFY);
          return Array.from(new Set(years)).sort((a, b) =>
            b.localeCompare(a, undefined, { numeric: true }),
          );
        }),

      db.approvedActionPlanDetails
        .findMany({
          distinct: ["schemeName"],
          select: { schemeName: true },
          orderBy: { schemeName: "asc" },
        })
        .then((schemes) =>
          schemes
            .filter((s) => s.schemeName)
            .map((s) => ({ schemeName: s.schemeName! })),
        ),

      db.approvedActionPlanDetails
        .findMany({
          distinct: ["fundType"],
          select: { fundType: true },
          orderBy: { fundType: "asc" },
        })
        .then((types) =>
          types
            .filter((t) => t.fundType)
            .map((t) => ({ fundType: t.fundType! })),
        ),
    ]);

    const dateFilter = {
      nitDetails: {
        memoDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    };

    const works = await db.worksDetail.findMany({
      where: {
        ...dateFilter,
        ...(parsedNit !== undefined && {
          nitDetails: { memoNumber: parsedNit },
        }),
        ...(schemeName && {
          ApprovedActionPlanDetails: { schemeName: schemeName },
        }),
        ...(fundType && {
          ApprovedActionPlanDetails: { fundType: fundType },
        }),
        tenderStatus: { in: ["AOC"] },
      },
      orderBy: [
        orderBy,
        { workslno: "asc" },
      ],
      include: {
        nitDetails: {
          include: {
            WorksDetail: true,
          },
        },
        ApprovedActionPlanDetails: true,
        paymentDetails: true,
        AwardofContract: {
          include: {
            workorderdetails: {
              include: {
                Bidagency: { include: { agencydetails: true } },
              },
            },
          },
        },
      },
    });

    const processedWorks = processWorks(works);

    const summary = processedWorks.reduce(
      (acc, work) => {
        const memo = work.nitDetails.memoNumber.toString();
        if (!acc[memo]) {
          acc[memo] = {
            totalPaid: 0,
            totalPending: 0,
            nitDate: work.nitDetails.memoDate,
            financialYear: work.financialYear,
            formattedNit: work.formattedNit,
            workCount: 0,
          };
        }
        acc[memo].totalPaid += Number(work.totalPaid) || 0;
        acc[memo].totalPending += Number(work.pending) || 0;
        acc[memo].workCount += 1;
        return acc;
      },
      {} as Record<string, any>,
    );

    const grandTotalPaid = Object.values(summary).reduce(
      (sum: number, item: any) => sum + item.totalPaid,
      0,
    );
    const grandTotalPending = Object.values(summary).reduce(
      (sum: number, item: any) => sum + item.totalPending,
      0,
    );

    const totalWorks = processedWorks.length;

    return NextResponse.json({
      nitOptions,
      financialYears,
      schemeNames,
      fundTypes,
      works: processedWorks,
      summary,
      grandTotalPaid,
      grandTotalPending,
      totalWorks,
      effectiveYear
    });
  } catch (error) {
    console.error("Error fetching fund status:", error);
    return NextResponse.json(
      { error: "Failed to fetch fund status" },
      { status: 500 }
    );
  }
}
