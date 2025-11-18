/**
 * @fileoverview Menu Plans API Client
 * @version Next.js 15.5.4 / Enterprise-grade API client
 * @author Bagizi-ID Development Team
 * 
 * API client for menu plan management and procurement integration
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { ApiResponse } from '@/lib/api-utils'

// ================================ TYPES ================================

export interface MenuPlan {
  id: string
  programId: string
  sppgId: string
  createdBy: string
  approvedBy: string | null
  name: string
  description: string | null
  startDate: string | Date
  endDate: string | Date
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
  isDraft: boolean
  isActive: boolean
  isArchived: boolean
  publishedAt: string | Date | null
  archivedAt: string | Date | null
  totalDays: number
  totalMenus: number
  averageCostPerDay: number
  totalEstimatedCost: number
  nutritionScore: number | null
  varietyScore: number | null
  costEfficiency: number | null
  meetsNutritionStandards: boolean
  meetsbudgetConstraints: boolean
  planningRules: Record<string, unknown> | null
  generationMetadata: Record<string, unknown> | null
  createdAt: string | Date
  updatedAt: string | Date
  approvedAt: string | Date | null
  publishedBy: string | null
  rejectedAt: string | Date | null
  rejectedBy: string | null
  rejectionReason: string | null
  submittedAt: string | Date | null
  submittedBy: string | null
}

export interface MenuAssignment {
  id: string
  menuPlanId: string
  menuId: string
  assignedDate: string | Date
  mealType: 'BREAKFAST' | 'SNACK' | 'LUNCH' | 'DINNER'
  plannedPortions: number
  estimatedCost: number
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  isSubstitute: boolean
  notes: string | null
  status: 'PLANNED' | 'CONFIRMED' | 'PRODUCED' | 'CANCELLED'
  isProduced: boolean
  isDistributed: boolean
  actualPortions: number | null
  actualCost: number | null
  productionId: string | null
  createdAt: string | Date
  updatedAt: string | Date
  menu?: MenuWithIngredients
}

export interface MenuWithIngredients {
  id: string
  menuName: string
  menuCode: string
  ingredients?: MenuIngredient[]
}

export interface MenuIngredient {
  id: string
  inventoryItemId: string
  quantity: number
  inventoryItem?: InventoryItem
}

export interface InventoryItem {
  id: string
  itemName: string
  category: string
  unit: string
  costPerUnit: number
}

export interface MenuPlanWithAssignments extends MenuPlan {
  assignments: MenuAssignment[]
}

export interface MenuPlanFilters {
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
  isArchived?: boolean
  programId?: string
  startDate?: string
  endDate?: string
}

// ================================ API CLIENT ================================

/**
 * Menu Plans API client with enterprise patterns
 * All methods support SSR via optional headers parameter
 */
export const menuPlansApi = {
  /**
   * Fetch all menu plans with optional filtering
   * @param filters - Optional filter parameters
   * @param headers - Optional headers for SSR
   * @returns Promise with API response
   */
  async getAll(
    filters?: MenuPlanFilters,
    headers?: HeadersInit
  ): Promise<ApiResponse<MenuPlan[]>> {
    const baseUrl = getBaseUrl()
    
    // Build query string if filters provided
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.isArchived !== undefined) params.append('isArchived', String(filters.isArchived))
    if (filters?.programId) params.append('programId', filters.programId)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    
    const queryString = params.toString()
    const url = queryString 
      ? `${baseUrl}/api/sppg/menu/plans?${queryString}`
      : `${baseUrl}/api/sppg/menu/plans`
    
    const response = await fetch(url, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch menu plans')
    }
    
    return response.json()
  },

  /**
   * Get menu plan by ID with assignments
   * @param id - Menu plan ID
   * @param headers - Optional headers for SSR
   */
  async getById(
    id: string,
    headers?: HeadersInit
  ): Promise<ApiResponse<MenuPlanWithAssignments>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/menu/plans/${id}`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch menu plan')
    }
    
    return response.json()
  },
}
