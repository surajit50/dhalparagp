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
    // TOTAL POPULATION
    const villageInfos = await prisma.villageInfo.findMany({
      where: {
        isDraft: false,
      },
      include: {
        villagePopulation: true,
      },
    });

    const totalPopulation = villageInfos.reduce((total, village) => {
      return (
        total +
        (village.villagePopulation?.male || 0) +
        (village.villagePopulation?.female || 0)
      );
    }, 0);

    // VILLAGES COUNT
    const villagesCovered = await prisma.villageInfo.count({
      where: {
        isDraft: false,
      },
    });

    // ANNUAL BUDGET
    let annualBudget = 0;

    const budgetStat = await prisma.statistic.findFirst({
      where: {
        name: "annual_budget",
      },
    });

    if (budgetStat) {
      annualBudget = budgetStat.value || 0;
    }

    // PROJECTS COMPLETED
    const projectsCompleted = await prisma.worksDetail.count({
      where: {
        workStatus: "billpaid",
      },
    });

    return {
      totalPopulation,
      villagesCovered,
      annualBudget,
      projectsCompleted,
    };
  } catch (error) {
    console.error("Stats Error:", error);

    return {
      totalPopulation: 0,
      villagesCovered: 0,
      annualBudget: 0,
      projectsCompleted: 0,
    };
  }
}

function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

export default async function GramPanchayatStats() {
  const stats = await fetchGramPanchayatStats();

  const statItems = [
    {
      value: formatIndianNumber(stats.totalPopulation),
      label: "Total Population",
      icon: <Users className="h-6 w-6" />,
    },
    {
      value: formatIndianNumber(stats.villagesCovered),
      label: "Villages Covered",
      icon: <MapPin className="h-6 w-6" />,
    },
    {
      value: `₹${formatIndianNumber(stats.annualBudget)}`,
      label: "Annual Budget",
      icon: <IndianRupee className="h-6 w-6" />,
    },
    {
      value: formatIndianNumber(stats.projectsCompleted),
      label: "Projects Completed",
      icon: <CheckCircle className="h-6 w-6" />,
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border bg-card p-6 text-center shadow-sm"
            >
              <div className="flex justify-center mb-4 text-primary">
                {item.icon}
              </div>

              <h3 className="text-3xl font-bold mb-2">
                {item.value}
              </h3>

              <p className="text-muted-foreground text-sm">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
