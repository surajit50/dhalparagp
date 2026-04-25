"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfDay,
} from "date-fns";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Truck,
  Download,
} from "lucide-react";

import { BookingStatusManager } from "./BookingStatusManager";
import { BookingStatus, ServiceType } from "@prisma/client";
import { Receipt } from "@/components/receipt";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { toast } from "@/components/ui/use-toast";

const statusFilters = [
  { value: "ALL", label: "All" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

const statusStyles: Record<BookingStatus, string> = {
  CONFIRMED: "bg-green-600 text-white",
  COMPLETED: "bg-blue-600 text-white",
  PENDING: "bg-yellow-500 text-white",
  CANCELLED: "bg-red-600 text-white",
  REJECTED: "bg-gray-600 text-white",
};
  

interface Booking {
  id: string;
  serviceType: ServiceType;
  bookingDate: Date;
  status: BookingStatus;
  amount: number;
  address: string;
  phone: string;
  receiptNumber: string | null;
  name: string;
  user: { name: string | null; role: string | null; id: string };
}

interface Props {
  bookings: Booking[];
  isAdmin: boolean;
}

export default function BookingsPageClient({ bookings, isAdmin }: Props) {
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Normalize bookings
  const normalizedBookings = useMemo(
    () =>
      bookings.map((b) => ({
        ...b,
        bookingDateObj: new Date(b.bookingDate),
      })),
    [bookings]
  );

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = normalizedBookings;

    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((b) => b.status === selectedStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter((booking) => {
        const name = (booking.user?.name ?? "").toLowerCase();
        const address = (booking.address ?? "").toLowerCase();
        const receipt = (booking.receiptNumber ?? "").toLowerCase();

        return (
          name.includes(query) ||
          booking.phone.includes(query) ||
          address.includes(query) ||
          receipt.includes(query)
        );
      });
    }

    return filtered;
  }, [normalizedBookings, selectedStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    let confirmed = 0;
    let pending = 0;
    let completed = 0;
    let totalAmount = 0;

    for (const b of filteredBookings) {
      if (b.status === "CONFIRMED") confirmed++;
      if (b.status === "PENDING") pending++;
      if (b.status === "COMPLETED") {
        completed++;
        totalAmount += b.amount;
      }
    }

    return {
      total: filteredBookings.length,
      confirmed,
      pending,
      completed,
      totalAmount,
    };
  }, [filteredBookings]);

  // Excel export
  const exportExcel = (data: Booking[], name: string) => {
    try {
      const rows = data.map((booking) => {
        const date = new Date(booking.bookingDate);

        return {
          Receipt: booking.receiptNumber || "N/A",
          Customer: booking.name,
          Phone: booking.phone,
          Address: booking.address,
          Service: booking.serviceType.replace("_", " "),
          Date: format(date, "yyyy-MM-dd"),
          Time: format(date, "HH:mm"),
          Status: booking.status,
          Amount: booking.amount,
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, "Report");

      const fileName = `${name}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

      XLSX.writeFile(wb, fileName);

      toast({
        title: "Export Successful",
        description: fileName,
      });
    } catch {
      toast({
        title: "Export Failed",
        variant: "destructive",
      });
    }
  };

  if (!bookings.length) {
    return (
      <div className="py-20 text-center">
        <Truck className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">No Bookings Found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent>{stats.total}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confirmed</CardTitle>
          </CardHeader>
          <CardContent>{stats.confirmed}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>{stats.pending}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>{stats.completed}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>₹{stats.totalAmount}</CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Button onClick={() => exportExcel(filteredBookings, "Bookings")}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
        <TabsList>
          {statusFilters.map((s) => (
            <TabsTrigger key={s.value} value={s.value}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedStatus}>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th>Customer</th>
                <th>Date</th>
                <th>Service</th>
                <th>Status</th>
                <th>Amount</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b">
                  <td>
                    <div>
                      <p className="font-medium">{booking.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.phone}
                      </p>
                    </div>
                  </td>

                  <td>
                    {format(booking.bookingDateObj, "PPP")}{" "}
                    {format(booking.bookingDateObj, "p")}
                  </td>

                  <td>
                    {booking.serviceType.toLowerCase().replace("_", " ")}
                  </td>

                  <td>
                    <Badge className={cn(statusStyles[booking.status])}>
                      {booking.status}
                    </Badge>
                  </td>

                  <td>₹{booking.amount}</td>

                  <td className="flex gap-2">
                    <BookingStatusManager
                      bookingId={booking.id}
                      currentStatus={booking.status}
                      isAdmin={isAdmin}
                      userId={booking.user.id}
                    />

                    <Separator orientation="vertical" />

                    <Receipt
                      booking={{
                        ...booking,
                        status: (booking.status === "COMPLETED"
                          ? "CONFIRMED"
                          : booking.status === "CANCELLED"
                          ? "REJECTED"
                          : booking.status) as "PENDING" | "CONFIRMED" | "REJECTED",
                      }}
                      receiptNumber={
                        booking.receiptNumber || `RCP-${booking.id.slice(-6)}`
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
