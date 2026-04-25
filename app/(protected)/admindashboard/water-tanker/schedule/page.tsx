import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import BookingsPageClient from "./BookingsPageClient";

export default async function BookingsPage() {
  const cUser = await currentUser();
  const isAdmin = cUser?.role === "admin";

  const bookings = await db.booking.findMany({
    orderBy: { bookingDate: "desc" },
    where: {
      serviceType: "WATER_TANKER",
    },
    select: {
      id: true,
      serviceType: true,
      bookingDate: true,
      status: true,
      amount: true,
      address: true,
      phone: true,
      receiptNumber: true,
      name: true,
      user: { select: { name: true, role: true, id: true } },
    },
  });

  return <BookingsPageClient bookings={bookings} isAdmin={isAdmin} />;
}
