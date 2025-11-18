/**
 * @fileoverview Enrollment Form Component
 * @version Next.js 15.5.4 / React Hook Form / Zod
 * @author Bagizi-ID Development Team
 * 
 * Reusable form component for creating and editing program enrollments
 * Supports both create and edit modes with proper validation
 * 
 * Form Sections:
 * 1. School Selection (create only)
 * 2. Enrollment Period
 * 3. Student Configuration
 * 4. Feeding Schedule
 * 5. Delivery Information
 * 6. Budget Allocation
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, School as SchoolIcon, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { enrollmentSchema, type EnrollmentInput } from '@/features/sppg/program/schemas/enrollmentSchema'
import { useCreateEnrollment, useUpdateEnrollment } from '@/features/sppg/program/hooks'
// import { useSchools } from '@/features/sppg/school/hooks' // ❌ DEPRECATED: School model removed
// import type { SchoolMaster } from '@/features/sppg/school/types' // ❌ DEPRECATED: School model removed
import type { EnrollmentWithRelations } from '@/features/sppg/program/types/enrollment.types'
import { toast } from 'sonner'

interface EnrollmentFormProps {
  programId: string
  enrollmentId?: string
  enrollment?: EnrollmentWithRelations
  mode: 'create' | 'edit'
}

export function EnrollmentForm({ programId, enrollmentId, enrollment, mode }: EnrollmentFormProps) {
  const router = useRouter()
  const [searchSchool, setSearchSchool] = useState('')

  // ❌ DEPRECATED: School model removed, use BeneficiaryOrganization instead
  // TODO: Replace with useBeneficiaryOrganizations hook
  // const { data: schoolsResponse } = useSchools({}, { enabled: mode === 'create' })
  // const schools = schoolsResponse?.schools || []
  const schools: Array<{ id: string; schoolName: string; schoolCode: string | null; schoolType: string; totalStudents: number }> = [] // Temporary empty array until BeneficiaryOrganization integration

  // API mutations
  const { mutate: createEnrollment, isPending: isCreating } = useCreateEnrollment(programId)
  const { mutate: updateEnrollment, isPending: isUpdating } = useUpdateEnrollment(programId)

  const isPending = isCreating || isUpdating

  // Form setup with proper type inference
  const form = useForm({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      schoolId: '',
      enrollmentDate: new Date(),
      startDate: new Date(),
      endDate: undefined,
      targetStudents: 0,
      activeStudents: 0,
      students4to6Years: 0,
      students7to12Years: 0,
      students13to15Years: 0,
      students16to18Years: 0,
      maleStudents: 0,
      femaleStudents: 0,
      feedingDays: 5,
      mealsPerDay: 1,
      feedingTime: null,
      breakfastTime: null,
      lunchTime: null,
      snackTime: null,
      deliveryAddress: '',
      deliveryContact: '',
      deliveryPhone: '',
      deliveryInstructions: null,
      preferredDeliveryTime: null,
      estimatedTravelTime: null,
      storageCapacity: null,
      servingMethod: null,
      monthlyBudgetAllocation: 0,
      budgetPerStudent: 0,
      contractStartDate: null,
      contractEndDate: null,
      contractValue: null,
      contractNumber: null,
      attendanceRate: null,
      participationRate: null,
      satisfactionScore: null,
      status: 'ACTIVE',
      isActive: true,
      notes: null,
      specialRequirements: null,
    },
  })

  // Populate form in edit mode
  useEffect(() => {
    if (mode === 'edit' && enrollment) {
      form.reset({
        schoolId: enrollment.schoolId,
        enrollmentDate: new Date(enrollment.enrollmentDate),
        startDate: new Date(enrollment.startDate),
        endDate: enrollment.endDate ? new Date(enrollment.endDate) : undefined,
        targetStudents: enrollment.targetStudents,
        activeStudents: enrollment.activeStudents || 0,
        students4to6Years: enrollment.students4to6Years || 0,
        students7to12Years: enrollment.students7to12Years || 0,
        students13to15Years: enrollment.students13to15Years || 0,
        students16to18Years: enrollment.students16to18Years || 0,
        maleStudents: enrollment.maleStudents || 0,
        femaleStudents: enrollment.femaleStudents || 0,
        feedingDays: enrollment.feedingDays ?? 5,
        mealsPerDay: enrollment.mealsPerDay ?? 1,
        feedingTime: enrollment.feedingTime,
        breakfastTime: enrollment.breakfastTime,
        lunchTime: enrollment.lunchTime,
        snackTime: enrollment.snackTime,
        deliveryAddress: enrollment.deliveryAddress || '',
        deliveryContact: enrollment.deliveryContact ?? undefined,
        deliveryPhone: enrollment.deliveryPhone ?? undefined,
        deliveryInstructions: enrollment.deliveryInstructions,
        preferredDeliveryTime: enrollment.preferredDeliveryTime,
        estimatedTravelTime: enrollment.estimatedTravelTime,
        storageCapacity: enrollment.storageCapacity,
        servingMethod: enrollment.servingMethod,
        monthlyBudgetAllocation: enrollment.monthlyBudgetAllocation ?? undefined,
        budgetPerStudent: enrollment.budgetPerStudent ?? undefined,
        contractStartDate: enrollment.contractStartDate ? new Date(enrollment.contractStartDate) : null,
        contractEndDate: enrollment.contractEndDate ? new Date(enrollment.contractEndDate) : null,
        contractValue: enrollment.contractValue,
        contractNumber: enrollment.contractNumber,
        attendanceRate: enrollment.attendanceRate,
        participationRate: enrollment.participationRate,
        satisfactionScore: enrollment.satisfactionScore,
        status: enrollment.status,
        isActive: enrollment.isActive,
        notes: enrollment.notes,
        specialRequirements: enrollment.specialRequirements || null,
      })
    }
  }, [mode, enrollment, form])

  // Filter schools by search
  const filteredSchools = schools?.filter((school) =>
    school.schoolName.toLowerCase().includes(searchSchool.toLowerCase())
  )

  // Form submission
  const onSubmit = (data: EnrollmentInput) => {
    console.log('📝 Form submission data (before transform):', JSON.stringify(data, null, 2))

    // Transform Date objects to ISO strings for API
    // TypeScript: We need to cast because API accepts string dates, not Date objects
    const transformedData = {
      ...data,
      enrollmentDate: data.enrollmentDate instanceof Date 
        ? data.enrollmentDate.toISOString() 
        : data.enrollmentDate,
      startDate: data.startDate instanceof Date 
        ? data.startDate.toISOString() 
        : data.startDate,
      endDate: data.endDate instanceof Date 
        ? data.endDate.toISOString() 
        : data.endDate,
      contractStartDate: data.contractStartDate instanceof Date 
        ? data.contractStartDate.toISOString() 
        : data.contractStartDate,
      contractEndDate: data.contractEndDate instanceof Date 
        ? data.contractEndDate.toISOString() 
        : data.contractEndDate,
    } as unknown as EnrollmentInput

    console.log('📝 Form submission data (after transform):', JSON.stringify(transformedData, null, 2))

    if (mode === 'create') {
      createEnrollment(transformedData, {
        onSuccess: () => {
          toast.success('Enrollment berhasil dibuat')
          router.push(`/program/${programId}/enrollments`)
        },
        onError: (error) => {
          console.error('❌ Create error:', error)
          toast.error(error.message || 'Gagal membuat enrollment')
        },
      })
    } else {
      console.log('🔄 Updating enrollment:', enrollmentId)
      updateEnrollment({ 
        enrollmentId: enrollmentId!,
        data: transformedData
      }, {
        onSuccess: () => {
          toast.success('Enrollment berhasil diupdate')
          router.push(`/program/${programId}/enrollments/${enrollmentId}`)
        },
        onError: (error) => {
          console.error('❌ Update error:', error)
          toast.error(error.message || 'Gagal mengupdate enrollment')
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* School Selection (Create Mode Only) */}
        {mode === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SchoolIcon className="h-5 w-5 text-primary" />
                Pilih Sekolah
              </CardTitle>
              <CardDescription>Pilih sekolah yang akan didaftarkan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sekolah *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sekolah" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            placeholder="Cari sekolah..."
                            value={searchSchool}
                            onChange={(e) => setSearchSchool(e.target.value)}
                            className="mb-2"
                          />
                        </div>
                        {filteredSchools?.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            <div>
                              <div className="font-medium">{school.schoolName}</div>
                              <div className="text-xs text-muted-foreground">
                                {school.schoolType}
                                {/* • {school.schoolAddress} */} {/* ❌ DEPRECATED: Field removed */}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Edit Mode: Show School Name */}
        {mode === 'edit' && enrollment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SchoolIcon className="h-5 w-5 text-primary" />
                Sekolah
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="font-semibold text-lg">{enrollment.school.schoolName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {enrollment.school.schoolType} • {enrollment.school.schoolAddress}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enrollment Period */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Periode Enrollment
            </CardTitle>
            <CardDescription>Atur periode dan status enrollment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="enrollmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Pendaftaran *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Selesai</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription>Kosongkan jika masih aktif</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Aktif</SelectItem>
                      <SelectItem value="COMPLETED">Selesai</SelectItem>
                      <SelectItem value="SUSPENDED">Ditangguhkan</SelectItem>
                      <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 3: Student Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SchoolIcon className="h-5 w-5 text-primary" />
              Konfigurasi Siswa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Target Students */}
              <FormField
                control={form.control}
                name="targetStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Siswa *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Total target siswa yang akan dilayani</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Students */}
              <FormField
                control={form.control}
                name="activeStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Siswa Aktif</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Jumlah siswa yang sudah aktif terdaftar</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Age Groups */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Distribusi Usia</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="students4to6Years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usia 4-6 Tahun</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="students7to12Years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usia 7-12 Tahun</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="students13to15Years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usia 13-15 Tahun</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="students16to18Years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usia 16-18 Tahun</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Gender Distribution */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Distribusi Gender</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="maleStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Siswa Laki-laki</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="femaleStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Siswa Perempuan</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Feeding Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Jadwal Feeding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Feeding Days */}
              <FormField
                control={form.control}
                name="feedingDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hari Feeding/Minggu *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="7"
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>1-7 hari per minggu</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Meals Per Day */}
              <FormField
                control={form.control}
                name="mealsPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Makan/Hari *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>1-5 kali makan per hari</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Feeding Times */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Waktu Feeding</Label>
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="breakfastTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waktu Sarapan</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
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
                  name="lunchTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waktu Makan Siang</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
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
                  name="snackTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waktu Snack</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Feeding Time Notes */}
            <FormField
              control={form.control}
              name="feedingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Waktu Feeding</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Setiap hari Senin-Jumat jam 10.00"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Informasi tambahan tentang jadwal feeding</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 5: Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SchoolIcon className="h-5 w-5 text-primary" />
              Informasi Pengiriman
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Delivery Address */}
            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Pengiriman</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Alamat lengkap untuk pengiriman"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Alamat untuk pengiriman makanan</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              {/* Delivery Contact */}
              <FormField
                control={form.control}
                name="deliveryContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kontak</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama PIC pengiriman"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Phone */}
              <FormField
                control={form.control}
                name="deliveryPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="08123456789"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Delivery Instructions */}
            <FormField
              control={form.control}
              name="deliveryInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruksi Pengiriman</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Instruksi khusus untuk pengiriman"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Catatan khusus untuk kurir</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="grid gap-4 md:grid-cols-3">
              {/* Preferred Delivery Time */}
              <FormField
                control={form.control}
                name="preferredDeliveryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Pengiriman Preferensi</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: 08:00-09:00"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Travel Time */}
              <FormField
                control={form.control}
                name="estimatedTravelTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimasi Waktu Tempuh (menit)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Storage Capacity */}
              <FormField
                control={form.control}
                name="storageCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kapasitas Penyimpanan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: 100 porsi"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Serving Method */}
            <FormField
              control={form.control}
              name="servingMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metode Penyajian</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Langsung disajikan, Dipanaskan kembali, dll"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Bagaimana makanan akan disajikan ke siswa</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 6: Budget Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Alokasi Anggaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Monthly Budget Allocation */}
              <FormField
                control={form.control}
                name="monthlyBudgetAllocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anggaran Bulanan</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Total anggaran per bulan (Rp)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Budget Per Student */}
              <FormField
                control={form.control}
                name="budgetPerStudent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anggaran per Siswa</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>Anggaran per siswa per bulan (Rp)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Contract Information */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Informasi Kontrak</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contractNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Kontrak</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="KONTR/2025/001"
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
                  name="contractValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai Kontrak</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100000000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>Total nilai kontrak (Rp)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Mulai Kontrak</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? (field.value instanceof Date ? field.value.toISOString().split('T')[0] : '') : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contractEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Selesai Kontrak</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? (field.value instanceof Date ? field.value.toISOString().split('T')[0] : '') : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Menyimpan...' : mode === 'create' ? 'Buat Enrollment' : 'Update Enrollment'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
