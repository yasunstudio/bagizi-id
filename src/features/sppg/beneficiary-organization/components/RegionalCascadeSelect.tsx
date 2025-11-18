/**
 * @fileoverview Regional Cascade Select Component - Foreign Key Version
 * @version Next.js 15.5.4
 */

'use client'

import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useProvinces,
  useRegenciesByProvince,
  useDistrictsByRegency,
  useVillagesByDistrict,
} from '../hooks/useRegional'
import type { BeneficiaryOrganizationInput } from '../schemas/beneficiaryOrganizationSchema'

interface RegionalCascadeSelectProps {
  form: UseFormReturn<BeneficiaryOrganizationInput>
}

export function RegionalCascadeSelect({ form }: RegionalCascadeSelectProps) {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null)
  const [selectedRegencyId, setSelectedRegencyId] = useState<string | null>(null)
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null)

  const { data: provinces, isLoading: provincesLoading } = useProvinces()
  const { data: regencies, isLoading: regenciesLoading } = useRegenciesByProvince(selectedProvinceId)
  const { data: districts, isLoading: districtsLoading } = useDistrictsByRegency(selectedRegencyId)
  const { data: villages, isLoading: villagesLoading } = useVillagesByDistrict(selectedDistrictId)

  useEffect(() => {
    const provinceId = form.getValues('provinceId')
    const regencyId = form.getValues('regencyId')
    const districtId = form.getValues('districtId')

    if (provinceId && provinceId !== selectedProvinceId) {
      setSelectedProvinceId(provinceId)
    }
    if (regencyId && regencyId !== selectedRegencyId) {
      setSelectedRegencyId(regencyId)
    }
    if (districtId && districtId !== selectedDistrictId) {
      setSelectedDistrictId(districtId)
    }
  }, [form, selectedProvinceId, selectedRegencyId, selectedDistrictId])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="provinceId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Provinsi <span className="text-destructive">*</span>
            </FormLabel>
            <Select
              onValueChange={(value) => {
                setSelectedProvinceId(value)
                setSelectedRegencyId(null)
                setSelectedDistrictId(null)
                form.setValue('regencyId', '')
                form.setValue('districtId', null)
                form.setValue('villageId', null)
                field.onChange(value)
              }}
              value={field.value || ''}
              disabled={provincesLoading}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={provincesLoading ? 'Memuat...' : 'Pilih Provinsi'} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {provinces?.map((province) => (
                  <SelectItem key={province.id} value={province.id}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="regencyId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Kota/Kabupaten <span className="text-destructive">*</span>
            </FormLabel>
            <Select
              onValueChange={(value) => {
                setSelectedRegencyId(value)
                setSelectedDistrictId(null)
                form.setValue('districtId', null)
                form.setValue('villageId', null)
                field.onChange(value)
              }}
              value={field.value || ''}
              disabled={!selectedProvinceId || regenciesLoading}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue 
                    placeholder={
                      !selectedProvinceId 
                        ? 'Pilih provinsi terlebih dahulu'
                        : regenciesLoading 
                        ? 'Memuat...' 
                        : 'Pilih Kota/Kabupaten'
                    } 
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {regencies?.map((regency) => (
                  <SelectItem key={regency.id} value={regency.id}>
                    {regency.type === 'CITY' ? 'Kota' : 'Kabupaten'} {regency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="districtId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kecamatan (Opsional)</FormLabel>
            <Select
              onValueChange={(value) => {
                setSelectedDistrictId(value)
                form.setValue('villageId', null)
                field.onChange(value)
              }}
              value={field.value || ''}
              disabled={!selectedRegencyId || districtsLoading}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue 
                    placeholder={
                      !selectedRegencyId 
                        ? 'Pilih kota/kabupaten terlebih dahulu'
                        : districtsLoading 
                        ? 'Memuat...' 
                        : 'Pilih Kecamatan (Opsional)'
                    } 
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {districts?.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="villageId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kelurahan/Desa (Opsional)</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(value)}
              value={field.value || ''}
              disabled={!selectedDistrictId || villagesLoading}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue 
                    placeholder={
                      !selectedDistrictId 
                        ? 'Pilih kecamatan terlebih dahulu'
                        : villagesLoading 
                        ? 'Memuat...' 
                        : 'Pilih Kelurahan/Desa (Opsional)'
                    } 
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {villages?.map((village) => (
                  <SelectItem key={village.id} value={village.id}>
                    {village.type === 'URBAN' ? 'Kelurahan' : 'Desa'} {village.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}