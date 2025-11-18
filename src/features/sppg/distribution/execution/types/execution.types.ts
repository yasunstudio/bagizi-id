/**
 * @fileoverview FoodDistribution Execution Type Definitions
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @description Type definitions for distribution execution tracking (real-time monitoring)
 * @author Bagizi-ID Development Team
 * @see {@link /docs/DISTRIBUTION_PHASE2_EXECUTION_PLAN.md} PHASE 2 Plan
 */

import {
  FoodDistribution,
  DistributionDelivery,
  DistributionSchedule,
  VehicleAssignment,
  DistributionStatus,
  Vehicle,
} from '@prisma/client'

// ============================================================================
// CORE EXECUTION TYPES
// ============================================================================

/**
 * Execution with all relations populated
 */
export interface ExecutionWithRelations extends FoodDistribution {
  sppg: {
    id: string
    sppgName: string
    sppgCode: string
  }
  production?: {
    estimatedCost: number
    actualCost: number | null
    costPerPortion: number | null
    plannedPortions: number
  } | null
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
    vehicleAssignments: VehicleAssignment[]
    packagingCost?: number | null
    fuelCost?: number | null
    totalPortions: number
    estimatedBeneficiaries: number
  }
  vehicle: Vehicle | null
  deliveries: (DistributionDelivery & {
    school: { // ✅ UPDATED (Phase 3)
      id: string
      schoolName: string
      schoolAddress: string
    } | null
  })[]
}

/**
 * Execution list item (simplified for table view)
 */
export interface ExecutionListItem {
  id: string
  distributionCode: string
  scheduleId: string
  scheduleName: string // From schedule.menuName
  status: DistributionStatus
  actualStartTime: Date | null
  actualEndTime: Date | null
  totalPortionsDelivered: number
  totalBeneficiariesReached: number
  plannedPortions: number // From schedule
  plannedBeneficiaries: number // From schedule
  deliveryCount: number
  completedDeliveryCount: number
  issuesCount: number
  createdAt: Date
}

/**
 * Execution detail (full information for monitoring)
 */
export interface ExecutionDetail extends ExecutionWithRelations {
  metrics: ExecutionMetrics
}

/**
 * Real-time execution metrics
 */
export interface ExecutionMetrics {
  // Progress
  progressPercentage: number
  portionProgress: {
    delivered: number
    planned: number
    percentage: number
  }
  beneficiaryProgress: {
    reached: number
    planned: number
    percentage: number
  }
  deliveryProgress: {
    completed: number
    total: number
    percentage: number
  }

  // Performance
  duration: number // In minutes
  estimatedTimeRemaining: number | null // In minutes
  deliveryRate: number // Portions per hour
  
  // Status
  activeVehicles: number
  issuesReported: number
  delayedDeliveries: number
  
  // Summary
  onTrack: boolean
  completionETA: Date | null
}

// ============================================================================
// ISSUE REPORTING
// ============================================================================

/**
 * Issue types during distribution
 */
export enum IssueType {
  VEHICLE_BREAKDOWN = 'VEHICLE_BREAKDOWN',
  WEATHER_DELAY = 'WEATHER_DELAY',
  TRAFFIC_JAM = 'TRAFFIC_JAM',
  ACCESS_DENIED = 'ACCESS_DENIED',
  RECIPIENT_UNAVAILABLE = 'RECIPIENT_UNAVAILABLE',
  FOOD_QUALITY = 'FOOD_QUALITY',
  SHORTAGE = 'SHORTAGE',
  OTHER = 'OTHER',
}

/**
 * Issue severity levels
 */
export enum IssueSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Issue report data
 */
export interface IssueReport {
  id?: string
  executionId: string
  type: IssueType
  severity: IssueSeverity
  description: string
  location?: string
  affectedDeliveries?: string[] // Delivery IDs
  reportedBy: string
  reportedAt: Date
  resolved: boolean
  resolutionNotes?: string
  resolvedAt?: Date | null
}

// ============================================================================
// EXECUTION STATUS
// ============================================================================

/**
 * Re-export Prisma distribution status enum
 */
export { DistributionStatus } from '@prisma/client'

/**
 * Status transition validation
 * Flow: SCHEDULED → PREPARING → IN_TRANSIT → DISTRIBUTING → COMPLETED
 */
export const EXECUTION_STATUS_TRANSITIONS: Record<
  DistributionStatus,
  DistributionStatus[]
> = {
  SCHEDULED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DISTRIBUTING', 'CANCELLED'],
  DISTRIBUTING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

/**
 * Status labels for UI (Indonesian)
 */
export const EXECUTION_STATUS_LABELS: Record<DistributionStatus, string> = {
  SCHEDULED: 'Dijadwalkan',
  PREPARING: 'Persiapan',
  IN_TRANSIT: 'Dalam Perjalanan',
  DISTRIBUTING: 'Sedang Distribusi',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
}

/**
 * Status colors for badges
 */
export const EXECUTION_STATUS_COLORS: Record<
  DistributionStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  SCHEDULED: 'outline',
  PREPARING: 'secondary',
  IN_TRANSIT: 'default',
  DISTRIBUTING: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
}

// ============================================================================
// FORM INPUTS
// ============================================================================

/**
 * Start execution input
 */
export interface StartExecutionInput {
  scheduleId: string
  notes?: string
}

/**
 * Update execution input
 */
export interface UpdateExecutionInput {
  totalPortionsDelivered?: number
  totalBeneficiariesReached?: number
  notes?: string
}

/**
 * Complete execution input
 */
export interface CompleteExecutionInput {
  actualEndTime?: Date
  totalPortionsDelivered: number
  totalBeneficiariesReached: number
  completionNotes?: string
}

/**
 * Report issue input
 */
export interface ReportIssueInput {
  type: IssueType
  severity: IssueSeverity
  description: string
  location?: string
  affectedDeliveries?: string[]
}

// ============================================================================
// FILTER & SEARCH
// ============================================================================

/**
 * Execution list filters
 */
export interface ExecutionFilters {
  status?: DistributionStatus | DistributionStatus[]
  scheduleId?: string
  dateFrom?: Date
  dateTo?: Date
  hasIssues?: boolean
  search?: string // Search by distribution code or schedule name
}

/**
 * Execution sort options
 */
export interface ExecutionSortOptions {
  field: 'actualStartTime' | 'status' | 'progressPercentage' | 'createdAt'
  direction: 'asc' | 'desc'
}

// ============================================================================
// API RESPONSES
// ============================================================================

/**
 * Execution list response
 */
export interface ExecutionListResponse {
  executions: ExecutionListItem[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Execution statistics
 */
export interface ExecutionStatistics {
  total: number
  byStatus: Record<DistributionStatus, number>
  activeExecutions: number
  completedToday: number
  totalPortionsDelivered: number
  totalBeneficiariesReached: number
  averageDeliveryRate: number
  issuesReported: number
}

// ============================================================================
// REAL-TIME UPDATES
// ============================================================================

/**
 * Real-time event types
 */
export enum ExecutionEventType {
  STATUS_CHANGED = 'STATUS_CHANGED',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
  ISSUE_REPORTED = 'ISSUE_REPORTED',
  ISSUE_RESOLVED = 'ISSUE_RESOLVED',
  PROGRESS_UPDATED = 'PROGRESS_UPDATED',
}

/**
 * Real-time event data
 */
export interface ExecutionEvent {
  type: ExecutionEventType
  executionId: string
  timestamp: Date
  data: Record<string, unknown>
  userId?: string
}
