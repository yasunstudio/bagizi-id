/**
 * @fileoverview TypeScript types for DistributionDelivery GPS tracking module
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/DISTRIBUTION_PHASE3_DELIVERY_PLAN.md} PHASE 3 Implementation Plan
 */

import type { 
  DistributionDelivery,
  DeliveryPhoto,
  DeliveryIssue,
  DeliveryTracking,
  DistributionSchedule,
  FoodDistribution,
  School, // ✅ UPDATED (Phase 3): Changed from SchoolBeneficiary
  DeliveryStatus,
  PhotoType,
  IssueType,
  IssueSeverity,
  Prisma
} from '@prisma/client'

// ============================================================================
// GPS & Location Types
// ============================================================================

/**
 * GPS coordinate with accuracy
 */
export interface GPSCoordinate {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp?: Date
}

/**
 * Route tracking point with status
 */
export interface RoutePoint extends GPSCoordinate {
  status: string
  notes?: string
}

/**
 * Parsed location string to coordinate object
 */
export type ParsedLocation = GPSCoordinate | null

// ============================================================================
// Delivery with Relations Types
// ============================================================================

/**
 * Full delivery with all relations loaded
 */
export type DeliveryWithRelations = DistributionDelivery & {
  schedule: DistributionSchedule & {
    production: {
      id: string
      batchNumber: string
      menu: {
        id: string
        menuName: string
        servingSize: number
      }
    }
  }
  distribution: FoodDistribution | null
  school: School | null // ✅ UPDATED (Phase 3): Changed from schoolBeneficiary
  photos: DeliveryPhoto[]
  issues: DeliveryIssue[]
  trackingPoints: DeliveryTracking[]
}

/**
 * Simplified delivery for list view
 */
export type DeliveryListItem = Pick<
  DistributionDelivery,
  | 'id'
  | 'scheduleId'
  | 'distributionId'
  | 'schoolId' // ✅ UPDATED (Phase 3)
  | 'targetName'
  | 'targetAddress'
  | 'plannedTime'
  | 'actualTime'
  | 'departureTime'
  | 'arrivalTime'
  | 'deliveryCompletedAt'
  | 'portionsPlanned'
  | 'portionsDelivered'
  | 'status'
  | 'driverName'
  | 'vehicleInfo'
  | 'currentLocation'
  | 'foodQualityChecked'
  | 'createdAt'
> & {
  schedule: Pick<DistributionSchedule, 'id' | 'sppgId'> & {
    production: {
      menu: {
        menuName: string
      }
    }
  }
  distribution?: Pick<FoodDistribution, 'id' | 'distributionCode'> | null
  school?: Pick<School, 'id' | 'schoolName' | 'schoolAddress'> | null // ✅ UPDATED (Phase 3)
  _count?: {
    photos: number
    issues: number
    trackingPoints: number
  }
}

/**
 * Full delivery detail with metrics
 */
export interface DeliveryDetail extends DeliveryWithRelations {
  metrics: DeliveryMetrics
  parsedLocations: {
    departure: ParsedLocation
    arrival: ParsedLocation
    current: ParsedLocation
  }
  routePoints: RoutePoint[]
}

// ============================================================================
// Metrics & Statistics Types
// ============================================================================

/**
 * Real-time delivery metrics
 */
export interface DeliveryMetrics {
  // Timing metrics
  isOnTime: boolean
  isDelayed: boolean
  delayMinutes: number
  estimatedArrivalTime: Date | null
  totalDuration: number | null // in minutes
  inTransitDuration: number | null
  
  // Distance & route metrics
  totalDistance: number | null // in kilometers
  averageSpeed: number | null // in km/h
  routeDeviation: number | null // percentage from planned route
  
  // Delivery metrics
  portionsFulfillment: number // percentage
  hasIssues: boolean
  unresolvedIssuesCount: number
  photoCount: number
  trackingPointsCount: number
  
  // Quality metrics
  qualityCheckPassed: boolean
  temperatureInRange: boolean
  
  // Status metrics
  isPending: boolean
  isInTransit: boolean
  isArrived: boolean
  isDelivered: boolean
  isFailed: boolean
  isPartial: boolean
}

/**
 * Delivery statistics aggregation
 */
