/**
 * @fileoverview Users API Client for Production Feature
 * @version Next.js 15.5.4 / TanStack Query v5
 * @description API client functions for fetching SPPG users
 */

import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
import type { UserRole } from '@prisma/client'

// ================================ TYPES ================================

export interface UserData {
  id: string
  name: string
  email: string
  userRole: UserRole
  phone?: string | null
  isActive: boolean
  profileImage?: string | null
  jobTitle?: string | null
  department?: string | null
  createdAt: Date | string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total?: number
    filters?: {
      role?: string
      search?: string
      status?: string
    }
  }
}

// ================================ API CLIENT ================================

/**
 * Users API Client
 * Handles all user-related API requests for production
 * Enterprise-grade with proper authentication handling
 */
export const usersApi = {
  /**
   * Get all users for SPPG
   * @param role - Optional role filter (e.g., 'SPPG_STAFF_DAPUR')
   * @param headers - Optional headers (for server-side auth forwarding)
   */
  async getAll(role?: UserRole | string, headers?: HeadersInit): Promise<ApiResponse<UserData[]>> {
    const baseUrl = getBaseUrl()
    // Use 'userRole' param name to match API endpoint expectation
    const url = role ? `${baseUrl}/api/sppg/users?userRole=${role}` : `${baseUrl}/api/sppg/users`
    const response = await fetch(url, getFetchOptions(headers))

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch users')
      } else {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
      }
    }

    return response.json()
  },

  /**
   * Get kitchen staff specifically
   * Convenience method for ProductionForm
   * @param headers - Optional headers (for server-side auth forwarding)
   */
  async getKitchenStaff(headers?: HeadersInit): Promise<ApiResponse<UserData[]>> {
    return this.getAll('SPPG_STAFF_DAPUR', headers)
  },

  /**
   * Get users by role with search
   * @param options - Filter options
   * @param headers - Optional headers (for server-side auth forwarding)
   */
  async getFiltered(
    options?: {
      role?: UserRole | string
      search?: string
      status?: 'active' | 'inactive'
    },
    headers?: HeadersInit
  ): Promise<ApiResponse<UserData[]>> {
    const params = new URLSearchParams()

    // Use 'userRole' param name to match API endpoint expectation
    if (options?.role) params.append('userRole', options.role)
    if (options?.search) params.append('search', options.search)
    if (options?.status) params.append('isActive', options.status === 'active' ? 'true' : 'false')

    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/api/sppg/users${params.toString() ? `?${params.toString()}` : ''}`
    const response = await fetch(url, getFetchOptions(headers))

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch users')
      } else {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
      }
    }

    return response.json()
  },

  /**
   * Get single user by ID
   * @param id - User ID
   * @param headers - Optional headers (for server-side auth forwarding)
   */
  async getById(id: string, headers?: HeadersInit): Promise<ApiResponse<UserData>> {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/sppg/users/${id}`, getFetchOptions(headers))

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch user')
      } else {
        throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`)
      }
    }

    return response.json()
  },
}

// ================================ HELPER FUNCTIONS ================================

/**
 * Filter users by role from array
 * @param users - Array of users
 * @param role - Role to filter by
 */
export function filterUsersByRole(users: UserData[], role: UserRole): UserData[] {
  return users.filter((user) => user.userRole === role)
}

/**
 * Get kitchen staff from users array
 * @param users - Array of users
 */
export function getKitchenStaff(users: UserData[]): UserData[] {
  return filterUsersByRole(users, 'SPPG_STAFF_DAPUR')
}

/**
 * Get active users only
 * @param users - Array of users
 */
export function getActiveUsers(users: UserData[]): UserData[] {
  return users.filter((user) => user.isActive)
}

/**
 * Find user by ID
 * @param users - Array of users
 * @param userId - User ID to find
 */
export function findUser(users: UserData[], userId: string): UserData | undefined {
  return users.find((user) => user.id === userId)
}

/**
 * Get user display name
 * @param user - User object
 */
export function getUserDisplayName(user: UserData): string {
  return user.name
}

/**
 * Get user full info display
 * @param user - User object
 */
export function getUserFullDisplay(user: UserData): string {
  const parts = [user.name]
  if (user.jobTitle) parts.push(`(${user.jobTitle})`)
  if (user.department) parts.push(`- ${user.department}`)
  return parts.join(' ')
}
