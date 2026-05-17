// components/GramPanchayatStats.tsx
import { Users, MapPin, IndianRupee, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma"; // Adjust the import path to your Prisma client

// Type for the stats data
interface GramPanchayatStatsData {
  totalPopulation: number;
  villagesCovered: number;
  annualBudget: number;
  projectsCompleted: number;
}

// Function to fetch statistics from the database
async function fetchGramPanchayatStats(): Promise<GramPanchayatStatsData> {
  try {
    // 1. Total Population: Sum of male + female from all non-draft VillagePopulation records
    //    linked to non-draft VillageInfo.
    const populationResult = await prisma.villageInfo.aggregate({
      where: {
        isDraft: false,
        villagePopulation: {
          isNot: null,
        },
      },
      _sum: {
        villagePopulation: {
          male: true,
          female: true,
        },
      },
    });

    // Since _sum on nested relation returns nested object, we need to sum the values
    const totalPopulation =
      (populationResult._sum?.villagePopulation?.male || 0) +
      (populationResult._sum?.villagePopulation?.female || 0);

    // 2. Villages Covered: Count of non-draft VillageInfo records
    const villagesCovered = await prisma.villageInfo.count({
      where: { isDraft: false },
    });

    // 3. Annual Budget: Try to get from Statistic model first, then fallback to FundAvailability
    let annualBudget = 0;

    // Check if Statistic model has annual budget
    const budgetStat = await prisma.statistic.findUnique({
      where: { name: "annual_budget" },
    });

    if (budgetStat && budgetStat.value > 0) {
      annualBudget = budgetStat.value;
    } else {
      // Fallback: Use FundAvailability for current financial year (e.g., "2025-26")
      const currentYear = getCurrentFinancialYear();
      const fundData = await prisma.fundAvailability.findMany({
        where: { year: currentYear },
      });

      // Sum opening balance + direct receipts + auto receipts as total available budget
      annualBudget = fundData.reduce((total, fund) => {
        return (
          total +
          (fund.openingBalanceTotal || 0) +
          (fund.directReceiptTotal || 0) +
          (fund.autoReceiptTotal || 0)
        );
      }, 0);

      // If still zero, try to get from any year
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
    // Return default values on error
    return {
      totalPopulation: 0,
      villagesCovered: 0,
      annualBudget: 0,
      projectsCompleted: 0,
    };
  }
}

// Helper function to get current financial year (e.g., "2025-26")
function getCurrentFinancialYear(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = January)

  // Financial year starts from April
  if (currentMonth >= 3) {
    // April to December
    return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
  } else {
    // January to March
    return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
  }
}

// Format number with Indian numbering system (lakhs/crores)
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

// Format plain number with commas
function formatNumber(num: number): string {
  return num.toLocaleString("en-IN");
}

// Server Component (Next.js App Router)
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
