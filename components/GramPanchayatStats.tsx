// components/GramPanchayatStats.tsx
import { Users, MapPin, IndianRupee, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface GramPanchayatStatsData {
  totalPopulation: number;
  mouzasCovered: number;
  annualBudget: number;
  projectsCompleted: number;
}

async function fetchGramPanchayatStats(): Promise<GramPanchayatStatsData> {
  try {
    // 1. TOTAL POPULATION – sum of male + female from PopulationSummary (linked to Mouzaname)
    //    If you want only current financial year, add a where clause (e.g., financialYear: "2025-26")
    const populationSummaries = await prisma.populationSummary.findMany({
      // Optionally filter by financialYear (uncomment if needed)
      // where: { financialYear: "2025-26" },
    });

    const totalPopulation = populationSummaries.reduce(
      (sum, ps) => sum + (ps.totalMale || 0) + (ps.totalFemale || 0),
      0
    );

    // 2. MOUZAS COVERED – count distinct Mouzaname records
    //    (add a where clause if you have an "isDraft" field or financialYear filter)
    const mouzasCovered = await prisma.mouzaname.count({
      // where: { isDraft: false }, // adapt based on actual schema
    });

    // 3. ANNUAL BUDGET – stored in Statistic table with name "annual_budget"
    let annualBudget = 0;
    const budgetStat = await prisma.statistic.findFirst({
      where: { name: "annual_budget" },
    });
    if (budgetStat) annualBudget = budgetStat.value || 0;

    // 4. PROJECTS COMPLETED – count WorksDetail with workStatus "billpaid"
    const projectsCompleted = await prisma.worksDetail.count({
      where: { workStatus: "billpaid" },
    });

    return {
      totalPopulation,
      mouzasCovered,
      annualBudget,
      projectsCompleted,
    };
  } catch (error) {
    console.error("Stats Error:", error);
    return {
      totalPopulation: 0,
      mouzasCovered: 0,
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
      value: formatIndianNumber(stats.mouzasCovered),
      label: "Mouzas Covered",   // Changed from "Villages Covered" to reflect actual schema
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
              <h3 className="text-3xl font-bold mb-2">{item.value}</h3>
              <p className="text-muted-foreground text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
