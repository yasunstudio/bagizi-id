/**
 * @fileoverview Beneficiary Organization Form Component - CORRECTED VERSION
 * Aligned with actual Prisma schema (no non-existent fields)
 * @version Next.js 15.5.4 / React Hook Form + Zod
 * @author Bagizi-ID Development Team
 */

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2 } from 'lucide-react'
import {
  useCreateBeneficiaryOrganization,
  useUpdateBeneficiaryOrganization,
  useBeneficiaryOrganization,
} from '../../hooks'
import { createBeneficiaryOrganizationSchema } from '../../schemas/beneficiaryOrganizationSchema'
import type { CreateBeneficiaryOrganizationInput } from '../../types/beneficiaryOrganization.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
// import { Checkbox } from '@/components/ui/checkbox' // TODO: Re-enable when facility checkboxes are added back

interface BeneficiaryOrganizationFormProps {
  organizationId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function BeneficiaryOrganizationForm({
  organizationId,
  onSuccess,
  onCancel,
}: BeneficiaryOrganizationFormProps) {
  const isEditMode = !!organizationId

  const { data: existingOrg, isLoading: isLoadingOrg } = useBeneficiaryOrganization(
    organizationId || '',
    { enabled: isEditMode }
  )

  const { mutate: createOrganization, isPending: isCreating } = useCreateBeneficiaryOrganization()
  const { mutate: updateOrganization, isPending: isUpdating } = useUpdateBeneficiaryOrganization()

  const form = useForm<CreateBeneficiaryOrganizationInput>({
    resolver: zodResolver(createBeneficiaryOrganizationSchema),
    defaultValues: {
      organizationName: '',
      type: 'SCHOOL',
      address: '',
      provinceId: '', // ✅ FIXED: Using foreign key ID
      regencyId: '', // ✅ FIXED: Using foreign key ID
      email: '',
      phone: '',
      operationalStatus: 'ACTIVE',
      isActive: true,
    },
  })

  // Load existing data in edit mode - only use fields that exist in Prisma schema
  useEffect(() => {
    if (existingOrg && isEditMode) {
      form.reset({
        organizationName: existingOrg.organizationName,
        type: existingOrg.type,
        subType: existingOrg.subType || undefined,
        npsn: existingOrg.npsn || undefined,
        nikkes: existingOrg.nikkes || undefined,
        // ❌ REMOVED: registrationNumber (not in schema anymore)
        principalName: existingOrg.principalName || undefined,
        principalNip: existingOrg.principalNip || undefined,
        contactPerson: existingOrg.contactPerson || undefined,
        contactTitle: existingOrg.contactTitle || undefined,
        phone: existingOrg.phone || undefined,
        email: existingOrg.email || undefined,
        address: existingOrg.address,
        provinceId: existingOrg.provinceId,
        regencyId: existingOrg.regencyId,
        districtId: existingOrg.districtId || undefined,
        villageId: existingOrg.villageId || undefined,
        postalCode: existingOrg.postalCode || undefined,
        latitude: existingOrg.latitude || undefined,
        longitude: existingOrg.longitude || undefined,
        operationalStatus: existingOrg.operationalStatus,
        isActive: existingOrg.isActive,
        totalCapacity: existingOrg.totalCapacity || undefined,
        maleMembers: existingOrg.maleMembers || undefined,
        femaleMembers: existingOrg.femaleMembers || undefined,
        posyanduCadres: existingOrg.posyanduCadres || undefined,
        ownershipStatus: existingOrg.ownershipStatus || undefined,
        serviceHours: existingOrg.serviceHours || undefined,
        operatingDays: existingOrg.operatingDays || undefined,
        accreditationGrade: existingOrg.accreditationGrade || undefined,
        accreditationYear: existingOrg.accreditationYear || undefined,
        establishedYear: existingOrg.establishedYear || undefined,
        description: existingOrg.description || undefined,
        notes: existingOrg.notes || undefined,
      })
    }
  }, [existingOrg, isEditMode, form])

  const onSubmit = (data: CreateBeneficiaryOrganizationInput) => {
    if (isEditMode && organizationId) {
      updateOrganization(
        { id: organizationId, data },
        {
          onSuccess: () => {
            onSuccess?.()
          },
        }
      )
    } else {
      createOrganization(data, {
        onSuccess: () => {
          form.reset()
          onSuccess?.()
        },
      })
    }
  }

  // const isPending = isCreating || isUpdating // Not used in this form

  if (isLoadingOrg && isEditMode) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {isEditMode ? 'Edit Organisasi Penerima Manfaat' : 'Tambah Organisasi Penerima Manfaat'}
        </CardTitle>
        <CardDescription>
          {isEditMode
            ? 'Perbarui informasi organisasi penerima manfaat'
            : 'Tambahkan organisasi baru yang akan menerima manfaat program gizi'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Dasar</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Organisasi *</FormLabel>
                      <FormControl>
                        <Input placeholder="SD Negeri 1 Jakarta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Organisasi *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe organisasi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SCHOOL">Sekolah</SelectItem>
                          <SelectItem value="HEALTH_FACILITY">Fasilitas Kesehatan</SelectItem>
                          <SelectItem value="INTEGRATED_SERVICE_POST">Posyandu</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Tipe</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih sub tipe (opsional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PAUD">PAUD</SelectItem>
                          <SelectItem value="TK">TK</SelectItem>
                          <SelectItem value="SD">SD</SelectItem>
                          <SelectItem value="SMP">SMP</SelectItem>
                          <SelectItem value="SMA">SMA</SelectItem>
                          <SelectItem value="SMK">SMK</SelectItem>
                          <SelectItem value="PESANTREN">Pesantren</SelectItem>
                          <SelectItem value="PUSKESMAS">Puskesmas</SelectItem>
                          <SelectItem value="KLINIK">Klinik</SelectItem>
                          <SelectItem value="POSYANDU">Posyandu</SelectItem>
                          <SelectItem value="PKK">PKK</SelectItem>
                          <SelectItem value="BALAI_WARGA">Balai Warga</SelectItem>
                          <SelectItem value="MASJID">Masjid</SelectItem>
                          <SelectItem value="GEREJA">Gereja</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="establishedYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Berdiri</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Type-specific identifiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="npsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPSN (untuk Sekolah)</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>Nomor Pokok Sekolah Nasional (8 digit)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nikkes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIKKES (untuk Faskes)</FormLabel>
                      <FormControl>
                        <Input placeholder="NIKKES123" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>NIK Kesehatan</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ❌ REMOVED: registrationNumber field (not in schema anymore) */}
                {/* TODO: Add conditional rendering based on organization type */}
              </div>
            </div>

            <Separator />

            {/* Section 2: Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Alamat</h3>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Lengkap *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jl. Merdeka No. 123"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ⚠️ TODO: Implement regional dropdown fields (Province > Regency > District > Village) */}
              {/* Schema now uses foreign keys: provinceId, regencyId, districtId, villageId */}
              {/* Need to integrate with regional data from Prisma (Province, Regency, District, Village models) */}
              
              {/* Temporary text fields for provinceId/regencyId (will be replaced with dropdowns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="provinceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provinsi ID * (Temporary)</FormLabel>
                      <FormControl>
                        <Input placeholder="Province ID (e.g., PROV-001)" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>TODO: Replace with Province dropdown</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="regencyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kabupaten/Kota ID * (Temporary)</FormLabel>
                      <FormControl>
                        <Input placeholder="Regency ID (e.g., REG-001)" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>TODO: Replace with Regency dropdown</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ❌ REMOVED: Old string-based location fields (subDistrict, district, city, province) */}
              {/* ✅ REPLACED: Now using foreign keys (provinceId, regencyId, districtId, villageId) - see above */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Pos</FormLabel>
                      <FormControl>
                        <Input placeholder="12345" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.000001"
                          placeholder="-6.200000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>Koordinat GPS (opsional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.000001"
                          placeholder="106.816666"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>Koordinat GPS (opsional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Section 3: Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Kontak</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input placeholder="021-1234567" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="sekolah@example.com"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kontak Person</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jabatan Kontak Person</FormLabel>
                      <FormControl>
                        <Input placeholder="Admin" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="principalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kepala/Pengelola</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Smith" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="principalNip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP Kepala/Pengelola</FormLabel>
                      <FormControl>
                        <Input placeholder="196512311987031001" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="serviceHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jam Operasional</FormLabel>
                      <FormControl>
                        <Input placeholder="08:00-16:00" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>Contoh: 08:00-16:00</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operatingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hari Operasional</FormLabel>
                      <FormControl>
                        <Input placeholder="Senin-Jumat" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>Contoh: Senin-Jumat</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Section 4: Capacity & Infrastructure */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Kapasitas & Infrastruktur</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="totalCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kapasitas Total</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormDescription>Jumlah penerima manfaat</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ❌ REMOVED: Capacity & Facility fields (not in Prisma schema) */}
                {/* - servingCapacity, averageServings */}
                {/* - buildingArea, storageCapacity */}
                {/* - hasElectricity, hasCleanWater, hasKitchen, hasStorageRoom */}
                {/* If these are needed in the future, add them to Prisma schema first */}
              </div>

              <div className="space-y-3">
                {/* Facility fields removed - see above */}
              </div>
            </div>

            <Separator />

            {/* Section 4: Operational Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Operasional</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="serviceHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jam Operasional</FormLabel>
                      <FormControl>
                        <Input placeholder="08:00 - 16:00" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operatingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hari Operasional</FormLabel>
                      <FormControl>
                        <Input placeholder="Senin - Jumat" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="operationalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Operasional</FormLabel>
                      <FormControl>
                        <Input placeholder="Aktif" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Section 5: Other Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Informasi Lainnya</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="accreditationGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai Akreditasi</FormLabel>
                      <FormControl>
                        <Input placeholder="A" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accreditationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Akreditasi</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2023"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="establishedYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Berdiri</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1990"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi organisasi..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Catatan tambahan..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? 'Menyimpan...' : isEditMode ? 'Perbarui' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
