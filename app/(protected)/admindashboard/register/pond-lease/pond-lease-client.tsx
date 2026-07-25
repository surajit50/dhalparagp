"use client"

import { useState, useMemo } from "react"
import { differenceInDays, differenceInMonths, differenceInYears, addYears, addMonths } from "date-fns"
import { formatDate } from "@/utils/utils"
import { toast } from "sonner"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

import {
  MoreHorizontal,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
  FileWarning,
  FileCheck,
  IndianRupee,
  Search,
  X,
  Printer,
  Calendar,
  Edit,
  AlertTriangle,
  Wallet,
  TrendingUp,
  Layers,
  Clock
} from "lucide-react"

import { AddLeaseDialog } from "./add-lease-dialog"
import { AddPondDialog } from "./add-pond-dialog"
import { AddPaymentDialog } from "./add-payment-dialog"
import { ExtendLeaseDialog } from "./extend-lease-dialog"
import { EditLeaseDialog } from "./edit-lease-dialog"
import { PendingDetailsDialog } from "./pending-details-dialog"
import { LeaseAgreementPrint } from "./lease-agreement-print"
import { PendingListPrint } from "./pending-list-print"
import { LeaseCollectionListPrint } from "./lease-collection-list-print"
import { NoticeGenerateDialog } from "./notice-generate-dialog"
import { BulkNoticeGenerateDialog } from "./bulk-notice-generate-dialog"
import { MarkNoticeReceivedDialog } from "./mark-notice-received-dialog"
import { ReprintNoticeDialog } from "./reprint-notice-dialog"
import { UpdateLeaseStatusDialog } from "./update-lease-status-dialog"
import { PublicPondSection } from "./public-pond-section"

import { deletePondLease, updateLeaseStatus, verifyPondLease } from "./actions"
import { LeaseStatusChart } from "./lease-status-chart"
import { PendingByYear } from "./pending-by-year"
import { cn } from "@/lib/utils"

interface PondLeaseClientProps {
  data: any[]
  ponds: any[]
  allPonds: any[]
  publicPonds: any[]
  initialTab?: string
  initialSearch?: string
}

type StatusFilter = "ALL" | "ACTIVE" | "EXPIRED" | "COMPLETED" | "CANCELLED"

