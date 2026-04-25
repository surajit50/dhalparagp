"use client"

import { CheckCircle, FileText, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
export default function Dashboard() {
  // Statistics data
  const stats = [
    { title: "Approved", value: "123", icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-100" },
    { title: "Apply", value: "123", icon: FileText, color: "text-blue-500", bgColor: "bg-blue-100" },
    { title: "Rejected", value: "5", icon: XCircle, color: "text-red-500", bgColor: "bg-red-100" },
  ]

  return (
    <main className="flex-1 overflow-auto py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here is a summary of your activities.</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "p-6 rounded-lg transition-all hover:shadow-md",
                stat.bgColor
              )}
            >
              <div className="flex items-center space-x-4">
                <div className={cn("p-3 rounded-full", stat.bgColor)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Content */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-600">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
