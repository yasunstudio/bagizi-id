/**
 * @fileoverview Distribution Cost API - Calculate Complete Distribution Costs
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * POST /api/sppg/procurement/distribution-cost
 * 
 * Calculates complete distribution costs with:
 * - Fetch linked FoodProduction with totalCost
 * - Calculate distribution costs (transport + fuel + packaging + labor + other)
 * - Aggregate: totalProductionCost + totalDistributionCost
 * - Calculate per-meal cost: totalCost / recipients
 * - Update FoodDistribution with complete cost breakdown
 * - Return cost breakdown with audit trail
 * 
 * Security:
 * - Protected by withSppgAuth wrapper
 * - Multi-tenant filtering by sppgId
 * - Ownership verification before operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { db } from '@/lib/prisma'
import { UserRole, DistributionStatus, MealType } from '@prisma/client'

// ============================================================================
// Request Validation Schema
// ============================================================================

const distributionCostSchema = z.object({
  programId: z.string().cuid('Invalid program ID'),
  productionId: z.string().cuid('Invalid production ID').optional(),
  procurementPlanId: z.string().cuid('Invalid procurement plan ID').optional(),
  distributionDate: z.string().datetime('Invalid date format'),
  distributionCode: z.string().min(3, 'Distribution code must be at least 3 characters'),
  mealType: z.nativeEnum(MealType),
  distributionPoint: z.string().min(3, 'Distribution point is required'),
  address: z.string().min(5, 'Address is required'),
  coordinates: z.string().optional(),
  plannedRecipients: z.number().int().positive('Planned recipients must be positive'),
  actualRecipients: z.number().int().positive('Actual recipients must be positive').optional(),
  plannedStartTime: z.string().datetime('Invalid start time format'),
  plannedEndTime: z.string().datetime('Invalid end time format'),
  distributorId: z.string().cuid('Invalid distributor ID'),
  driverId: z.string().cuid('Invalid driver ID').optional(),
  volunteers: z.array(z.string()).default([]),
  // Cost data
  transportCost: z.number().nonnegative('Transport cost must be non-negative').default(0),
  fuelCost: z.number().nonnegative('Fuel cost must be non-negative').default(0),
  packagingCost: z.number().nonnegative('Packaging cost must be non-negative').default(0),
  laborCost: z.number().nonnegative('Labor cost must be non-negative').default(0),
  otherCosts: z.number().nonnegative('Other costs must be non-negative').default(0),
  // Menu & portions
  menuItems: z.record(z.string(), z.unknown()), // JSON object for menu details
  totalPortions: z.number().int().positive('Total portions must be positive'),
  portionSize: z.number().positive('Portion size must be positive'),
  // Optional fields
  vehicleType: z.string().optional(),
  vehiclePlate: z.string().optional(),
  schoolId: z.string().cuid().optional(),
  notes: z.string().optional(),
})

// ============================================================================
// Response Types
// ============================================================================

interface DistributionCostBreakdown {
  // Production costs (from linked production)
  totalProductionCost: number
  productionCostPerMeal: number
  
  // Distribution costs
  transportCost: number
  fuelCost: number
  packagingCost: number
  laborCost: number
  otherCosts: number
  totalDistributionCost: number
  distributionCostPerMeal: number
  
  // Aggregated total
  grandTotalCost: number
  totalCostPerMeal: number
  
  // Recipients
  plannedRecipients: number
  actualRecipients: number
}

// ============================================================================
// POST Handler - Create Distribution with Complete Cost Tracking
// ============================================================================

/**
 * POST /api/sppg/procurement/distribution-cost
 * 
 * Creates a food distribution record with complete cost calculation
 * Aggregates costs from production and adds distribution overhead
 * Calculates per-meal cost for complete budget tracking
 * 
 * @param request - NextRequest with distribution details and costs
 * @returns Promise<NextResponse> - Distribution record with cost breakdown
 * @rbac Protected by withSppgAuth - requires DISTRIBUTION_MANAGE permission
 */
