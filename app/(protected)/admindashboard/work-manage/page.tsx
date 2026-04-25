"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calculator,
  FileText,
  BookOpen,
  CreditCard,
  Eye,
  PlusCircle,
  Upload,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DashboardStats {
  totalWorks: number;
  estimatesCreated: number;
  mbEntries: number;
  billsGenerated: number;
}

const quickActions = [
  {
    title: "Estimate Preparation",
    description: "Create detailed work estimates with measurements",
    href: "/admindashboard/work-manage/(estimate_bii)/estimate-preparation",
    icon: Calculator,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    badge: "Start Here",
  },
  {
    title: "MB Create",
    description: "Record measurement book entries",
    href: "/admindashboard/work-manage/(estimate_bii)/mb-create",
    icon: BookOpen,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
  },
  {
    title: "Bill Abstract",
    description: "Generate bill abstracts from MB",
    href: "/admindashboard/work-manage/(estimate_bii)/bill-abstract",
    icon: FileText,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
  },
  {
    title: "Bill Deduction",
    description: "Apply deductions and calculate net payable",
    href: "/admindashboard/work-manage/(estimate_bii)/bill-deduction",
    icon: CreditCard,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
  },
];

const workflowSteps = [
  { step: 1, title: "Estimate Preparation", icon: Calculator, status: "active" },
  { step: 2, title: "MB Create", icon: BookOpen, status: "pending" },
  { step: 3, title: "Bill Abstract", icon: FileText, status: "pending" },
  { step: 4, title: "Bill Deduction", icon: CreditCard, status: "pending" },
];

export default function WorkManageDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalWorks: 0,
    estimatesCreated: 0,
    mbEntries: 0,
    billsGenerated: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [worksRes, estimatesRes, mbRes, billsRes] = await Promise.all([
        fetch("/api/works"),
        fetch("/api/work-estimate-items"),
        fetch("/api/work-measurement-books"),
        fetch("/api/work-bill-abstracts"),
      ]);

      const works = await worksRes.json();
      const estimates = await estimatesRes.json();
      const mbs = await mbRes.json();
      const bills = await billsRes.json();

      setStats({
        totalWorks: Array.isArray(works) ? works.length : 0,
        estimatesCreated: Array.isArray(estimates) ? estimates.length : 0,
        mbEntries: Array.isArray(mbs) ? mbs.length : 0,
        billsGenerated: Array.isArray(bills) ? bills.length : 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const completionPercentage = stats.totalWorks > 0 
    ? Math.round((stats.billsGenerated / stats.totalWorks) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Work Management Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage estimates, measurements, and billing all in one place
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/admindashboard/work-manage/view">
                <Eye className="h-4 w-4" />
                View All Works
              </Link>
            </Button>
            <Button asChild className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-md hover:shadow-lg">
              <Link href="/admindashboard/work-manage/add">
                <PlusCircle className="h-4 w-4" />
                Add New Work
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium text-gray-500 uppercase">
                Total Works
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-gray-800">
                {loading ? "..." : stats.totalWorks}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>Active projects</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium text-gray-500 uppercase">
                Estimates Created
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-gray-800">
                {loading ? "..." : stats.estimatesCreated}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <Calculator className="h-4 w-4" />
                <span>Work estimates</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium text-gray-500 uppercase">
                MB Entries
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-gray-800">
                {loading ? "..." : stats.mbEntries}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <BookOpen className="h-4 w-4" />
                <span>Measurements recorded</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium text-gray-500 uppercase">
                Bills Generated
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-gray-800">
                {loading ? "..." : stats.billsGenerated}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <FileText className="h-4 w-4" />
                <span>Completed bills</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Overall Progress
            </CardTitle>
            <CardDescription>
              Track the completion rate of your work management workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Workflow Completion</span>
              <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3 bg-gray-200" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{stats.billsGenerated} bills completed</span>
              <span>{stats.totalWorks - stats.billsGenerated} pending</span>
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Recommended Workflow
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card className={`${action.bgColor} border-2 border-transparent hover:border-current transition-all duration-300 hover:shadow-lg cursor-pointer group h-full`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-md group-hover:shadow-lg transition-shadow`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {action.badge && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-4 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full justify-between group-hover:bg-white/50">
                        Start
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recommended Workflow
            </CardTitle>
            <CardDescription>
              Follow these steps in order for the best results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {workflowSteps.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === workflowSteps.length - 1;
                return (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                          {item.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Icon className="h-5 w-5 text-gray-400 mb-1" />
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!isLast && (
                      <ArrowRight className="h-5 w-5 text-gray-300 hidden md:block flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="h-5 w-5" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-700 text-sm font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-sm text-gray-700">
                  Add or upload your approved action plans first
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-700 text-sm font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-sm text-gray-700">
                  Create estimates for each work with detailed measurements
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-700 text-sm font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-sm text-gray-700">
                  Record actual measurements in the Measurement Book
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-700 text-sm font-bold flex-shrink-0">
                  4
                </div>
                <p className="text-sm text-gray-700">
                  Generate bill abstracts and apply necessary deductions
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <TrendingUp className="h-5 w-5" />
                Tips & Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Always save your work before generating PDFs
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Use the WorkSearchAndSelect component for easy work selection
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Complete measurements in MB before creating bill abstracts
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Review all deductions carefully before finalizing bills
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
