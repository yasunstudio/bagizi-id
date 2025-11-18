/**
 * @fileoverview RecipeStepsManager - Main component for managing recipe steps
 * @version Next.js 15.5.4 / shadcn/ui / dnd-kit
 * @author Bagizi-ID Development Team
 * @see {@link /docs/MENU_MODULE_COMPLETE_AUDIT.md} Menu Module Implementation
 */

'use client'

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Plus,
  GripVertical,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRecipeSteps, useReorderRecipeSteps } from '../hooks/useRecipeSteps'
import { RecipeStepCard } from './RecipeStepCard'
import { RecipeStepForm } from './RecipeStepForm'
import type { RecipeStep } from '../api/recipeStepsApi'

// ================================ TYPES ================================

interface RecipeStepsManagerProps {
  menuId: string
  menuName?: string
  isEditable?: boolean
  className?: string
}

// ================================ MAIN COMPONENT ================================

export function RecipeStepsManager({
  menuId,
  menuName,
  isEditable = true,
  className
}: RecipeStepsManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStep, setEditingStep] = useState<RecipeStep | null>(null)

  // Fetch recipe steps
  const { data: steps, isLoading, error } = useRecipeSteps(menuId)
  const { mutate: reorderSteps, isPending: isReordering } = useReorderRecipeSteps()

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id || !steps) {
      return
    }

    const oldIndex = steps.findIndex((step) => step.id === active.id)
    const newIndex = steps.findIndex((step) => step.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Reorder array
    const reorderedSteps = arrayMove(steps, oldIndex, newIndex)

    // Create step orders with new step numbers
    const stepOrders = reorderedSteps.map((step, index) => ({
      stepId: step.id,
      newStepNumber: index + 1,
    }))

    // Execute reorder mutation
    reorderSteps({ menuId, stepOrders })
  }

  // Handle form actions
  const handleAddStep = () => {
    setEditingStep(null)
    setIsFormOpen(true)
  }

  const handleEditStep = (step: RecipeStep) => {
    setEditingStep(step)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingStep(null)
  }

  // Calculate total duration
  const totalDuration = steps?.reduce((sum, step) => sum + (step.duration || 0), 0) || 0

  // ================================ RENDER LOADING ================================

  if (isLoading) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  // ================================ RENDER ERROR ================================

  if (error) {
    return (
      <Card className={cn('border-destructive', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Gagal Memuat Langkah Resep
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(error as Error).message || 'Terjadi kesalahan saat memuat langkah resep'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // ================================ RENDER EMPTY STATE ================================

  if (!steps || steps.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Langkah-Langkah Resep</span>
            {isEditable && (
              <Button onClick={handleAddStep} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Langkah
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {menuName && `Langkah memasak untuk ${menuName}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <GripVertical className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Belum Ada Langkah Resep
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Tambahkan langkah-langkah memasak untuk menu ini. Anda dapat mengatur
              ulang urutan dengan drag & drop.
            </p>
            {isEditable && (
              <Button onClick={handleAddStep}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Langkah Pertama
              </Button>
            )}
          </div>
        </CardContent>

        {/* Form Dialog */}
        {isFormOpen && (
          <RecipeStepForm
            menuId={menuId}
            step={editingStep}
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSuccess={handleFormClose}
          />
        )}
      </Card>
    )
  }

  // ================================ RENDER MAIN CONTENT ================================

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              Langkah-Langkah Resep
              <Badge variant="secondary">
                {steps.length} langkah
              </Badge>
            </CardTitle>
            <CardDescription>
              {menuName && `Langkah memasak untuk ${menuName}`}
            </CardDescription>
          </div>
          {isEditable && (
            <Button onClick={handleAddStep} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Langkah
            </Button>
          )}
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Total waktu: {totalDuration} menit</span>
          </div>
          {steps.every(step => step.instruction) && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Semua langkah lengkap</span>
            </div>
          )}
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6">
        {isReordering && (
          <Alert className="mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Mengatur ulang urutan langkah...
            </AlertDescription>
          </Alert>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map(step => step.id)}
            strategy={verticalListSortingStrategy}
            disabled={!isEditable || isReordering}
          >
            <div className="space-y-4">
              {steps.map((step) => (
                <RecipeStepCard
                  key={step.id}
                  step={step}
                  menuId={menuId}
                  isEditable={isEditable}
                  onEdit={handleEditStep}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>

      {/* Form Dialog */}
      {isFormOpen && (
        <RecipeStepForm
          menuId={menuId}
          step={editingStep}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={handleFormClose}
        />
      )}
    </Card>
  )
}
