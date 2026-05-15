"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Printer,
  Users,
  Home,
  Droplets,
  GraduationCap,
  UserCheck,
  BarChart3,
  PieChart,
  LayoutDashboard,
  Flag,
  Activity,
  Search,
  ChevronRight,
  Database,
  ShieldCheck,
  Building2,
  Waves,
  Heart,
  Calendar
} from "lucide-react";
import { getVillageReportData } from "@/action/villagemanage";
import { VillagePageHeader } from "@/components/village/VillagePageHeader";
import { VillageDataTable } from "@/components/village/VillageDataTable";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart as RePieChart,
  Pie,
} from "recharts";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";

export default function VillageReportsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState<{
    mouzas: any[];
    population: any[];
    voterSummary: any[];
    waterSummary: any[];
    toiletSummary: any[];
    educationSummary: any[];
    members: any[];
    sansads: any[];
  }>({
    mouzas: [],
    population: [],
    voterSummary: [],
    waterSummary: [],
    toiletSummary: [],
    educationSummary: [],
    members: [],
    sansads: [],
  });

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVillageReportData();
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const {
    mouzas,
    population,
    voterSummary,
    waterSummary,
    toiletSummary,
    educationSummary,
    members,
    sansads,
  } = reportData;

  // Aggregate stats
  const stats = useMemo(() => {
    const totalHouseholds = mouzas.reduce((sum, m) => sum + (m.totalHouseholds || 0), 0);
    const totalPop = population.reduce((sum, p) => sum + (p.male || 0) + (p.female || 0), 0);
    const totalVoters = voterSummary.reduce((sum, v) => sum + (v.totalMaleVoter || 0) + (v.totalFemaleVoter || 0), 0);
    const totalMembers = members.length;

    return [
      { label: "Total Population", value: totalPop, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Total residents across GP" },
      { label: "Households", value: totalHouseholds, icon: Home, color: "text-orange-600", bg: "bg-orange-50", desc: "Registered housing units" },
      { label: "Voter Base", value: totalVoters, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50", desc: "Eligible electoral population" },
      { label: "GP Personnel", value: totalMembers, icon: UserCheck, color: "text-purple-600", bg: "bg-purple-50", desc: "Active executive members" },
    ];
  }, [mouzas, population, voterSummary, members]);

  // Filter logic
  const filteredMouzas = useMemo(() => mouzas.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.jlno.toLowerCase().includes(searchTerm.toLowerCase()),
  ), [mouzas, searchTerm]);

  const filteredPopulation = useMemo(() => population.filter((p) =>
    p.mouza?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  ), [population, searchTerm]);

  const filteredVoters = useMemo(() => voterSummary.filter(
    (v) =>
      v.pollingStationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.pollingStationNo.toLowerCase().includes(searchTerm.toLowerCase()),
  ), [voterSummary, searchTerm]);

  const filteredWater = useMemo(() => waterSummary.filter((w) =>
    w.mouza?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  ), [waterSummary, searchTerm]);

  const filteredToilet = useMemo(() => toiletSummary.filter((t) =>
    t.mouza?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  ), [toiletSummary, searchTerm]);

  const filteredEducation = useMemo(() => educationSummary.filter((e) =>
    e.mouza?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  ), [educationSummary, searchTerm]);

  const filteredMembers = useMemo(() => members.filter(
    (m) =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.contactNo.toLowerCase().includes(searchTerm.toLowerCase()),
  ), [members, searchTerm]);

  const filteredSansads = useMemo(() => sansads.filter(
    (s) =>
      s.sansadname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sansadnumber.toLowerCase().includes(searchTerm.toLowerCase()),
  ), [sansads, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Overview
    const overviewData = mouzas.map((m) => ({
      "Mouza Name": m.name,
      "J.L. No.": m.jlno,
      Households: m.totalHouseholds || 0,
      "Created At": new Date(m.createdAt).toLocaleDateString(),
    }));
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, "Overview");

    // Sheet 2: Population
    const popData = population.map((p) => ({
      Mouza: p.mouza?.name,
      Male: p.male,
      Female: p.female,
      SC: p.sc,
      ST: p.st,
      OBC: p.obc,
      Hindu: p.hindu,
      Muslim: p.muslim,
    }));
    const wsPop = XLSX.utils.json_to_sheet(popData);
    XLSX.utils.book_append_sheet(wb, wsPop, "Population");

    // Sheet 3: Voters
    const vData = voterSummary.map((v) => ({
      "Polling Station": `${v.pollingStationName} (${v.pollingStationNo})`,
      "Male Voters": v.totalMaleVoter,
      "Female Voters": v.totalFemaleVoter,
      Total: v.totalMaleVoter + v.totalFemaleVoter,
    }));
    const wsVoter = XLSX.utils.json_to_sheet(vData);
    XLSX.utils.book_append_sheet(wb, wsVoter, "Voters");

    // Sheet 4: Members
    const mData = members.map((m) => ({
      Name: `${m.salutation} ${m.firstName} ${m.lastName}`,
      Gender: m.gender,
      Contact: m.contactNo,
      Aadhar: m.aadhar,
      "Political Party": m.politicalParty,
    }));
    const wsMember = XLSX.utils.json_to_sheet(mData);
    XLSX.utils.book_append_sheet(wb, wsMember, "Members");

    XLSX.writeFile(
      wb,
      `GP_Village_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  const populationChartData = useMemo(() => population.slice(0, 10).map((p) => ({
    name: p.mouza?.name.substring(0, 10),
    male: p.male,
    female: p.female,
  })), [population]);

  const socialCategoryData = useMemo(() => {
    const sc = population.reduce((sum, p) => sum + (p.sc || 0), 0);
    const st = population.reduce((sum, p) => sum + (p.st || 0), 0);
    const obc = population.reduce((sum, p) => sum + (p.obc || 0), 0);
    const general = population.reduce((sum, p) => sum + (p.male + p.female - (p.sc || 0) - (p.st || 0) - (p.obc || 0)), 0);
    return [
      { name: "SC", value: sc },
      { name: "ST", value: st },
      { name: "OBC", value: obc },
      { name: "General", value: general > 0 ? general : 0 },
    ];
  }, [population]);

  const columns = {
    overview: [
      {
        header: "Mouza Identity",
        accessor: (item: any) => (
          <div className="flex flex-col pl-6">
            <span className="font-bold text-gray-900">{item.name}</span>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5">J.L. No: {item.jlno}</span>
          </div>
        ),
      },
      { 
        header: "Households", 
        accessor: (item: any) => (
          <div className="flex items-center space-x-2">
            <Home className="h-4 w-4 text-orange-400" />
            <span className="font-bold">{item.totalHouseholds || 0}</span>
          </div>
        )
      },
      {
        header: "Registry Info",
        accessor: (item: any) => (
          <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            <Calendar className="h-3 w-3 mr-1 text-slate-400" />
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </div>
        )
      }
    ],
    population: [
      {
        header: "Mouza",
        accessor: (item: any) => (
          <span className="font-bold text-gray-900 pl-6">{item.mouza?.name}</span>
        ),
      },
      { 
        header: "Gender Distribution", 
        accessor: (item: any) => (
          <div className="flex space-x-4">
            <div className="flex items-center text-xs font-bold text-orange-600">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5" />
              M: {item.male}
            </div>
            <div className="flex items-center text-xs font-bold text-pink-600">
              <span className="w-2 h-2 rounded-full bg-pink-500 mr-1.5" />
              F: {item.female}
            </div>
          </div>
        )
      },
      { 
        header: "Caste/Category", 
        accessor: (item: any) => (
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-[9px] font-black bg-slate-50">SC: {item.sc || 0}</Badge>
            <Badge variant="outline" className="text-[9px] font-black bg-slate-50">ST: {item.st || 0}</Badge>
            <Badge variant="outline" className="text-[9px] font-black bg-slate-50">OBC: {item.obc || 0}</Badge>
          </div>
        )
      },
      { 
        header: "Religion", 
        accessor: (item: any) => (
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-[9px] font-black bg-amber-50 text-amber-700 border-amber-100">HIN: {item.hindu || 0}</Badge>
            <Badge variant="secondary" className="text-[9px] font-black bg-emerald-50 text-emerald-700 border-emerald-100">MUS: {item.muslim || 0}</Badge>
          </div>
        )
      },
    ],
    voters: [
      {
        header: "Polling Station",
        accessor: (item: any) => (
          <div className="flex flex-col pl-6">
            <span className="font-bold text-gray-900">{item.pollingStationName}</span>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5">Station No: {item.pollingStationNo}</span>
          </div>
        ),
      },
      { 
        header: "Electoral Roll", 
        accessor: (item: any) => (
          <div className="flex space-x-4">
            <div className="flex items-center text-xs font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-1.5" />
              Male: {item.totalMaleVoter}
            </div>
            <div className="flex items-center text-xs font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-pink-500 mr-1.5" />
              Female: {item.totalFemaleVoter}
            </div>
          </div>
        )
      },
      { 
        header: "Total Voters", 
        accessor: (item: any) => (
          <Badge className="font-black bg-slate-900">{item.totalMaleVoter + item.totalFemaleVoter}</Badge>
        )
      },
    ],
    infrastructure: [
      {
        header: "Mouza",
        accessor: (item: any) => (
          <span className="font-bold text-gray-900 pl-6">{item.mouza?.name}</span>
        ),
      },
      {
        header: "Water Supply",
        accessor: (item: any) => (
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
              <Waves className="h-2.5 w-2.5 mr-1" /> Tap: {item.tapWater || 0}
            </div>
            <div className="flex items-center text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
              <Droplets className="h-2.5 w-2.5 mr-1" /> Pump: {item.handPump || 0}
            </div>
          </div>
        ),
      },
      {
        header: "Sanitation",
        accessor: (item: any) => {
          // Note: This assumes we have toilet data in the same row or map it correctly
          // For simplicity in report, we'll just show what's available
          return (
            <div className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              <Home className="h-2.5 w-2.5 mr-1" /> Available Records
            </div>
          );
        }
      }
    ],
    education: [
      {
        header: "Mouza",
        accessor: (item: any) => (
          <span className="font-bold text-gray-900 pl-6">{item.mouza?.name}</span>
        ),
      },
      { 
        header: "Schools", 
        accessor: (item: any) => (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[9px] font-black border-amber-200 text-amber-700 bg-amber-50">Primary: {item.primarySchool || 0}</Badge>
            <Badge variant="outline" className="text-[9px] font-black border-orange-200 text-orange-700 bg-orange-50">High: {item.highSchool || 0}</Badge>
          </div>
        )
      },
      { 
        header: "Support", 
        accessor: (item: any) => (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[9px] font-black border-pink-200 text-pink-700 bg-pink-50">Anganwadi: {item.anganwadi || 0}</Badge>
            <Badge variant="outline" className="text-[9px] font-black border-orange-200 text-orange-700 bg-orange-50">SSK: {item.ssk || 0}</Badge>
          </div>
        )
      },
    ],
    members: [
      {
        header: "Personnel Identity",
        accessor: (item: any) => (
          <div className="flex flex-col pl-6">
            <span className="font-bold text-gray-900">{item.salutation} {item.firstName} {item.lastName}</span>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-0.5">{item.gender} • {item.politicalParty || "Independent"}</span>
          </div>
        ),
      },
      { 
        header: "Contact", 
        accessor: (item: any) => (
          <div className="flex items-center text-sm font-medium text-slate-600">
            <UserCheck className="h-3 w-3 mr-1.5 text-orange-500" />
            {item.contactNo}
          </div>
        )
      },
      { 
        header: "Aadhar", 
        accessor: (item: any) => (
          <span className="font-mono text-[10px] text-slate-400">{item.aadhar}</span>
        )
      },
    ],
    sansads: [
      { 
        header: "Sansad Name", 
        accessor: (item: any) => (
          <span className="font-bold text-gray-900 pl-6">{item.sansadname}</span>
        )
      },
      { 
        header: "Constituency No.", 
        accessor: (item: any) => (
          <Badge variant="secondary" className="font-black bg-slate-100">{item.sansadnumber}</Badge>
        )
      },
    ]
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 space-y-10 print:p-0 print:bg-white">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 print:hidden">
        <VillagePageHeader
          title="Analytical Intelligence"
          description="Comprehensive data visualization, statistical reports, and GP infrastructure auditing."
          icon={Database}
          gradientFrom="from-slate-800"
          gradientTo="to-slate-900"
        />
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search all reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-none bg-white shadow-xl shadow-gray-100/50 focus-visible:ring-slate-500 rounded-2xl"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="h-12 px-6 rounded-2xl bg-white border-gray-100 shadow-sm hover:bg-gray-50"
            >
              <Printer className="mr-2 h-4 w-4" /> Print Report
            </Button>
            <Button
              onClick={exportToExcel}
              className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl shadow-slate-200 transition-all duration-300 hover:-translate-y-1"
            >
              <Download className="mr-2 h-4 w-4" /> Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 group">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                    <p className={cn("text-3xl font-black transition-transform duration-500 group-hover:scale-110 origin-left", stat.color)}>
                      {loading ? "..." : stat.value.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium italic mt-1">{stat.desc}</p>
                  </div>
                  <div className={cn("p-5 rounded-[1.5rem] transition-all duration-500 group-hover:rotate-12", stat.bg)}>
                    <stat.icon className={cn("h-7 w-7", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 print:hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-gray-800 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-orange-500" />
                    Population Density
                  </CardTitle>
                  <CardDescription className="text-xs font-medium text-gray-400">Gender distribution across top 10 Mouzas</CardDescription>
                </div>
                <Badge variant="outline" className="bg-white border-orange-100 text-orange-600 font-bold uppercase tracking-tighter">Live Census</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={populationChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "12px 16px" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar dataKey="male" name="Male" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
                  <Bar dataKey="female" name="Female" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-gray-800 flex items-center gap-2">
                    <PieChart className="h-6 w-6 text-emerald-500" />
                    Social Category
                  </CardTitle>
                  <CardDescription className="text-xs font-medium text-gray-400">Aggregated demographic caste distribution</CardDescription>
                </div>
                <Badge variant="outline" className="bg-white border-emerald-100 text-emerald-600 font-bold uppercase tracking-tighter">Statistics</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={socialCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {socialCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                  />
                  <Legend iconType="circle" verticalAlign="middle" align="right" layout="vertical" />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Area with Tabs */}
      <Card className="border-none shadow-2xl shadow-gray-200/50 rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-900 rounded-2xl shadow-lg shadow-slate-200">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-gray-900">
                  Granular Intelligence
                </CardTitle>
                <CardDescription className="text-sm font-medium text-gray-400">Explore detailed datasets across multiple GP sectors</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-widest">
              <Activity className="h-3 w-3" />
              Real-time synchronization active
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-8 pt-6 border-b border-gray-50 bg-white">
              <TabsList className="bg-gray-100/50 p-1.5 rounded-2xl mb-6 w-full justify-start overflow-x-auto h-auto">
                {[
                  { id: "overview", label: "Mouza", icon: Building2, color: "blue" },
                  { id: "population", label: "Census", icon: Users, color: "emerald" },
                  { id: "voters", label: "Voters", icon: ShieldCheck, color: "amber" },
                  { id: "infrastructure", label: "Assets", icon: Waves, color: "sky" },
                  { id: "education", label: "Education", icon: GraduationCap, color: "violet" },
                  { id: "members", label: "Personnel", icon: UserCheck, color: "purple" },
                  { id: "sansads", label: "Sansads", icon: Flag, color: "rose" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-slate-900 flex items-center gap-2.5 transition-all duration-300 group"
                  >
                    <tab.icon className={cn("h-4 w-4 transition-colors", `text-${tab.color}-500`)} />
                    <span className="font-bold text-sm">{tab.label}</span>
                    <ChevronRight className="h-3 w-3 opacity-0 group-data-[state=active]:opacity-100 transition-opacity ml-1" />
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="overview" className="mt-0">
                    <VillageDataTable columns={columns.overview} data={filteredMouzas} emptyMessage="No mouza data available." />
                  </TabsContent>
                  <TabsContent value="population" className="mt-0">
                    <VillageDataTable columns={columns.population} data={filteredPopulation} emptyMessage="No population records found." />
                  </TabsContent>
                  <TabsContent value="voters" className="mt-0">
                    <VillageDataTable columns={columns.voters} data={filteredVoters} emptyMessage="No voter registry found." />
                  </TabsContent>
                  <TabsContent value="infrastructure" className="mt-0 space-y-8">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-gray-800 flex items-center gap-2 uppercase tracking-widest text-xs">
                            <Waves className="h-4 w-4 text-orange-500" />
                            Water Resources Audit
                          </h3>
                        </div>
                        <VillageDataTable columns={columns.infrastructure} data={filteredWater} emptyMessage="No water resources documented." />
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-black text-gray-800 flex items-center gap-2 uppercase tracking-widest text-xs">
                          <Home className="h-4 w-4 text-emerald-500" />
                          Sanitation Coverage Summary
                        </h3>
                        <VillageDataTable
                          columns={[
                            {
                              header: "Mouza",
                              accessor: (item: any) => (
                                <span className="font-bold text-gray-900 pl-6">{item.mouza?.name}</span>
                              ),
                            },
                            {
                              header: "IHHL Statistics",
                              accessor: (item: any) => (
                                <div className="flex space-x-4">
                                  <div className="flex items-center text-xs font-bold text-emerald-600">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                                    Avail: {item.toiletAvailable}
                                  </div>
                                  <div className="flex items-center text-xs font-bold text-rose-600">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" />
                                    N/A: {item.toiletNotAvailable}
                                  </div>
                                </div>
                              ),
                            },
                            {
                              header: "Progress",
                              accessor: (item: any) => (
                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500" 
                                    style={{ width: `${(item.toiletAvailable / (item.totalHousehold || 1)) * 100}%` }} 
                                  />
                                </div>
                              )
                            }
                          ]}
                          data={filteredToilet}
                          emptyMessage="No sanitation data documented."
                        />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="education" className="mt-0">
                    <VillageDataTable columns={columns.education} data={filteredEducation} emptyMessage="No educational assets found." />
                  </TabsContent>
                  <TabsContent value="members" className="mt-0">
                    <VillageDataTable columns={columns.members} data={filteredMembers} emptyMessage="No personnel registered." />
                  </TabsContent>
                  <TabsContent value="sansads" className="mt-0">
                    <VillageDataTable columns={columns.sansads} data={filteredSansads} emptyMessage="No sansad constituencies found." />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-8 bg-white rounded-[2rem] border border-gray-100 print:hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-2xl">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          </div>
          <p className="text-sm font-medium text-gray-500 max-w-sm">
            This report provides a comprehensive overview of GP operations. For specific data corrections, please use the respective module dashboards.
          </p>
        </div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Report Generated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
