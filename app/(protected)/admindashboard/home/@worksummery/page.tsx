// app/(protected)/admindashboard/fundstatus/page.tsx
import { db } from "@/lib/db";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CombinedFilter from "@/components/CombinedFilter";
import { Suspense } from "react";
import FilterSkeleton from "@/components/FilterSkeleton";
import SummaryCard from "@/components/SummaryCard";



const getFinancialYear = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const processWorks = (works: any[]) => {
  return works.map((work) => {
    const totalPaid = work.paymentDetails.reduce(
      (sum: number, payment: any) => sum + (payment.grossBillAmount || 0),
      0
    );
    const estimatedCost = Number(work.finalEstimateAmount) || 0;
    const hasFinalBill = work.paymentDetails.some((p: any) =>
      p.billType.toLowerCase().includes("final bill")
    );
    const pending = hasFinalBill ? 0 : estimatedCost - totalPaid;
    const financialYear = getFinancialYear(work.nitDetails.memoDate);

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

const Fundstatus = async ({
  searchParams,
}: {
  searchParams: Promise<{
    nit?: string;
    fundType?: string;
    tab?: string;
    year?: string;
  }>;
}) => {
  const search = await searchParams;
  const currentFY = getFinancialYear(new Date());
  const effectiveYear = search.year ?? currentFY;
  const [startYear] = effectiveYear.split("-").map(Number);
  const startDate = new Date(startYear, 3, 1); // April 1
  const endDate = new Date(startYear + 1, 2, 31); // March 31

  // Validate and parse NIT number
  let parsedNit: number | undefined = undefined;
  if (search.nit) {
    try {
      parsedNit = Number.parseInt(search.nit);
      if (isNaN(parsedNit)) throw new Error("Invalid NIT number");
    } catch (error) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTitle>Invalid Input</AlertTitle>
            <AlertDescription>Invalid NIT number format</AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  // Fetch filter options with FY filtering
  const [nitOptions, financialYears, fundTypes] = await Promise.all([
    // NIT Options filtered by FY
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
          .filter(Boolean)
      ),

    // Financial Years from all memoDates
    db.nitDetails
      .findMany({
        distinct: ["memoDate"],
        select: { memoDate: true },
      })
      .then((dates) => {
        const years = dates.map((d) => getFinancialYear(d.memoDate));
        if (!years.includes(currentFY)) years.push(currentFY);
        return Array.from(new Set(years)).sort((a, b) =>
          b.localeCompare(a, undefined, { numeric: true })
        );
      }),

    // Fund Types
    db.approvedActionPlanDetails
      .findMany({
        distinct: ["schemeName"],
        select: { schemeName: true },
        orderBy: { schemeName: "asc" },
      })
      .then((schemes) =>
        schemes
          .filter((s) => s.schemeName)
          .map((s) => ({ schemeName: s.schemeName! }))
      ),
  ]);

  // Date filter for works query
  const dateFilter = {
    nitDetails: {
      memoDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  };

  // Fetch works with filters
  const works = await db.worksDetail.findMany({
    where: {
      ...dateFilter,
      ...(parsedNit !== undefined && {
        nitDetails: { memoNumber: parsedNit },
      }),
      ...(search.fundType && {
        ApprovedActionPlanDetails: { schemeName: search.fundType },
      }),
      tenderStatus: { in: ["AOC"] },
    },
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

  // Summary calculations
  const summary = processedWorks.reduce((acc, work) => {
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
  }, {} as Record<string, any>);

  const grandTotalPaid = Object.values(summary).reduce(
    (sum: number, item: any) => sum + item.totalPaid,
    0
  );
  const grandTotalPending = Object.values(summary).reduce(
    (sum: number, item: any) => sum + item.totalPending,
    0
  );

  // Calculate total works
  const totalWorks = processedWorks.length;

  return (
    <div className="p-4 space-y-6">
      <Suspense fallback={<FilterSkeleton />}>
        <CombinedFilter
          nitOptions={nitOptions}
          financialYears={financialYears}
          fundTypes={fundTypes}
          selectedNit={search.nit}
          selectedFundType={search.fundType}
          selectedYear={effectiveYear}
        />
      </Suspense>

      <SummaryCard
        summaryData={summary}
        grandTotalPaid={grandTotalPaid}
        grandTotalPending={grandTotalPending}
        totalWorks={totalWorks}
      />

      

      {/* <DataTable data={processedWorks} columns={columns} /> */}
    </div>
  );
};

export default Fundstatus;
