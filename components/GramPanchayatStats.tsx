// components/GramPanchayatStats.tsx
import { Users, MapPin, IndianRupee, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface GramPanchayatStatsData {
  totalPopulation: number;
  villagesCovered: number;
  annualBudget: number;
  projectsCompleted: number;
}

async function fetchGramPanchayatStats(): Promise<GramPanchayatStatsData> {
  try {
    // 1. Total Population: Sum from VillagePopulation linked to non‑draft VillageInfo
    const villageInfos = await prisma.villageInfo.findMany({
      where: {
        isDraft: false,
        villagePopulationId: { not: null },
      },
      include: {
        villagePopulation: true,
      },
    });

    let totalPopulation = 0;
    for (const vi of villageInfos) {
      if (vi.villagePopulation) {
        totalPopulation +=
          (vi.villagePopulation.male || 0) +
          (vi.villagePopulation.female || 0);
      }
    }

    // 2. Villages Covered: Count of non‑draft VillageInfo
    const villagesCovered = await prisma.villageInfo.count({
      where: { isDraft: false },
    });

    // 3. Annual Budget: Try Statistic model first, fallback to FundAvailability
    let annualBudget = 0;

    const budgetStat = await prisma.statistic.findUnique({
      where: { name: "annual_budget" },
    });

    if (budgetStat && budgetStat.value > 0) {
      annualBudget = budgetStat.value;
    } else {
      const currentYear = getCurrentFinancialYear();
      const fundData = await prisma.fundAvailability.findMany({
        where: { year: currentYear },
      });

      annualBudget = fundData.reduce((total, fund) => {
        return (
          total +
          (fund.openingBalanceTotal || 0) +
          (fund.directReceiptTotal || 0) +
          (fund.autoReceiptTotal || 0)
        );
      }, 0);

      // If still zero, sum across all years
      if (annualBudget === 0) {
        const allFunds = await prisma.fundAvailability.findMany();
        annualBudget = allFunds.reduce((total, fund) => {
          return (
            total +
            (fund.openingBalanceTotal || 0) +
            (fund.directReceiptTotal || 0) +
            (fund.autoReceiptTotal || 0)
          );
        }, 0);
      }
    }

    // 4. Projects Completed: Count of WorksDetail with workStatus = 'workcompleted'
    const projectsCompleted = await prisma.worksDetail.count({
      where: { workStatus: "workcompleted" },
    });

    return {
      totalPopulation,
      villagesCovered,
      annualBudget,
      projectsCompleted,
    };
  } catch (error) {
    console.error("Error fetching Gram Panchayat stats:", error);
    return {
      totalPopulation: 0,
      villagesCovered: 0,
      annualBudget: 0,
      projectsCompleted: 0,
    };
  }
}

function getCurrentFinancialYear(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  // Financial year starts in April
  if (currentMonth >= 3) {
    return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
  } else {
    return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
  }
}

function formatIndianNumber(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)}Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  } else if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }
  return `₹${num}`;
}

function formatNumber(num: number): string {
  return num.toLocaleString("en-IN");
}

export default async function GramPanchayatStats() {
  const stats = await fetchGramPanchayatStats();

  const statItems = [
    {
      value: formatNumber(stats.totalPopulation),
      label: "Total Population",
      icon: <Users size={24} />,
    },
    {
      value: formatNumber(stats.villagesCovered),
      label: "Villages Covered",
      icon: <MapPin size={24} />,
    },
    {
      value: formatIndianNumber(stats.annualBudget),
      label: "Annual Budget",
      icon: <IndianRupee size={24} />,
    },
    {
      value: `${formatNumber(stats.projectsCompleted)}+`,
      label: "Projects Completed",
      icon: <CheckCircle size={24} />,
    },
  ];

  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-nic-primary tracking-tight mb-3">
            Gram Panchayat at a Glance
          </h2>
          <div className="w-24 h-1 bg-nic-primary mx-auto rounded-full opacity-80"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className="bg-muted border border-border rounded-2xl p-6 text-center hover:bg-nic-bg transition-colors duration-300 group"
            >
              <div className="mx-auto w-12 h-12 bg-card rounded-full flex items-center justify-center text-nic-primary shadow-sm mb-4 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
