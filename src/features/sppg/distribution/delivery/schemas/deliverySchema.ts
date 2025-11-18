/**
 * @fileoverview Zod validation schemas for DistributionDelivery GPS tracking
 * @version Next.js 15.5.4 / Zod 3.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/DISTRIBUTION_PHASE3_DELIVERY_PLAN.md} PHASE 3 Implementation Plan
 */

import { z } from 'zod'
import { DeliveryStatus, PhotoType, IssueType, IssueSeverity } from '@prisma/client'

// ============================================================================
// GPS & Location Validation Helpers
// ============================================================================

/**
 * GPS coordinate string validation
 * Format: "latitude,longitude" (e.g., "-6.200000,106.816666")
 */
const gpsCoordinateSchema = z
  .string()
  .regex(
    /^-?\d+\.?\d*,-?\d+\.?\d*$/,
    'Format GPS tidak valid. Gunakan format: "latitude,longitude"'
  )
  .refine(
    (value) => {
      const [lat, lng] = value.split(',').map(Number)
      return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
    },
    'Koordinat GPS harus dalam rentang valid (lat: -90 hingga 90, lng: -180 hingga 180)'
  )

/**
 * Optional GPS coordinate
 */
const optionalGpsSchema = z.string().optional().refine(
  (value) => {
    if (!value) return true
    const [lat, lng] = value.split(',').map(Number)
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  },
  'Format GPS tidak valid'
)

/**
 * Accuracy in meters
 */
const gpsAccuracySchema = z
  .number()
  .min(0, 'Akurasi tidak boleh negatif')
  .max(1000, 'Akurasi terlalu rendah (maksimal 1000 meter)')
  .optional()

// ============================================================================
// Update Delivery Status Schema
// ============================================================================

/**
 * Update delivery status with optional GPS location
 */
export const updateDeliveryStatusSchema = z.object({
  status: z.nativeEnum(DeliveryStatus, {
    message: 'Status pengiriman tidak valid'
  }),
  currentLocation: optionalGpsSchema,
  notes: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
})

export type UpdateDeliveryStatusInput = z.infer<typeof updateDeliveryStatusSchema>

// ============================================================================
// Start Delivery Schema
// ============================================================================

/**
 * Start delivery validation (departure)
 */
export const startDeliverySchema = z.object({
  departureTime: z.coerce.date({
    message: 'Waktu keberangkatan harus berupa tanggal yang valid'
  }),
  departureLocation: gpsCoordinateSchema,
  vehicleInfo: z
    .string()
    .min(3, 'Informasi kendaraan minimal 3 karakter')
    .max(100, 'Informasi kendaraan maksimal 100 karakter')
    .optional(),
  driverName: z
    .string()
    .min(3, 'Nama pengemudi minimal 3 karakter')
    .max(100, 'Nama pengemudi maksimal 100 karakter')
    .optional(),
  helperNames: z
    .array(
      z.string().min(3, 'Nama pembantu minimal 3 karakter')
    )
    .max(5, 'Maksimal 5 pembantu')
    .optional(),
  notes: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
}).refine(
  (data) => {
    // Departure time should not be in the future more than 1 hour
    const now = new Date()
    const maxFutureTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour ahead
    return data.departureTime <= maxFutureTime
  },
  {
    message: 'Waktu keberangkatan tidak boleh lebih dari 1 jam ke depan',
    path: ['departureTime']
  }
)

export type StartDeliveryInput = z.infer<typeof startDeliverySchema>

// ============================================================================
// Arrive at Destination Schema
// ============================================================================

/**
 * Arrival validation
 */
export const arriveDeliverySchema = z.object({
  arrivalTime: z.coerce.date({
    message: 'Waktu kedatangan harus berupa tanggal yang valid'
  }),
  arrivalLocation: gpsCoordinateSchema,
  notes: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
}).refine(
  (data) => {
    // Arrival time should not be in the future more than 1 hour
    const now = new Date()
    const maxFutureTime = new Date(now.getTime() + 60 * 60 * 1000)
    return data.arrivalTime <= maxFutureTime
  },
  {
    message: 'Waktu kedatangan tidak boleh lebih dari 1 jam ke depan',
    path: ['arrivalTime']
  }
)

