"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Clock,
  MapPin,
  Users,
  FileText,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
} from "lucide-react";
import Link from "next/link";

const meetingTypes = [
  {
    value: "UPASAMITY",
    label: "Upasamity",
    color: "bg-orange-100 text-orange-800",
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

const meetingStatuses = [
  {
    value: "SCHEDULED",
    label: "Scheduled",
    color: "bg-orange-100 text-orange-800",
    icon: Calendar,
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800",
    icon: Play,
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  {
    value: "POSTPONED",
    label: "Postponed",
    color: "bg-orange-100 text-orange-800",
    icon: AlertCircle,
  },
];

export default function MeetingManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeetings() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (selectedType && selectedType !== "all")
          params.append("type", selectedType);
        if (selectedStatus && selectedStatus !== "all")
          params.append("status", selectedStatus);
        if (selectedYear && selectedYear !== "all")
          params.append("financialYear", selectedYear);
        if (selectedMonth && selectedMonth !== "all")
          params.append("month", selectedMonth);
        if (searchTerm) params.append("search", searchTerm);
        params.append("limit", "100");
        const res = await fetch(`/api/meetings?${params.toString()}`);
        if (!res.ok) {
          throw new Error(
            (await res.json()).error || "Failed to fetch meetings",
          );
        }
        const data = await res.json();
        setMeetings(data.meetings || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch meetings");
      } finally {
        setLoading(false);
      }
    }
    fetchMeetings();
  }, [selectedType, selectedStatus, selectedYear, selectedMonth, searchTerm]);

  const getStatusIcon = (status: string) => {
    const statusObj = meetingStatuses.find((s) => s.value === status);
    return statusObj ? statusObj.icon : Calendar;
  };

  const getStatusColor = (status: string) => {
    const statusObj = meetingStatuses.find((s) => s.value === status);
    return statusObj ? statusObj.color : "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type: string) => {
    const typeObj = meetingTypes.find((t) => t.value === type);
    return typeObj ? typeObj.color : "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type: string) => {
    const typeObj = meetingTypes.find((t) => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getStatusLabel = (status: string) => {
    const statusObj = meetingStatuses.find((s) => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Statistics
  const totalMeetings = meetings.length;
  const scheduledCount = meetings.filter(
    (m) => m.status === "SCHEDULED",
  ).length;
  const completedCount = meetings.filter(
    (m) => m.status === "COMPLETED",
  ).length;
  const publishedCount = meetings.filter((m) => m.isPublished).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Meeting Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all Gram Sabha meetings and related activities
          </p>
        </div>
        <Link href="/admindashboard/meeting-manage/add-meeting">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Add New Meeting
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Meetings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMeetings}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-orange-600">
                  {scheduledCount}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {completedCount}
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
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-purple-600">
                  {publishedCount}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-gray-600" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Meeting Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {meetingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {meetingStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Financial Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  <SelectItem value="2023-24">2023-24</SelectItem>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2025-26">2025-26</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("all");
                  setSelectedStatus("all");
                  setSelectedYear("all");
                  setSelectedMonth("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meetings List */}
      <Card>
        <CardHeader>
          <CardTitle>Meetings ({meetings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading meetings...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => {
                const StatusIcon = getStatusIcon(meeting.status);
                return (
                  <div
                    key={meeting.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {meeting.title}
                          </h3>
                          <Badge className={getTypeColor(meeting.meetingType)}>
                            {getTypeLabel(meeting.meetingType)}
                          </Badge>
                          <Badge className={getStatusColor(meeting.status)}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {getStatusLabel(meeting.status)}
                          </Badge>
                          {meeting.isPublished && (
                            <Badge className="bg-green-100 text-green-800">
                              Published
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-orange-600" />
                            <span>{formatDate(meeting.meetingDate)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-green-600" />
                            <span>
                              {meeting.startTime} - {meeting.endTime}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-red-600" />
                            <span>{meeting.venue}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-purple-600" />
                            <span>
                              {meeting.attendance > 0
                                ? `${meeting.attendance} attendees`
                                : "No attendance yet"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-gray-500">
                          <span>Financial Year: {meeting.financialYear}</span>
                          <span className="mx-2">•</span>
                          <span>Month: {meeting.month}</span>
                          <span className="mx-2">•</span>
                          <span>Created: {formatDate(meeting.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          href={`/admindashboard/meeting-manage/${meeting.id}`}
                        >
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {meetings.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No meetings found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
