// Type definitions based on Prisma schema
// These types include relations and are used for client-side components

import { Decimal } from '@prisma/client/runtime/library'

// Convert Decimal to number for client-side usage
export type DecimalToNumber<T> = T extends Decimal ? number : T extends object ? {
  [K in keyof T]: DecimalToNumber<T[K]>
} : T

// Business types
export interface BusinessWithRelations {
  id: string
  userId: string
  businessName: string
  slug: string
  description: string | null
  category: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string | null
  website: string | null
  instagram: string | null
  isVerified: boolean
  isActive: boolean
  images: string[]
  openingHours: any // JSON field
  stripeAccountId: string | null
  stripeOnboarded: boolean
  commissionRate: number
  createdAt: Date
  updatedAt: Date
  services?: ServiceWithRelations[]
  reviews?: ReviewWithRelations[]
  photos?: BusinessPhoto[]
  products?: ProductWithRelations[]
  staff?: StaffWithRelations[]
}

// Service types
export interface ServiceWithRelations {
  id: string
  businessId: string
  name: string
  description: string | null
  price: number
  duration: number
  category: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  business?: BusinessWithRelations
}

// Product types
export interface ProductWithRelations {
  id: string
  businessId: string
  categoryId: string | null
  name: string
  description: string | null
  price: number
  compareAtPrice: number | null
  sku: string | null
  trackInventory: boolean
  inventoryCount: number
  lowStockAlert: number
  images: string[]
  isActive: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
  category?: ProductCategory
  business?: BusinessWithRelations
}

export interface ProductCategory {
  id: string
  businessId: string
  name: string
  description: string | null
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

// Review types
export interface ReviewWithRelations {
  id: string
  userId: string
  businessId: string
  bookingId: string
  rating: number
  comment: string | null
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    name: string
    email: string
  }
  business?: BusinessWithRelations
}

// Booking types
export interface BookingWithRelations {
  id: string
  userId: string
  businessId: string
  serviceId: string
  staffId: string | null
  date: Date
  startTime: Date
  endTime: Date
  status: string
  notes: string | null
  totalPrice: number
  paymentStatus: string
  stripePaymentIntentId: string | null
  stripeFee: number | null
  platformFee: number | null
  businessPayout: number | null
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  business?: BusinessWithRelations
  service?: ServiceWithRelations
  staff?: StaffWithRelations
}

// Staff types
export interface StaffWithRelations {
  id: string
  businessId: string
  name: string
  email: string
  phone: string | null
  role: string
  isActive: boolean
  canManageBookings: boolean
  canManageStaff: boolean
  profileImage: string | null
  bio: string | null
  createdAt: Date
  updatedAt: Date
  business?: BusinessWithRelations
  services?: StaffService[]
  schedules?: StaffSchedule[]
}

export interface StaffService {
  id: string
  staffId: string
  serviceId: string
  createdAt: Date
  service?: ServiceWithRelations
}

export interface StaffSchedule {
  id: string
  staffId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Business Photo types
export interface BusinessPhoto {
  id: string
  businessId: string
  url: string
  key: string
  type: 'HERO' | 'GALLERY' | 'LOGO' | 'BANNER'
  caption: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}

// Customer Profile types
export interface CustomerProfileWithRelations {
  id: string
  businessId: string
  userId: string
  tags: string[]
  notes: string | null
  totalSpent: number
  visitCount: number
  lastVisit: Date | null
  segment: string
  preferences: any // JSON field
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  business?: BusinessWithRelations
  communications?: Communication[]
}

export interface Communication {
  id: string
  businessId: string
  customerId: string
  staffId: string | null
  type: string
  subject: string | null
  content: string
  status: string
  scheduledFor: Date | null
  sentAt: Date | null
  metadata: any // JSON field
  createdAt: Date
}

// Order types
export interface OrderWithRelations {
  id: string
  userId: string
  businessId: string
  bookingId: string | null
  orderNumber: string
  type: string
  fulfillmentType: string
  status: string
  paymentStatus: string
  stripePaymentIntentId: string | null
  subtotal: number
  tax: number
  fees: number
  discount: number
  total: number
  stripeFee: number | null
  platformFee: number | null
  businessPayout: number | null
  customerName: string
  customerEmail: string
  customerPhone: string | null
  deliveryAddress: string | null
  notes: string | null
  metadata: any // JSON field
  createdAt: Date
  updatedAt: Date
  items?: OrderItem[]
  business?: BusinessWithRelations
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  name: string
  price: number
  quantity: number
  total: number
  metadata: any // JSON field
  product?: ProductWithRelations
}

// Promotion types
export interface PromotionWithRelations {
  id: string
  businessId: string
  name: string
  description: string | null
  code: string
  type: string
  value: number
  scope: string
  serviceIds: string[]
  productIds: string[]
  minPurchase: number | null
  maxDiscount: number | null
  usageLimit: number | null
  usageCount: number
  customerUsageLimit: number | null
  firstTimeOnly: boolean
  validFrom: Date
  validTo: Date | null
  isActive: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
  business?: BusinessWithRelations
}

// Column definitions for data tables
export interface ColumnDef<T> {
  accessorKey?: keyof T | string
  id?: string
  header?: string | ((props: any) => React.ReactNode)
  cell?: (props: { row: { original: T; getValue: (key: string) => any } }) => React.ReactNode
  enableSorting?: boolean
  enableHiding?: boolean
}

// Search params type
export interface SearchParamsProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

// Generic API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Form data types
export interface BookingFormData {
  serviceId: string
  date: Date
  time: string
  notes?: string
}

export interface PaymentFormData {
  cardNumber: string
  expiryDate: string
  cvc: string
  name: string
  email: string
  saveCard?: boolean
}