/**
 * @fileoverview Individual Procurement Plan API endpoints - GET, PATCH, DELETE
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth, hasPermission } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'
import { 
  procurementPlanUpdateSchema
} from '@/features/sppg/procurement/plans/schemas'

// ================================ GET /api/sppg/procurement/plans/[id] ================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Permission Check - User must have read permission
      if (!hasPermission(session.user.userRole, 'user:read')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Insufficient permissions' 
        }, { status: 403 })
      }

      // Fetch procurement plan with multi-tenant check
      const plan = await db.procurementPlan.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId! // CRITICAL: Ensure plan belongs to user's SPPG
        },
        include: {
          sppg: {
            select: {
              id: true,
              name: true
            }
          },
          program: {
            select: {
              id: true,
              name: true,
              programCode: true
            }
          },
          // ✅ NEW: Include menu plan relation (for "From Menu" mode)
          menuPlan: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
              totalMenus: true,
              totalEstimatedCost: true,
              status: true,
              program: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          procurements: {
            include: {
              supplier: {
                select: {
                  id: true,
                  supplierCode: true,
                  supplierName: true
                }
              },
              items: {
                select: {
                  id: true,
                  itemName: true,
                  orderedQuantity: true,
                  unit: true,
                  finalPrice: true
                }
              }
            },
            orderBy: {
              procurementDate: 'desc'
            }
          },
          // ✅ NEW: Include productions relation (track usage)
          productions: {
            select: {
              id: true,
              productionCode: true,
              productionDate: true,
              status: true,
              targetPortions: true
            },
            orderBy: {
              productionDate: 'desc'
            }
          },
          // ✅ NEW: Include distributions relation (track delivery)
          distributions: {
            select: {
              id: true,
              distributionCode: true,
              distributionDate: true,
              status: true,
              totalRecipients: true
            },
            orderBy: {
              distributionDate: 'desc'
            }
          }
        }
      })

    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        error: 'Procurement plan not found or access denied' 
      }, { status: 404 })
    }

    // 4. Calculate statistics
    const totalProcurements = plan.procurements.length
    const completedProcurements = plan.procurements.filter(p => p.status === 'COMPLETED').length
    const pendingProcurements = plan.procurements.filter(p => 
      p.status === 'DRAFT' || p.status === 'PENDING_APPROVAL' || p.status === 'APPROVED'
    ).length
    const budgetUtilization = plan.totalBudget > 0 
      ? (plan.usedBudget / plan.totalBudget) * 100 
      : 0

    // Success response
    return NextResponse.json({
      success: true,
      data: {
        ...plan,
        totalProcurements,
        completedProcurements,
        pendingProcurements,
        budgetUtilization: Math.round(budgetUtilization * 100) / 100
      }
    })

    } catch (error) {
      console.error('GET /api/sppg/procurement/plans/[id] error:', error)
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch procurement plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ PATCH /api/sppg/procurement/plans/[id] ================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params
      
      // Permission Check - User must have procurement update permission
      if (!hasPermission(session.user.userRole, 'procurement:update')) {
        return NextResponse.json({
          success: false,
          error: 'Insufficient permissions'
        }, { status: 403 })
      }

      // Verify plan exists and belongs to SPPG
      const existingPlan = await db.procurementPlan.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!
        }
      })

      if (!existingPlan) {
        return NextResponse.json({ 
          success: false, 
          error: 'Procurement plan not found or access denied' 
        }, { status: 404 })
      }

      // Check if plan can be edited (not approved or completed)
      if (existingPlan.approvalStatus === 'APPROVED') {
        return NextResponse.json({ 
          success: false, 
          error: 'Cannot edit approved procurement plan. Request revision first.' 
        }, { status: 403 })
      }

      // Parse and validate request body
      const body = await request.json()
      const validated = procurementPlanUpdateSchema.parse(body)

      // Verify program belongs to SPPG if programId changed
      if (validated.programId && validated.programId !== existingPlan.programId) {
        const program = await db.nutritionProgram.findFirst({
          where: {
            id: validated.programId,
            sppgId: session.user.sppgId! as string
          }
        })

        if (!program) {
          return NextResponse.json({ 
            success: false, 
            error: 'Program not found or does not belong to your SPPG' 
          }, { status: 404 })
        }
      }

      // Calculate remaining budget if total budget changed
      let remainingBudget = existingPlan.remainingBudget
      if (validated.totalBudget !== undefined) {
        remainingBudget = validated.totalBudget - existingPlan.usedBudget
      }

      // Update procurement plan
      const updatedPlan = await db.procurementPlan.update({
        where: { id },
        data: {
          ...validated,
          remainingBudget,
          // ✅ Handle submission workflow
          ...(validated.approvalStatus === 'SUBMITTED' && {
            submittedAt: new Date(),
            submittedBy: session.user.id
          }),
          // ✅ Handle approval workflow
          ...(validated.approvalStatus === 'APPROVED' && {
            approvedAt: new Date(),
            approvedBy: session.user.id
          }),
          // ✅ Handle rejection (clear approval data)
          ...(validated.approvalStatus === 'REJECTED' && {
            approvedAt: null,
            approvedBy: null
          })
        },
        include: {
          sppg: {
            select: {
              id: true,
              name: true
            }
          },
          program: {
            select: {
              id: true,
              name: true,
              programCode: true
            }
          },
          // ✅ Include menuPlan in update response
          menuPlan: {
            select: {
              id: true,
              name: true,
              totalMenus: true,
              totalEstimatedCost: true
            }
          },
          procurements: {
            select: {
              id: true,
              status: true,
              totalAmount: true
            }
          }
        }
      })

      // Success response
      return NextResponse.json({
        success: true,
        data: updatedPlan,
        message: 'Procurement plan updated successfully'
      })

    } catch (error) {
      console.error('PATCH /api/sppg/procurement/plans/[id] error:', error)
      
      // Validation error
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json({ 
          success: false, 
          error: 'Validation failed',
          details: error 
        }, { status: 400 })
      }

      // Internal server error
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update procurement plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// ================================ DELETE /api/sppg/procurement/plans/[id] ================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params
      
      // Permission Check - User must have procurement delete permission
      if (!hasPermission(session.user.userRole, 'procurement:delete')) {
        return NextResponse.json({ 
          success: false,
          error: 'Insufficient permissions'
        }, { status: 403 })
      }

      // Verify plan exists and belongs to SPPG
      const plan = await db.procurementPlan.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!
        },
        include: {
          procurements: {
            select: {
              id: true,
              status: true
            }
          }
        }
      })

      if (!plan) {
        return NextResponse.json({ 
          success: false, 
          error: 'Procurement plan not found or access denied' 
        }, { status: 404 })
      }

      // Check if plan can be deleted (only draft status)
      if (plan.approvalStatus !== 'DRAFT') {
        return NextResponse.json({ 
          success: false, 
          error: 'Only draft plans can be deleted. Approved or submitted plans must be cancelled instead.' 
        }, { status: 403 })
      }

      // Check if there are any procurements linked to this plan
      const hasActiveProcurements = plan.procurements.some(
        p => p.status !== 'CANCELLED' && p.status !== 'DRAFT'
      )

      if (hasActiveProcurements) {
        return NextResponse.json({ 
          success: false, 
          error: 'Cannot delete plan with active procurements. Cancel procurements first.' 
        }, { status: 403 })
      }

      // Soft delete the plan (set status to CANCELLED)
      await db.procurementPlan.update({
        where: { id },
        data: {
          approvalStatus: 'CANCELLED'
        }
      })

      // Success response
      return NextResponse.json({
        success: true,
        message: 'Procurement plan deleted successfully'
      })

    } catch (error) {
      console.error('DELETE /api/sppg/procurement/plans/[id] error:', error)
      
      // Internal server error
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete procurement plan',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
