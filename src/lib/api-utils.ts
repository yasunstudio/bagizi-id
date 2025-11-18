/**
 * @fileoverview Shared API Utilities for Universal Fetch
 * @module lib/api-utils
 * @description Universal helpers for API clients that work in both Server and Client Components
 * 
 * CRITICAL: These utilities enable API clients to work seamlessly in both environments:
 * - Browser (Client Components): Uses relative URLs with window.fetch
 * - Server (Server Components): Uses full URLs with node-fetch
 * 
 * @version Next.js 15.5.4 / Enterprise-Grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/ENTERPRISE_API_PATTERN_FIX.md} API Pattern Documentation
 */

// ============================================
// ENVIRONMENT DETECTION
// ============================================

/**
 * Get base URL based on execution environment
 * 
 * @returns {string} Empty string for browser, full URL for server
 * 
 * @example
 * // Browser (Client Component)
 * getBaseUrl() // Returns: ''
 * 
 * // Server (Server Component)
 * getBaseUrl() // Returns: 'http://localhost:3000' or process.env.NEXTAUTH_URL
 */
export function getBaseUrl(): string {
  // Browser environment - use relative URLs
  if (typeof window !== 'undefined') {
    return ''
  }

  // Server environment - use full URL
  // Priority: NEXTAUTH_URL > VERCEL_URL > localhost
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Development fallback
  return 'http://localhost:3000'
}

// ============================================
// HEADERS CONVERSION UTILITIES
// ============================================

/**
 * Convert Next.js ReadonlyHeaders to plain HeadersInit object
 * 
 * Next.js 15's headers() returns ReadonlyHeaders which cannot be passed
 * directly as HeadersInit. This helper converts it to a plain object.
 * 
 * @param {ReadonlyHeaders} headers - Next.js ReadonlyHeaders from headers()
 * @returns {Record<string, string>} Plain object suitable for HeadersInit
 * 
 * @example
 * // Server Component
 * import { headers } from 'next/headers'
 * import { convertHeaders } from '@/lib/api-utils'
 * 
 * const headersList = await headers()
 * const headersObj = convertHeaders(headersList)
 * const result = await myApi.getById(id, headersObj)
 */
export function convertHeaders(headers: ReadonlyHeaders): Record<string, string> {
  const headersObj: Record<string, string> = {}
  headers.forEach((value, key) => {
    headersObj[key] = value
  })
  return headersObj
}

/**
 * Type definition for ReadonlyHeaders (Next.js 15+)
 * This is a minimal type definition to avoid importing from next/headers
 */
interface ReadonlyHeaders {
  forEach(callbackfn: (value: string, key: string) => void): void
  get(name: string): string | null
}

// ============================================
// FETCH OPTIONS BUILDER
// ============================================

/**
 * Build fetch options with optional header forwarding
 * 
 * SECURITY: Essential for Server Components to forward authentication cookies
 * from incoming request to internal API calls
 * 
 * @param {HeadersInit} [headers] - Optional headers to merge (e.g., Cookie header from Server Component)
 * @returns {RequestInit} Fetch options with merged headers and credentials
 * 
 * @example
 * // Client Component (browser)
 * const options = getFetchOptions()
 * // { headers: { 'Content-Type': 'application/json' } }
 * 
 * // Server Component (with auth forwarding)
 * const headersList = await headers()
 * const cookieHeader = headersList.get('cookie')
 * const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : {}
 * const options = getFetchOptions(requestHeaders)
 * // { 
 * //   headers: { 'Content-Type': 'application/json', Cookie: '...' },
 * //   credentials: 'include'
 * // }
 */
export function getFetchOptions(headers?: HeadersInit): RequestInit {
  const baseHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Merge custom headers if provided
  const mergedHeaders = headers
    ? { ...baseHeaders, ...headers }
    : baseHeaders

  // Always include credentials for cookie/session handling
  // This is essential for authentication in both client and server
  return {
    headers: mergedHeaders,
    credentials: 'include',
  }
}

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

/**
 * Parse API response with error handling
 * Utility function to consistently handle API responses
 * 
 * @param {Response} response - Fetch API response
 * @returns {Promise<unknown>} Parsed JSON data
 * @throws {Error} When response is not ok or parsing fails
 */
export async function parseApiResponse(response: Response): Promise<unknown> {
  // Check response status
  if (!response.ok) {
    // Try to parse error message
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'API request failed')
    }
    
    throw new Error(`API request failed with status ${response.status}`)
  }

  // Parse successful response
  const contentType = response.headers.get('content-type')
  
  // Handle JSON responses
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  // Handle empty responses
  if (response.status === 204) {
    return { success: true }
  }

  // Handle unexpected content types
  throw new Error(
    `Unexpected content-type: ${contentType}. Expected application/json.`
  )
}

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Standard API response structure
 * All API endpoints should return this structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  error?: string
  message?: string
}

/**
 * Paginated API Response Type
 */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * @example Client Component Usage
 * 
 * import { getBaseUrl, getFetchOptions } from '@/lib/api-utils'
 * 
 * export const menuApi = {
 *   async getAll() {
 *     const baseUrl = getBaseUrl()
 *     const response = await fetch(
 *       `${baseUrl}/api/sppg/menu`,
 *       getFetchOptions()
 *     )
 *     return response.json()
 *   }
 * }
 */

/**
 * @example Server Component Usage
 * 
 * import { headers } from 'next/headers'
 * import { menuApi } from '@/features/sppg/menu/api/menuApi'
 * 
 * export default async function MenuPage() {
 *   // Forward authentication headers
 *   const headersList = await headers()
 *   const cookieHeader = headersList.get('cookie')
 *   const requestHeaders = cookieHeader ? { Cookie: cookieHeader } : {}
 *   
 *   // Call API with forwarded headers
 *   const response = await menuApi.getAll(requestHeaders)
 *   const menus = response.data || []
 *   
 *   return <MenuList menus={menus} />
 * }
 */

/**
 * @example API Client Template
 * 
 * import { getBaseUrl, getFetchOptions, parseApiResponse } from '@/lib/api-utils'
 * 
 * export const exampleApi = {
 *   async getAll(headers?: HeadersInit) {
 *     const baseUrl = getBaseUrl()
 *     const response = await fetch(
 *       `${baseUrl}/api/sppg/example`,
 *       getFetchOptions(headers)
 *     )
 *     return parseApiResponse(response)
 *   },
 *   
 *   async create(data: any, headers?: HeadersInit) {
 *     const baseUrl = getBaseUrl()
 *     const response = await fetch(
 *       `${baseUrl}/api/sppg/example`,
 *       {
 *         ...getFetchOptions(headers),
 *         method: 'POST',
 *         body: JSON.stringify(data),
 *       }
 *     )
 *     return parseApiResponse(response)
 *   }
 * }
 */
