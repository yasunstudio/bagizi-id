/**
 * @fileoverview Procurement Settings React Hooks
 * @version Next.js 15.5.4 / TanStack Query 5.62.13
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * HOOKS ARCHITECTURE:
 * - Query Hooks: Data fetching with caching (useQuery)
 * - Mutation Hooks: Data mutations with optimistic updates (useMutation)
 * - Centralized API calls via settingsApi
 * - Automatic cache invalidation on mutations
 * - Toast notifications on success/error
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { settingsApi } from '../api'
import type { UpdateSettingsRequest } from '../types'

// ================================ QUERY KEYS ================================

/**
 * Query keys for cache management
 */
export const settingsKeys = {
  all: ['procurement', 'settings'] as const,
  detail: () => [...settingsKeys.all, 'detail'] as const,
}

// ================================ QUERY HOOKS ================================

/**
 * Fetch procurement settings
 * Returns settings with all relations
 * 
 * @returns Query result with settings data
 * 
 * @example
 * ```typescript
 * const { data: settings, isLoading, error } = useSettings()
 * 
 * if (settings) {
 *   console.log('Approval levels:', settings.approvalLevels)
 *   console.log('Categories:', settings.customCategories)
 * }
 * ```
 */
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: async () => {
      console.log('[useSettings] Fetching settings...')
      const result = await settingsApi.get()
      console.log('[useSettings] API result:', {
        success: result.success,
        hasData: !!result.data,
        dataType: result.data ? typeof result.data : 'null',
      })
      
      if (!result.success) {
        console.error('[useSettings] API returned error:', result.error)
        throw new Error(result.error || 'Failed to fetch procurement settings')
      }
      
      // Return null if settings not initialized yet (not an error)
      const finalData = result.data ?? null
      console.log('[useSettings] Returning:', finalData ? 'settings object' : 'null')
      return finalData
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (settings change less frequently)
    retry: 1,
  })
}

// ================================ MUTATION HOOKS ================================

/**
 * Update procurement settings
 * Can update general settings and/or specific sections
 * 
 * @returns Mutation hook with update function
 * 
 * @example
 * ```typescript
 * const { mutate: updateSettings, isPending } = useUpdateSettings()
 * 
 * updateSettings({
 *   general: {
 *     autoApproveThreshold: 10000000,
 *     requireQCPhotos: true
 *   },
 *   approvalLevels: [...]
 * })
 * ```
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UpdateSettingsRequest) => {
      const result = await settingsApi.update(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update procurement settings')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Update cache with new settings
      queryClient.setQueryData(settingsKeys.detail(), data)
      
      toast.success('Pengaturan procurement berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui pengaturan procurement')
    },
  })
}

/**
 * Initialize default settings
 * Creates settings with default configurations
 * 
 * @returns Mutation hook with initialize function
 * 
 * @example
 * ```typescript
 * const { mutate: initializeSettings, isPending } = useInitializeSettings()
 * 
 * initializeSettings()
 * ```
 */
export function useInitializeSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      console.log('[useInitializeSettings] Starting initialization...')
      const result = await settingsApi.initialize()
      console.log('[useInitializeSettings] API result:', result)
      
      if (!result.success || !result.data) {
        const errorMsg = result.error || 'Failed to initialize procurement settings'
        console.error('[useInitializeSettings] Error:', errorMsg)
        throw new Error(errorMsg)
      }
      
      return result.data
    },
    onSuccess: (data) => {
      console.log('[useInitializeSettings] Success! Data:', data)
      // Set cache with initialized settings
      queryClient.setQueryData(settingsKeys.detail(), data)
      
      toast.success('Pengaturan default berhasil dibuat')
    },
    onError: (error: Error) => {
      console.error('[useInitializeSettings] onError:', error.message)
      toast.error(error.message || 'Gagal membuat pengaturan default')
    },
  })
}

/**
 * Reset settings to default values
 * WARNING: This will delete all custom configurations
 * 
 * @returns Mutation hook with reset function
 * 
 * @example
 * ```typescript
 * const { mutate: resetSettings, isPending } = useResetSettings()
 * 
 * // Show confirmation dialog first
 * if (confirm('Reset to default? This will delete all custom settings.')) {
 *   resetSettings()
 * }
 * ```
 */
export function useResetSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const result = await settingsApi.reset()
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to reset procurement settings')
      }
      
      return result.data
    },
    onSuccess: (data) => {
      // Update cache with reset settings
      queryClient.setQueryData(settingsKeys.detail(), data)
      
      toast.success('Pengaturan berhasil direset ke default')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mereset pengaturan')
    },
  })
}
