/**
 * @fileoverview Food Production API Client
 * @module features/sppg/production/api/productionApi
 * @description API client for food production operations with quality control
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import { FoodProduction, QualityControl, ProductionStatus } from '@prisma/client'

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ProductionFilters {
  page?: number
  limit?: number
  search?: string // Search by batch number or menu name
  status?: ProductionStatus | 'ALL'
  startDate?: string // ISO date string
  endDate?: string // ISO date string
  menuId?: string
  programId?: string
}

export interface ProductionInput {
  programId: string
  menuId: string
  productionDate: Date | string
  batchNumber?: string // Auto-generated if not provided
  plannedPortions: number
  plannedStartTime: Date | string
  plannedEndTime: Date | string
  headCook: string // User ID
  assistantCooks?: string[] // Array of User IDs
  supervisorId?: string // User ID
  // ❌ estimatedCost removed - use ProductionCostCalculator.calculateEstimatedCost()
  targetTemperature?: number
  notes?: string
}

export interface ProductionResponse {
  success: boolean
  data?: FoodProduction & {
    sppg?: {
      id: string
      name: string
      code: string
    }
    program?: {
      id: string
      name: string
    }
    menu?: {
      id: string
      name: string
      code: string
      mealType: string
      servingSize: number
    }
    qualityChecks?: QualityControl[]
    _count?: {
      qualityChecks: number
    }
  }
  error?: string
}

export interface ProductionListResponse {
  success: boolean
  data?: Array<FoodProduction & {
    sppg?: {
      id: string
      name: string
      code: string
    }
    program?: {
      id: string
      name: string
    }
    menu?: {
      id: string
      name: string
      code: string
      mealType: string
    }
    _count?: {
      qualityChecks: number
    }
  }>
  pagination?: {
    total: number
    page: number
    limit: number
    pages: number // Changed from totalPages to match API response
  }
  error?: string
}

export interface QualityCheckInput {
  checkType: 'HYGIENE' | 'TEMPERATURE' | 'TASTE' | 'APPEARANCE' | 'SAFETY'
  parameter: string
  expectedValue?: string
  actualValue: string
  passed: boolean
  score?: number
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  notes?: string
  recommendations?: string
  actionRequired?: boolean
  actionTaken?: string
}

export interface QualityCheckWithUser extends QualityControl {
  user?: {
    id: string
    name: string
    email: string
    userRole: string | null
  }
}

export interface QualityCheckResponse {
  success: boolean
  data?: QualityCheckWithUser | QualityCheckWithUser[]
  error?: string
}

export interface StatusUpdateInput {
  reason?: string // For CANCELLED status
  actualPortions?: number // For COMPLETED status
  // ❌ actualCost removed - use ProductionCostCalculator.calculateProductionCost()
  actualTemperature?: number // For quality check
  qualityPassed?: boolean // For quality check
  wasteAmount?: number // For COMPLETED status
  wasteNotes?: string // For COMPLETED status
}

// ============================================
// API CLIENT
// ============================================

export const productionApi = {
  /**
   * Get all food productions with filters
   * @param filters - Optional filters for querying productions
   * @returns Promise with list of productions
   */
  async getAll(filters?: ProductionFilters, headers?: HeadersInit): Promise<ProductionListResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value))
          }
        })
      }

      const baseUrl = getBaseUrl()
      const url = `${baseUrl}/api/sppg/production${params.toString() ? `?${params.toString()}` : ''}`
      console.log('[productionApi.getAll] Fetching URL:', url)
      
      const response = await fetch(url, {
        ...getFetchOptions(headers),
        credentials: 'include', // Include cookies for session
      })
      
      console.log('[productionApi.getAll] Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        let errorMessage = 'Failed to fetch productions'
        
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json()
          errorMessage = error.error || errorMessage
          console.error('[productionApi.getAll] API error:', error)
        } else {
          const text = await response.text()
          console.error('[productionApi.getAll] Non-JSON response:', text)
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('[productionApi.getAll] Success response:', data)
      return data
    } catch (error) {
      console.error('[productionApi.getAll] Exception:', error)
      throw error
    }
  },

  /**
   * Get single production by ID with full details
   * @param id - Production ID
   * @returns Promise with production details including menu, recipe, and quality checks
   */
  async getById(id: string, headers?: HeadersInit): Promise<ProductionResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/production/${id}`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch production')
    }

    return response.json()
  },

  /**
   * Create new food production
   * @param data - Production data
   * @returns Promise with created production
   */
  async create(data: ProductionInput, headers?: HeadersInit): Promise<ProductionResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/production`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create production')
    }

    return response.json()
  },

  /**
   * Update existing production (only allowed for PLANNED status)
   * @param id - Production ID
   * @param data - Updated production data
   * @returns Promise with updated production
   */
  async update(id: string, data: Partial<ProductionInput>, headers?: HeadersInit): Promise<ProductionResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/production/${id}`, {
      ...getFetchOptions(headers),
      method: 'PUT',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update production')
    }

    return response.json()
  },

  /**
   * Delete production (only allowed for PLANNED status)
   * @param id - Production ID
   * @returns Promise with success status
   */
  async delete(id: string, headers?: HeadersInit): Promise<{ success: boolean; error?: string }> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/production/${id}`, {
      ...getFetchOptions(headers),
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete production')
    }

    return response.json()
  },

  /**
   * Start production (PLANNED → PREPARING)
   * @param id - Production ID
   * @returns Promise with updated production
   */
  async startProduction(id: string, headers?: HeadersInit): Promise<ProductionResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/production/${id}/status`, {
      ...getFetchOptions(headers),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ status: 'PREPARING' }),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start production')
      } else {
        throw new Error(`Failed to start production: ${response.status} ${response.statusText}`)
      }
    }

    return response.json()
  },

  /**
   * Start cooking phase (PREPARING → COOKING)
   * @param id - Production ID
   * @returns Promise with updated production
   */
  async startCooking(id: string, headers?: HeadersInit): Promise<ProductionResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/production/${id}/status`, {
      ...getFetchOptions(headers),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ status: 'COOKING' }),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start cooking')
      } else {
        throw new Error(`Failed to start cooking: ${response.status} ${response.statusText}`)
      }
    }

    return response.json()
  },

  /**
   * Complete production (COOKING → QUALITY_CHECK)
   * @param id - Production ID
   * @param data - Actual production data (portions, cost, temperature, waste)
   * @returns Promise with updated production
   */
  async completeProduction(id: string, data: StatusUpdateInput, headers?: HeadersInit): Promise<ProductionResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/production/${id}/status`, {
      ...getFetchOptions(headers),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        status: 'QUALITY_CHECK',
        actualPortions: data.actualPortions,
        actualTemperature: data.actualTemperature,
        wasteAmount: data.wasteAmount,
        wasteNotes: data.wasteNotes,
      }),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete production')
      } else {
        throw new Error(`Failed to complete production: ${response.status} ${response.statusText}`)
      }
    }

    return response.json()
  },

  /**
   * Finalize production after quality check (QUALITY_CHECK → COMPLETED)
   * @param id - Production ID
   * @param qualityPassed - Whether production passed quality check
   * @returns Promise with updated production
   */
  async finalizeProduction(id: string, qualityPassed: boolean, headers?: HeadersInit): Promise<ProductionResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/production/${id}/status`, {
      ...getFetchOptions(headers),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        status: 'COMPLETED',
        qualityPassed,
      }),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to finalize production')
      } else {
        throw new Error(`Failed to finalize production: ${response.status} ${response.statusText}`)
      }
    }

    return response.json()
  },

  /**
   * Cancel production (any status → CANCELLED)
   * @param id - Production ID
   * @param reason - Cancellation reason
   * @returns Promise with updated production
   */
  async cancelProduction(id: string, reason: string, headers?: HeadersInit): Promise<ProductionResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/production/${id}/status`, {
      ...getFetchOptions(headers),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        status: 'CANCELLED',
        cancellationReason: reason,
      }),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel production')
      } else {
        throw new Error(`Failed to cancel production: ${response.status} ${response.statusText}`)
      }
    }

    return response.json()
  },

  /**
   * Add quality check to production
   * @param id - Production ID
   * @param data - Quality check data
   * @returns Promise with created quality check
   */
  async addQualityCheck(id: string, data: QualityCheckInput, headers?: HeadersInit): Promise<QualityCheckResponse> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/production/${id}/quality-checks`, {
      ...getFetchOptions(headers),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        // Use error.message first (from API), fallback to error.error, then default message
        throw new Error(error.message || error.error || 'Failed to add quality check')
      } else {
        throw new Error(`Failed to add quality check: ${response.status} ${response.statusText}`)
      }
    }

    return response.json()
  },

  /**
   * Get quality checks for production
   * @param id - Production ID
   * @returns Promise with list of quality checks
   */
  async getQualityChecks(id: string, headers?: HeadersInit): Promise<{ success: boolean; data?: QualityControl[]; error?: string }> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/production/${id}/quality-checks`, getFetchOptions(headers))
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch quality checks')
    }

    return response.json()
  },

  /**
   * Record stock usage for completed production
   * Automatically creates ProductionStockUsage records for all ingredients
   * 
   * @param id - Production ID
   * @param data - Stock usage data (actualPortions, recordedBy)
   * @returns Promise with stock usage summary
   * 
   * @example
   * ```typescript
   * const result = await productionApi.recordStockUsage('prod_123', {
   *   actualPortions: 100,
   *   recordedBy: 'user_123'
   * })
   * console.log(`Total Cost: ${result.data.totalCost}`)
   * ```
   */
  async recordStockUsage(
    id: string, 
    data: { actualPortions: number; recordedBy?: string },
    headers?: HeadersInit
  ): Promise<{
    success: boolean
    data?: {
      recordsCreated: number
      totalCost: number
      costPerPortion: number
      ingredients: Array<{
        inventoryItemId: string
        quantityUsed: number
        unit: string
        totalCost: number
      }>
    }
    error?: string
  }> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/production/${id}/record-usage`, {
      ...getFetchOptions(headers),
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to record stock usage')
    }

    return response.json()
  },
}
