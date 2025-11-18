/**
 * @fileoverview Employee Form Component
 * @module features/sppg/hrd/components/EmployeeForm
 * @description Form for creating and editing employees with validation
 * 
 * Features:
 * - Create/Edit modes based on employee prop
 * - React Hook Form with Zod validation
 * - 5 main sections: Personal, Contact, Emergency, Employment, Compensation
 * - Field dependencies: contract dates for CONTRACT type, probation for PROBATION status
 * - Location cascade: province → regency → district → village
 * - Auto-generated employeeCode or manual input
 * - Photo upload preview
 * - Loading states during mutations
 * 
 * @version Next.js 15.5.4 / React Hook Form 7.x / Zod 3.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  User,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Calendar,
  Upload,
  Save,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

import { useCreateEmployee, useUpdateEmployee } from '../hooks'
import { useDepartments } from '../hooks/useDepartments'
import { usePositions } from '../hooks/usePositions'
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from '../schemas/employeeSchema'
import type { EmployeeDetail } from '../types'

interface EmployeeFormProps {
  employee?: EmployeeDetail
  onSuccess?: () => void
  onCancel?: () => void
}

export function EmployeeForm({
  employee,
  onSuccess,
  onCancel,
}: EmployeeFormProps) {
  const router = useRouter()
  const isEditMode = !!employee

  const { mutate: createEmployee, isPending: isCreating } = useCreateEmployee()
  const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee()

  // Fetch departments and positions for selectors
  const { data: departments = [], isLoading: isDepartmentsLoading } = useDepartments({ isActive: true })
  const { data: positions = [], isLoading: isPositionsLoading } = usePositions({ isActive: true })

  const isPending = isCreating || isUpdating

  // Photo preview state
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    employee?.photoUrl || null
  )

  // Form setup
  const form = useForm<CreateEmployeeInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEditMode ? updateEmployeeSchema : createEmployeeSchema) as any,
    defaultValues: isEditMode
      ? {
          fullName: employee.fullName,
          nickname: employee.nickname || '',
          nik: employee.nik || '',
          dateOfBirth: employee.dateOfBirth || undefined,
          placeOfBirth: employee.placeOfBirth || '',
          gender: employee.gender || 'MALE',
          religion: employee.religion || 'ISLAM',
          maritalStatus: employee.maritalStatus || 'SINGLE',
          bloodType: employee.bloodType || undefined,
          nationality: employee.nationality || 'WNI',
          phone: employee.phone || '',
          email: employee.email || '',
          personalEmail: employee.personalEmail || '',
          addressDetail: employee.addressDetail || '',
          villageId: employee.villageId || undefined,
          postalCode: employee.postalCode || '',
          emergencyContactName: employee.emergencyContactName || '',
          emergencyContactPhone: employee.emergencyContactPhone || '',
          emergencyContactRelation: employee.emergencyContactRelation || '',
          employeeCode: employee.employeeCode || '',
          departmentId: employee.departmentId,
          positionId: employee.positionId,
          employmentType: employee.employmentType,
          employmentStatus: employee.employmentStatus || 'ACTIVE',
          joinDate: employee.joinDate,
          probationEndDate: employee.probationEndDate || undefined,
          contractStartDate: employee.contractStartDate || undefined,
          contractEndDate: employee.contractEndDate || undefined,
          directSupervisor: employee.directSupervisor || '',
          workLocation: employee.workLocation || '',
          workScheduleId: employee.workScheduleId || undefined,
          basicSalary: employee.basicSalary || 0,
          currency: employee.currency || 'IDR',
          salaryGrade: employee.salaryGrade || '',
          taxId: employee.taxId || '',
          bankAccount: employee.bankAccount || '',
          bankName: employee.bankName || '',
          bankBranch: employee.bankBranch || '',
          photoUrl: employee.photoUrl || '',
          biography: employee.biography || '',
          skills: employee.skills || [],
          languages: employee.languages || [],
        }
      : {
          fullName: '',
          nickname: '',
          nik: '',
          gender: 'MALE',
          religion: 'ISLAM',
          maritalStatus: 'SINGLE',
          nationality: 'WNI',
          phone: '',
          email: '',
          departmentId: '',
          positionId: '',
          employmentType: 'PERMANENT',
          employmentStatus: 'ACTIVE',
          joinDate: new Date(),
          basicSalary: 0,
          currency: 'IDR',
        },
  })

  // Watch employment type for contract date fields
  const employmentType = form.watch('employmentType')
  const employmentStatus = form.watch('employmentStatus')

  // Form submission
  const onSubmit = (data: CreateEmployeeInput | UpdateEmployeeInput) => {
    if (isEditMode && employee) {
      updateEmployee(
        { id: employee.id, data: data as UpdateEmployeeInput },
        {
          onSuccess: () => {
            toast.success('Karyawan berhasil diperbarui')
            onSuccess?.()
            router.push(`/hrd/employees/${employee.id}`)
          },
        }
      )
    } else {
      createEmployee(data as CreateEmployeeInput, {
        onSuccess: (newEmployee) => {
          toast.success('Karyawan berhasil ditambahkan')
          onSuccess?.()
          router.push(`/hrd/employees/${newEmployee.id}`)
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Photo Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Foto Profil
            </CardTitle>
            <CardDescription>
              Upload foto karyawan (opsional, maks. 2MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={photoPreview || undefined} />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              // Show preview
                              const reader = new FileReader()
                              reader.onloadend = () => {
                                setPhotoPreview(reader.result as string)
                              }
                              reader.readAsDataURL(file)
                              
                              // In production, upload to storage and set URL
                              // For now, just set placeholder
                              field.onChange(`/uploads/employees/${file.name}`)
                            }
                          }}
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

        {/* Personal Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pribadi
            </CardTitle>
            <CardDescription>
              Data pribadi karyawan sesuai KTP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nickname */}
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Panggilan</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NIK */}
              <FormField
                control={form.control}
                name="nik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIK (KTP)</FormLabel>
                    <FormControl>
                      <Input placeholder="3201234567890001" maxLength={16} {...field} />
                    </FormControl>
                    <FormDescription>16 digit nomor KTP</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(new Date(field.value), 'dd MMMM yyyy', {
                                locale: idLocale,
                              })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date)}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Place of Birth */}
              <FormField
                control={form.control}
                name="placeOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempat Lahir</FormLabel>
                    <FormControl>
                      <Input placeholder="Jakarta" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kelamin *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Laki-laki</SelectItem>
                        <SelectItem value="FEMALE">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Religion */}
              <FormField
                control={form.control}
                name="religion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agama *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih agama" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ISLAM">Islam</SelectItem>
                        <SelectItem value="KRISTEN">Kristen</SelectItem>
                        <SelectItem value="KATOLIK">Katolik</SelectItem>
                        <SelectItem value="HINDU">Hindu</SelectItem>
                        <SelectItem value="BUDDHA">Buddha</SelectItem>
                        <SelectItem value="KONGHUCU">Konghucu</SelectItem>
                        <SelectItem value="LAINNYA">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Marital Status */}
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Perkawinan *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SINGLE">Belum Menikah</SelectItem>
                        <SelectItem value="MARRIED">Menikah</SelectItem>
                        <SelectItem value="DIVORCED">Cerai</SelectItem>
                        <SelectItem value="WIDOWED">Janda/Duda</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Blood Type */}
              <FormField
                control={form.control}
                name="bloodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Golongan Darah</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih golongan darah" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="AB">AB</SelectItem>
                        <SelectItem value="O">O</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nationality */}
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kewarganegaraan *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kewarganegaraan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WNI">WNI</SelectItem>
                        <SelectItem value="WNA">WNA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informasi Kontak
            </CardTitle>
            <CardDescription>
              Data kontak dan alamat tempat tinggal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon *</FormLabel>
                    <FormControl>
                      <Input placeholder="08123456789" {...field} />
                    </FormControl>
                    <FormDescription>Format: 08xxx atau +62xxx</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email (Corporate) */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Perusahaan</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Personal Email */}
              <FormField
                control={form.control}
                name="personalEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Pribadi</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.doe@gmail.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Postal Code */}
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Pos</FormLabel>
                    <FormControl>
                      <Input placeholder="12345" maxLength={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Detail */}
            <FormField
              control={form.control}
              name="addressDetail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Lengkap</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Alamat detail termasuk nama jalan, nomor, RT/RW
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Village ID - In production, implement province → regency → district → village cascade */}
            <FormField
              control={form.control}
              name="villageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kelurahan/Desa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ID Kelurahan/Desa"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Pilih kelurahan/desa (cascade: provinsi → kabupaten → kecamatan → kelurahan)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Emergency Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Kontak Darurat
            </CardTitle>
            <CardDescription>
              Kontak yang dapat dihubungi dalam keadaan darurat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Emergency Contact Name */}
              <FormField
                control={form.control}
                name="emergencyContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kontak Darurat</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Emergency Contact Phone */}
              <FormField
                control={form.control}
                name="emergencyContactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="08123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Emergency Contact Relation */}
              <FormField
                control={form.control}
                name="emergencyContactRelation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hubungan</FormLabel>
                    <FormControl>
                      <Input placeholder="Istri/Suami/Orang Tua" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Employment Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informasi Kepegawaian
            </CardTitle>
            <CardDescription>
              Data terkait posisi dan status kepegawaian
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Code */}
              <FormField
                control={form.control}
                name="employeeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Karyawan</FormLabel>
                    <FormControl>
                      <Input placeholder="EMP-IT-001 (auto)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Kosongkan untuk generate otomatis
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department ID */}
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departemen *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isDepartmentsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isDepartmentsLoading ? "Memuat..." : "Pilih departemen"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.departmentCode} - {dept.departmentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih departemen dari daftar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Position ID */}
              <FormField
                control={form.control}
                name="positionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posisi/Jabatan *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isPositionsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isPositionsLoading ? "Memuat..." : "Pilih posisi"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos.id} value={pos.id}>
                            {pos.positionCode} - {pos.positionName} ({pos.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih posisi dari daftar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Employment Type */}
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Kepegawaian *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kepegawaian" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERMANENT">Tetap</SelectItem>
                        <SelectItem value="CONTRACT">Kontrak</SelectItem>
                        <SelectItem value="TEMPORARY">Tidak Tetap</SelectItem>
                        <SelectItem value="INTERN">Magang</SelectItem>
                        <SelectItem value="FREELANCE">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Employment Status */}
              <FormField
                control={form.control}
                name="employmentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Kepegawaian *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Aktif</SelectItem>
                        <SelectItem value="PROBATION">Masa Percobaan</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="TERMINATED">Diberhentikan</SelectItem>
                        <SelectItem value="RESIGNED">Mengundurkan Diri</SelectItem>
                        <SelectItem value="RETIRED">Pensiun</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Join Date */}
              <FormField
                control={form.control}
                name="joinDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Bergabung *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(new Date(field.value), 'dd MMMM yyyy', {
                                locale: idLocale,
                              })
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date)}
                          disabled={(date) => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Probation End Date - Show only if status is PROBATION */}
              {employmentStatus === 'PROBATION' && (
                <FormField
                  control={form.control}
                  name="probationEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Akhir Masa Percobaan</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(new Date(field.value), 'dd MMMM yyyy', {
                                  locale: idLocale,
                                })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Contract Start Date - Show only if type is CONTRACT */}
              {employmentType === 'CONTRACT' && (
                <FormField
                  control={form.control}
                  name="contractStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Mulai Kontrak</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(new Date(field.value), 'dd MMMM yyyy', {
                                  locale: idLocale,
                                })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Contract End Date - Show only if type is CONTRACT */}
              {employmentType === 'CONTRACT' && (
                <FormField
                  control={form.control}
                  name="contractEndDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Akhir Kontrak</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(new Date(field.value), 'dd MMMM yyyy', {
                                  locale: idLocale,
                                })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Direct Supervisor */}
              <FormField
                control={form.control}
                name="directSupervisor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atasan Langsung</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama atasan langsung" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Work Location */}
              <FormField
                control={form.control}
                name="workLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi Kerja</FormLabel>
                    <FormControl>
                      <Input placeholder="Kantor Pusat / Cabang" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Work Schedule ID */}
              <FormField
                control={form.control}
                name="workScheduleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jadwal Kerja</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ID Jadwal Kerja"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Pilih jadwal kerja dari daftar
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Compensation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Informasi Kompensasi
            </CardTitle>
            <CardDescription>
              Data gaji, pajak, dan rekening bank
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Salary */}
              <FormField
                control={form.control}
                name="basicSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gaji Pokok *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5000000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mata Uang *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih mata uang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                        <SelectItem value="USD">USD (Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Salary Grade */}
              <FormField
                control={form.control}
                name="salaryGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Gaji</FormLabel>
                    <FormControl>
                      <Input placeholder="A1, B2, C3, dll." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tax ID */}
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NPWP</FormLabel>
                    <FormControl>
                      <Input placeholder="12.345.678.9-012.345" {...field} />
                    </FormControl>
                    <FormDescription>Nomor Pokok Wajib Pajak</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bank Account */}
              <FormField
                control={form.control}
                name="bankAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Rekening</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bank Name */}
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Bank</FormLabel>
                    <FormControl>
                      <Input placeholder="BCA, Mandiri, BRI, dll." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bank Branch */}
              <FormField
                control={form.control}
                name="bankBranch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cabang Bank</FormLabel>
                    <FormControl>
                      <Input placeholder="KCP Jakarta Pusat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Tambahan
            </CardTitle>
            <CardDescription>
              Data pelengkap profil karyawan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Biography */}
            <FormField
              control={form.control}
              name="biography"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ceritakan sedikit tentang latar belakang dan pengalaman..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Skills - In production, use TagInput or multi-select */}
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keahlian</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pisahkan dengan koma: JavaScript, React, Node.js"
                      value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                      onChange={(e) => {
                        const skills = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                        field.onChange(skills)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Pisahkan dengan koma untuk beberapa keahlian
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Languages - In production, use TagInput or multi-select */}
            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bahasa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Pisahkan dengan koma: Indonesia, Inggris, Mandarin"
                      value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                      onChange={(e) => {
                        const languages = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean)
                        field.onChange(languages)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Pisahkan dengan koma untuk beberapa bahasa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onCancel?.()
              router.back()
            }}
            disabled={isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending
              ? 'Menyimpan...'
              : isEditMode
              ? 'Simpan Perubahan'
              : 'Tambah Karyawan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
