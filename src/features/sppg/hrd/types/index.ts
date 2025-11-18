/**
 * @fileoverview HRD Employee Types
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * TypeScript types for Employee management based on Prisma schema
 */

import type {
  Employee,
  Gender,
  MaritalStatus,
  EmploymentType,
  EmploymentStatus,
  EmployeeLevel,
} from '@prisma/client'

/**
 * Employee list item for DataTable display
 * Optimized with only essential fields for list view
 */
export interface EmployeeListItem {
  id: string
  employeeCode: string | null
  fullName: string
  email: string | null
  phone: string | null
  department: {
    id: string
    departmentName: string
  }
  position: {
    id: string
    positionName: string
    level: EmployeeLevel
  }
  employmentType: EmploymentType
  employmentStatus: EmploymentStatus
  joinDate: Date
  isActive: boolean
}

/**
 * Employee detail with full information and relations
 * Used for detail page and edit form
 */
export interface EmployeeDetail extends Omit<Employee, 'sppgId'> {
  department: {
    id: string
    departmentCode: string
    departmentName: string
  }
  position: {
    id: string
    positionCode: string
    positionName: string
    level: EmployeeLevel
  }
  village: {
    id: string
    name: string
    district: {
      id: string
      name: string
      regency: {
        id: string
        name: string
        province: {
          id: string
          name: string
        }
      }
    }
  }
  sppg: {
    id: string
    code: string
    name: string
  }
  user?: {
    id: string
    email: string
    name: string
  } | null
}

/**
 * Filters for employee list queries
 */
export interface EmployeeFilters {
  search?: string // Search in fullName, email, employeeCode
  departmentId?: string
  positionId?: string
  employmentType?: EmploymentType
  employmentStatus?: EmploymentStatus
  employeeLevel?: EmployeeLevel
  gender?: Gender
  isActive?: boolean
  joinDateFrom?: Date
  joinDateTo?: Date
  page?: number
  limit?: number
  sortBy?: 'fullName' | 'employeeCode' | 'joinDate' | 'department' | 'position'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Employee statistics for dashboard
 */
export interface EmployeeStatistics {
  total: number
  active: number
  inactive: number
  byDepartment: Record<string, number>
  byPosition: Record<string, number>
  byEmploymentType: {
    permanent: number
    contract: number
    partTime: number
    intern: number
  }
  byEmploymentStatus: {
    active: number
    probation: number
    terminated: number
    resigned: number
    retired: number
  }
  byGender: {
    male: number
    female: number
  }
  newHiresThisMonth: number
  terminationsThisMonth: number
}

/**
 * Department list item
 */
export interface DepartmentListItem {
  id: string
  departmentCode: string
  departmentName: string
  description: string | null
  currentEmployees: number
  maxEmployees: number | null
  isActive: boolean
}

/**
 * Position list item
 */
export interface PositionListItem {
  id: string
  positionCode: string
  positionName: string
  departmentId: string
  departmentName: string
  level: EmployeeLevel
  currentOccupants: number
  maxOccupants: number
  isActive: boolean
}

// Export Prisma enums for convenience
export type {
  Gender,
  MaritalStatus,
  EmploymentType,
  EmploymentStatus,
  EmployeeLevel,
}

// Export Department types
export * from './department.types'

// Export Position types
export * from './position.types'