export async function POST(request: NextRequest) {
  return withSppgAuth(request, async (session) => {
    try {
      // 1. Permission check
      if (!hasPermission(session.user.userRole as UserRole, 'DISTRIBUTION_MANAGE')) {
        return NextResponse.json({ 
          success: false,
          error: 'Insufficient permissions',
          message: 'You do not have permission to manage distribution'
        }, { status: 403 })
      }

      const sppgId = session.user.sppgId!

      // 2. Verify SPPG is active
      const sppg = await db.sPPG.findUnique({
        where: { id: sppgId },
        select: { status: true }
      })

      if (!sppg || sppg.status !== 'ACTIVE') {
        return NextResponse.json(
          {
            success: false,
            error: 'SPPG is not active'
          },
          { status: 403 }
        )
      }

      // 3. Parse and validate request body
      const body = await request.json()
      const validated = distributionCostSchema.safeParse(body)

      if (!validated.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: validated.error.issues
          },
          { status: 400 }
        )
      }

      const data = validated.data

      // 4. Verify program ownership
      const program = await db.nutritionProgram.findFirst({
        where: {
          id: data.programId,
          sppgId
        }
      })

      if (!program) {
        return NextResponse.json(
          { success: false, error: 'Program not found or access denied' },
          { status: 404 }
        )
      }

      // 5. Check for duplicate distribution code
      const existingDistribution = await db.foodDistribution.findFirst({
        where: {
          distributionCode: data.distributionCode,
          sppgId
        }
      })

      if (existingDistribution) {
        return NextResponse.json(
          {
            success: false,
            error: 'Distribution code already exists',
            details: { existingDistributionId: existingDistribution.id }
          },
          { status: 409 }
        )
      }

      // 6. Fetch production costs if productionId is provided
      let totalProductionCost = 0
      let productionCostPerMeal = 0

      if (data.productionId) {
        const production = await db.foodProduction.findFirst({
          where: {
            id: data.productionId,
            sppgId
          },
          select: {
            id: true,
            totalCost: true,
            costPerMeal: true,
            actualPortions: true,
            plannedPortions: true
          }
        })

        if (!production) {
          return NextResponse.json(
            { success: false, error: 'Production not found or access denied' },
            { status: 404 }
          )
        }

        totalProductionCost = production.totalCost || 0
        productionCostPerMeal = production.costPerMeal || 0
      }

      // 7. Calculate distribution costs
      const totalDistributionCost = 
        data.transportCost + 
        data.fuelCost + 
        data.packagingCost + 
        data.laborCost + 
        data.otherCosts

      const recipients = data.actualRecipients || data.plannedRecipients
      const distributionCostPerMeal = recipients > 0 ? totalDistributionCost / recipients : 0

      // 8. Calculate grand total
      const grandTotalCost = totalProductionCost + totalDistributionCost
      const totalCostPerMeal = recipients > 0 ? grandTotalCost / recipients : 0

      // 9. Create distribution record
      const distribution = await db.foodDistribution.create({
        data: {
          sppgId,
          programId: data.programId,
          productionId: data.productionId,
          procurementPlanId: data.procurementPlanId,
          distributionDate: new Date(data.distributionDate),
          distributionCode: data.distributionCode,
          mealType: data.mealType,
          distributionPoint: data.distributionPoint,
          address: data.address,
          coordinates: data.coordinates,
          plannedRecipients: data.plannedRecipients,
          actualRecipients: data.actualRecipients,
          plannedStartTime: new Date(data.plannedStartTime),
          plannedEndTime: new Date(data.plannedEndTime),
          distributorId: data.distributorId,
          driverId: data.driverId,
          volunteers: data.volunteers,
          vehicleType: data.vehicleType,
          vehiclePlate: data.vehiclePlate,
          menuItems: JSON.parse(JSON.stringify(data.menuItems)),
          totalPortions: data.totalPortions,
          portionSize: data.portionSize,
          schoolId: data.schoolId,
          notes: data.notes,
          // Cost tracking
          transportCost: data.transportCost,
          fuelCost: data.fuelCost,
          packagingCost: data.packagingCost,
          laborCost: data.laborCost,
          otherCosts: data.otherCosts,
          totalProductionCost,
          totalDistributionCost,
          totalCostPerMeal,
          // Status
          status: data.actualRecipients ? DistributionStatus.COMPLETED : DistributionStatus.SCHEDULED,
        }
      })

      // 10. Prepare cost breakdown
      const costBreakdown: DistributionCostBreakdown = {
        // Production costs
        totalProductionCost,
        productionCostPerMeal,
        
        // Distribution costs
        transportCost: data.transportCost,
        fuelCost: data.fuelCost,
        packagingCost: data.packagingCost,
        laborCost: data.laborCost,
        otherCosts: data.otherCosts,
        totalDistributionCost,
        distributionCostPerMeal,
        
        // Aggregated
        grandTotalCost,
        totalCostPerMeal,
        
        // Recipients
        plannedRecipients: data.plannedRecipients,
        actualRecipients: data.actualRecipients || 0,
      }

      // 11. Return success response
      return NextResponse.json(
        {
          success: true,
          data: {
            distribution: {
              id: distribution.id,
              distributionCode: distribution.distributionCode,
              programId: distribution.programId,
              productionId: distribution.productionId,
              distributionDate: distribution.distributionDate.toISOString(),
              distributionPoint: distribution.distributionPoint,
              mealType: distribution.mealType,
              plannedRecipients: distribution.plannedRecipients,
              actualRecipients: distribution.actualRecipients,
              status: distribution.status,
              createdAt: distribution.createdAt.toISOString(),
            },
            costBreakdown,
            summary: {
              totalBeneficiaries: recipients,
              totalPortions: data.totalPortions,
              costEfficiency: totalCostPerMeal > 0 ? `Rp ${totalCostPerMeal.toFixed(2)} per meal` : 'N/A',
            }
          }
        },
        { status: 201 }
      )

    } catch (error) {
      console.error('[Distribution Cost] Error:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'N/A',
      })
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create distribution record',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
        },
        { status: 500 }
      )
    }
  })
}
