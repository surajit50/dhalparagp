"use client"

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { updateBookingStatus } from '@/action/bookings'
import { BookingStatus } from '@prisma/client'

interface BookingStatusProps {
  bookingId: string
  currentStatus: BookingStatus
  isAdmin: boolean
}

export function BookingStatusManager({
  bookingId,
  currentStatus,
  isAdmin
}: BookingStatusProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()

  const statusOptions = isAdmin 
    ? Object.values(BookingStatus)
    : [BookingStatus.CANCELLED]

  const handleStatusChange = (newStatus: BookingStatus) => {
    startTransition(async () => {
      const result = await updateBookingStatus({
        bookingId,
        status: newStatus
      })

      if (result.success) {
        toast({
          title: "Status Updated",
          description: result.message
        })
        setStatus(newStatus)
      } else {
        toast({
          title: "Update Failed",
          description: result.error,
          variant: "destructive"
        })
      }
    })
  }

  return (
    <div className="flex items-center gap-4">
      <Select
        value={status}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((status) => (
            <SelectItem key={status} value={status}>
              {status.toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <span className="animate-pulse">Saving...</span>}
    </div>
  )
}
