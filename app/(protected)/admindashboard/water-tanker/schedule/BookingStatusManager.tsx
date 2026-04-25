'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { updateBookingStatus } from '@/action/bookings'
import { BookingStatus } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface BookingStatusProps {
  bookingId: string
  currentStatus: BookingStatus
  isAdmin: boolean
  userId?: string
}

export function BookingStatusManager({
  bookingId,
  currentStatus,
  isAdmin,
  userId,
}: BookingStatusProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()

  const statusOptions = isAdmin
    ? Object.values(BookingStatus)
    : [BookingStatus.CANCELLED]

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  }

  const handleStatusChange = (newStatus: BookingStatus) => {
    startTransition(async () => {
      const result = await updateBookingStatus({
        bookingId,
        status: newStatus,
        userId,
      })

      if (result.success) {
        toast({
          title: 'Status Updated',
          description: result.message,
        })
        setStatus(newStatus)
      } else {
        toast({
          title: 'Update Failed',
          description: result.error,
          variant: 'destructive',
        })
        // Reset to previous status on error
        setStatus(currentStatus)
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Badge className={statusColors[status]}>
          {status.toLowerCase()}
        </Badge>
        
        {isAdmin && (
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
        )}

        {!isAdmin && status === 'PENDING' && (
          <Button
            variant="destructive"
            onClick={() => handleStatusChange('CANCELLED')}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancel Booking
          </Button>
        )}
      </div>

      {isPending && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Updating status...
        </div>
      )}
    </div>
  )
}