export interface DeliveryStatistics {
  total: number
  byStatus: Record<DeliveryStatus, number>
  onTimeCount: number
  delayedCount: number
  withIssuesCount: number
  avgDeliveryTime: number // in minutes
  avgPortionsFulfillment: number // percentage
  totalPhotos: number
  totalIssues: number
  totalTrackingPoints: number
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Filters for delivery list queries
 */
export interface DeliveryFilters {
  scheduleId?: string
  distributionId?: string
  schoolId?: string // ✅ UPDATED (Phase 3)
  status?: string | string[] // String values: "ASSIGNED", "DEPARTED", "DELIVERED", "FAILED"
  driverName?: string
  hasIssues?: boolean
  qualityChecked?: boolean
  dateFrom?: Date | string
  dateTo?: Date | string
  search?: string
}

/**
 * Delivery list API response
 */
export interface DeliveryListResponse {
  success: boolean
  data: DeliveryListItem[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  statistics?: DeliveryStatistics
}

/**
 * Single delivery API response
 */
export interface DeliveryDetailResponse {
  success: boolean
  data: DeliveryDetail
}

/**
 * Generic delivery API response
 */
export interface DeliveryResponse {
  success: boolean
  data?: DistributionDelivery
  error?: string
  details?: Record<string, unknown>
}

/**
 * GPS tracking history API response
 */
export interface TrackingHistoryResponse {
  success: boolean
  data: DeliveryTracking[]
  statistics: {
    totalPoints: number
    totalDistance: number
    latestPoint: {
      latitude: number
      longitude: number
      recordedAt: Date
      status: string
    } | null
  }
}

// ============================================================================
// Form Input Types
// ============================================================================

/**
 * Update delivery status input
 */
export interface UpdateDeliveryStatusInput {
  status: DeliveryStatus
  currentLocation?: string
  notes?: string
}

/**
 * Start delivery input
 */
export interface StartDeliveryInput {
  departureTime: Date | string
  departureLocation: string
  vehicleInfo?: string
  driverName?: string
  helperNames?: string[]
  notes?: string
}

/**
 * Arrive at destination input
 */
export interface ArriveDeliveryInput {
  arrivalTime: Date | string
  arrivalLocation: string
  notes?: string
}

/**
 * Complete delivery input
 */
export interface CompleteDeliveryInput {
  deliveryCompletedAt: Date | string
  portionsDelivered: number
  recipientName: string
  recipientTitle?: string
  recipientSignature?: string
  foodQualityChecked: boolean
  foodQualityNotes?: string
  foodTemperature?: number
  deliveryNotes?: string
  deliveryPhoto?: string
}

/**
 * Upload photo input
 */
export interface UploadPhotoInput {
  photoUrl: string
  photoType: PhotoType
  caption?: string
  locationTaken?: string
  fileSize?: number
  mimeType?: string
}

/**
 * Report issue input
 */
export interface ReportIssueInput {
  issueType: IssueType
  severity: IssueSeverity
  description: string
  notes?: string
}

/**
 * Track GPS location input
 */
export interface TrackLocationInput {
  latitude: number
  longitude: number
  accuracy?: number
  status: string
  notes?: string
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Photo with metadata
 */
export type PhotoWithMetadata = DeliveryPhoto & {
  parsedLocation: ParsedLocation
}

/**
 * Issue with resolution status
 */
export type IssueWithStatus = DeliveryIssue & {
  isResolved: boolean
  daysSinceReported: number
}

/**
 * Tracking point with parsed coordinates
 */
export type TrackingPointParsed = DeliveryTracking & {
  coordinate: GPSCoordinate
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if delivery has GPS tracking
 */
export function hasGPSTracking(delivery: DistributionDelivery): boolean {
  return !!(
    delivery.departureLocation ||
    delivery.arrivalLocation ||
    delivery.currentLocation ||
    (delivery.routeTrackingPoints && delivery.routeTrackingPoints.length > 0)
  )
}

/**
 * Check if delivery has quality checks
 */
export function hasQualityCheck(delivery: DistributionDelivery): boolean {
  return delivery.foodQualityChecked === true
}

/**
 * Check if delivery is active (in progress)
 */
export function isActiveDelivery(delivery: DistributionDelivery): boolean {
  return delivery.status === 'DEPARTED'
}

/**
 * Check if delivery is completed
 */
export function isCompletedDelivery(delivery: DistributionDelivery): boolean {
  return delivery.status === 'DELIVERED' || delivery.status === 'FAILED' || delivery.status === 'CANCELLED'
}

// ============================================================================
// Prisma Include Types (for type-safe queries)
// ============================================================================

/**
 * Standard include for delivery list queries
 */
export const deliveryListInclude = {
  schedule: {
    select: {
      id: true,
      sppgId: true,
      production: {
        select: {
          menu: {
            select: {
              menuName: true,
            }
          }
        }
      }
    }
  },
  distribution: {
    select: {
      id: true,
      distributionCode: true,
    }
  },
  school: { // ✅ UPDATED (Phase 3)
    select: {
      id: true,
      schoolName: true,
      schoolAddress: true,
    }
  },
  _count: {
    select: {
      photos: true,
      issues: true,
      trackingPoints: true,
    }
  }
} satisfies Prisma.DistributionDeliveryInclude

/**
 * Full include for delivery detail queries
 */
export const deliveryDetailInclude = {
  schedule: {
    include: {
      production: {
        select: {
          id: true,
          batchNumber: true,
          menu: {
            select: {
              id: true,
              menuName: true,
              servingSize: true,
            }
          }
        }
      }
    }
  },
  distribution: true,
  school: true, // ✅ UPDATED (Phase 3)
  photos: {
    orderBy: {
      takenAt: 'desc' as const
    }
  },
  issues: {
    orderBy: {
      reportedAt: 'desc' as const
    }
  },
  trackingPoints: {
    orderBy: {
      recordedAt: 'asc' as const
    }
  }
} satisfies Prisma.DistributionDeliveryInclude
