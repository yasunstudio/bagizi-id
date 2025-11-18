/**
 * @fileoverview Recipe Steps API Endpoints - CRUD operations for menu recipe steps
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/MENU_MODULE_COMPLETE_AUDIT.md} Menu Module Implementation
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { hasPermission } from '@/lib/permissions'
import { z } from 'zod'

// ================================ VALIDATION SCHEMAS ================================

const recipeStepCreateSchema = z.object({
  stepNumber: z.number()
    .int('Step number harus bilangan bulat')
    .min(1, 'Step number minimal 1'),
  
  title: z.string()
    .max(100, 'Judul maksimal 100 karakter')
    .optional()
    .nullable(),
  
  instruction: z.string()
    .min(10, 'Instruksi minimal 10 karakter')
    .max(1000, 'Instruksi maksimal 1000 karakter'),
  
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
    .default([]),
  
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

// ================================ GET /api/sppg/menu/[id]/recipe-steps ================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions'
        }, { status: 403 })
      }

      // Get menuId from params
      const { id: menuId } = await params

      // Verify menu exists and belongs to user's SPPG
      const menu = await db.nutritionMenu.findFirst({
        where: {
          id: menuId,
          program: {
            sppgId: session.user.sppgId! // Multi-tenant security
          }
        },
        select: { id: true }
      })

      if (!menu) {
        return NextResponse.json({
          success: false,
          error: 'Menu not found or access denied'
        }, { status: 404 })
      }

      // Fetch recipe steps ordered by step number
      const steps = await db.recipeStep.findMany({
        where: { menuId },
        orderBy: { stepNumber: 'asc' }
      })

      return NextResponse.json({
        success: true,
        data: steps,
        meta: {
          total: steps.length,
          menuId
        }
      })

    } catch (error) {
      console.error('GET /api/sppg/menu/[menuId]/recipe-steps error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch recipe steps',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}

// ================================ POST /api/sppg/menu/[id]/recipe-steps ================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      // Permission Check
      if (!session.user.userRole || !hasPermission(session.user.userRole as UserRole, 'WRITE')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions for recipe step management'
        }, { status: 403 })
      }

      // Get menuId from params
      const { id: menuId } = await params

      // Verify menu exists and belongs to user's SPPG
      const menu = await db.nutritionMenu.findFirst({
        where: {
          id: menuId,
          program: {
            sppgId: session.user.sppgId! // Multi-tenant security
          }
        },
        select: { id: true, menuName: true }
      })

      if (!menu) {
        return NextResponse.json({
          success: false,
          error: 'Menu not found or access denied'
        }, { status: 404 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = recipeStepCreateSchema.parse(body)

      // Check for duplicate step number
      const existingStep = await db.recipeStep.findUnique({
        where: {
          menuId_stepNumber: {
            menuId,
            stepNumber: validated.stepNumber
          }
        }
      })

      if (existingStep) {
        return NextResponse.json({
          success: false,
          error: 'Step number already exists for this menu',
          details: { field: 'stepNumber', code: 'DUPLICATE_STEP_NUMBER' }
        }, { status: 409 })
      }

      // Create recipe step
      const step = await db.recipeStep.create({
        data: {
          menuId,
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
      console.log(`Recipe step created: ${step.id} for menu ${menuId} by user ${session.user.id}`)

      return NextResponse.json({
        success: true,
        data: step,
        message: 'Recipe step created successfully'
      }, { status: 201 })

    } catch (error) {
      console.error('POST /api/sppg/menu/[menuId]/recipe-steps error:', error)

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
        error: 'Failed to create recipe step',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      }, { status: 500 })
    }
  })
}
