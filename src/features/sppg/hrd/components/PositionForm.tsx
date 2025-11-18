/**
 * @fileoverview Position Form Component
 * React Hook Form + Zod for creating/editing positions
 * @version Next.js 15.5.4 / React Hook Form 7.x
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building2,
  DollarSign,
  FileText,
  ListChecks,
  Plus,
  Trash2,
  Users,
  Info,
} from 'lucide-react'
import { useDepartments } from '../hooks/useDepartments'
import { useCreatePosition, useUpdatePosition } from '../hooks/usePositions'
import { positionSchema } from '../schemas/positionSchema'
import type { PositionInput, PositionWithRelations } from '../types/position.types'
import { EMPLOYEE_LEVEL_LABELS } from '../types/position.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PositionFormProps {
  position?: PositionWithRelations
  mode?: 'create' | 'edit'
}

export function PositionForm({ position, mode = 'create' }: PositionFormProps) {
  const router = useRouter()
  const [requirements, setRequirements] = useState<string[]>(
    position?.requirements || ['']
  )
  const [responsibilities, setResponsibilities] = useState<string[]>(
    position?.responsibilities || ['']
  )

  // Fetch departments for selector
  const { data: departments } = useDepartments()

  // Mutations
  const { mutate: createPosition, isPending: isCreating } = useCreatePosition()
  const { mutate: updatePosition, isPending: isUpdating } = useUpdatePosition()

  const isPending = isCreating || isUpdating

  // Form setup
  const form = useForm<PositionInput>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      departmentId: position?.departmentId || '',
      positionCode: position?.positionCode || '',
      positionName: position?.positionName || '',
      jobDescription: position?.jobDescription || '',
      requirements: position?.requirements || [],
      responsibilities: position?.responsibilities || [],
      level: position?.level || 'STAFF',
      reportsTo: position?.reportsTo || undefined,
      minSalary: position?.minSalary || 0,
      maxSalary: position?.maxSalary || 0,
      currency: position?.currency || 'IDR',
      maxOccupants: position?.maxOccupants || 1,
      isActive: position?.isActive ?? true,
    },
  })

  // Handle form submission
  const onSubmit = (data: PositionInput) => {
    // Filter empty requirements and responsibilities
    const filteredData = {
      ...data,
      requirements: requirements.filter((r) => r.trim() !== ''),
      responsibilities: responsibilities.filter((r) => r.trim() !== ''),
    }

    if (mode === 'edit' && position) {
      updatePosition(
        { id: position.id, data: filteredData },
        {
          onSuccess: () => {
            router.push(`/hrd/positions/${position.id}`)
          },
        }
      )
    } else {
      createPosition(filteredData, {
        onSuccess: (newPosition) => {
          router.push(`/hrd/positions/${newPosition.id}`)
        },
      })
    }
  }

  // Handle array input changes
  const addRequirement = () => {
    setRequirements([...requirements, ''])
  }

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements]
    newRequirements[index] = value
    setRequirements(newRequirements)
  }

  const addResponsibility = () => {
    setResponsibilities([...responsibilities, ''])
  }

  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index))
  }

  const updateResponsibility = (index: number, value: string) => {
    const newResponsibilities = [...responsibilities]
    newResponsibilities[index] = value
    setResponsibilities(newResponsibilities)
  }

  // Update form when arrays change
  useEffect(() => {
    form.setValue('requirements', requirements.filter((r) => r.trim() !== ''))
  }, [requirements, form])

  useEffect(() => {
    form.setValue('responsibilities', responsibilities.filter((r) => r.trim() !== ''))
  }, [responsibilities, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="positionCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Posisi *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MGR-001"
                        {...field}
                        className="font-mono uppercase"
                      />
                    </FormControl>
                    <FormDescription>
                      Kode unik untuk posisi (2-20 karakter)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="positionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Posisi *</FormLabel>
                    <FormControl>
                      <Input placeholder="Manager Operasional" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nama lengkap posisi jabatan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Pekerjaan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi singkat tentang posisi ini..."
                      rows={3}
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Ringkasan singkat tentang posisi dan tanggung jawabnya
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Department & Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Departemen & Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departemen *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih departemen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            <div className="flex items-center gap-2">
                              <span>{dept.departmentName}</span>
                              {!dept.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Nonaktif
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Departemen tempat posisi ini berada
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level Jabatan *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(EMPLOYEE_LEVEL_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Level hierarki dalam organisasi
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maxOccupants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Maksimal Pegawai</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Berapa banyak pegawai yang dapat mengisi posisi ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Salary Ranges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Rentang Gaji
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="minSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gaji Minimum *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={100000}
                        placeholder="5000000"
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Gaji terendah (IDR)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gaji Maksimum *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={100000}
                        placeholder="8000000"
                        {...field}
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Gaji tertinggi (IDR)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mata Uang</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih mata uang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IDR">IDR - Rupiah</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Mata uang gaji</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-600 dark:text-blue-400">
                <p className="font-medium">Catatan:</p>
                <p>Gaji minimum harus lebih kecil atau sama dengan gaji maksimum.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Persyaratan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Persyaratan ${index + 1}`}
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                />
                {requirements.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeRequirement(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRequirement}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Persyaratan
            </Button>
          </CardContent>
        </Card>

        {/* Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tanggung Jawab
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {responsibilities.map((responsibility, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Tanggung jawab ${index + 1}`}
                  value={responsibility}
                  onChange={(e) => updateResponsibility(index, e.target.value)}
                />
                {responsibilities.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeResponsibility(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addResponsibility}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Tanggung Jawab
            </Button>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status Aktif</FormLabel>
                    <FormDescription>
                      Posisi aktif dapat digunakan untuk penempatan pegawai
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
            {isPending
              ? mode === 'edit'
                ? 'Menyimpan...'
                : 'Membuat...'
              : mode === 'edit'
              ? 'Simpan Perubahan'
              : 'Buat Posisi'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
