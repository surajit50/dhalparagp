"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Users,
  FileText,
  Download,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const meetingTypes = [
  {
    value: "UPASAMITY",
    label: "Upasamity",
    color: "bg-blue-100 text-blue-800",
  },
  { value: "GENERAL", label: "General", color: "bg-green-100 text-green-800" },
  { value: "ARTHO", label: "Artho", color: "bg-purple-100 text-purple-800" },
  {
    value: "SPECIAL_GRAM_SABHA",
    label: "Special Gram Sabha",
    color: "bg-orange-100 text-orange-800",
  },
  {
    value: "REGULAR_GRAM_SABHA",
    label: "Regular Gram Sabha",
    color: "bg-red-100 text-red-800",
  },
];

const financialYears = ["2024-25", "2025-26", "2026-27"];

// Mock data for demonstration
const mockStats = {
  totalMeetings: 45,
  completedMeetings: 38,
  scheduledMeetings: 5,
  cancelledMeetings: 2,
  averageAttendance: 187,
  totalResolutions: 156,
  totalDocuments: 234,
  quorumAchievement: 84,
};

const mockMonthlyData = [
  { month: "January", meetings: 4, attendance: 156, resolutions: 12 },
  { month: "February", meetings: 3, attendance: 142, resolutions: 8 },
  { month: "March", meetings: 5, attendance: 189, resolutions: 15 },
  { month: "April", meetings: 4, attendance: 167, resolutions: 11 },
  { month: "May", meetings: 3, attendance: 134, resolutions: 9 },
  { month: "June", meetings: 4, attendance: 178, resolutions: 13 },
];

const mockTypeDistribution = [
  { type: "Regular Gram Sabha", count: 24, percentage: 53 },
  { type: "Special Gram Sabha", count: 8, percentage: 18 },
  { type: "Upasamity", count: 6, percentage: 13 },
  { type: "Artho", count: 4, percentage: 9 },
  { type: "General", count: 3, percentage: 7 },
];

export default function MeetingReportsPage() {
  const [selectedYear, setSelectedYear] = useState("2024-25");
  const [selectedType, setSelectedType] = useState("ALL");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meeting Reports</h1>
          <p className="text-gray-600 mt-2">
            Analytics and insights for meeting management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {financialYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {meetingTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Meetings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockStats.totalMeetings}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockStats.completedMeetings}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Attendance
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {mockStats.averageAttendance}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolutions</p>
                <p className="text-2xl font-bold text-orange-600">
                  {mockStats.totalResolutions}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMonthlyData.map((data, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{data.month}</p>
                      <p className="text-sm text-gray-600">
                        {data.meetings} meetings
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{data.attendance} attendees</p>
                    <p className="text-sm text-gray-600">
                      {data.resolutions} resolutions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Meeting Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5 text-green-600" />
              Meeting Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTypeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          index === 0
                            ? "#3B82F6"
                            : index === 1
                            ? "#10B981"
                            : index === 2
                            ? "#8B5CF6"
                            : index === 3
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    ></div>
                    <span className="font-medium">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.count}</p>
                    <p className="text-sm text-gray-600">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-purple-600" />
              Quorum Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {mockStats.quorumAchievement}%
              </div>
              <p className="text-sm text-gray-600">
                {mockStats.completedMeetings} out of {mockStats.totalMeetings}{" "}
                meetings achieved quorum
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${mockStats.quorumAchievement}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
              Meeting Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Completed</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {mockStats.completedMeetings}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Scheduled</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {mockStats.scheduledMeetings}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Cancelled</span>
                </div>
                <Badge className="bg-red-100 text-red-800">
                  {mockStats.cancelledMeetings}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-orange-600" />
              Document Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Documents</span>
                <Badge className="bg-orange-100 text-orange-800">
                  {mockStats.totalDocuments}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average per Meeting</span>
                <Badge variant="outline">
                  {Math.round(
                    mockStats.totalDocuments / mockStats.totalMeetings
                  )}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Resolutions</span>
                <Badge className="bg-green-100 text-green-800">
                  {mockStats.totalResolutions}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Meeting Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold">Monthly Gram Sabha Meeting</p>
                  <p className="text-sm text-gray-600">
                    Completed on February 15, 2025
                  </p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Completed</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold">Special Budget Review Meeting</p>
                  <p className="text-sm text-gray-600">
                    Scheduled for March 5, 2025
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-semibold">Upasamity Committee Meeting</p>
                  <p className="text-sm text-gray-600">
                    Completed on February 10, 2025
                  </p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800">Completed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
