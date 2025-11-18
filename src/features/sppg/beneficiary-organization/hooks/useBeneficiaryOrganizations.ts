/**
 * @fileoverview React Query Hooks untuk Beneficiary Organizations
 * @version React Query v5 / Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { beneficiaryOrganizationApi } from '../api/beneficiaryOrganizationApi'
import type {
  BeneficiaryOrganizationInput,
  BeneficiaryOrganizationFilter,
} from '../schemas/beneficiaryOrganizationSchema'

/**
 * Query key factory untuk beneficiary organizations
 */
export const beneficiaryOrganizationKeys = {
  all: ['beneficiary-organizations'] as const,
  lists: () => [...beneficiaryOrganizationKeys.all, 'list'] as const,
  list: (filters?: BeneficiaryOrganizationFilter) =>
    [...beneficiaryOrganizationKeys.lists(), filters] as const,
  details: () => [...beneficiaryOrganizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...beneficiaryOrganizationKeys.details(), id] as const,
}

/**
 * Hook untuk mengambil semua beneficiary organizations
 * @param filters - Filter opsional
 */
export function useBeneficiaryOrganizations(filters?: BeneficiaryOrganizationFilter) {
  return useQuery({
    queryKey: beneficiaryOrganizationKeys.list(filters),
    queryFn: async () => {
      const result = await beneficiaryOrganizationApi.getAll(filters)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal mengambil data organisasi penerima manfaat')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook untuk mengambil detail beneficiary organization
 * @param id - Organization ID
 */
export function useBeneficiaryOrganization(id: string | undefined | null) {
  return useQuery({
    queryKey: beneficiaryOrganizationKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('ID organisasi tidak valid')
      
      const result = await beneficiaryOrganizationApi.getById(id)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal mengambil detail organisasi penerima manfaat')
      }
      
      return result.data
    },
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook untuk membuat beneficiary organization baru
 */
export function useCreateBeneficiaryOrganization() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: BeneficiaryOrganizationInput) => {
      const result = await beneficiaryOrganizationApi.create(data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal membuat organisasi penerima manfaat')
      }
      
      return result.data
    },
    onSuccess: () => {
      // Invalidate all lists to refetch
      queryClient.invalidateQueries({
        queryKey: beneficiaryOrganizationKeys.lists(),
      })
      toast.success('Organisasi penerima manfaat berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat organisasi penerima manfaat')
    },
  })
}

/**
 * Hook untuk mengubah beneficiary organization
 */
export function useUpdateBeneficiaryOrganization() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<BeneficiaryOrganizationInput>
    }) => {
      const result = await beneficiaryOrganizationApi.update(id, data)
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal mengubah organisasi penerima manfaat')
      }
      
      return result.data
    },
    onSuccess: (_, variables) => {
      // Invalidate specific detail query
      queryClient.invalidateQueries({
        queryKey: beneficiaryOrganizationKeys.detail(variables.id),
      })
      // Invalidate all lists
      queryClient.invalidateQueries({
        queryKey: beneficiaryOrganizationKeys.lists(),
      })
      toast.success('Organisasi penerima manfaat berhasil diubah')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengubah organisasi penerima manfaat')
    },
  })
}

/**
 * Hook untuk menghapus beneficiary organization
 */
export function useDeleteBeneficiaryOrganization() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await beneficiaryOrganizationApi.delete(id)
      
      if (!result.success) {
        throw new Error(result.error || 'Gagal menghapus organisasi penerima manfaat')
      }
      
      return result
    },
    onSuccess: (_, deletedId) => {
      // Invalidate detail query
      queryClient.invalidateQueries({
        queryKey: beneficiaryOrganizationKeys.detail(deletedId),
      })
      // Invalidate all lists
      queryClient.invalidateQueries({
        queryKey: beneficiaryOrganizationKeys.lists(),
      })
      toast.success('Organisasi penerima manfaat berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus organisasi penerima manfaat')
    },
  })
}
