/**
 * @fileoverview RecipeStepForm - Enterprise-grade form for recipe step management
 * @version Next.js 15.5.4 / React Hook Form / shadcn/ui / zod
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X, Plus, Loader2, Clock, Wrench, ChefHat, CheckCircle, Info } from 'lucide-react'
import { useCreateRecipeStep, useUpdateRecipeStep } from '../hooks/useRecipeSteps'
import type { RecipeStep } from '../api/recipeStepsApi'
import { toast } from 'sonner'

// ================================ VALIDATION SCHEMA ================================

/**
 * Recipe Step Form Schema - Enterprise-grade validation
 * Matches Prisma RecipeStep model exactly with proper type inference
 */
const recipeStepFormSchema = z.object({
  // Required fields
  stepNumber: z.number().int().min(1, 'Step number minimal 1'),
  instruction: z.string().min(10, 'Instruksi minimal 10 karakter').max(1000, 'Instruksi maksimal 1000 karakter'),
  
  // Optional string fields
  title: z.string().max(100, 'Judul maksimal 100 karakter').optional(),
  qualityCheck: z.string().max(500, 'Quality check maksimal 500 karakter').optional(),
  imageUrl: z.string().url('Image URL tidak valid').optional(),
  videoUrl: z.string().url('Video URL tidak valid').optional(),
  
  // Optional number fields
  duration: z.number().int('Durasi harus bilangan bulat').min(1, 'Durasi minimal 1 menit').max(480, 'Durasi maksimal 8 jam').optional(),
  temperature: z.number().min(0, 'Temperatur tidak boleh negatif').max(300, 'Temperatur maksimal 300°C').optional(),
  
  // Array field
  equipment: z.array(z.string()).optional(),
})

type RecipeStepFormData = z.infer<typeof recipeStepFormSchema>

// ================================ TYPES ================================

interface RecipeStepFormProps {
  menuId: string
  step?: RecipeStep | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// ================================ HELPER FUNCTIONS ================================

/**
 * Convert form data to API payload
 * Handles optional fields properly: undefined → null for database
 */
function formDataToPayload(data: RecipeStepFormData) {
  return {
    stepNumber: data.stepNumber,
    instruction: data.instruction,
    title: data.title?.trim() || null,
    qualityCheck: data.qualityCheck?.trim() || null,
    imageUrl: data.imageUrl?.trim() || null,
    videoUrl: data.videoUrl?.trim() || null,
    duration: data.duration ?? null,
    temperature: data.temperature ?? null,
    equipment: data.equipment?.filter(e => e.trim().length > 0) ?? [],
  }
}

// ================================ MAIN COMPONENT ================================

export function RecipeStepForm({
  menuId,
  step,
  open,
  onOpenChange,
  onSuccess
}: RecipeStepFormProps) {
  const isEditing = !!step
  const [newEquipment, setNewEquipment] = React.useState('')

  const { mutate: createStep, isPending: isCreating } = useCreateRecipeStep()
  const { mutate: updateStep, isPending: isUpdating } = useUpdateRecipeStep()
  const isPending = isCreating || isUpdating

  // ================================ FORM STATE ================================
  
  const form = useForm<RecipeStepFormData>({
    resolver: zodResolver(recipeStepFormSchema),
    defaultValues: {
      stepNumber: step?.stepNumber ?? 1,
      instruction: step?.instruction ?? '',
      title: step?.title ?? undefined,
      duration: step?.duration ?? undefined,
      temperature: step?.temperature ?? undefined,
      equipment: step?.equipment ?? [],
      qualityCheck: step?.qualityCheck ?? undefined,
      imageUrl: step?.imageUrl ?? undefined,
      videoUrl: step?.videoUrl ?? undefined,
    }
  })

  // Handle form submit
  const onSubmit = (data: RecipeStepFormData) => {
    const payload = formDataToPayload(data)
    
    if (isEditing) {
      updateStep(
        { menuId, stepId: step.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Langkah resep berhasil diperbarui')
            onSuccess?.()
            onOpenChange(false)
          },
          onError: (error) => {
            toast.error(error.message || 'Gagal memperbarui langkah resep')
          }
        }
      )
    } else {
      createStep(
        { menuId, data: payload },
        {
          onSuccess: () => {
            toast.success('Langkah resep berhasil ditambahkan')
            form.reset()
            onSuccess?.()
            onOpenChange(false)
          },
          onError: (error) => {
            toast.error(error.message || 'Gagal menambahkan langkah resep')
          }
        }
      )
    }
  }

