import { db } from "@/lib/db";
import { DeliveryTable } from "@/components/delivery-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Water Tanker Schedule | Admin Dashboard",
  description: "Manage and track water tanker delivery bookings",
};

const Page = async () => {
  // Get current date at start of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get end date (7 days from now)
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 7);

  const bookings = await db.booking.findMany({
    where: {
      bookingDate: {
        gte: today,
        lte: endDate, // Add end date filter
      },
    },
    orderBy: [
      { bookingDate: "asc" },
      { createdAt: "desc" },
    ],
    include: {
      user: true,
    },
  });

  // Add isToday and daysDiff flags to bookings
  const bookingsWithDate = bookings.map((booking) => {
    const bookingDate = new Date(booking.bookingDate);
    bookingDate.setHours(0, 0, 0, 0);
    const isToday = bookingDate.getTime() === today.getTime();
    const daysDiff = Math.floor((bookingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Transform booking to match the Booking interface
    return {
      ...booking,
      isToday,
      daysDiff,
      receiptNumber: booking.receiptNumber || null, // Ensure null instead of undefined
      user: booking.user ? {
        name: booking.user.name,
        email: booking.user.email,
        id: booking.user.id
      } : null
    };
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Upcoming Deliveries
        </h1>
        <p className="text-muted-foreground">
          Showing deliveries for the next 7 days
        </p>
      </div>

      <DeliveryTable bookings={bookingsWithDate} />
    </div>
  );
};

export default Page;
