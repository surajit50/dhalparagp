import { BookingStatus, ServiceType , Booking} from '@prisma/client'

export type BookingDetails = {
  id: string
  serviceType: ServiceType
  userId: string
  name: string
  address: string
  phone: string
  bookingDate: Date
  amount: number
  status: BookingStatus
  receiptNumber?: string | null
  isPaid: boolean
}
export interface BookingActionResponse {
  success: boolean;
  error?: string;
  message?: string;
  booking?: any;
  receipt?: {
    receiptUrl: string;
    receiptNumber: string;
  };
}

export type BookingStatusUpdateParams = {
  bookingId: string
  status: BookingStatus
  userId?: string
}
