"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  BookingForm,
  type BookingFormData,
  type ServiceType,
} from "./booking-form"
import { useBooking } from "@/hooks/use-booking"
import { useServiceFees } from "@/hooks/use-service-fee"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const bookingSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must be less than 200 characters"),
  phone: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit Indian mobile number"
    ),
  bookingDate: z.string().refine(
    (date) => {
      const selectedDate = new Date(date)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      return selectedDate >= tomorrow
    },
    {
      message: "Booking date must be at least tomorrow",
    }
  ),
})

const WaterTankerBooking = () => {
  const { createBooking, isSubmitting } = useBooking()
  const { getServiceFee, isLoading: feesLoading } = useServiceFees()

  const waterTankerForm = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      bookingDate: "",
    },
  })

  const dustbinForm = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      bookingDate: "",
    },
  })

  const handleBooking = async (
    data: BookingFormData,
    serviceType: ServiceType
  ) => {
    const amount = getServiceFee(serviceType)
    const success = await createBooking(data, serviceType, amount)

    if (success) {
      if (serviceType === "WATER_TANKER") {
        waterTankerForm.reset()
      } else {
        dustbinForm.reset()
      }
    }
  }

  if (feesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background/50 to-background py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12 space-y-2">
            <Skeleton className="h-12 w-96 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <Card key={i} className="rounded-2xl shadow-lg border-0 bg-background/80">
                <CardHeader className="bg-muted/40 px-6 py-4 rounded-t-2xl border-b">
                  <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-14 w-full rounded-xl" />
                    </div>
                  ))}
                  <Skeleton className="h-14 w-full rounded-xl" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/50 to-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent mb-3">
            Municipal Services Booking
          </h1>
          <p className="text-xl text-muted-foreground">
            Book essential services with instant confirmation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BookingForm
            form={waterTankerForm}
            serviceType="WATER_TANKER"
            title="Water Tanker Service"
            fee={getServiceFee("WATER_TANKER")}
            isSubmitting={isSubmitting}
            onSubmit={handleBooking}
          />
          <BookingForm
            form={dustbinForm}
            serviceType="DUSTBIN_VAN"
            title="Dustbin Van Service"
            fee={getServiceFee("DUSTBIN_VAN")}
            isSubmitting={isSubmitting}
            onSubmit={handleBooking}
          />
        </div>

        <div className="mt-8 text-center text-muted-foreground text-sm">
          <p>24/7 availability | Instant confirmation | Certified operators</p>
          <div className="mt-4 flex justify-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              ⚡ Same-day service
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              🔒 Secure payment
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaterTankerBooking
