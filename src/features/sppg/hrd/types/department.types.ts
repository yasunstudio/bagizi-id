/**
 * @fileoverview HRD Department TypeScript Types
 * @version Next.js 15.5.4 / TypeScript 5.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Type Safety Guidelines
 * 
 * TypeScript type definitions for Department domain
 * Includes full Prisma types and API response types
 */

import { Department, Employee, Position, SPPG } from '@prisma/client'

/**
 * Base Department type from Prisma
 */
export type { Department }

/**
 * Department input for create operations
 */
export interface DepartmentInput {
  departmentCode: string
  departmentName: string
  description?: string | null
  parentId?: string | null
  managerId?: string | null
  budgetAllocated?: number | null
  maxEmployees?: number | null
  email?: string | null
  phone?: string | null
  location?: string | null
  isActive?: boolean
}

/**
 * Department update input (all fields optional)
 */
export type DepartmentUpdate = Partial<DepartmentInput>

/**
 * Department filter parameters for queries
 */
export interface DepartmentFilters {
  search?: string
  parentId?: string
  managerId?: string
  isActive?: boolean
  hasParent?: boolean
}

/**
 * Department with parent relationship
 */
export interface DepartmentWithParent extends Department {
  parent: Department | null
}

/**
 * Department with children relationship
 */
export interface DepartmentWithChildren extends Department {
  children: Department[]
}

/**
 * Department with employees relationship
 */
export interface DepartmentWithEmployees extends Department {
  employees: Employee[]
}

/**
 * Department with positions relationship
 */
export interface DepartmentWithPositions extends Department {
  positions: Position[]
}

/**
 * Department with all relationships
 */
export interface DepartmentWithRelations extends Department {
  sppg: SPPG
  parent: Department | null
  children: Department[]
  employees: Employee[]
  positions: Position[]
  manager?: Employee | null
  _count: {
    employees: number
    positions: number
    children: number
  }
}

/**
 * Hierarchical department tree node
 */
export interface DepartmentTreeNode {
  id: string
  departmentCode: string
  departmentName: string
  description?: string | null
  managerId?: string | null
  budgetAllocated?: number | null
  maxEmployees?: number | null
  currentEmployees: number
  isActive: boolean
  children: DepartmentTreeNode[]
}

/**
 * Department statistics
 */
export interface DepartmentStats {
  totalDepartments: number
  activeDepartments: number
  inactiveDepartments: number
  rootDepartments: number
  childDepartments: number
  totalEmployees: number
  avgEmployeesPerDept: number
  departmentsAtCapacity: number
  totalBudgetAllocated: number
  departmentsWithBudget: number
}

/**
 * Department capacity info
 */
export interface DepartmentCapacity {
  departmentId: string
  departmentName: string
  currentEmployees: number
  maxEmployees: number | null
  capacityUsed: number // percentage
  hasCapacity: boolean
  remainingSlots: number | null
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}

/**
 * Department list response
 */
export type DepartmentListResponse = ApiResponse<Department[]>

/**
 * Department detail response
 */
export type DepartmentDetailResponse = ApiResponse<DepartmentWithRelations>

/**
 * Department hierarchy response
 */
export type DepartmentHierarchyResponse = ApiResponse<DepartmentTreeNode[]>

/**
 * Department statistics response
 */
export type DepartmentStatsResponse = ApiResponse<DepartmentStats>
