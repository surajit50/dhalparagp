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

// Helper for dynamic badge colors (NIC orange theme)
const getTypeStyles = (type: string) => {
  switch (type) {
    case "Tender":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "Notice":
      return "bg-nic-bg text-nic-primary border-nic-border"
    case "Circular":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    default:
      return "bg-slate-50 text-slate-700 border-slate-200"
  }
}

// Mobile-friendly card view for small screens
function MobileNoticeList({ notices }: { notices: NoticeItem[] }) {
  if (notices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileX className="h-12 w-12 mb-4 text-muted-foreground/60" />
        <p className="text-lg font-medium text-foreground/70">No records found</p>
        <p className="text-sm">There are no notices in this category at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <div
          key={notice.id}
          className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm"
        >
          {/* Header: Title + Reference + Type */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-base leading-tight">
                {notice.title}
              </h3>
              <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-wider bg-muted border-border text-muted-foreground">
                Ref: {notice.reference}
              </Badge>
            </div>
            <Badge variant="outline" className={`shrink-0 font-medium ${getTypeStyles(notice.type)}`}>
              {notice.type}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {notice.description}
          </p>

          {/* Metadata row: Department + Date */}
          <div className="flex flex-wrap gap-4 text-sm text-foreground/80">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="line-clamp-1">{notice.department}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{notice.date}</span>
            </div>
          </div>

          {/* Files */}
          {notice.files && notice.files.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {notice.files.map((file, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-nic-primary/30 text-nic-primary hover:bg-nic-primary hover:text-primary-foreground transition-all"
                  onClick={() => window.open(file.url, "_blank")}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  {file.name}
                </Button>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">No files attached</span>
          )}
        </div>
      ))}
    </div>
  )
}

// Desktop table view (horizontally scrollable on smaller laptops)
function DesktopNoticeList({ notices }: { notices: NoticeItem[] }) {
  if (notices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileX className="h-12 w-12 mb-4 text-muted-foreground/60" />
        <p className="text-lg font-medium text-foreground/70">No records found</p>
        <p className="text-sm">There are no notices in this category at the moment.</p>
      </div>
    )
  }

  return (
    <ScrollArea className="w-full rounded-md border border-border">
      <div className="min-w-[800px]">
        <table className="w-full">
          <thead className="bg-muted sticky top-0 z-10">
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-bold text-foreground">Title & Details</th>
              <th className="text-left p-4 text-sm font-bold text-foreground w-[120px]">Type</th>
              <th className="text-left p-4 text-sm font-bold text-foreground w-[180px]">Department</th>
              <th className="text-left p-4 text-sm font-bold text-foreground w-[140px]">Date</th>
              <th className="text-left p-4 text-sm font-bold text-foreground w-[200px]">Documents</th>
            </tr>
          </thead>
          <tbody className="bg-card">
            {notices.map((notice) => (
              <tr key={notice.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-4 align-top">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{notice.title}</span>
                      <Badge variant="outline" className="text-[10px] uppercase bg-muted border-border text-muted-foreground">
                        Ref: {notice.reference}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notice.description}</p>
                  </div>
                </td>
                <td className="p-4 align-top">
                  <Badge variant="outline" className={`font-medium ${getTypeStyles(notice.type)}`}>
                    {notice.type}
                  </Badge>
                </td>
                <td className="p-4 text-sm text-foreground/80 align-top">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="line-clamp-2">{notice.department}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-foreground/80 align-top">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    {notice.date}
                  </div>
                </td>
                <td className="p-4 align-top">
                  {notice.files && notice.files.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {notice.files.map((file, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs border-nic-primary/30 text-nic-primary hover:bg-nic-primary hover:text-primary-foreground"
                          onClick={() => window.open(file.url, "_blank")}
                        >
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          {file.name}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No files attached</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      <Card className="w-full border-0 shadow-lg rounded-2xl overflow-hidden bg-card">
        <CardHeader className="bg-nic-primary py-5 px-6">
          <CardTitle className="text-primary-foreground text-xl font-bold flex items-center gap-2 tracking-tight">
            <Newspaper className="h-5 w-5" />
            Official Notice Board
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full md:w-1/2 rounded-lg bg-muted mb-6" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border border-border rounded-xl space-y-3">
                <Skeleton className="h-6 w-3/4 rounded-lg bg-muted" />
                <Skeleton className="h-4 w-full rounded-lg bg-muted" />
                <div className="flex gap-4">
                  <Skeleton className="h-5 w-24 rounded-lg bg-muted" />
                  <Skeleton className="h-5 w-24 rounded-lg bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-0 shadow-lg rounded-2xl overflow-hidden bg-card">
        <CardHeader className="bg-nic-primary py-5 px-6">
          <CardTitle className="text-primary-foreground text-xl font-bold flex items-center gap-2 tracking-tight">
            <Newspaper className="h-5 w-5" />
            Official Notice Board
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive">
            <AlertDescription className="text-base">
              <span className="font-semibold">Error:</span> {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-0 shadow-lg rounded-2xl overflow-hidden bg-card">
      <CardHeader className="bg-nic-primary py-5 px-6">
        <CardTitle className="text-primary-foreground text-xl font-bold flex items-center gap-2 tracking-tight">
          <Newspaper className="h-5 w-5" />
          Official Notice Board
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full flex flex-wrap bg-muted/60 p-1.5 mb-6 rounded-xl gap-1">
            {["all", "tender", "notice", "circular", "other"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 sm:flex-none text-sm font-medium rounded-lg px-4 py-2 capitalize data-[state=active]:bg-card data-[state=active]:text-nic-primary data-[state=active]:shadow-sm transition-all"
              >
                {tab === "all" ? "All Notices" : `${tab}s`}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Mobile: cards, Desktop: table */}
          <div className="block lg:hidden">
            <TabsContent value="all" className="mt-0">
              <MobileNoticeList notices={notices} />
            </TabsContent>
            <TabsContent value="tender" className="mt-0">
              <MobileNoticeList notices={notices.filter((n) => n.type === "Tender")} />
            </TabsContent>
            <TabsContent value="notice" className="mt-0">
              <MobileNoticeList notices={notices.filter((n) => n.type === "Notice")} />
            </TabsContent>
            <TabsContent value="circular" className="mt-0">
              <MobileNoticeList notices={notices.filter((n) => n.type === "Circular")} />
            </TabsContent>
            <TabsContent value="other" className="mt-0">
              <MobileNoticeList notices={notices.filter((n) => n.type === "Other")} />
            </TabsContent>
          </div>

          <div className="hidden lg:block">
            <TabsContent value="all" className="mt-0">
              <DesktopNoticeList notices={notices} />
            </TabsContent>
            <TabsContent value="tender" className="mt-0">
              <DesktopNoticeList notices={notices.filter((n) => n.type === "Tender")} />
            </TabsContent>
            <TabsContent value="notice" className="mt-0">
              <DesktopNoticeList notices={notices.filter((n) => n.type === "Notice")} />
            </TabsContent>
            <TabsContent value="circular" className="mt-0">
              <DesktopNoticeList notices={notices.filter((n) => n.type === "Circular")} />
            </TabsContent>
            <TabsContent value="other" className="mt-0">
              <DesktopNoticeList notices={notices.filter((n) => n.type === "Other")} />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