export function PondLeaseClient({ data, ponds, allPonds, publicPonds, initialTab = "dashboard", initialSearch = "" }: PondLeaseClientProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [selectedLeases, setSelectedLeases] = useState<string[]>([])

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  })

  const filteredData = useMemo(() => {
    return data.filter((lease) => {
      const matchesSearch =
        (lease.pond.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (lease.leasePartyName?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "ALL" || lease.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [data, searchTerm, statusFilter])

  // Clear selections when filter changes
  useMemo(() => {
    setSelectedLeases([])
  }, [searchTerm, statusFilter])

  const totalLeases = data.length
  const activeLeases = data.filter((l) => l.status === "ACTIVE").length
  const expiredLeases = data.filter((l) => l.status === "EXPIRED").length
  const totalPendingAmount = data.reduce((sum, l) => sum + l.pendingAmount, 0)

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200/50"
      case "EXPIRED":
        return "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200/50"
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200/50"
      case "CANCELLED":
        return "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-slate-200/50"
      default:
        return "bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-slate-200/50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle2 className="h-3 w-3 mr-1" />
      case "EXPIRED":
        return <AlertTriangle className="h-3 w-3 mr-1" />
      case "COMPLETED":
        return <FileCheck className="h-3 w-3 mr-1" />
      case "CANCELLED":
        return <XCircle className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lease record?")) return

    try {
      await deletePondLease(id)
      toast.success("Lease deleted")
    } catch {
      toast.error("Delete failed")
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateLeaseStatus(id, status as any)
      toast.success("Status updated")
    } catch {
      toast.error("Update failed")
    }
  }

  const handleVerify = async (id: string) => {
    if (!confirm("Are you sure you want to final verify this lease? Once verified, details cannot be modified.")) return

    try {
      await verifyPondLease(id)
      toast.success("Lease final verified")
    } catch {
      toast.error("Verification failed")
    }
  }

  const formatRemainingTime = (end: Date, today: Date) => {
    if (end < today) return "Expired";
    const years = differenceInYears(end, today);
    const dateAfterYears = addYears(today, years);
    const months = differenceInMonths(end, dateAfterYears);
    const dateAfterMonths = addMonths(dateAfterYears, months);
    const days = differenceInDays(end, dateAfterMonths);

    const parts = [];
    if (years > 0) parts.push(`${years} yr`);
    if (months > 0) parts.push(`${months} mo`);
    if (days > 0) parts.push(`${days} d`);
    
    return parts.length > 0 ? parts.join(" ") : "Expires today";
  };

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("ALL")
  }

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "ALL"

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeases(filteredData.map(l => l.id))
    } else {
      setSelectedLeases([])
    }
  }

  const handleSelectLease = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLeases(prev => [...prev, id])
    } else {
      setSelectedLeases(prev => prev.filter(l => l !== id))
    }
  }

  return (
    <Tabs defaultValue={initialTab} className="space-y-8">
      {/* Header Section with Gradient Accent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/10 via-primary/5 to-transparent p-6 md:p-8 border border-border/50 backdrop-blur-sm">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
              <FileCheck className="h-8 w-8 text-blue-600" />
              Pond Lease Management
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Manage pond lease records, track payments, and generate agreements in one unified dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PendingListPrint leases={data} />
            <LeaseCollectionListPrint leases={data} ponds={allPonds} />
            <AddPondDialog />
            <AddLeaseDialog ponds={ponds} />
          </div>
        </div>
      </div>

      <div className="flex justify-center md:justify-start w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard & Analytics</TabsTrigger>
          <TabsTrigger value="records">Lease Records</TabsTrigger>
          <TabsTrigger value="public">Public Ponds</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="dashboard" className="space-y-8 mt-6">
        {/* Enhanced Stats Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leases</p>
                <h3 className="text-3xl font-bold mt-2">{totalLeases}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Leases</p>
                <h3 className="text-3xl font-bold mt-2">{activeLeases}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                <h3 className="text-3xl font-bold mt-2 text-red-600">{currency.format(totalPendingAmount)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired Leases</p>
                <h3 className="text-3xl font-bold mt-2">{expiredLeases}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - Improved Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Lease Status Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Distribution of lease agreements by status</p>
          </CardHeader>
          <CardContent>
            <LeaseStatusChart data={data} />
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Amount by Year</CardTitle>
            <p className="text-sm text-muted-foreground">Year-wise breakdown of outstanding payments</p>
          </CardHeader>
          <CardContent>
            <PendingByYear leases={data} />
          </CardContent>
        </Card>
      </div>
      </TabsContent>

      <TabsContent value="records" className="mt-6">
        {/* Main Table Section */}
        <Card className="border-border/50 shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Lease Records</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all pond lease agreements
              </p>
            </div>

            {/* Filters and Bulk Actions Section */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
              {selectedLeases.length > 0 && (
                <div className="flex items-center gap-3 mr-2 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
                  <span className="text-sm text-blue-700 whitespace-nowrap">{selectedLeases.length} selected</span>
                  <BulkNoticeGenerateDialog leases={data.filter(l => selectedLeases.includes(l.id))} />
                </div>
              )}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pond or party..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-8"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                  <TabsTrigger value="ALL">All</TabsTrigger>
                  <TabsTrigger value="ACTIVE">Active</TabsTrigger>
                  <TabsTrigger value="EXPIRED">Expired</TabsTrigger>
                  <TabsTrigger value="COMPLETED">Done</TabsTrigger>
                  <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
                </TabsList>
              </Tabs>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[650px] scrollbar-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80 z-10">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="w-12 text-center">
                    <Checkbox 
                      checked={selectedLeases.length > 0 && selectedLeases.length === filteredData.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Pond</TableHead>
                  <TableHead className="font-semibold">Party</TableHead>
                  <TableHead className="font-semibold">Lease Period</TableHead>
                  <TableHead className="font-semibold">Lease Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <FileText className="h-12 w-12 mb-3 opacity-30" />
                        <p className="text-lg font-medium">No lease records found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                        {hasActiveFilters && (
                          <Button variant="link" onClick={clearFilters} className="mt-2">
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {filteredData.map((lease, index) => {
                  const today = new Date()
                  const start = new Date(lease.leaseStartDate)
                  const end = new Date(lease.leaseEndDate)

                  const totalDays = differenceInDays(end, start)
                  const usedDays = differenceInDays(today, start)
                  const progress = Math.min(Math.max((usedDays / totalDays) * 100, 0), 100)
                  const daysLeft = differenceInDays(end, today)
                  const isExpiringSoon = daysLeft <= 30 && daysLeft > 0 && lease.status === "ACTIVE"
                  const isOverdue = daysLeft < 0 && lease.status === "ACTIVE"
                  
                  const paidPercentage = (lease.paidAmount / lease.totalAmount) * 100

                  return (
                    <TableRow
                      key={lease.id}
                      className={`group hover:bg-muted/40 transition-colors duration-150 ${selectedLeases.includes(lease.id) ? 'bg-blue-50/30' : ''}`}
                    >
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={selectedLeases.includes(lease.id)}
                          onCheckedChange={(checked) => handleSelectLease(lease.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{index + 1}</TableCell>

                      {/* Pond Column */}
                      <TableCell>
                        <div className="font-semibold text-foreground">{lease.pond.name}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{lease.pond.location}</span>
                        </div>
                      </TableCell>

                      {/* Party Column */}
                      <TableCell>
                        <div className="font-medium">{lease.leasePartyName}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                          <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{lease.leasePartyMobile}</span>
                        </div>
                      </TableCell>

                      {/* Period Column */}
                      <TableCell className="min-w-[180px]">
                        <div className="text-sm">
                          <span className="font-medium">{formatDate(start)}</span>
                          <span className="text-muted-foreground mx-1">→</span>
                          <span className="font-medium">{formatDate(end)}</span>
                        </div>
                        <div className="mt-2 mb-1">
                          <Progress 
                            value={progress} 
                            className={`h-1.5 ${isExpiringSoon ? "[&>div]:bg-orange-500" : isOverdue ? "[&>div]:bg-red-500" : ""}`}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">
                            {usedDays > totalDays ? "Completed" : `${Math.round(progress)}%`}
                          </span>
                          {(isExpiringSoon || isOverdue || lease.status === "ACTIVE") && !isOverdue && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 whitespace-nowrap">
                              {formatRemainingTime(end, today)}
                            </Badge>
                          )}
                          {isOverdue && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 whitespace-nowrap">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Financial Column */}
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Lease Amount:</span>
                            <span className="font-semibold">{currency.format(lease.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Paid:</span>
                            <span className="text-green-600 font-medium">{currency.format(lease.paidAmount)}</span>
                          </div>
                          {lease.pendingAmount > 0 && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pending:</span>
                                <span className="text-red-600 font-bold">{currency.format(lease.pendingAmount)}</span>
                              </div>
                              <div className="mt-1">
                                <Progress value={paidPercentage} className="h-1 [&>div]:bg-green-500" />
                              </div>
                            </>
                          )}
                          {lease.pendingAmount > 0 && (
                            <div className="mt-1">
                              <PendingDetailsDialog lease={lease} />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Status Column */}
                      <TableCell>
                        <div className="flex flex-col items-start gap-2">
                          <Badge className={cn("gap-1 font-medium shadow-sm transition-colors", getStatusClasses(lease.status))}>
                            {getStatusIcon(lease.status)}
                            {lease.status}
                          </Badge>
                          {((lease.noticeCount && lease.noticeCount > 0) || lease.lastNoticeDate) && (
                            <div className="text-xs font-medium text-orange-600 flex flex-col gap-1 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                              <div className="flex items-center gap-1">
                                <FileWarning className="h-3 w-3" />
                                {lease.noticeCount || 1} Notice{(lease.noticeCount || 1) > 1 ? 's' : ''} Sent
                              </div>
                              {lease.noticeReceivedDate && (
                                <div className="text-[10px] text-green-700 flex items-center gap-1 border-t border-orange-200 pt-1 mt-0.5">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Received: {new Date(lease.noticeReceivedDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell className="text-right">

<DropdownMenu>

                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">

                            <DropdownMenuItem asChild>
                              <LeaseAgreementPrint lease={lease} />
                            </DropdownMenuItem>

                            <AddPaymentDialog lease={lease} />

                            <ExtendLeaseDialog lease={lease} />

                            {!lease.isVerified && (
                              <EditLeaseDialog lease={lease} />
                            )}
                            
                            {!lease.isVerified && (
                              <DropdownMenuItem
                                onClick={() => handleVerify(lease.id)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                                Final Verify
                              </DropdownMenuItem>
                            )}

                            <NoticeGenerateDialog lease={lease} />

                            {lease.status === "ACTIVE" && (
                              <>
                                <MarkNoticeReceivedDialog lease={lease} />
                                <ReprintNoticeDialog lease={lease} />
                                <UpdateLeaseStatusDialog lease={lease} statusType="COMPLETED" />
                                <UpdateLeaseStatusDialog lease={lease} statusType="CANCELLED" />
                              </>
                            )}

                          </DropdownMenuContent>

                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="public" className="mt-6">
        <PublicPondSection publicPonds={publicPonds} />
      </TabsContent>
    </Tabs>
  )
}
