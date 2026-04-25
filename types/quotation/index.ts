import type { Prisma } from "@prisma/client"

// User Types
export type User = Prisma.UserGetPayload<{}>
export type CreateUserInput = Prisma.UserCreateInput
export type UpdateUserInput = Prisma.UserUpdateInput

// Quotation Types
export type Quotation = Prisma.QuotationGetPayload<{
  include: {
    createdBy: true
    bids: {
      include: {
       agencyDetails:true
      }
    }
    comparativeStatement: true
    order: true
    documents: true
  }
}>

export type QuotationWithBids = Prisma.QuotationGetPayload<{
  include: {
    bids: {
      include: {
        agencyDetails: true
      }
    }
  }
}>

export type CreateQuotationInput = Omit<Prisma.QuotationCreateInput, "createdBy"> & {
  createdById: string
}

export type UpdateQuotationInput = Prisma.QuotationUpdateInput



export type CreateBidderInput = Prisma.AgencyDetailsCreateInput
export type UpdateBidderInput = Prisma.AgencyDetailsUpdateInput

// Bid Types
export type Bid = Prisma.BidGetPayload<{
  include: {
    bidder: true
    quotation: true
  }
}>

export type CreateBidInput = Prisma.BidCreateInput
export type UpdateBidInput = Prisma.BidUpdateInput

// Order Types
export type Order = Prisma.OrderGetPayload<{
  include: {
    quotation: true
    agencyDetails: true
    createdBy: true
    items: true
    timeline: true
    documents: true
  }
}>

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: true
    agencyDetails: true
    quotation: true
  }
}>

export type CreateOrderInput = Omit<Prisma.OrderCreateInput, "createdBy" | "quotation" | "supplier"> & {
  createdById: string
  quotationId: string
  supplierId: string
  items: Omit<Prisma.OrderItemCreateInput, "order">[]
}

export type UpdateOrderInput = Prisma.OrderUpdateInput

// Order Item Types
export type OrderItem = Prisma.OrderItemGetPayload<{}>
export type CreateOrderItemInput = Omit<Prisma.OrderItemCreateInput, "order">

// Notification Types
export type Notification = Prisma.NotificationGetPayload<{}>
export type CreateNotificationInput = Omit<Prisma.NotificationCreateInput, "user"> & {
  userId: string
}

// Document Types
export type Document = Prisma.DocumentGetPayload<{}>
export type CreateDocumentInput = Prisma.DocumentCreateInput

// Audit Log Types
export type AuditLog = Prisma.AuditLogGetPayload<{
  include: {
    user: true
  }
}>

export type CreateAuditLogInput = Omit<Prisma.AuditLogCreateInput, "user"> & {
  userId: string
}

// API Response Types
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form Types
export type QuotationFormData = {
  quotationType: "WORK" | "SUPPLY" | "SALE"
  nitNo: string
  nitDate: string
  workName: string
  estimatedAmount: string
  submissionDate: string
  submissionTime: string
  openingDate: string
  openingTime: string
  description?: string
  eligibilityCriteria?: string
  itemCondition?: string
  specifications?: string
  workLocation?: string
  quantity?: string
  unit?: string
}

export type OrderFormData = {
  orderNo: string
  orderDate: string
  deliveryDate: string
  specialInstructions?: string
  items: {
    name: string
    specifications?: string
    quantity: number
    unit: string
    rate: number
    amount: number
  }[]
}



// Filter Types
export type QuotationFilters = {
  status?: string
  quotationType?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export type OrderFilters = {
  status?: string
  paymentStatus?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export type BidderFilters = {
  type?: string
  status?: string
  search?: string
}
