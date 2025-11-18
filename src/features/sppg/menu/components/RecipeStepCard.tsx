/**
 * @fileoverview RecipeStepCard - Display individual recipe step
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import React from 'react'
import Image from 'next/image'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  GripVertical,
  Clock,
  Thermometer,
  Wrench,
  Image as ImageIcon,
  Video,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDeleteRecipeStep } from '../hooks/useRecipeSteps'
import type { RecipeStep } from '../api/recipeStepsApi'

// ================================ TYPES ================================

interface RecipeStepCardProps {
  step: RecipeStep
  menuId: string
  isEditable?: boolean
  onEdit?: (step: RecipeStep) => void
  className?: string
}

// ================================ MAIN COMPONENT ================================

export function RecipeStepCard({
  step,
  menuId,
  isEditable = true,
  onEdit,
  className
}: RecipeStepCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  
  const { mutate: deleteStep, isPending: isDeleting } = useDeleteRecipeStep()

  // Sortable hook for drag and drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id, disabled: !isEditable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Handle delete
  const handleDelete = () => {
    deleteStep(
      { menuId, stepId: step.id },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false)
        }
      }
    )
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          'transition-all',
          isDragging && 'opacity-50 shadow-lg',
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Drag Handle */}
            {isEditable && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing pt-1"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              </div>
            )}

            {/* Step Number */}
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {step.stepNumber}
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 space-y-3">
              {/* Title */}
              {step.title && (
                <h4 className="font-semibold text-lg leading-tight">
                  {step.title}
                </h4>
              )}

              {/* Instruction */}
              <p className="text-sm text-foreground/90 leading-relaxed">
                {step.instruction}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3">
                {step.duration && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{step.duration} menit</span>
                  </div>
                )}

                {step.temperature && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Thermometer className="h-4 w-4" />
                    <span>{step.temperature}°C</span>
                  </div>
                )}

                {step.equipment && step.equipment.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Wrench className="h-4 w-4" />
                    <span>{step.equipment.length} alat</span>
                  </div>
                )}

                {step.imageUrl && (
                  <Badge variant="outline" className="gap-1">
                    <ImageIcon className="h-3 w-3" />
                    Gambar
                  </Badge>
                )}

                {step.videoUrl && (
                  <Badge variant="outline" className="gap-1">
                    <Video className="h-3 w-3" />
                    Video
                  </Badge>
                )}

                {step.qualityCheck && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    QC
                  </Badge>
                )}
              </div>

              {/* Equipment List */}
              {step.equipment && step.equipment.length > 0 && (
                <div className="pt-2">
                  <Separator className="mb-3" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Alat yang Dibutuhkan
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.equipment.map((item, index) => (
                        <Badge key={index} variant="outline" className="font-normal">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quality Check */}
              {step.qualityCheck && (
                <div className="pt-2">
                  <Separator className="mb-3" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle className="h-3 w-3" />
                      Quality Check
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {step.qualityCheck}
                    </p>
                  </div>
                </div>
              )}

              {/* Media Preview */}
              {(step.imageUrl || step.videoUrl) && (
                <div className="pt-2">
                  <Separator className="mb-3" />
                  <div className="grid grid-cols-2 gap-3">
                    {step.imageUrl && (
                      <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                        <Image
                          src={step.imageUrl}
                          alt={step.title || `Step ${step.stepNumber}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    {step.videoUrl && (
                      <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                        <video
                          src={step.videoUrl}
                          controls
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Menu */}
            {isEditable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEdit?.(step)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Langkah
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Langkah
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Langkah Resep?</AlertDialogTitle>
            <AlertDialogDescription>
              Langkah {step.stepNumber}
              {step.title && `: ${step.title}`} akan dihapus secara permanen.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
