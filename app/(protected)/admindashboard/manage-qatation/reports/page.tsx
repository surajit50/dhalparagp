"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, TrendingUp, Download, BarChart3, PieChart, FileText, Calendar } from "lucide-react"

const reportTypes = [
  {
    title: "Quotation Summary Report",
    description: "Overview of all quotations by status and type",
    icon: BarChart3,
    color: "bg-blue-500",
    data: "24 Total, 18 Published, 6 Draft",
  },
  {
    title: "Financial Report",
    description: "Budget utilization and expenditure analysis",
    icon: TrendingUp,
    color: "bg-green-500",
    data: "₹5.2L Budget, ₹3.8L Utilized",
  },
  {
    title: "Bidder Performance",
    description: "Bidder participation and success rates",
    icon: PieChart,
    color: "bg-purple-500",
    data: "45 Bidders, 78% Success Rate",
  },
  {
    title: "Monthly Activity",
    description: "Month-wise quotation and order statistics",
    icon: Calendar,
    color: "bg-orange-500",
    data: "12 This Month, 8 Completed",
  },
  {
    title: "Work Category Analysis",
    description: "Analysis by work type (Supply/Work/Sale)",
    icon: FileText,
    color: "bg-teal-500",
    data: "60% Supply, 30% Work, 10% Sale",
  },
  {
    title: "Compliance Report",
    description: "Audit trail and compliance tracking",
    icon: FileText,
    color: "bg-red-500",
    data: "100% Compliant, 0 Issues",
  },
]

export default function ReportsPage() {
  const handleDownloadReport = (reportType: string) => {
    alert(`Downloading ${reportType} report...`)
  }

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Reports & Analytics
            </CardTitle>
            <CardDescription>Generate detailed reports and analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportTypes.map((report) => {
                const Icon = report.icon
                return (
                  <Card key={report.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                      <div className="text-sm font-medium text-gray-600 mt-2">{report.data}</div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          View Report
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report.title)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">₹5.2L</div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <div className="text-xs text-green-600 mt-1">+12% from last year</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">₹3.8L</div>
              <p className="text-sm text-muted-foreground">Utilized</p>
              <div className="text-xs text-blue-600 mt-1">73% utilization</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">24</div>
              <p className="text-sm text-muted-foreground">Total Quotations</p>
              <div className="text-xs text-green-600 mt-1">+8 this month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">78%</div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <div className="text-xs text-green-600 mt-1">+5% improvement</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
