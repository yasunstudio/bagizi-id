/**
 * @fileoverview Recipe Step Detail API - Update and Delete operations
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { hasPermission } from '@/lib/permissions'
import { z } from 'zod'

// ================================ VALIDATION SCHEMAS ================================

const recipeStepUpdateSchema = z.object({
  stepNumber: z.number()
    .int('Step number harus bilangan bulat')
    .min(1, 'Step number minimal 1')
    .optional(),
  
  title: z.string()
    .max(100, 'Judul maksimal 100 karakter')
    .optional()
    .nullable(),
  
  instruction: z.string()
    .min(10, 'Instruksi minimal 10 karakter')
    .max(1000, 'Instruksi maksimal 1000 karakter')
    .optional(),
  
  duration: z.number()
    .int('Durasi harus bilangan bulat')
    .min(1, 'Durasi minimal 1 menit')
    .max(480, 'Durasi maksimal 8 jam')
    .optional()
    .nullable(),
  
  temperature: z.number()
    .min(0, 'Temperatur tidak boleh negatif')
    .max(300, 'Temperatur maksimal 300°C')
    .optional()
    .nullable(),
  
  equipment: z.array(z.string())
    .max(20, 'Maksimal 20 alat')
    .optional(),
  
  qualityCheck: z.string()
    .max(500, 'Quality check maksimal 500 karakter')
    .optional()
    .nullable(),
  
  imageUrl: z.string()
    .url('Image URL tidak valid')
    .optional()
    .nullable(),
  
  videoUrl: z.string()
    .url('Video URL tidak valid')
    .optional()
    .nullable(),
})

// ================================ PUT /api/sppg/menu/[id]/recipe-steps/[stepId] ================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions'
        }, { status: 403 })
      }

      // Get params
      const { id: menuId, stepId } = await params

      // Verify step exists and menu belongs to user's SPPG
      const existingStep = await db.recipeStep.findFirst({
        where: {
          id: stepId,
          menuId,
          menu: {
            program: {
              sppgId: session.user.sppgId! // Multi-tenant security
            }
          }
        },
        include: {
          menu: {
            select: { id: true, menuName: true }
          }
        }
      })

      if (!existingStep) {
        return NextResponse.json({
          success: false,
          error: 'Recipe step not found or access denied'
        }, { status: 404 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = recipeStepUpdateSchema.parse(body)

      // If changing step number, check for conflicts
      if (validated.stepNumber && validated.stepNumber !== existingStep.stepNumber) {
        const conflictingStep = await db.recipeStep.findUnique({
          where: {
            menuId_stepNumber: {
              menuId,
              stepNumber: validated.stepNumber
            }
          }
        })

        if (conflictingStep) {
          return NextResponse.json({
            success: false,
            error: 'Step number already exists for this menu',
            details: { field: 'stepNumber', code: 'DUPLICATE_STEP_NUMBER' }
          }, { status: 409 })
        }
      }

      // Update recipe step
      const updatedStep = await db.recipeStep.update({
        where: { id: stepId },
        data: {
          stepNumber: validated.stepNumber,
          title: validated.title,
          instruction: validated.instruction,
          duration: validated.duration,
          temperature: validated.temperature,
          equipment: validated.equipment,
          qualityCheck: validated.qualityCheck,
          imageUrl: validated.imageUrl,
          videoUrl: validated.videoUrl,
        }
      })

      // Log activity
      console.log(`Recipe step updated: ${stepId} for menu ${menuId} by user ${session.user.id}`)

      return NextResponse.json({
        success: true,
        data: updatedStep,
        message: 'Recipe step updated successfully'
      })

    } catch (error) {
      console.error('PUT /api/sppg/menu/[menuId]/recipe-steps/[stepId] error:', error)

      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: error.issues
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to update recipe step',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}

// ================================ DELETE /api/sppg/menu/[id]/recipe-steps/[stepId] ================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions'
        }, { status: 403 })
      }

      // Get params
      const { id: menuId, stepId } = await params

      // Verify step exists and menu belongs to user's SPPG
      const existingStep = await db.recipeStep.findFirst({
        where: {
          id: stepId,
          menuId,
          menu: {
            program: {
              sppgId: session.user.sppgId! // Multi-tenant security
            }
          }
        }
      })

      if (!existingStep) {
        return NextResponse.json({
          success: false,
          error: 'Recipe step not found or access denied'
        }, { status: 404 })
      }

      // Delete recipe step
      await db.recipeStep.delete({
        where: { id: stepId }
      })

      // Log activity
      console.log(`Recipe step deleted: ${stepId} from menu ${menuId} by user ${session.user.id}`)

      return NextResponse.json({
        success: true,
        message: 'Recipe step deleted successfully'
      })

    } catch (error) {
      console.error('DELETE /api/sppg/menu/[menuId]/recipe-steps/[stepId] error:', error)

      return NextResponse.json({
        success: false,
        error: 'Failed to delete recipe step',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
