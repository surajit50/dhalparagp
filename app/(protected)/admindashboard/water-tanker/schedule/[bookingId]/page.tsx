// app/bookings/[bookingId]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BookingConfirmation } from "@/components/form/booking-confirmation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default async function BookingConfirmationPage({ params }: PageProps) {
  const { bookingId } = await params;
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <BookingContent bookingId={bookingId} />
      </Suspense>
    </div>
  );
}

async function BookingContent({ bookingId }: { bookingId: string }) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        serviceType: true,
        bookingDate: true,
        status: true,
        amount: true,
        address: true,
        phone: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return notFound();
    }

    const bookingDetails = {
      ...booking,
      bookingDate: new Date(booking.bookingDate),
    };

    return <BookingConfirmation booking={bookingDetails} />;
  } catch (error) {
    console.error("Error fetching booking:", error);
    return notFound();
  }
}

function LoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-12 w-full" />
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
