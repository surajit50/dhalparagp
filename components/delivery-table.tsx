"use client"

import { useState, useMemo } from "react"
import { formatDate } from "@/utils/utils"
import { Receipt } from "@/components/receipt"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, MapPin, User, Package } from "lucide-react"

type BookingStatus = "COMPLETED" | "CANCELLED" | "PENDING" | "CONFIRMED" | "REJECTED"

interface Booking {
  id: string
  bookingDate: Date
  serviceType: 'WATER_TANKER' | 'DUSTBIN_VAN'
  address: string
  status: BookingStatus
  createdAt: Date
  updatedAt: Date
  amount: number
  phone: string
  receiptNumber: string | null // Changed from string | undefined to string | null
  isToday: boolean
  daysDiff: number
  user: {
    name: string | null
    email: string | null
    id: string
  } | null
}

interface DeliveryTableProps {
  bookings: Booking[]
}

export function DeliveryTable({ bookings }: DeliveryTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [serviceFilter, setServiceFilter] = useState<string>("all")

  const getStatusVariant = (status: BookingStatus) => {
    const variants = {
      COMPLETED: "default",
      CANCELLED: "destructive",
      PENDING: "secondary",
      CONFIRMED: "default",
      REJECTED: "destructive",
    } as const
    return variants[status] || "secondary"
  }

  const getStatusColor = (status: BookingStatus) => {
    const colors = {
      COMPLETED: "bg-green-100 text-green-800 hover:bg-green-200",
      CANCELLED: "bg-red-100 text-red-800 hover:bg-red-200",
      PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      CONFIRMED: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      REJECTED: "bg-red-100 text-red-800 hover:bg-red-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }

  // Get unique service types for filter
  const serviceTypes = useMemo(() => {
    const types = Array.from(new Set(bookings.map((booking) => booking.serviceType)))
    return types.sort()
  }, [bookings])

  // Filter bookings based on search and filters
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm)

      const matchesStatus = statusFilter === "all" || booking.status === statusFilter
      const matchesService = serviceFilter === "all" || booking.serviceType === serviceFilter

      return matchesSearch && matchesStatus && matchesService
    })
  }, [bookings, searchTerm, statusFilter, serviceFilter])

  // Stats
  const stats = useMemo(() => {
    const total = bookings.length
    const today = bookings.filter((b) => b.isToday).length
    const pending = bookings.filter((b) => b.status === "PENDING").length
    const completed = bookings.filter((b) => b.status === "COMPLETED").length

    return { total, today, pending, completed }
  }, [bookings])

  const getDayLabel = (daysDiff: number) => {
    if (daysDiff === 0) return "Today"
    if (daysDiff === 1) return "Tomorrow"
    if (daysDiff < 7) return `In ${daysDiff} days`
    return "Future"
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Deliveries</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, service, address, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {serviceTypes.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Delivery List ({filteredBookings.length} of {bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Sl.No</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="hidden lg:table-cell">Updated</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No deliveries found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking, index) => (
                    <TableRow 
                      key={booking.id} 
                      className={booking.isToday ? "bg-yellow-50 hover:bg-yellow-100" : 
                        booking.daysDiff === 1 ? "bg-blue-50 hover:bg-blue-100" : ""}
                    >
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={booking.isToday ? "secondary" : "outline"} 
                            className="w-fit text-xs"
                          >
                            {getDayLabel(booking.daysDiff)}
                          </Badge>
                          <span className="text-sm">{formatDate(booking.bookingDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{booking.user?.name || "Unknown User"}</span>
                          <span className="text-sm text-muted-foreground">{booking.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{booking.serviceType}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px]">
                        <span className="truncate" title={booking.address}>
                          {booking.address}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDate(booking.createdAt)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDate(booking.updatedAt)}
                      </TableCell>
                      <TableCell>
                        {(booking.status === "COMPLETED" || booking.status === "CONFIRMED") && (
                          <Receipt
                            booking={{
                              id: booking.id,
                              name: booking.user?.name || "Unknown User",
                              serviceType: booking.serviceType,
                              bookingDate: booking.bookingDate,
                              amount: booking.amount,
                              status: booking.status === "COMPLETED" ? "CONFIRMED" : booking.status,
                              address: booking.address,
                              phone: booking.phone,
                              user: {
                                name: booking.user?.name || null,
                                id: booking.user?.id || booking.id
                              },
                            }}
                            receiptNumber={booking.receiptNumber || `RCP-${booking.id.slice(-6)}`}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
