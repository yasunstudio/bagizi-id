/**
 * @fileoverview Individual Recipe Step API - Update/Delete specific step
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'
import { z } from 'zod'

// ================================ VALIDATION SCHEMAS ================================

const recipeStepUpdateSchema = z.object({
  stepNumber: z.number().int().positive().optional(),
  title: z.string().optional().nullable(),
  instruction: z.string().min(1).optional(),
  duration: z.number().int().positive().optional().nullable(),
  temperature: z.number().int().optional().nullable(),
  equipment: z.array(z.string()).optional(),
  qualityCheck: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  videoUrl: z.string().url().optional().nullable()
})

// ================================ PUT /api/sppg/menu/[id]/recipe/[stepId] ================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: menuId, stepId } = await params

      // Verify recipe step and menu belong to user's SPPG
      const recipeStep = await db.recipeStep.findFirst({
        where: {
          id: stepId,
          menuId,
          menu: {
            program: {
              sppgId: session.user.sppgId!
            }
          }
        }
      })

      if (!recipeStep) {
        return NextResponse.json({ 
          success: false, 
          error: 'Recipe step not found or access denied' 
        }, { status: 404 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = recipeStepUpdateSchema.parse(body)

      // If step number is being changed, check for conflicts
      if (validated.stepNumber && validated.stepNumber !== recipeStep.stepNumber) {
        const conflictingStep = await db.recipeStep.findFirst({
          where: {
            menuId,
            stepNumber: validated.stepNumber,
            id: { not: stepId }
          }
        })

        if (conflictingStep) {
          return NextResponse.json({ 
            success: false, 
            error: `Step number ${validated.stepNumber} already exists` 
          }, { status: 400 })
        }
      }

      // Update recipe step
      const updatedStep = await db.recipeStep.update({
        where: { id: stepId },
        data: validated
      })

      // Update menu's updatedAt timestamp
      await db.nutritionMenu.update({
        where: { id: menuId },
        data: { updatedAt: new Date() }
      })

      return NextResponse.json({
        success: true,
        data: updatedStep,
        message: 'Recipe step updated successfully'
      })

    } catch (error) {
      console.error('PUT /api/sppg/menu/[id]/recipe/[stepId] error:', error)
      
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
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ DELETE /api/sppg/menu/[id]/recipe/[stepId] ================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Use MENU_MANAGE instead of DELETE - Anyone who can manage menus should be able to delete recipe steps
      if (!hasPermission(session.user.userRole as UserRole, 'MENU_MANAGE')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: menuId, stepId } = await params

      // Verify recipe step and menu belong to user's SPPG
      const recipeStep = await db.recipeStep.findFirst({
        where: {
          id: stepId,
          menuId,
          menu: {
            program: {
              sppgId: session.user.sppgId!
            }
          }
        }
      })

      if (!recipeStep) {
        return NextResponse.json({ 
          success: false, 
          error: 'Recipe step not found or access denied' 
        }, { status: 404 })
      }

      // Delete recipe step
      await db.recipeStep.delete({
        where: { id: stepId }
      })

      // Update menu's updatedAt timestamp
      await db.nutritionMenu.update({
        where: { id: menuId },
        data: { updatedAt: new Date() }
      })

      return NextResponse.json({
        success: true,
        message: 'Recipe step deleted successfully'
      })

    } catch (error) {
      console.error('DELETE /api/sppg/menu/[id]/recipe/[stepId] error:', error)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to delete recipe step',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