export type ArriveDeliveryInput = z.infer<typeof arriveDeliverySchema>

// ============================================================================
// Complete Delivery Schema
// ============================================================================

/**
 * Complete delivery with signature and quality check
 */
export const completeDeliverySchema = z.object({
  deliveryCompletedAt: z.coerce.date({
    message: 'Waktu penyelesaian harus berupa tanggal yang valid'
  }),
  portionsDelivered: z
    .number()
    .int('Jumlah porsi harus bilangan bulat')
    .min(0, 'Jumlah porsi tidak boleh negatif')
    .max(10000, 'Jumlah porsi terlalu besar'),
  recipientName: z
    .string()
    .min(3, 'Nama penerima minimal 3 karakter')
    .max(100, 'Nama penerima maksimal 100 karakter'),
  recipientTitle: z
    .string()
    .max(50, 'Jabatan penerima maksimal 50 karakter')
    .optional(),
  recipientSignature: z
    .string()
    .url('Tanda tangan harus berupa URL yang valid')
    .optional(),
  foodQualityChecked: z.boolean({
    message: 'Status pengecekan kualitas harus berupa boolean'
  }),
  foodQualityNotes: z
    .string()
    .max(500, 'Catatan kualitas maksimal 500 karakter')
    .optional(),
  foodTemperature: z
    .number()
    .min(-20, 'Suhu makanan terlalu rendah')
    .max(100, 'Suhu makanan terlalu tinggi')
    .optional(),
  deliveryNotes: z
    .string()
    .max(1000, 'Catatan pengiriman maksimal 1000 karakter')
    .optional(),
  deliveryPhoto: z
    .string()
    .url('Foto pengiriman harus berupa URL yang valid')
    .optional()
}).refine(
  (data) => {
    // If quality checked, notes should be provided
    if (data.foodQualityChecked && !data.foodQualityNotes) {
      return false
    }
    return true
  },
  {
    message: 'Catatan kualitas wajib diisi jika kualitas makanan dicek',
    path: ['foodQualityNotes']
  }
).refine(
  (data) => {
    // If temperature is provided, quality should be checked
    if (data.foodTemperature !== undefined && !data.foodQualityChecked) {
      return false
    }
    return true
  },
  {
    message: 'Pengecekan kualitas harus diaktifkan jika suhu makanan dicatat',
    path: ['foodQualityChecked']
  }
).refine(
  (data) => {
    // Completion time should not be in the future more than 1 hour
    const now = new Date()
    const maxFutureTime = new Date(now.getTime() + 60 * 60 * 1000)
    return data.deliveryCompletedAt <= maxFutureTime
  },
  {
    message: 'Waktu penyelesaian tidak boleh lebih dari 1 jam ke depan',
    path: ['deliveryCompletedAt']
  }
)

export type CompleteDeliveryInput = z.infer<typeof completeDeliverySchema>

// ============================================================================
// Upload Photo Schema
// ============================================================================

/**
 * Upload delivery photo with GPS tagging
 */
export const uploadPhotoSchema = z.object({
  photoUrl: z
    .string()
    .url('URL foto harus valid'),
  photoType: z.nativeEnum(PhotoType, {
    message: 'Tipe foto tidak valid'
  }),
  caption: z
    .string()
    .max(200, 'Keterangan foto maksimal 200 karakter')
    .optional(),
  locationTaken: optionalGpsSchema,
  fileSize: z
    .number()
    .int('Ukuran file harus bilangan bulat')
    .min(1, 'Ukuran file tidak valid')
    .max(10 * 1024 * 1024, 'Ukuran file maksimal 10 MB')
    .optional(),
  mimeType: z
    .string()
    .regex(
      /^image\/(jpeg|jpg|png|webp)$/,
      'Format foto harus JPEG, PNG, atau WebP'
    )
    .optional()
})

export type UploadPhotoInput = z.infer<typeof uploadPhotoSchema>

// ============================================================================
// Report Delivery Issue Schema
// ============================================================================

/**
 * Report delivery issue
 */
