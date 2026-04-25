
"use client"

import type React from "react"
import type { UseFormReturn } from "react-hook-form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export type ServiceType = "WATER_TANKER" | "DUSTBIN_VAN"

export interface BookingFormData {
  name: string
  address: string
  phone: string
  bookingDate: string
}

interface BookingFormProps {
  form: UseFormReturn<BookingFormData>
  serviceType: ServiceType
  title: string
  fee: number
  isSubmitting: boolean
  onSubmit: (data: BookingFormData, serviceType: ServiceType) => void
}

export const BookingForm: React.FC<BookingFormProps> = ({ form, serviceType, title, fee, isSubmitting, onSubmit }) => {
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  return (
    <Card className="h-fit shadow-lg border-0 rounded-xl bg-gradient-to-b from-background/50 to-background">
      <CardHeader className="bg-muted/40 px-6 py-4 rounded-t-xl border-b">
        <CardTitle className="flex items-center justify-between text-xl font-bold">
          <span>{title}</span>
          <Badge variant="success" className="px-4 py-2 text-lg">
            ₹{fee}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSubmit(data, serviceType))} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      disabled={isSubmitting}
                      className="rounded-lg py-6 px-4 border-2"
                    />
                  </FormControl>
                  <FormMessage className="font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Service Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter complete address with landmarks..."
                      className="min-h-[100px] rounded-lg px-4 border-2"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      disabled={isSubmitting}
                      className="rounded-lg py-6 px-4 border-2"
                    />
                  </FormControl>
                  <FormMessage className="font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bookingDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Preferred Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      min={getMinDate()}
                      disabled={isSubmitting}
                      className="rounded-lg py-6 px-4 border-2 [&::-webkit-calendar-picker-indicator]:opacity-70"
                    />
                  </FormControl>
                  <FormMessage className="font-medium" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 rounded-xl text-lg font-bold transition-transform hover:scale-[1.01]"
              variant={serviceType === "WATER_TANKER" ? "default" : "secondary"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Booking...
                </>
              ) : (
                `Book ${serviceType === "WATER_TANKER" ? "Water Tanker" : "Dustbin Van"}`
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
