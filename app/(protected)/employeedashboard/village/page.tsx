"use client";

import { 
  MapPin, 
  Users, 
  Home, 
  Droplets, 
  GraduationCap, 
  UserCheck, 
  LayoutDashboard, 
  PieChart, 
  FileText, 
  Settings2, 
  ArrowRight,
  Database,
  Search,
  PlusCircle,
  Activity,
  ShieldCheck,
  Building2,
  Waves
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VillagePageHeader } from "@/components/village/VillagePageHeader";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { getVillageOverview, getMouzaList } from "@/action/villagemanage";
import { Badge } from "@/components/ui/badge";

export default function VillageDashboardPage() {
  const [overview, setOverview] = useState<any[]>([]);
  const [mouzas, setMouzas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [overviewRes, mouzasData] = await Promise.all([
        getVillageOverview(),
        getMouzaList()
      ]);
      if (overviewRes.success) setOverview(overviewRes.data || []);
      setMouzas(mouzasData || []);
      setLoading(false);
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalPopulation = overview.reduce((acc, curr) => acc + (curr.totalPopulation || 0), 0);
    const totalHouseholds = overview.reduce((acc, curr) => acc + (curr.householdCount || 0), 0);
    return [
      { label: "Administrative Mouzas", value: mouzas.length, icon: MapPin, color: "text-orange-600", bg: "bg-orange-50" },
      { label: "Total Residents", value: totalPopulation, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "Recorded Households", value: totalHouseholds, icon: Home, color: "text-purple-600", bg: "bg-purple-50" },
      { label: "Active Constituencies", value: 12, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" }, // Placeholder for Sansad count
    ];
  }, [overview, mouzas]);

  const modules = [
    {
      title: "Village Directory",
      description: "Comprehensive list of all villages with demographic and infrastructure summaries.",
      icon: LayoutDashboard,
      link: "/employeedashboard/village/view",
      color: "blue",
      category: "Intelligence"
    },
    {
      title: "Mouza Registry",
      description: "Manage official mouza names, J.L. numbers, and administrative boundaries.",
      icon: MapPin,
      link: "/employeedashboard/village/mouza",
      color: "indigo",
      category: "Governance"
    },
    {
      title: "Sansad Management",
      description: "Configure and manage sansad constituencies and administrative records.",
      icon: Building2,
      link: "/employeedashboard/village/sansad",
      color: "slate",
      category: "Governance"
    },
    {
      title: "Personnel Database",
      description: "Maintain records of village members, contact details, and assigned roles.",
      icon: UserCheck,
      link: "/employeedashboard/village/member",
      color: "purple",
      category: "Personnel"
    },
    {
      title: "Demographic Entry",
      description: "Record detailed population data including gender and religious distributions.",
      icon: Users,
      link: "/employeedashboard/village/population",
      color: "emerald",
      category: "Census"
    },
    {
      title: "Census Summary",
      description: "View aggregated population statistics and social category breakdowns.",
      icon: PieChart,
      link: "/employeedashboard/village/population-summary",
      color: "teal",
      category: "Census"
    },
    {
      title: "Voter Registry",
      description: "Manage polling station data and voter demographics for elections.",
      icon: ShieldCheck,
      link: "/employeedashboard/village/voter",
      color: "rose",
      category: "Electoral"
    },
    {
      title: "Sanitation Audit",
      description: "Monitor IHHL coverage and individual household latrine availability.",
      icon: Home,
      link: "/employeedashboard/village/toilet",
      color: "orange",
      category: "Infrastructure"
    },
    {
      title: "Water Resources",
      description: "Track drinking water sources including tap water, pumps, and wells.",
      icon: Waves,
      link: "/employeedashboard/village/water",
      color: "sky",
      category: "Infrastructure"
    },
    {
      title: "Educational Assets",
      description: "Monitor schools, libraries, and educational institutions across the GP.",
      icon: GraduationCap,
      link: "/employeedashboard/village/education",
      color: "violet",
      category: "Infrastructure"
    },
    {
      title: "Analytical Reports",
      description: "Generate comprehensive reports and export data for official use.",
      icon: FileText,
      link: "/employeedashboard/village/reports",
      color: "cyan",
      category: "Analytics"
    },
    {
      title: "Data Maintenance",
      description: "Quickly update and correct administrative records and J.L. numbers.",
      icon: Settings2,
      link: "/employeedashboard/village/update",
      color: "gray",
      category: "Admin"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-10">
      <VillagePageHeader
        title="Village Operations Hub"
        description="Central management system for GP demographics, infrastructure, and administrative intelligence."
        icon={Database}
        gradientFrom="from-slate-800"
        gradientTo="to-slate-900"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-lg shadow-gray-200/50 rounded-3xl overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-black text-gray-900">
                      {loading ? "..." : stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={cn("p-4 rounded-2xl", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Module Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <PlusCircle className="h-6 w-6 mr-2 text-orange-600" />
            Management Modules
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span>All Systems Operational</span>
          </div>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
         
        >
          {modules.map((mod, i) => (
            <motion.div key={i} variants={item}>
              <Link href={mod.link}>
                <Card className="group h-full border-none shadow-md shadow-gray-100/50 rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 hover:-translate-y-2 flex flex-col">
                  <div className={cn(
                    "h-2 w-full",
                    `bg-${mod.color}-500`
                  )} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                        `bg-${mod.color}-50 text-${mod.color}-600`
                      )}>
                        <mod.icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="bg-gray-50 text-gray-400 border-none text-[10px] uppercase font-bold tracking-tighter">
                        {mod.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                      {mod.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <CardDescription className="text-gray-500 text-sm leading-relaxed mb-6">
                      {mod.description}
                    </CardDescription>
                    <div className="flex items-center text-xs font-bold text-orange-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                      Explore Module
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Decorative background element */}
      <div className="fixed bottom-[-100px] right-[-100px] w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-[20%] left-[-100px] w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
    </div>
  );
}
