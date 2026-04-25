
"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import type { ServiceType, BookingFormData } from "@/components/booking-form"

interface ServiceFee {
  serviceType: string
  amount: number
}

export const useBooking = () => {
  const { toast } = useToast()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateSession = (): boolean => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a service.",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const createBooking = async (data: BookingFormData, serviceType: ServiceType, amount: number) => {
    if (!validateSession()) return false

    try {
      setIsSubmitting(true)

      const bookingData = {
        serviceType,
        userId: session!.user.id,
        employeeId: session!.user.id,
        ...data,
        bookingDate: new Date(data.bookingDate).toISOString(),
        amount,
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      toast({
        title: "Booking Confirmed!",
        description: `Your ${serviceType === "WATER_TANKER" ? "water tanker" : "dustbin van"} has been booked successfully.`,
      })

      return true
    } catch (error) {
      console.error("Booking error:", error)
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    createBooking,
    isSubmitting,
  }
}
