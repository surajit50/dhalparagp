"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, Building2, Download, Newspaper, FileX } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getNotices } from "@/action/notice"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface NoticeItem {
  id: string
  title: string
  description: string
  department: string
  type: "Tender" | "Notice" | "Circular" | "Other"
  reference: string
  date: string
  files?: {
    name: string
    url: string
    type: string
  }[]
}

// Helper for dynamic badge colors
const getTypeStyles = (type: string) => {
  switch (type) {
    case "Tender":
      return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
    case "Notice":
      return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
    case "Circular":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
  }
}

function NoticeList({ notices }: { notices: NoticeItem[] }) {
  if (notices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
        <FileX className="h-12 w-12 mb-4 text-slate-300" />
        <p className="text-lg font-medium text-slate-600">No records found</p>
        <p className="text-sm">There are no notices in this category at the moment.</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[500px] rounded-md border border-slate-100">
      <Table>
        <TableHeader className="sticky top-0 bg-slate-50 shadow-sm z-10">
          <TableRow className="hover:bg-slate-50 border-slate-200">
            <TableHead className="text-sm font-bold text-slate-700 py-4">Title & Details</TableHead>
            <TableHead className="text-sm font-bold text-slate-700 w-[120px]">Type</TableHead>
            <TableHead className="text-sm font-bold text-slate-700 w-[180px]">Department</TableHead>
            <TableHead className="text-sm font-bold text-slate-700 w-[140px]">Date</TableHead>
            <TableHead className="text-sm font-bold text-slate-700 w-[180px]">Documents</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="bg-white">
          {notices.map((notice) => (
            <TableRow
              key={notice.id}
              className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
            >
              <TableCell className="p-4 align-top">
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800 leading-tight">
                      {notice.title}
                    </h3>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-slate-50 border-slate-200 text-slate-500 py-0 h-5">
                      Ref: {notice.reference}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 pr-4">
                    {notice.description}
                  </p>
                </div>
              </TableCell>

              <TableCell className="p-4 align-top">
                <Badge variant="outline" className={`font-medium ${getTypeStyles(notice.type)}`}>
                  {notice.type}
                </Badge>
              </TableCell>

              <TableCell className="p-4 text-sm text-slate-600 align-top">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="line-clamp-2">{notice.department}</span>
                </div>
              </TableCell>

              <TableCell className="p-4 text-sm text-slate-600 align-top">
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  {notice.date}
                </div>
              </TableCell>

              <TableCell className="p-4 align-top">
                {notice.files && notice.files.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {notice.files.map((file, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-[#1e3a8a]/20 text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition-all w-full justify-start"
                        onClick={() => window.open(file.url, "_blank")}
                      >
                        <Download className="h-3.5 w-3.5 mr-2 shrink-0" />
                        <span className="truncate">{file.name}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">No files attached</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}

export default function LatestNewsUpdate() {
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const result = await getNotices()
        if (result.data?.length) {
          setNotices(
            result.data.map((notice) => ({
              ...notice,
              date: new Date(notice.date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
            })),
          )
        } else {
          setError("No notices available at the moment")
        }
      } catch {
        setError("Failed to load notices. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchNotices()
  }, [])

  if (loading) {
    return (
      <Card className="w-full border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-[#1e3a8a] py-5 px-6">
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2 tracking-tight">
            <Newspaper className="h-5 w-5" />
            Official Notice Board
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full md:w-1/2 rounded-lg bg-slate-100 mb-6" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-4 py-3 border-b border-slate-50">
                <Skeleton className="h-16 w-full md:w-1/3 rounded-lg bg-slate-100" />
                <Skeleton className="h-16 w-full md:w-1/4 rounded-lg bg-slate-100" />
                <Skeleton className="h-16 w-full md:w-1/4 rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-[#1e3a8a] py-5 px-6">
          <CardTitle className="text-white text-xl font-bold flex items-center gap-2 tracking-tight">
            <Newspaper className="h-5 w-5" />
            Official Notice Board
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
            <AlertDescription className="text-base">
              <span className="font-semibold">Error:</span> {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
      <CardHeader className="bg-[#1e3a8a] py-5 px-6">
        <CardTitle className="text-white text-xl font-bold flex items-center gap-2 tracking-tight">
          <Newspaper className="h-5 w-5" />
          Official Notice Board
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full sm:w-auto flex flex-wrap bg-slate-100/80 p-1.5 mb-6 rounded-xl">
            {["all", "tender", "notice", "circular", "other"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 sm:flex-none text-sm font-medium rounded-lg px-4 py-2 capitalize data-[state=active]:bg-white data-[state=active]:text-[#1e3a8a] data-[state=active]:shadow-sm transition-all"
              >
                {tab === "all" ? "All Notices" : `${tab}s`}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="bg-white rounded-xl">
            <TabsContent value="all" className="mt-0 outline-none">
              <NoticeList notices={notices} />
            </TabsContent>
            <TabsContent value="tender" className="mt-0 outline-none">
              <NoticeList notices={notices.filter((n) => n.type === "Tender")} />
            </TabsContent>
            <TabsContent value="notice" className="mt-0 outline-none">
              <NoticeList notices={notices.filter((n) => n.type === "Notice")} />
            </TabsContent>
            <TabsContent value="circular" className="mt-0 outline-none">
              <NoticeList notices={notices.filter((n) => n.type === "Circular")} />
            </TabsContent>
            <TabsContent value="other" className="mt-0 outline-none">
              <NoticeList notices={notices.filter((n) => n.type === "Other")} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
