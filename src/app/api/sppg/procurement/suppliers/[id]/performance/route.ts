/**
 * @fileoverview Supplier Performance Analytics API endpoint
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 * 
 * RBAC Integration:
 * - GET: Protected by withSppgAuth
 * - Automatic audit logging
 * - Multi-tenant: Supplier ownership verified
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { db } from '@/lib/prisma'

// ================================ GET /api/sppg/suppliers/[id]/performance ================================

/**
 * @rbac Protected by withSppgAuth
 * @audit Automatic logging
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      const { id } = await params

      // Verify supplier exists and belongs to SPPG
      const supplier = await db.supplier.findFirst({
        where: {
          id,
          sppgId: session.user.sppgId!
        },
        include: {
          procurements: {
            select: {
              id: true,
              procurementCode: true,
              procurementDate: true,
              totalAmount: true,
              status: true,
              deliveryStatus: true,
              paymentStatus: true,
              items: {
                select: {
                  orderedQuantity: true,
                  receivedQuantity: true,
                  gradeReceived: true
                }
              }
            },
            orderBy: {
              procurementDate: 'desc'
            }
          },
          supplierEvaluations: {
            select: {
              id: true,
              evaluationType: true,
              evaluationPeriod: true,
              overallScore: true,
              qualityScore: true,
              deliveryScore: true,
              priceScore: true,
              serviceScore: true,
              evaluationDate: true,
              recommendations: true,
              strengths: true,
              weaknesses: true
            },
            orderBy: {
              evaluationDate: 'desc'
            }
          },
          supplierContracts: {
            select: {
              id: true,
              contractNumber: true,
              contractType: true,
              contractStatus: true,
              startDate: true,
              endDate: true,
              contractValue: true
            }
          }
        }
      })

    if (!supplier) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supplier not found or access denied' 
      }, { status: 404 })
    }

    // 4. Calculate comprehensive performance metrics
    
    // 4.1 Overall Performance Score (0-100)
    const overallPerformance = {
      score: Math.round(
        (supplier.overallRating / 5 * 30) +
        (supplier.qualityRating / 5 * 25) +
        (supplier.deliveryRating / 5 * 25) +
        (supplier.serviceRating / 5 * 20)
      ),
      rating: supplier.overallRating,
      qualityRating: supplier.qualityRating,
      deliveryRating: supplier.deliveryRating,
      serviceRating: supplier.serviceRating,
      totalEvaluations: supplier.supplierEvaluations.length
    }

    // 4.2 Procurement History Analysis
    const totalProcurements = supplier.procurements.length
    const completedProcurements = supplier.procurements.filter(p => p.status === 'COMPLETED' || p.status === 'FULLY_RECEIVED')
    const completionRate = totalProcurements > 0 ? (completedProcurements.length / totalProcurements) * 100 : 0
    
    // 4.3 Delivery Performance
    const onTimeDeliveries = supplier.procurements.filter(p => p.deliveryStatus === 'DELIVERED').length
    const lateDeliveries = supplier.procurements.filter(p => p.deliveryStatus === 'CANCELLED').length
    const deliveryPerformance = {
      onTimeRate: totalProcurements > 0 ? (onTimeDeliveries / totalProcurements) * 100 : 0,
      totalOnTime: onTimeDeliveries,
      totalLate: lateDeliveries,
      totalProcurements
    }

    // 4.4 Quality Performance
    let totalItems = 0
    let goodQualityItems = 0
    let rejectedItems = 0

    supplier.procurements.forEach(procurement => {
      procurement.items.forEach(item => {
        totalItems += item.orderedQuantity
        if (item.gradeReceived === 'GOOD' || item.gradeReceived === 'EXCELLENT') {
          goodQualityItems += (item.receivedQuantity || 0)
        }
        if (item.gradeReceived === 'REJECTED') {
          rejectedItems += (item.receivedQuantity || 0)
        }
      })
    })

    const qualityPerformance = {
      acceptanceRate: totalItems > 0 ? (goodQualityItems / totalItems) * 100 : 0,
      rejectionRate: totalItems > 0 ? (rejectedItems / totalItems) * 100 : 0,
      totalItemsReceived: totalItems,
      goodQualityItems,
      rejectedItems
    }

    // 4.5 Payment Performance
    const paidOnTime = supplier.procurements.filter(p => p.paymentStatus === 'PAID').length
    const paymentPerformance = {
      onTimePaymentRate: totalProcurements > 0 ? (paidOnTime / totalProcurements) * 100 : 0,
      totalPaid: paidOnTime,
      totalProcurements
    }

    // 4.6 Financial Metrics
    const totalSpend = supplier.totalPurchaseValue
    const averageOrderValue = totalProcurements > 0 ? totalSpend / totalProcurements : 0
    const last12MonthsSpend = supplier.procurements
      .filter(p => {
        const monthsAgo = new Date()
        monthsAgo.setMonth(monthsAgo.getMonth() - 12)
        return new Date(p.procurementDate) >= monthsAgo
      })
      .reduce((sum, p) => sum + p.totalAmount, 0)

    const financialMetrics = {
      totalSpend,
      averageOrderValue: Math.round(averageOrderValue),
      last12MonthsSpend: Math.round(last12MonthsSpend),
      totalOrders: totalProcurements
    }

    // 4.7 Contract Compliance
    const activeContracts = supplier.supplierContracts.filter(c => c.contractStatus === 'ACTIVE')
    const expiredContracts = supplier.supplierContracts.filter(c => c.contractStatus === 'EXPIRED')
    const contractMetrics = {
      totalContracts: supplier.supplierContracts.length,
      activeContracts: activeContracts.length,
      expiredContracts: expiredContracts.length,
      totalContractValue: supplier.supplierContracts.reduce((sum, c) => sum + (c.contractValue || 0), 0)
    }

    // 4.8 Evaluation History (Last 12 months)
    const recentEvaluations = supplier.supplierEvaluations.filter(e => {
      const monthsAgo = new Date()
      monthsAgo.setMonth(monthsAgo.getMonth() - 12)
      return new Date(e.evaluationDate) >= monthsAgo
    })

    const evaluationTrend = recentEvaluations.map(e => ({
      date: e.evaluationDate,
      overallScore: e.overallScore,
      qualityScore: e.qualityScore,
      deliveryScore: e.deliveryScore,
      priceScore: e.priceScore,
      serviceScore: e.serviceScore
    }))

    // 4.9 Performance Trend (last 3 evaluations)
    const last3Evaluations = supplier.supplierEvaluations.slice(0, 3)
    const performanceTrend = last3Evaluations.length >= 2
      ? {
          direction: last3Evaluations[0].overallScore > last3Evaluations[last3Evaluations.length - 1].overallScore 
            ? 'improving' 
            : last3Evaluations[0].overallScore < last3Evaluations[last3Evaluations.length - 1].overallScore
            ? 'declining'
            : 'stable',
          change: Math.round((last3Evaluations[0].overallScore - last3Evaluations[last3Evaluations.length - 1].overallScore) * 100) / 100
        }
      : {
          direction: 'insufficient_data',
          change: 0
        }

    // 4.10 Strengths and Weaknesses
    const latestEvaluation = supplier.supplierEvaluations[0]
    const insights = latestEvaluation ? {
      strengths: latestEvaluation.strengths || [],
      weaknesses: latestEvaluation.weaknesses || [],
      recommendations: latestEvaluation.recommendations || []
    } : {
      strengths: [],
      weaknesses: [],
      recommendations: []
    }

    // 4.11 Risk Assessment
    const riskScore = calculateRiskScore({
      isBlacklisted: supplier.isBlacklisted,
      deliveryPerformance: deliveryPerformance.onTimeRate,
      qualityPerformance: qualityPerformance.acceptanceRate,
      overallRating: supplier.overallRating,
      totalOrders: totalProcurements
    })

    // 5. Success response
    return NextResponse.json({
      success: true,
      data: {
        supplierId: supplier.id,
        supplierName: supplier.supplierName,
        supplierCode: supplier.supplierCode,
        
        // Overall Performance
        overallPerformance,
        
        // Detailed Metrics
        deliveryPerformance,
        qualityPerformance,
        paymentPerformance,
        financialMetrics,
        contractMetrics,
        
        // Trends and History
        evaluationTrend,
        performanceTrend,
        
        // Insights
        insights,
        
        // Risk Assessment
        riskAssessment: {
          riskLevel: riskScore >= 80 ? 'LOW' : riskScore >= 60 ? 'MEDIUM' : riskScore >= 40 ? 'HIGH' : 'CRITICAL',
          riskScore,
          isBlacklisted: supplier.isBlacklisted,
          blacklistReason: supplier.blacklistReason
        },
        
        // Summary Stats
        summary: {
          totalProcurements,
          completedProcurements: completedProcurements.length,
          completionRate: Math.round(completionRate),
          totalSpend,
          averageOrderValue: Math.round(averageOrderValue),
          lastOrderDate: supplier.procurements[0]?.procurementDate || null
        }
      }
    })

    } catch (error) {
      console.error('GET /api/sppg/suppliers/[id]/performance error:', error)
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch supplier performance',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}

// Helper function to calculate risk score
function calculateRiskScore(metrics: {
  isBlacklisted: boolean
  deliveryPerformance: number
  qualityPerformance: number
  overallRating: number
  totalOrders: number
}): number {
  // Start with 100 and deduct points for risk factors
  let score = 100

  // Blacklisted is critical risk
  if (metrics.isBlacklisted) {
    score -= 50
  }

  // Delivery performance impact (0-20 points)
  if (metrics.deliveryPerformance < 80) {
    score -= Math.round((80 - metrics.deliveryPerformance) / 4)
  }

  // Quality performance impact (0-20 points)
  if (metrics.qualityPerformance < 90) {
    score -= Math.round((90 - metrics.qualityPerformance) / 4)
  }

  // Overall rating impact (0-15 points)
  if (metrics.overallRating < 4) {
    score -= Math.round((4 - metrics.overallRating) * 7.5)
  }

  // Limited order history is a risk (0-10 points)
  if (metrics.totalOrders < 5) {
    score -= (5 - metrics.totalOrders) * 2
  }

  return Math.max(0, Math.min(100, score))
}