  // ================================ EQUIPMENT MANAGEMENT ================================
  
  /**
   * Add new equipment to the list
   */
  const handleAddEquipment = () => {
    const trimmed = newEquipment.trim()
    if (trimmed) {
      const currentEquipment = form.getValues('equipment') ?? []
      if (!currentEquipment.includes(trimmed)) {
        form.setValue('equipment', [...currentEquipment, trimmed])
        setNewEquipment('')
      } else {
        toast.info('Alat sudah ada dalam daftar')
      }
    }
  }

  /**
   * Remove equipment from the list
   */
  const handleRemoveEquipment = (index: number) => {
    const currentEquipment = form.getValues('equipment') ?? []
    form.setValue('equipment', currentEquipment.filter((_, i) => i !== index))
  }

  /**
   * Handle Enter key in equipment input
   */
  const handleEquipmentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddEquipment()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            {isEditing ? 'Edit Langkah Resep' : 'Tambah Langkah Resep'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Perbarui informasi langkah resep memasak'
              : 'Tambahkan langkah baru dalam proses memasak menu ini'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="stepNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Langkah *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Judul Langkah (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Tumis bumbu dasar"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Judul singkat untuk langkah ini
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Instruction */}
            <FormField
              control={form.control}
              name="instruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruksi *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan langkah ini secara detail untuk staf dapur..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex justify-between text-xs">
                    <span>Minimal 10 karakter, maksimal 1000 karakter</span>
                    <span className="text-muted-foreground">
                      {field.value.length}/1000
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-6" />

            {/* Duration & Temperature */}
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Waktu & Temperatur
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durasi (menit)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="480"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Kosongkan jika tidak ada durasi spesifik
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperatur (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="300"
                          step="0.1"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Temperatur pemasakan jika diperlukan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Equipment */}
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    Alat yang Dibutuhkan
                  </FormLabel>
                  <div className="space-y-3">
                    {/* Equipment List */}
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-md">
                        {field.value.map((item, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="gap-1.5 pr-1 pl-3"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => handleRemoveEquipment(index)}
                              className="ml-1 hover:bg-destructive/20 rounded-sm p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Hapus {item}</span>
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Add Equipment Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nama alat (contoh: Wajan, Spatula, Kompor)..."
                        value={newEquipment}
                        onChange={(e) => setNewEquipment(e.target.value)}
                        onKeyDown={handleEquipmentKeyDown}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddEquipment}
                        disabled={!newEquipment.trim()}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Tambah alat</span>
                      </Button>
                    </div>
                  </div>
                  <FormDescription className="text-xs">
                    Tekan Enter atau klik tombol + untuk menambah alat
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-6" />

            {/* Quality Check */}
            <FormField
              control={form.control}
              name="qualityCheck"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    Quality Check (Opsional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Kriteria yang harus dicek untuk memastikan langkah ini berhasil...&#10;Contoh: Bumbu sudah harum, warna berubah kecokelatan"
                      className="min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Standar kualitas yang harus dipenuhi pada langkah ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-6" />

            {/* Media URLs */}
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                Media Pendukung (Opsional)
              </h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Gambar</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Link gambar untuk visualisasi langkah ini
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Video</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/video.mp4"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Link video tutorial untuk langkah ini
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Perbarui Langkah' : 'Tambah Langkah'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