export const reportDeliveryIssueSchema = z.object({
  issueType: z.nativeEnum(IssueType, {
    message: 'Tipe masalah tidak valid'
  }),
  severity: z.nativeEnum(IssueSeverity, {
    message: 'Tingkat keparahan tidak valid'
  }),
  description: z
    .string()
    .min(10, 'Deskripsi masalah minimal 10 karakter')
    .max(1000, 'Deskripsi masalah maksimal 1000 karakter'),
  notes: z
    .string()
    .max(500, 'Catatan tambahan maksimal 500 karakter')
    .optional()
})

export type ReportIssueInput = z.infer<typeof reportDeliveryIssueSchema>

// ============================================================================
// Track GPS Location Schema
// ============================================================================

/**
 * Track GPS location during delivery
 */
export const trackLocationSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Latitude harus antara -90 dan 90')
    .max(90, 'Latitude harus antara -90 dan 90'),
  longitude: z
    .number()
    .min(-180, 'Longitude harus antara -180 dan 180')
    .max(180, 'Longitude harus antara -180 dan 180'),
  accuracy: gpsAccuracySchema,
  status: z
    .string()
    .min(1, 'Status harus diisi')
    .max(50, 'Status maksimal 50 karakter'),
  notes: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
})

export type TrackLocationInput = z.infer<typeof trackLocationSchema>

// ============================================================================
// Delivery Filters Schema (for API queries)
// ============================================================================

/**
 * Filters for delivery list queries
 */
export const deliveryFiltersSchema = z.object({
  scheduleId: z.string().cuid().optional(),
  distributionId: z.string().cuid().optional(),
  schoolId: z.string().cuid().optional(), // ✅ UPDATED (Phase 3): Changed from schoolBeneficiaryId
  status: z
    .union([
      z.nativeEnum(DeliveryStatus),
      z.array(z.nativeEnum(DeliveryStatus))
    ])
    .optional(),
  driverName: z.string().min(1).max(100).optional(),
  hasIssues: z.coerce.boolean().optional(),
  qualityChecked: z.coerce.boolean().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().max(100).optional()
}).refine(
  (data) => {
    // If both dates provided, dateFrom should be before dateTo
    if (data.dateFrom && data.dateTo) {
      return data.dateFrom <= data.dateTo
    }
    return true
  },
  {
    message: 'Tanggal mulai harus sebelum atau sama dengan tanggal akhir',
    path: ['dateFrom']
  }
)

export type DeliveryFiltersInput = z.infer<typeof deliveryFiltersSchema>

// ============================================================================
// Pagination Schema
// ============================================================================

/**
 * Pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int('Halaman harus bilangan bulat')
    .min(1, 'Halaman minimal 1')
    .default(1),
  limit: z.coerce
    .number()
    .int('Limit harus bilangan bulat')
    .min(1, 'Limit minimal 1')
    .max(100, 'Limit maksimal 100')
    .default(10)
})

export type PaginationInput = z.infer<typeof paginationSchema>

// ============================================================================
// Combined Schemas
// ============================================================================

/**
 * Delivery list query with filters and pagination
 */
export const deliveryListQuerySchema = deliveryFiltersSchema.merge(paginationSchema)

export type DeliveryListQueryInput = z.infer<typeof deliveryListQuerySchema>

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse GPS coordinate string to object
 */
export function parseGPSCoordinate(gps: string | null | undefined): {
  latitude: number
  longitude: number
} | null {
  if (!gps) return null
  
  try {
    const [lat, lng] = gps.split(',').map(Number)
    if (isNaN(lat) || isNaN(lng)) return null
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
    
    return { latitude: lat, longitude: lng }
  } catch {
    return null
  }
}

/**
 * Format GPS coordinate object to string
 */
export function formatGPSCoordinate(latitude: number, longitude: number): string {
  return `${latitude},${longitude}`
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Validate if delivery time is within reasonable range
 */
export function isValidDeliveryTime(time: Date, maxHoursAhead: number = 1): boolean {
  const now = new Date()
  const maxFutureTime = new Date(now.getTime() + maxHoursAhead * 60 * 60 * 1000)
  return time <= maxFutureTime
}

/**
 * Validate food temperature is in safe range
 */
export function isFoodTemperatureSafe(
  temperature: number | null | undefined,
  minSafe: number = 60,
  maxSafe: number = 80
): boolean {
  if (temperature === null || temperature === undefined) return false
  return temperature >= minSafe && temperature <= maxSafe
}
