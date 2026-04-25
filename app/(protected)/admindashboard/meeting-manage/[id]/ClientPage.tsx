"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Download,
  Edit,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Phone,
  Mail,
  User,
  Building,
  IndianRupee,
  CalendarDays,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

const meetingTypes = [
  { value: "UPASAMITY", label: "Upasamity", color: "bg-blue-100 text-blue-800" },
  { value: "GENERAL", label: "General", color: "bg-green-100 text-green-800" },
  { value: "ARTHO", label: "Artho", color: "bg-purple-100 text-purple-800" },
  { value: "SPECIAL_GRAM_SABHA", label: "Special Gram Sabha", color: "bg-orange-100 text-orange-800" },
  { value: "REGULAR_GRAM_SABHA", label: "Regular Gram Sabha", color: "bg-red-100 text-red-800" },
];

const meetingStatuses = [
  { value: "SCHEDULED", label: "Scheduled", color: "bg-blue-100 text-blue-800", icon: Calendar },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-yellow-100 text-yellow-800", icon: Play },
  { value: "COMPLETED", label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
  { value: "POSTPONED", label: "Postponed", color: "bg-orange-100 text-orange-800", icon: AlertCircle },
];

export default function ClientPage({ id }: { id: string }) {
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeeting() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/meetings/${id}`);
        if (!res.ok) {
          throw new Error((await res.json()).error || "Failed to fetch meeting");
        }
        const data = await res.json();
        setMeeting(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch meeting");
      } finally {
        setLoading(false);
      }
    }
    fetchMeeting();
  }, [id]);

  const getTypeColor = (type: string) => meetingTypes.find((t) => t.value === type)?.color || "bg-gray-100 text-gray-800";
  const getTypeLabel = (type: string) => meetingTypes.find((t) => t.value === type)?.label || type;
  const getStatusColor = (status: string) => meetingStatuses.find((s) => s.value === status)?.color || "bg-gray-100 text-gray-800";
  const getStatusLabel = (status: string) => meetingStatuses.find((s) => s.value === status)?.label || status;
  const formatDate = (dateString: string) => !dateString ? "-" : new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const formatDateTime = (dateString: string) => !dateString ? "-" : new Date(dateString).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const formatFileSize = (bytes: number) => !bytes ? "0 Bytes" : (bytes / Math.pow(1024, Math.floor(Math.log(bytes) / Math.log(1024)))).toFixed(2) + " " + ["Bytes","KB","MB","GB"][Math.floor(Math.log(bytes) / Math.log(1024))];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-20 text-gray-500 text-lg">Loading meeting details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-20 text-red-500 text-lg">{error}</div>
        <div className="text-center">
          <Link href="/admindashboard/meeting-manage">
            <Button variant="outline">Back to Meetings</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!meeting) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admindashboard/meeting-manage">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Meetings
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{meeting.title}</h1>
            <p className="text-gray-600 mt-1">Meeting Details and Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Edit className="mr-2 h-4 w-4" />Edit Meeting</Button>
          <Button><Download className="mr-2 h-4 w-4" />Export Details</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Meeting Overview</span>
            <div className="flex items-center gap-2">
              <Badge className={getTypeColor(meeting.meetingType)}>{getTypeLabel(meeting.meetingType)}</Badge>
              <Badge className={getStatusColor(meeting.status)}>{getStatusLabel(meeting.status)}</Badge>
              {meeting.isPublished && (<Badge className="bg-green-100 text-green-800">Published</Badge>)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center"><Calendar className="mr-3 h-5 w-5 text-blue-600" /><div><p className="text-sm text-gray-600">Meeting Date</p><p className="font-semibold">{formatDate(meeting.meetingDate)}</p></div></div>
            <div className="flex items-center"><Clock className="mr-3 h-5 w-5 text-green-600" /><div><p className="text-sm text-gray-600">Time</p><p className="font-semibold">{meeting.startTime} - {meeting.endTime}</p></div></div>
            <div className="flex items-center"><MapPin className="mr-3 h-5 w-5 text-red-600" /><div><p className="text-sm text-gray-600">Venue</p><p className="font-semibold">{meeting.venue}</p></div></div>
            <div className="flex items-center"><Users className="mr-3 h-5 w-5 text-purple-600" /><div><p className="text-sm text-gray-600">Attendance</p><p className="font-semibold">{meeting.attendance ?? meeting.attendees?.length ?? 0} members</p></div></div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center"><CalendarDays className="mr-3 h-5 w-5 text-indigo-600" /><div><p className="text-sm text-gray-600">Financial Year</p><p className="font-semibold">{meeting.financialYear}</p></div></div>
            <div className="flex items-center"><UserCheck className="mr-3 h-5 w-5 text-teal-600" /><div><p className="text-sm text-gray-600">Quorum Achieved</p><p className="font-semibold">{meeting.quorumAchieved ? "Yes" : "No"}</p></div></div>
            <div className="flex items-center"><Building className="mr-3 h-5 w-5 text-orange-600" /><div><p className="text-sm text-gray-600">Month</p><p className="font-semibold">{meeting.month}</p></div></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="agenda" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          <TabsTrigger value="resolutions">Resolutions</TabsTrigger>
          <TabsTrigger value="minutes">Minutes</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="agenda" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Meeting Agenda</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div><h4 className="font-semibold mb-2">Agenda Points:</h4><div className="bg-gray-50 p-4 rounded-lg"><pre className="whitespace-pre-wrap text-sm">{meeting.agenda}</pre></div></div>
                <div><h4 className="font-semibold mb-2">Description:</h4><p className="text-gray-700">{meeting.description}</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attendees" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center justify-between"><span>Meeting Attendees</span><Badge variant="outline">{meeting.attendees?.filter((a: any) => a.isPresent).length ?? 0} Present / {meeting.attendees?.length ?? 0} Total</Badge></CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meeting.attendees?.map((attendee: any) => (
                  <div key={attendee.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><User className="h-5 w-5 text-blue-600" /></div>
                        <div><h4 className="font-semibold">{attendee.name}</h4><p className="text-sm text-gray-600">{attendee.designation}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={attendee.isPresent ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{attendee.isPresent ? "Present" : "Absent"}</Badge>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center"><Building className="mr-2 h-4 w-4 text-gray-400" /><span>{attendee.village}</span></div>
                      <div className="flex items-center"><Phone className="mr-2 h-4 w-4 text-gray-400" /><span>{attendee.phone}</span></div>
                      <div className="flex items-center"><Mail className="mr-2 h-4 w-4 text-gray-400" /><span>{attendee.email}</span></div>
                      {attendee.isPresent && (<div className="flex items-center"><Clock className="mr-2 h-4 w-4 text-gray-400" /><span>{attendee.arrivalTime && formatDateTime(attendee.arrivalTime)}</span></div>)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resolutions" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Meeting Resolutions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-6">
                {meeting.resolutions?.map((resolution: any) => (
                  <div key={resolution.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4"><div><h4 className="text-lg font-semibold">{resolution.resolutionNumber}</h4><p className="text-gray-600">{resolution.subject}</p></div><Badge className="bg-green-100 text-green-800">{resolution.status}</Badge></div>
                    <div className="space-y-4">
                      <div><h5 className="font-semibold mb-2">Description:</h5><p className="text-gray-700">{resolution.description}</p></div>
                      <div><h5 className="font-semibold mb-2">Decision:</h5><p className="text-gray-700">{resolution.decision}</p></div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center"><IndianRupee className="mr-2 h-4 w-4 text-green-600" /><div><p className="text-sm text-gray-600">Budget Amount</p><p className="font-semibold">₹{resolution.budgetAmount?.toLocaleString?.() ?? resolution.budgetAmount}</p></div></div>
                        <div className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-blue-600" /><div><p className="text-sm text-gray-600">Timeline</p><p className="font-semibold">{resolution.implementationTimeline}</p></div></div>
                        <div className="flex items-center"><User className="mr-2 h-4 w-4 text-purple-600" /><div><p className="text-sm text-gray-600">Responsible</p><p className="font-semibold">{resolution.responsiblePerson}</p></div></div>
                      </div>
                      {resolution.votingResults && (<div className="bg-gray-50 p-4 rounded-lg"><h5 className="font-semibold mb-2">Voting Results:</h5><div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"><div><span className="text-gray-600">In Favor:</span><span className="font-semibold ml-2">{resolution.votingResults.inFavor}</span></div><div><span className="text-gray-600">Against:</span><span className="font-semibold ml-2">{resolution.votingResults.against}</span></div><div><span className="text-gray-600">Abstained:</span><span className="font-semibold ml-2">{resolution.votingResults.abstained}</span></div><div><span className="text-gray-600">Total:</span><span className="font-semibold ml-2">{resolution.votingResults.total}</span></div></div></div>)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="minutes" className="space-y-6">
          <Card><CardHeader><CardTitle>Meeting Minutes</CardTitle></CardHeader><CardContent><div className="space-y-6"><div><h4 className="font-semibold mb-2">Key Discussions:</h4><div className="bg-gray-50 p-4 rounded-lg"><pre className="whitespace-pre-wrap text-sm">{meeting.minutes?.keyDiscussions}</pre></div></div><div><h4 className="font-semibold mb-2">Decisions Made:</h4><div className="bg-gray-50 p-4 rounded-lg"><pre className="whitespace-pre-wrap text-sm">{meeting.minutes?.decisions}</pre></div></div><div><h4 className="font-semibold mb-2">Action Items:</h4><div className="bg-gray-50 p-4 rounded-lg"><pre className="whitespace-pre-wrap text-sm">{meeting.minutes?.actionItems}</pre></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><h4 className="font-semibold mb-2">Next Meeting:</h4><p className="text-gray-700">{formatDate(meeting.minutes?.nextMeetingDate)}</p><p className="text-sm text-gray-600 mt-1">{meeting.minutes?.nextMeetingAgenda}</p></div><div><h4 className="font-semibold mb-2">Attendance Summary:</h4><div className="bg-gray-50 p-4 rounded-lg"><pre className="whitespace-pre-wrap text-sm">{meeting.minutes?.attendanceSummary}</pre></div></div></div><div><h4 className="font-semibold mb-2">Special Observations:</h4><p className="text-gray-700">{meeting.minutes?.specialObservations}</p></div></div></CardContent></Card>
        </TabsContent>
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Meeting Documents</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meeting.documents?.map((document: any) => (
                  <div key={document.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="h-5 w-5 text-blue-600" /></div>
                      <div><h4 className="font-semibold">{document.title}</h4><p className="text-sm text-gray-600">{document.fileName}</p><p className="text-xs text-gray-500">{formatFileSize(document.fileSize)} • {formatDateTime(document.uploadedAt)}</p></div>
                    </div>
                    <div className="flex items-center gap-2"><Badge variant="outline">{document.documentType}</Badge><Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

