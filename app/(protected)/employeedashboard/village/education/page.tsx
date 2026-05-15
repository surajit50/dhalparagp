"use client"

import { CheckCircle, FileText, XCircle, Activity, Inbox } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  // Enhanced Statistics data with descriptive text
  const stats = [
    { 
      title: "Approved Applications", 
      value: "123", 
      description: "Processed successfully",
      icon: CheckCircle, 
      color: "text-emerald-600", 
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100"
    },
    { 
      title: "Pending Review", 
      value: "45", 
      description: "Awaiting action",
      icon: FileText, 
      color: "text-orange-600", 
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100"
    },
    { 
      title: "Rejected", 
      value: "5", 
      description: "Requires attention",
      icon: XCircle, 
      color: "text-rose-600", 
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100"
    },
  ]

  return (
    <main className="flex-1 overflow-auto py-8 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 mt-1">
              Welcome back! Here is a summary of your recent activities.
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-xl bg-white border border-slate-200 p-6 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              {/* Subtle top border accent */}
              <div className={cn("absolute top-0 left-0 w-full h-1", stat.color.replace('text-', 'bg-'))} />
              
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div className={cn("p-3 rounded-lg border", stat.bgColor, stat.borderColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
              
              <div className="mt-4 flex items-center text-sm text-slate-500">
                <span>{stat.description}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Content - Enhanced Empty State */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-semibold text-slate-900">
              Recent Activity
            </h2>
          </div>
          
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center transition-colors hover:bg-slate-50">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <Inbox className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No recent activity
            </h3>
            <p className="text-slate-500 max-w-sm text-sm">
              When you start processing applications, your recent actions will appear here.
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}
