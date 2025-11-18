/**
 * @fileoverview Position TypeScript Type Definitions
 * Comprehensive type definitions for Position management with relations
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Position, EmployeeLevel } from '@prisma/client'
import type { ApiResponse } from './department.types'

/**
 * Base Position Type
 * Core position entity from Prisma
 */
export type { Position, EmployeeLevel }

/**
 * Position Input Type
 * Data required to create a new position
 */
export interface PositionInput {
  departmentId: string
  positionCode: string
  positionName: string
  jobDescription?: string | null
  requirements?: string[]
  responsibilities?: string[]
  level?: EmployeeLevel
  reportsTo?: string | null
  minSalary?: number | null
  maxSalary?: number | null
  currency?: string
  maxOccupants?: number
  isActive?: boolean
}

/**
 * Position Update Type
 * Partial data for updating existing position
 */
export interface PositionUpdate {
  departmentId?: string
  positionCode?: string
  positionName?: string
  jobDescription?: string | null
  requirements?: string[]
  responsibilities?: string[]
  level?: EmployeeLevel
  reportsTo?: string | null
  minSalary?: number | null
  maxSalary?: number | null
  currency?: string
  maxOccupants?: number
  isActive?: boolean
}

/**
 * Position Filters Type
 * Query parameters for filtering position list
 */
export interface PositionFilters {
  search?: string
  departmentId?: string
  level?: EmployeeLevel
  isActive?: boolean
  minSalaryRange?: number
  maxSalaryRange?: number
}

/**
 * Position with Department Relation
 * Position with basic department information
 */
export interface PositionWithDepartment extends Position {
  department: {
    id: string
    departmentCode: string
    departmentName: string
    isActive: boolean
    parentId: string | null
  }
}

/**
 * Position with Employees Relation
 * Position with full employee details
 */
export interface PositionWithEmployees extends Position {
  employees: Array<{
    id: string
    employeeCode: string | null
    fullName: string
    email: string | null
    photoUrl: string | null
    employmentStatus: string
    isActive: boolean
  }>
}

/**
 * Position with All Relations
 * Complete position data with all related entities
 */
export interface PositionWithRelations extends Position {
  department: {
    id: string
    departmentCode: string
    departmentName: string
    isActive: boolean
    parentId: string | null
  }
  employees: Array<{
    id: string
    employeeCode: string | null
    fullName: string
    email: string | null
    photoUrl: string | null
    employmentStatus: string
    isActive: boolean
  }>
  _count: {
    employees: number
  }
}

/**
 * Position with Count Only
 * Position with employee count for list displays
 */
export interface PositionWithCount extends Position {
  department: {
    id: string
    departmentCode: string
    departmentName: string
    isActive: boolean
  }
  _count: {
    employees: number
  }
}

/**
 * Position Statistics Type
 * Aggregated statistics for position analytics
 */
export interface PositionStats {
  totalPositions: number
  activePositions: number
  inactivePositions: number
  totalMaxOccupants: number
  totalCurrentOccupants: number
  occupancyRate: number // Percentage: (current / max) * 100
  byLevel: Record<EmployeeLevel, number>
  byDepartment: Array<{
    departmentId: string
    departmentName: string
    positionCount: number
  }>
}

/**
 * Position Occupancy Type
 * Occupancy information for capacity management
 */
export interface PositionOccupancy {
  positionId: string
  positionCode: string
  positionName: string
  maxOccupants: number
  currentOccupants: number
  availableSlots: number
  occupancyRate: number // Percentage
  isAtCapacity: boolean
  isNearCapacity: boolean // >= 80%
}

/**
 * Position Salary Range Type
 * Salary information for compensation management
 */
export interface PositionSalaryRange {
  positionId: string
  positionCode: string
  positionName: string
  level: EmployeeLevel
  minSalary: number | null
  maxSalary: number | null
  currency: string
  midpoint: number | null // Average of min and max
  spread: number | null // max - min
}

/**
 * Position List Response Type
 * API response for position list endpoint
 */
export type PositionListResponse = ApiResponse<PositionWithCount[]>

/**
 * Position Detail Response Type
 * API response for position detail endpoint
 */
export type PositionDetailResponse = ApiResponse<PositionWithRelations>

/**
 * Position Create Response Type
 * API response for position creation endpoint
 */
export type PositionCreateResponse = ApiResponse<PositionWithCount>

/**
 * Position Update Response Type
 * API response for position update endpoint
 */
export type PositionUpdateResponse = ApiResponse<PositionWithRelations>

/**
 * Position Delete Response Type
 * API response for position deletion endpoint
 */
export type PositionDeleteResponse = ApiResponse<{ message: string }>

/**
 * Position by Department Response Type
 * API response for positions by department endpoint
 */
export type PositionByDepartmentResponse = ApiResponse<PositionWithCount[]>

/**
 * Employee Level Labels
 * Human-readable labels for employee levels
 */
export const EMPLOYEE_LEVEL_LABELS: Record<EmployeeLevel, string> = {
  STAFF: 'Staff',
  SUPERVISOR: 'Supervisor',
  MANAGER: 'Manager',
  SENIOR_MANAGER: 'Senior Manager',
  DIRECTOR: 'Director',
  EXECUTIVE: 'Executive',
}

/**
 * Employee Level Colors
 * Color variants for level badges (shadcn/ui)
 */
export const EMPLOYEE_LEVEL_COLORS: Record<
  EmployeeLevel,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  STAFF: 'outline',
  SUPERVISOR: 'secondary',
  MANAGER: 'default',
  SENIOR_MANAGER: 'default',
  DIRECTOR: 'destructive',
  EXECUTIVE: 'destructive',
}

/**
 * Position Form Mode
 * Determines form behavior (create vs edit)
 */
export type PositionFormMode = 'create' | 'edit'

/**
 * Position Sort Field
 * Available fields for sorting position list
 */
export type PositionSortField =
  | 'positionCode'
  | 'positionName'
  | 'level'
  | 'departmentName'
  | 'currentOccupants'
  | 'createdAt'
  | 'updatedAt'

/**
 * Position Sort Order
 * Sort direction
 */
export type PositionSortOrder = 'asc' | 'desc'
