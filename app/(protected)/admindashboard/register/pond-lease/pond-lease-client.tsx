"use client"

import { useState, useMemo } from "react"
import { format, differenceInDays } from "date-fns"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
import { NoticeGenerateDialog } from "./notice-generate-dialog"

import { deletePondLease, updateLeaseStatus } from "./actions"
import { LeaseStatusChart } from "./lease-status-chart"
import { PendingByYear } from "./pending-by-year"

interface PondLeaseClientProps {
  data: any[]
  ponds: any[]
}

type StatusFilter = "ALL" | "ACTIVE" | "EXPIRED" | "COMPLETED" | "CANCELLED"

export function PondLeaseClient({ data, ponds }: PondLeaseClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")

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

  const totalLeases = data.length
  const activeLeases = data.filter((l) => l.status === "ACTIVE").length
  const expiredLeases = data.filter((l) => l.status === "EXPIRED").length
  const totalPendingAmount = data.reduce((sum, l) => sum + l.pendingAmount, 0)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default"
      case "EXPIRED":
        return "destructive"
      case "COMPLETED":
        return "secondary"
      case "CANCELLED":
        return "outline"
      default:
        return "outline"
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

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("ALL")
  }

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "ALL"

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gradient-to-b from-background to-muted/20 min-h-screen">
      {/* Header Section with Gradient Accent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/10 via-primary/5 to-transparent p-6 md:p-8 border border-border/50 backdrop-blur-sm">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              <FileCheck className="h-8 w-8 text-blue-600" />
              Pond Lease Management
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Manage pond lease records, track payments, and generate agreements in one unified dashboard.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PendingListPrint leases={data} />
            <AddPondDialog />
            <AddLeaseDialog ponds={ponds} />
          </div>
        </div>
      </div>

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
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-orange-600" />
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

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Pond</TableHead>
                  <TableHead className="font-semibold">Party</TableHead>
                  <TableHead className="font-semibold">Lease Period</TableHead>
                  <TableHead className="font-semibold">Financial</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
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
                      className="group hover:bg-muted/40 transition-colors duration-150"
                    >
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
                          <span className="font-medium">{format(start, "dd MMM yyyy")}</span>
                          <span className="text-muted-foreground mx-1">→</span>
                          <span className="font-medium">{format(end, "dd MMM yyyy")}</span>
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
                          {(isExpiringSoon || isOverdue) && (
                            <Badge variant={isOverdue ? "destructive" : "secondary"} className="text-[10px] px-1.5">
                              {isOverdue ? "Expired" : `${daysLeft} days left`}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Financial Column */}
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total:</span>
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
                        <Badge variant={getStatusVariant(lease.status)} className="gap-1">
                          {getStatusIcon(lease.status)}
                          {lease.status}
                        </Badge>
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                              <div className="cursor-pointer">
                                <LeaseAgreementPrint lease={lease} />
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <div className="cursor-pointer">
                                <AddPaymentDialog lease={lease} />
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <div className="cursor-pointer">
                                <ExtendLeaseDialog lease={lease} />
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <div className="cursor-pointer">
                                <EditLeaseDialog lease={lease} />
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <div className="cursor-pointer">
                                <NoticeGenerateDialog lease={lease} />
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {lease.status === "ACTIVE" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(lease.id, "COMPLETED")}
                                  className="text-green-600 focus:text-green-600"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Mark Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(lease.id, "CANCELLED")}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Lease
                                </DropdownMenuItem>
                              </>
                            )}
                            {lease.status !== "ACTIVE" && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(lease.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Delete Record
                              </DropdownMenuItem>
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
    </div>
  )
}
