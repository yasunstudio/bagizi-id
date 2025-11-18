/**
 * @fileoverview Beneficiary Organization Form Component - Create/Edit dengan bahasa Indonesia
 * @version Next.js 15.5.4 / React Hook Form / Zod
 * @author Bagizi-ID Development Team
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, MapPin, Phone, Users, FileText, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  beneficiaryOrganizationSchema,
  type BeneficiaryOrganizationInput,
  organizationTypeLabels,
  organizationSubTypeLabels,
  subTypesByOrganizationType,
} from '../schemas/beneficiaryOrganizationSchema'
import {
  useCreateBeneficiaryOrganization,
  useUpdateBeneficiaryOrganization,
} from '../hooks/useBeneficiaryOrganizations'
import type { BeneficiaryOrganizationResponse } from '../api/beneficiaryOrganizationApi'
import { RegionalCascadeSelect } from './RegionalCascadeSelect'

interface BeneficiaryOrganizationFormProps {
  organization?: BeneficiaryOrganizationResponse
  mode: 'create' | 'edit'
}

export function BeneficiaryOrganizationForm({
  organization,
  mode,
}: BeneficiaryOrganizationFormProps) {
  const router = useRouter()
  const { mutate: createOrganization, isPending: isCreating } =
    useCreateBeneficiaryOrganization()
  const { mutate: updateOrganization, isPending: isUpdating } =
    useUpdateBeneficiaryOrganization()

  const form = useForm<BeneficiaryOrganizationInput>({
    resolver: zodResolver(beneficiaryOrganizationSchema) as any,
    defaultValues: organization
      ? ({
          // Organization Identity
          organizationName: organization.organizationName,
          organizationCode: organization.organizationCode,
          type: organization.type,
          subType: organization.subType || undefined,
          
          // Location - Use foreign key IDs
          address: organization.address,
          provinceId: organization.provinceId,
          regencyId: organization.regencyId,
          districtId: organization.districtId || undefined,
          villageId: organization.villageId || undefined,
          postalCode: organization.postalCode || undefined,
          latitude: organization.latitude || undefined,
          longitude: organization.longitude || undefined,
          
          // Contact Information
          phone: organization.phone || undefined,
          email: organization.email || undefined,
          contactPerson: organization.contactPerson || undefined,
          contactTitle: organization.contactTitle || undefined,
          
          // Type-Specific Identifiers
          npsn: organization.npsn || undefined,
          nikkes: organization.nikkes || undefined,
          registrationNumber: organization.registrationNumber || undefined,
          
          // Principal/Head Information
          principalName: organization.principalName || undefined,
          principalNip: organization.principalNip || undefined,
          
          // Ownership Status
          ownershipStatus: organization.ownershipStatus || undefined,
          
          // Staff/Personnel Counts (Comprehensive)
          teachingStaffCount: organization.teachingStaffCount || undefined,
          nonTeachingStaffCount: organization.nonTeachingStaffCount || undefined,
          
          // Established Year
          establishedYear: organization.establishedYear || undefined,
          
          // Operational Status
          operationalStatus: organization.operationalStatus || undefined,
          isActive: organization.isActive,
          
          // Additional Information
          notes: organization.notes || undefined,
        } as BeneficiaryOrganizationInput)
      : ({
          // Organization Identity
          organizationName: '',
          organizationCode: '',
          type: 'SCHOOL',
          subType: undefined,
          
          // Location
          address: '',
          provinceId: '',
          regencyId: '',
          districtId: undefined,
          villageId: undefined,
          postalCode: undefined,
          latitude: undefined,
          longitude: undefined,
          
          // Contact Information
          phone: undefined,
          email: undefined,
          contactPerson: undefined,
          contactTitle: undefined,
          
          // Type-Specific Identifiers
          npsn: undefined,
          nikkes: undefined,
          registrationNumber: undefined,
          
          // Principal/Head Information
          principalName: undefined,
          principalNip: undefined,
          
          // Ownership Status
          ownershipStatus: undefined,
          
          // Staff/Personnel Counts (Comprehensive)
          teachingStaffCount: undefined,
          nonTeachingStaffCount: undefined,
          
          // Established Year
          establishedYear: undefined,
          
          // Operational Status
          operationalStatus: 'ACTIVE',
          isActive: true,
          
          // Additional Information
          notes: undefined,
        } as BeneficiaryOrganizationInput),
  })

  const selectedType = form.watch('type')

  // Reset subType when organization type changes
  useEffect(() => {
    const currentSubType = form.getValues('subType')
    if (selectedType && currentSubType) {
      // Get available subtypes for the selected organization type
      const availableSubTypes = subTypesByOrganizationType[
        selectedType as keyof typeof subTypesByOrganizationType
      ] || []
      
      // If current subType is not valid for the new organization type, reset it
      if (!(availableSubTypes as readonly string[]).includes(currentSubType)) {
        form.setValue('subType', undefined as any)
      }
    }
  }, [selectedType, form])

  const onSubmit = (data: BeneficiaryOrganizationInput) => {
    if (mode === 'create') {
      createOrganization(data, {
        onSuccess: () => {
          router.push('/beneficiary-organizations')
        },
      })
    } else if (organization) {
      updateOrganization(
        { id: organization.id, data },
        {
          onSuccess: () => {
            router.push(`/beneficiary-organizations/${organization.id}`)
          },
        }
      )
    }
  }

  const isPending = isCreating || isUpdating

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        {/* Informasi Dasar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Organisasi <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="SDN Jatiluhur 1" {...field} className="w-full" />
                    </FormControl>
                    <FormDescription>
                      Nama lengkap sekolah, posyandu, atau organisasi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="organizationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kode Organisasi <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="ORG12ABC"
                          {...field}
                          className="w-full font-mono"
                          style={{ textTransform: 'uppercase' }}
                        />
                        {mode === 'create' && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              // Generate 8-character random alphanumeric code
                              const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                              let code = ''
                              for (let i = 0; i < 8; i++) {
                                code += chars.charAt(Math.floor(Math.random() * chars.length))
                              }
                              
                              form.setValue('organizationCode', code)
                              toast.success('Kode organisasi berhasil dibuat')
                            }}
                            className="shrink-0"
                          >
                            Generate
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      {mode === 'create'
                        ? 'Klik "Generate" untuk membuat kode unik 8 karakter secara otomatis'
                        : 'Kode unik 8 karakter (huruf kapital & angka)'
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Jenis Organisasi <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih jenis organisasi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(organizationTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Kategori utama organisasi penerima manfaat
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="subType"
                render={({ field }) => {
                  // Get available subtypes based on selected organization type
                  const availableSubTypes = selectedType
                    ? subTypesByOrganizationType[
                        selectedType as keyof typeof subTypesByOrganizationType
                      ] || []
                    : []

                  return (
                    <FormItem>
                      <FormLabel>Sub Jenis</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        disabled={!selectedType || availableSubTypes.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue 
                              placeholder={
                                !selectedType 
                                  ? "Pilih jenis organisasi terlebih dahulu" 
                                  : "Pilih sub jenis"
                              } 
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSubTypes.map((subType) => (
                            <SelectItem key={subType} value={subType}>
                              {organizationSubTypeLabels[subType as keyof typeof organizationSubTypeLabels]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {!selectedType ? "Silakan pilih jenis organisasi terlebih dahulu" : "Sub kategori dari jenis organisasi"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informasi Khusus Sekolah */}
        {selectedType === 'SCHOOL' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Informasi Sekolah
                <Badge variant="secondary">Khusus Sekolah</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="npsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NPSN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12345678"
                          {...field}
                          value={field.value || ''}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Nomor Pokok Sekolah Nasional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="principalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kepala Sekolah</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nama kepala sekolah"
                          {...field}
                          value={field.value || ''}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Nama lengkap kepala sekolah</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="principalNip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP Kepala Sekolah</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="NIP kepala sekolah"
                          {...field}
                          value={field.value || ''}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Nomor Induk Pegawai</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="establishedYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Berdiri</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2000"
                          {...field}
                          value={field.value || ''}
                          className="w-full"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>Tahun pendirian sekolah</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as any}
                name="ownershipStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Kepemilikan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih status kepemilikan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NEGERI">Negeri</SelectItem>
                        <SelectItem value="SWASTA">Swasta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Status kepemilikan sekolah (Negeri/Swasta)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Informasi Khusus Fasilitas Kesehatan */}
        {selectedType === 'HEALTH_FACILITY' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Informasi Fasilitas Kesehatan
                <Badge variant="secondary">Khusus Faskes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="nikkes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIKKES</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nomor Induk Kesehatan"
                          {...field}
                          value={field.value || ''}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Nomor Induk Kesehatan Sekolah</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Registrasi</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nomor registrasi faskes"
                          {...field}
                          value={field.value || ''}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Nomor registrasi fasilitas kesehatan</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="principalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kepala Faskes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nama kepala fasilitas kesehatan"
                          {...field}
                          value={field.value || ''}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Nama lengkap kepala/pimpinan faskes</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="principalNip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP Kepala Faskes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="NIP kepala faskes"
                          {...field}
                          value={field.value || ''}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Nomor Induk Pegawai</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="establishedYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Berdiri</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2000"
                          {...field}
                          value={field.value || ''}
                          className="w-full"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>Tahun pendirian fasilitas kesehatan</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="ownershipStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Kepemilikan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih status kepemilikan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NEGERI">Negeri</SelectItem>
                          <SelectItem value="SWASTA">Swasta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Status kepemilikan faskes (Negeri/Swasta)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informasi Khusus Posyandu */}
        {selectedType === 'INTEGRATED_SERVICE_POST' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Informasi Posyandu
                <Badge variant="secondary">Khusus Posyandu</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Registrasi</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nomor registrasi posyandu"
                          {...field}
                          value={field.value || ''}
                          className="w-full"
                        />
                      </FormControl>
                      <FormDescription>Nomor registrasi posyandu</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="establishedYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Berdiri</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2000"
                          {...field}
                          value={field.value || ''}
                          className="w-full"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>Tahun pendirian posyandu</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as any}
                name="principalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Ketua Posyandu</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama ketua posyandu"
                        {...field}
                        value={field.value || ''}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>Nama lengkap ketua/koordinator posyandu</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Lokasi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Lokasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control as any}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Alamat Lengkap <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jl. Raya Jatiluhur No. 123"
                      {...field}
                      rows={3}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Regional Cascade Select - Province → Regency → District → Village */}
            <RegionalCascadeSelect form={form} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Pos</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="41152"
                        {...field}
                        value={field.value || ''}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
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
                        value={field.value ?? ''}
                        className="w-full"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Koordinat lintang (contoh: -6.200000)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
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
                        value={field.value ?? ''}
                        className="w-full"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Koordinat bujur (contoh: 106.816666)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kontak */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Informasi Kontak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kontak</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama penanggung jawab"
                        {...field}
                        value={field.value || ''}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="contactTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan Kontak</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Kepala Sekolah, Direktur, dll"
                        {...field}
                        value={field.value || ''}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="08123456789"
                        {...field}
                        value={field.value || ''}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                        value={field.value || ''}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Kepegawaian & Status Operasional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Data Kepegawaian & Status Operasional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Operasional */}
            <FormField
              control={form.control as any}
              name="operationalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Operasional</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || 'ACTIVE'}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih status operasional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Aktif</SelectItem>
                      <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                      <SelectItem value="TEMPORARILY_CLOSED">Tutup Sementara</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Status operasional organisasi saat ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Staff Counts - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="teachingStaffCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedType === 'SCHOOL' 
                        ? 'Jumlah Guru/Tenaga Pengajar' 
                        : selectedType === 'HEALTH_FACILITY'
                        ? 'Jumlah Tenaga Medis'
                        : 'Jumlah Kader/Tenaga Utama'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ''}
                        className="w-full"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedType === 'SCHOOL' 
                        ? 'Guru dan tenaga pengajar' 
                        : selectedType === 'HEALTH_FACILITY'
                        ? 'Dokter, perawat, bidan, dll'
                        : 'Kader posyandu dan tenaga kesehatan'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="nonTeachingStaffCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Tenaga Pendukung (Non-Pengajar)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ''}
                        className="w-full"
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Tenaga administrasi, staf pendukung, dan lainnya
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Status & Catatan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control as any}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Organisasi Aktif</FormLabel>
                    <FormDescription>
                      Nonaktifkan jika organisasi tidak lagi beroperasi
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan tentang organisasi..."
                      {...field}
                      value={field.value || ''}
                      rows={4}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Catatan internal atau informasi tambahan yang perlu dicatat
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="submit" disabled={isPending} size="lg">
            {isPending
              ? mode === 'create'
                ? 'Membuat...'
                : 'Menyimpan...'
              : mode === 'create'
              ? 'Buat Organisasi'
              : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
