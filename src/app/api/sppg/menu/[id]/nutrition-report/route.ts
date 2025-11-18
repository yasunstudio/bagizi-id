/**
 * @fileoverview Nutrition Report API - Get detailed nutrition analysis
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade
 */

import { NextRequest, NextResponse } from 'next/server'
import { withSppgAuth } from '@/lib/api-middleware'
import { hasPermission } from '@/lib/permissions'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/prisma'

// Helper types
interface NutritionCalcData {
  adequateNutrients?: string[]
  deficientNutrients?: string[]
  excessNutrients?: string[]
}

// Helper function to calculate compliance score
function calculateComplianceScore(nutritionCalc: NutritionCalcData): number {
  // Calculate based on how many nutrients meet AKG vs deficient/excessive
  const adequate = nutritionCalc.adequateNutrients?.length || 0
  const deficient = nutritionCalc.deficientNutrients?.length || 0
  const excessive = nutritionCalc.excessNutrients?.length || 0
  
  const total = adequate + deficient + excessive
  if (total === 0) return 0
  
  // Score: (adequate - excessive) / total * 100
  // Deficient is neutral (not penalized as much as excessive)
  const score = ((adequate - (excessive * 0.5)) / total) * 100
  return Math.max(0, Math.min(100, score)) // Clamp between 0-100
}

// ================================ GET /api/sppg/menu/[id]/nutrition-report ================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withSppgAuth(request, async (session) => {
    try {
      if (!hasPermission(session.user.userRole as UserRole, 'READ')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
      }

      const { id: menuId } = await params

      // Verify menu belongs to user's SPPG and get nutrition data
      const menu = await db.nutritionMenu.findFirst({
        where: {
          id: menuId,
          program: {
            sppgId: session.user.sppgId!
          }
        },
        include: {
          program: {
            select: {
              id: true,
              name: true,
            }
          },
          nutritionCalc: true,
          ingredients: {
            include: {
              inventoryItem: {
                select: {
                  id: true,
                  itemName: true,
                  unit: true,
                  category: true,
                  calories: true,
                  protein: true,
                  carbohydrates: true,
                  fat: true,
                  fiber: true
                }
              }
            }
          }
        }
      })

      if (!menu) {
        return NextResponse.json({ 
          success: false, 
          error: 'Menu not found or access denied' 
        }, { status: 404 })
      }

    if (!menu.nutritionCalc) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nutrisi belum dihitung. Silakan hitung nutrisi terlebih dahulu.' 
      }, { status: 404 })
    }

    // 4. Build comprehensive nutrition report matching NutritionReport type
    const report = {
      menuId: menu.id,
      menuName: menu.menuName,
      servingSize: menu.servingSize,
      servingsPerRecipe: 1, // Default to 1
      
      // Nutrition data (flat structure for easy access)
      nutrition: {
        calories: menu.nutritionCalc.totalCalories || 0,
        protein: menu.nutritionCalc.totalProtein || 0,
        carbohydrates: menu.nutritionCalc.totalCarbs || 0,
        fat: menu.nutritionCalc.totalFat || 0,
        fiber: menu.nutritionCalc.totalFiber || 0,
        vitaminA: menu.nutritionCalc.totalVitaminA || 0,
        vitaminC: menu.nutritionCalc.totalVitaminC || 0,
        vitaminD: menu.nutritionCalc.totalVitaminD || 0,
        vitaminE: menu.nutritionCalc.totalVitaminE || 0,
        vitaminK: menu.nutritionCalc.totalVitaminK || 0,
        vitaminB1: menu.nutritionCalc.totalVitaminB1 || 0,
        vitaminB2: menu.nutritionCalc.totalVitaminB2 || 0,
        vitaminB3: menu.nutritionCalc.totalVitaminB3 || 0,
        vitaminB6: menu.nutritionCalc.totalVitaminB6 || 0,
        vitaminB12: menu.nutritionCalc.totalVitaminB12 || 0,
        folate: menu.nutritionCalc.totalFolate || 0,
        calcium: menu.nutritionCalc.totalCalcium || 0,
        iron: menu.nutritionCalc.totalIron || 0,
        magnesium: menu.nutritionCalc.totalMagnesium || 0,
        phosphorus: menu.nutritionCalc.totalPhosphorus || 0,
        potassium: menu.nutritionCalc.totalPotassium || 0,
        sodium: menu.nutritionCalc.totalSodium || 0,
        zinc: menu.nutritionCalc.totalZinc || 0,
        copper: 0, // Not available in schema
        manganese: 0, // Not available in schema
        selenium: menu.nutritionCalc.totalSelenium || 0
      },
      
      // Daily value percentages
      dailyValuePercentages: {
        calories: menu.nutritionCalc.caloriesDV || 0,
        protein: menu.nutritionCalc.proteinDV || 0,
        carbohydrates: menu.nutritionCalc.carbsDV || 0,
        fat: menu.nutritionCalc.fatDV || 0,
        fiber: menu.nutritionCalc.fiberDV || 0,
        // Vitamins and minerals DV not in schema - calculate or default to 0
        vitaminA: 0,
        vitaminC: 0,
        vitaminD: 0,
        vitaminE: 0,
        vitaminK: 0,
        vitaminB1: 0,
        vitaminB2: 0,
        vitaminB3: 0,
        vitaminB6: 0,
        vitaminB12: 0,
        folate: 0,
        calcium: 0,
        iron: 0,
        magnesium: 0,
        phosphorus: 0,
        potassium: 0,
        sodium: 0,
        zinc: 0,
        copper: 0,
        manganese: 0,
        selenium: 0
      },
      
      // Compliance
      akgCompliant: menu.nutritionCalc.meetsAKG || false,
      complianceScore: calculateComplianceScore(menu.nutritionCalc),
      
      // Ingredients breakdown - calculate actual contribution based on quantity
      ingredients: menu.ingredients.map(ing => {
        const item = ing.inventoryItem
        
        // Convert quantity to grams for calculation
        let quantityInGrams = ing.quantity
        const unit = item.unit?.toLowerCase() || 'kg'
        
        if (unit === 'kg' || unit === 'kilogram') {
          quantityInGrams = ing.quantity * 1000
        } else if (unit === 'liter' || unit === 'l') {
          quantityInGrams = ing.quantity * 1000
        } else if (unit === 'lembar' || unit === 'pcs' || unit === 'piece') {
          quantityInGrams = ing.quantity * 100
        }
        
        // Calculate nutrition contribution (per 100g × quantity factor)
        const factor = quantityInGrams / 100
        
        return {
          ingredientName: item.itemName,
          quantity: ing.quantity,
          unit: item.unit,
          // Actual contribution to menu (not per 100g!)
          calories: (item.calories || 0) * factor,
          protein: (item.protein || 0) * factor,
          carbohydrates: (item.carbohydrates || 0) * factor,
          fat: (item.fat || 0) * factor,
          fiber: (item.fiber || 0) * factor,
          inventoryItem: {
            itemName: item.itemName,
            itemCode: item.id
          }
        }
      }),
      
      // Metadata
      calculatedAt: menu.nutritionCalc.calculatedAt.toISOString()
    }

      return NextResponse.json({
        success: true,
        data: report
      })

    } catch (error) {
      console.error('GET /api/sppg/menu/[id]/nutrition-report error:', error)
      
      return NextResponse.json({
        success: false,
        error: 'Failed to generate nutrition report',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 })
    }
  })
}
