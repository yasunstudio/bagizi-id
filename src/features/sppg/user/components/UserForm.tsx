/**
 * @fileoverview SPPG User Form Component
 * @version Next.js 15.5.4 / React Hook Form / Zod
 * @author Bagizi-ID Development Team
 * 
 * Features:
 * - Create/Edit modes with conditional fields
 * - React Hook Form + Zod validation
 * - Password strength indicator (create mode)
 * - Phone formatting: Display 08xxx, submit +628xxx
 * - Role dropdown with all 16 SPPG UserRole values
 * - Timezone: WIB/WITA/WIT radio buttons
 * - Language: Indonesian/English toggle
 * - Form validation with inline error messages
 * - Loading states & disabled submit
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

import { 
  useCreateUser, 
  useUpdateUser, 
  useUser,
  useDepartmentsForUser,
  usePositionsForUser,
} from '@/features/sppg/user/hooks'
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/features/sppg/user/schemas'

interface UserFormProps {
  mode: 'create' | 'edit'
  userId?: string
}

/**
 * User Form Component
 * Handles both create and edit modes with proper validation
 */
export function UserForm({ mode, userId }: UserFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)

  // Hooks
  const { data: existingUser, isLoading: isLoadingUser } = useUser(userId!, {
    enabled: mode === 'edit' && !!userId,
  })
  const { mutate: createUser, isPending: isCreating } = useCreateUser()
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser()
  
  // Fetch departments and positions for dropdowns
  const { data: departments = [], isLoading: isLoadingDepartments } = useDepartmentsForUser()
  const { data: positions = [], isLoading: isLoadingPositions } = usePositionsForUser(selectedDepartmentId)

  const isPending = isCreating || isUpdating

  // Form setup with conditional schema
  const form = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(mode === 'create' ? createUserSchema : updateUserSchema),
    defaultValues: {
      email: '',
      name: '',
      password: mode === 'create' ? '' : undefined,
      userType: 'SPPG_USER',
      userRole: 'SPPG_VIEWER',
      phone: '',
      firstName: '',
      lastName: '',
      departmentId: null,
      positionId: null,
      location: '',
      timezone: 'WIB',
      language: 'id',
      isActive: true,
    },
  })

  // Load existing user data in edit mode
  useEffect(() => {
    if (mode === 'edit' && existingUser) {
      console.log('[UserForm] Loading existing user data:', {
        userId: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        userRole: existingUser.userRole,
        userType: existingUser.userType,
        departmentId: existingUser.departmentId,
        positionId: existingUser.positionId,
        rawData: existingUser
      })
      
      // Set selected department for position filtering
      if (existingUser.departmentId) {
        setSelectedDepartmentId(existingUser.departmentId)
      }
      
      form.reset({
        email: existingUser.email,
        name: existingUser.name,
        userType: existingUser.userType,
        userRole: existingUser.userRole || 'SPPG_VIEWER',
        phone: existingUser.phone ? formatPhoneDisplay(existingUser.phone) : '',
        firstName: existingUser.firstName || '',
        lastName: existingUser.lastName || '',
        departmentId: existingUser.departmentId || null,
        positionId: existingUser.positionId || null,
        location: existingUser.location || '',
        timezone: (existingUser.timezone as 'WIB' | 'WITA' | 'WIT') || 'WIB',
        language: (existingUser.language as 'id' | 'en') || 'id',
        isActive: existingUser.isActive,
      })
      
      console.log('[UserForm] Form values after reset:', form.getValues())
    }
  }, [existingUser, mode, form])

  // Watch password for strength indicator
  const password = form.watch('password')
  useEffect(() => {
    if (mode === 'create' && password) {
      setPasswordStrength(calculatePasswordStrength(password))
    }
  }, [password, mode])

  // Form submit handler
  const onSubmit = (data: CreateUserInput | UpdateUserInput) => {
    if (mode === 'create') {
      const createData = data as CreateUserInput
      
      // Convert empty strings and null to undefined for optional fields
      const rawPhone = toOptionalString(createData.phone)
      const phone: string | undefined = rawPhone ? formatPhoneSubmit(rawPhone) : undefined
      const firstName: string | undefined = toOptionalString(createData.firstName)
      const lastName: string | undefined = toOptionalString(createData.lastName)
      
      const processedData: CreateUserInput = {
        email: createData.email,
        name: createData.name,
        password: createData.password,
        userType: createData.userType,
        userRole: createData.userRole,
        phone,
        firstName,
        lastName,
        departmentId: createData.departmentId || null,
        positionId: createData.positionId || null,
        timezone: createData.timezone,
        language: createData.language,
        isActive: createData.isActive,
      } as CreateUserInput

      createUser(processedData, {
        onSuccess: () => {
          toast.success('User berhasil dibuat')
          router.push('/users')
        },
        onError: (error) => {
          toast.error('Gagal membuat user', {
            description: error.message,
          })
        },
      })
    } else {
      // Convert empty strings and null to undefined for optional fields
      const updateData = data as UpdateUserInput
      
      const rawPhone = toOptionalString(updateData.phone)
      const phone: string | undefined = rawPhone ? formatPhoneSubmit(rawPhone) : undefined
      const firstName: string | undefined = toOptionalString(updateData.firstName)
      const lastName: string | undefined = toOptionalString(updateData.lastName)
      const location: string | undefined = toOptionalString(updateData.location)
      
      const processedData: UpdateUserInput = {
        name: updateData.name,
        phone,
        firstName,
        lastName,
        departmentId: updateData.departmentId || null,
        positionId: updateData.positionId || null,
        location,
        timezone: updateData.timezone,
        language: updateData.language,
        isActive: updateData.isActive,
      } as UpdateUserInput

      updateUser(
        { id: userId!, data: processedData },
        {
          onSuccess: () => {
            toast.success('User berhasil diperbarui')
            router.push(`/users/${userId}`)
          },
          onError: (error) => {
            toast.error('Gagal memperbarui user', {
              description: error.message,
            })
          },
        }
      )
    }
  }

  // Loading state for edit mode
  if (mode === 'edit' && isLoadingUser) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Memuat data user...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>
              Data login dan informasi dasar user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@sppg.id"
                      disabled={mode === 'edit' || isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email akan digunakan untuk login
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password fields - only in create mode */}
            {mode === 'create' && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Minimal 8 karakter"
                            disabled={isPending}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Kekuatan Password:</span>
                      <Badge variant={getPasswordStrengthVariant(passwordStrength)}>
                        {getPasswordStrengthLabel(passwordStrength)}
                      </Badge>
                    </div>
                    <Progress value={passwordStrength} className="h-2" />
                  </div>
                )}

                {passwordStrength < 60 && password && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Password terlalu lemah! Gunakan kombinasi huruf besar, kecil, angka, dan simbol.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Role & Hak Akses</CardTitle>
            <CardDescription>
              Tentukan role dan tipe user untuk akses sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Type */}
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe User *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={mode === 'edit' || isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SPPG_USER">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">SPPG User</span>
                          <span className="text-xs text-muted-foreground">
                            User regular SPPG dengan akses berdasarkan role
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="DEMO_USER">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Demo User</span>
                          <span className="text-xs text-muted-foreground">
                            User demo dengan akses terbatas
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Tipe user menentukan kategori akses sistem
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* User Role */}
            <FormField
              control={form.control}
              name="userRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role User *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SPPG_KEPALA">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Kepala SPPG</span>
                          <span className="text-xs text-muted-foreground">
                            Full access ke semua modul
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SPPG_ADMIN">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Admin SPPG</span>
                          <span className="text-xs text-muted-foreground">
                            Manage users, menu, procurement
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SPPG_AHLI_GIZI">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Ahli Gizi</span>
                          <span className="text-xs text-muted-foreground">
                            Menu planning, nutrition analysis
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SPPG_AKUNTAN">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Akuntan</span>
                          <span className="text-xs text-muted-foreground">
                            Financial management, reporting
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SPPG_PRODUKSI_MANAGER">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Manager Produksi</span>
                          <span className="text-xs text-muted-foreground">
                            Production planning & monitoring
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SPPG_DISTRIBUSI_MANAGER">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Manager Distribusi</span>
                          <span className="text-xs text-muted-foreground">
                            Distribution planning & delivery
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SPPG_HRD_MANAGER">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Manager HRD</span>
                          <span className="text-xs text-muted-foreground">
                            User management, staff records
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SPPG_STAFF_DAPUR">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Staff Dapur</span>
                          <span className="text-xs text-muted-foreground">
                            Production execution, QC
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SPPG_STAFF_DISTRIBUSI">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Staff Distribusi</span>
                          <span className="text-xs text-muted-foreground">
                            Delivery execution & tracking
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SPPG_STAFF_ADMIN">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Staff Admin</span>
                          <span className="text-xs text-muted-foreground">
                            Data entry, document management
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SPPG_STAFF_QC">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Staff QC</span>
                          <span className="text-xs text-muted-foreground">
                            Quality control & inspection
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="SPPG_VIEWER">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Viewer</span>
                          <span className="text-xs text-muted-foreground">
                            Read-only access, reports only
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Role menentukan hak akses user di sistem
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Akun</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'true')}
                    defaultValue={field.value ? 'true' : 'false'}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">
                        <Badge variant="default">Aktif</Badge>
                      </SelectItem>
                      <SelectItem value="false">
                        <Badge variant="secondary">Nonaktif</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    User nonaktif tidak dapat login ke sistem
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Personal</CardTitle>
            <CardDescription>
              Data pribadi dan kontak user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Depan</FormLabel>
                    <FormControl>
                      <Input placeholder="John" disabled={isPending} {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Belakang</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" disabled={isPending} {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="08123456789"
                      disabled={isPending}
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const formatted = formatPhoneInput(e.target.value)
                        field.onChange(formatted)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Format: 08xxxxxxxxxx (akan disimpan sebagai +628xxx)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Department */}
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departemen</FormLabel>
                    <Select
                      value={field.value || ''}
                      onValueChange={(value) => {
                        field.onChange(value || null)
                        setSelectedDepartmentId(value || null)
                        // Reset position when department changes
                        form.setValue('positionId', null)
                      }}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih departemen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.length === 0 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            Tidak ada departemen aktif
                          </div>
                        ) : (
                          departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.departmentName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih departemen tempat pengguna bekerja
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Position */}
              <FormField
                control={form.control}
                name="positionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posisi</FormLabel>
                    <Select
                      value={field.value || ''}
                      onValueChange={(value) => field.onChange(value || null)}
                      disabled={isPending || !selectedDepartmentId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              selectedDepartmentId 
                                ? "Pilih posisi" 
                                : "Pilih departemen terlebih dahulu"
                            } 
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positions.length === 0 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            {selectedDepartmentId 
                              ? 'Tidak ada posisi aktif untuk departemen ini'
                              : 'Pilih departemen terlebih dahulu'}
                          </div>
                        ) : (
                          positions.map((pos) => (
                            <SelectItem key={pos.id} value={pos.id}>
                              {pos.positionName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Pilih posisi/jabatan pengguna (bergantung pada departemen)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi Kerja</FormLabel>
                  <FormControl>
                    <Input placeholder="Jakarta Pusat" disabled={isPending} {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferensi</CardTitle>
            <CardDescription>
              Pengaturan timezone dan bahasa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timezone */}
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Zona Waktu</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                      disabled={isPending}
                    >
                      <div>
                        <RadioGroupItem
                          value="WIB"
                          id="wib"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="wib"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <span className="text-sm font-medium">WIB</span>
                          <span className="text-xs text-muted-foreground">UTC+7</span>
                        </label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="WITA"
                          id="wita"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="wita"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <span className="text-sm font-medium">WITA</span>
                          <span className="text-xs text-muted-foreground">UTC+8</span>
                        </label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="WIT"
                          id="wit"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="wit"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <span className="text-sm font-medium">WIT</span>
                          <span className="text-xs text-muted-foreground">UTC+9</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Bahasa Interface</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                      disabled={isPending}
                    >
                      <div>
                        <RadioGroupItem
                          value="id"
                          id="id"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="id"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <span className="text-sm font-medium">🇮🇩 Indonesia</span>
                        </label>
                      </div>
                      <div>
                        <RadioGroupItem
                          value="en"
                          id="en"
                          className="peer sr-only"
                        />
                        <label
                          htmlFor="en"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <span className="text-sm font-medium">🇬🇧 English</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
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
            {mode === 'create' ? 'Buat User' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

/**
 * Convert nullable string to undefined
 * Helper to ensure TypeScript type narrowing for optional fields
 */
function toOptionalString(value: string | null | undefined): string | undefined {
  if (value === null || value === '' || value === undefined) return undefined
  return value as string
}

/**
 * Format phone input: allow only numbers, max 13 digits
 */
function formatPhoneInput(value: string): string {
  const numbers = value.replace(/\D/g, '')
  return numbers.slice(0, 13)
}

/**
 * Format phone for display: 08xxx
 */
function formatPhoneDisplay(value: string): string {
  if (value.startsWith('+62')) {
    return '0' + value.slice(3)
  }
  return value
}

/**
 * Format phone for submission: +628xxx
 */
function formatPhoneSubmit(value: string): string {
  if (value.startsWith('08')) {
    return '+62' + value.slice(1)
  }
  if (value.startsWith('8')) {
    return '+62' + value
  }
  return value
}

/**
 * Calculate password strength (0-100)
 */
function calculatePasswordStrength(password: string): number {
  let strength = 0

  // Length
  if (password.length >= 8) strength += 20
  if (password.length >= 12) strength += 10
  if (password.length >= 16) strength += 10

  // Character types
  if (/[a-z]/.test(password)) strength += 15
  if (/[A-Z]/.test(password)) strength += 15
  if (/[0-9]/.test(password)) strength += 15
  if (/[^a-zA-Z0-9]/.test(password)) strength += 15

  return Math.min(strength, 100)
}

/**
 * Get password strength label
 */
function getPasswordStrengthLabel(strength: number): string {
  if (strength < 40) return 'Sangat Lemah'
  if (strength < 60) return 'Lemah'
  if (strength < 80) return 'Sedang'
  if (strength < 100) return 'Kuat'
  return 'Sangat Kuat'
}

/**
 * Get password strength badge variant
 */
function getPasswordStrengthVariant(
  strength: number
): 'destructive' | 'secondary' | 'default' {
  if (strength < 60) return 'destructive'
  if (strength < 80) return 'secondary'
  return 'default'
}
