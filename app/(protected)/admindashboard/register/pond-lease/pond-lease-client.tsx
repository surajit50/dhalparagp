"use client"

import { useState, useMemo } from "react"
import { format, differenceInDays } from "date-fns"

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
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

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
  Search
} from "lucide-react"

import { toast } from "sonner"

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

import { DashboardCard } from "./dashboard-card"
import { LeaseStatusChart } from "./lease-status-chart"
import { PendingByYear } from "./pending-by-year"

interface PondLeaseClientProps {
  data: any[]
  ponds: any[]
}

export function PondLeaseClient({ data, ponds }: PondLeaseClientProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  })

  const filteredData = useMemo(() => {
    return data.filter(
      (lease) =>
        (lease.pond.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (lease.leasePartyName?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

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

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileCheck className="h-8 w-8 text-blue-600" />
            Pond Lease Management
          </h1>

          <p className="text-muted-foreground mt-2">
            Manage pond lease records, payments and agreements
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <PendingListPrint leases={data} />
          <AddPondDialog />
          <AddLeaseDialog ponds={ponds} />
        </div>
      </div>

      {/* DASHBOARD */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <DashboardCard
          title="Total Leases"
          value={totalLeases}
          icon={<FileText className="h-5 w-5 text-blue-600" />}
        />

        <DashboardCard
          title="Active Leases"
          value={activeLeases}
          icon={<FileCheck className="h-5 w-5 text-green-600" />}
        />

        <DashboardCard
          title="Pending Amount"
          value={currency.format(totalPendingAmount)}
          icon={<IndianRupee className="h-5 w-5 text-red-600" />}
        />

        <DashboardCard
          title="Expired Leases"
          value={expiredLeases}
          icon={<FileWarning className="h-5 w-5 text-orange-600" />}
        />

      </div>

      {/* STATUS CHART */}

      <Card>
        <CardHeader>
          <CardTitle>Lease Status Overview</CardTitle>
        </CardHeader>

        <CardContent>
          <LeaseStatusChart data={data} />
        </CardContent>
      </Card>

      {/* PENDING SUMMARY */}

      <PendingByYear leases={data} />

      {/* TABLE */}

      <Card>

        <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-6">

          <div>
            <CardTitle>Lease Records</CardTitle>
            <p className="text-sm text-muted-foreground">
              View and manage all pond lease agreements
            </p>
          </div>

          {/* SEARCH */}

          <div className="relative w-full md:max-w-md">

            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="Search pond or party..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />

          </div>

        </CardHeader>

        <CardContent className="p-0">

          <div className="overflow-x-auto max-h-[650px]">

            <Table>

              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Pond</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Lease Period</TableHead>
                  <TableHead>Financial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <FileText className="h-10 w-10 mb-3 opacity-50" />
                        No lease records found
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
                  const progress = Math.min((usedDays / totalDays) * 100, 100)

                  const daysLeft = differenceInDays(end, today)

                  return (
                    <TableRow
                      key={lease.id}
                      className="hover:bg-muted/40 transition"
                    >

                      <TableCell>{index + 1}</TableCell>

                      {/* POND */}

                      <TableCell>

                        <div className="font-semibold">
                          {lease.pond.name}
                        </div>

                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {lease.pond.location}
                        </div>

                      </TableCell>

                      {/* PARTY */}

                      <TableCell>

                        <div className="font-medium">
                          {lease.leasePartyName}
                        </div>

                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          {lease.leasePartyMobile}
                        </div>

                      </TableCell>

                      {/* PERIOD */}

                      <TableCell>

                        <div className="text-sm font-medium">
                          {format(start, "dd MMM yyyy")}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          to {format(end, "dd MMM yyyy")}
                        </div>

                        <Progress value={progress} className="mt-2 h-2" />

                        {daysLeft <= 30 && lease.status === "ACTIVE" && (
                          <Badge
                            variant={daysLeft < 0 ? "destructive" : "secondary"}
                            className="mt-2"
                          >
                            {daysLeft < 0 ? "Expired" : `${daysLeft} days left`}
                          </Badge>
                        )}

                      </TableCell>

                      {/* FINANCIAL */}

                      <TableCell>

                        <div className="space-y-1 text-sm">

                          <div className="font-semibold">
                            Total: {currency.format(lease.totalAmount)}
                          </div>

                          <div className="text-green-600">
                            Paid: {currency.format(lease.paidAmount)}
                          </div>

                          {lease.pendingAmount > 0 && (
                            <div className="text-red-600 font-semibold">
                              Pending: {currency.format(lease.pendingAmount)}
                            </div>
                          )}

                          {lease.pendingAmount > 0 && (
                            <PendingDetailsDialog lease={lease} />
                          )}

                        </div>

                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <Badge variant={getStatusVariant(lease.status)}>
                          {lease.status}
                        </Badge>
                      </TableCell>

                      {/* ACTIONS */}

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

                            <EditLeaseDialog lease={lease} />

                            <NoticeGenerateDialog lease={lease} />

                            {lease.status === "ACTIVE" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(lease.id, "COMPLETED")
                                  }
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                  Mark Completed
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusUpdate(lease.id, "CANCELLED")
                                  }
                                >
                                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                  Cancel Lease
                                </DropdownMenuItem>
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

    </div>
  )
}
