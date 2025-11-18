/**
 * @fileoverview Menu Plans Hooks
 * @version Next.js 15.5.4 / TanStack Query
 * @author Bagizi-ID Development Team
 * 
 * Hooks for menu plan management and integration
 * 
 * Features:
 * - Fetch approved menu plans for procurement integration
 * - Get menu plan details with assignments
 * - Calculate suggested procurement items from menu plan
 * - Auto-populate procurement plan from menu data
 */

import { useQuery } from '@tanstack/react-query'
import { 
  menuPlansApi, 
  type MenuPlanWithAssignments, 
  type MenuAssignment,
  type MenuIngredient,
} from '../api/menuPlansApi'

/**
 * Get approved menu plans for procurement integration
 * 
 * @returns Query with approved menu plans list
 */
export function useApprovedMenuPlans() {
  return useQuery({
    queryKey: ['menu-plans', 'approved'],
    queryFn: async () => {
      const response = await menuPlansApi.getAll({
        status: 'APPROVED',
        isArchived: false,
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Suggested procurement item calculated from menu plan
 */
interface SuggestedItem {
  itemId: string
  itemName: string
  category: string
  totalQuantity: number
  unit: string
  estimatedCost: number
  menuCount: number
}

/**
 * Menu plan data with calculated procurement items
 */
interface MenuPlanDataResult {
  menuPlan: MenuPlanWithAssignments
  suggestedItems: SuggestedItem[]
  estimatedTotalCost: number
  estimatedDailyRecipients: number
}

/**
 * Get menu plan details with calculated procurement items
 * 
 * @param menuPlanId - Menu plan ID
 * @returns Query with menu plan data and suggested items
 */
export function useMenuPlanData(menuPlanId?: string) {
  return useQuery({
    queryKey: ['menu-plans', menuPlanId, 'with-items'],
    queryFn: async (): Promise<MenuPlanDataResult | null> => {
      if (!menuPlanId) return null
      
      const response = await menuPlansApi.getById(menuPlanId)
      const menuPlan = response.data
      
      if (!menuPlan) return null
      
      // Calculate suggested procurement items
      const suggestedItems = calculateSuggestedItems(menuPlan)
      
      return {
        menuPlan,
        suggestedItems,
        estimatedTotalCost: menuPlan.totalEstimatedCost || 0,
        estimatedDailyRecipients: menuPlan.totalDays > 0 
          ? Math.ceil(menuPlan.totalMenus / menuPlan.totalDays)
          : 0,
      }
    },
    enabled: !!menuPlanId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Calculate suggested procurement items from menu plan
 * Groups ingredients by item and calculates total quantities
 * 
 * @param menuPlan - Menu plan with assignments
 * @returns Array of suggested procurement items
 */
function calculateSuggestedItems(menuPlan: MenuPlanWithAssignments): SuggestedItem[] {
  if (!menuPlan.assignments || menuPlan.assignments.length === 0) {
    return []
  }

  // Group by inventory item
  const itemMap = new Map<string, SuggestedItem>()

  menuPlan.assignments.forEach((assignment: MenuAssignment) => {
    if (!assignment.menu || !assignment.menu.ingredients) return

    assignment.menu.ingredients.forEach((ingredient: MenuIngredient) => {
      const itemId = ingredient.inventoryItemId
      const itemName = ingredient.inventoryItem?.itemName || 'Unknown Item'
      const category = ingredient.inventoryItem?.category || 'OTHER'
      const unit = ingredient.inventoryItem?.unit || 'kg'
      
      // Calculate quantity needed
      const quantityPerPortion = ingredient.quantity || 0
      const portions = assignment.plannedPortions || 0
      const totalQuantity = quantityPerPortion * portions
      
      // Estimate cost
      const unitPrice = ingredient.inventoryItem?.costPerUnit || 0
      const estimatedCost = totalQuantity * unitPrice

      if (itemMap.has(itemId)) {
        const existing = itemMap.get(itemId)!
        existing.totalQuantity += totalQuantity
        existing.estimatedCost += estimatedCost
        existing.menuCount += 1
      } else {
        itemMap.set(itemId, {
          itemId,
          itemName,
          category,
          totalQuantity,
          unit,
          estimatedCost,
          menuCount: 1,
        })
      }
    })
  })

  return Array.from(itemMap.values())
    .sort((a, b) => b.estimatedCost - a.estimatedCost) // Sort by cost descending
}

/**
 * Budget breakdown by category
 */
export interface BudgetBreakdown {
  proteinBudget: number
  carbBudget: number
  vegetableBudget: number
  fruitBudget: number
  otherBudget: number
}

/**
 * Calculate budget breakdown by category from suggested items
 * 
 * @param suggestedItems - Suggested procurement items
 * @returns Budget breakdown by category
 */
export function calculateBudgetBreakdown(suggestedItems: SuggestedItem[]): BudgetBreakdown {
  const breakdown: BudgetBreakdown = {
    proteinBudget: 0,
    carbBudget: 0,
    vegetableBudget: 0,
    fruitBudget: 0,
    otherBudget: 0,
  }

  suggestedItems.forEach(item => {
    const category = item.category?.toUpperCase()
    
    if (category?.includes('PROTEIN') || category?.includes('HEWANI') || category?.includes('NABATI')) {
      breakdown.proteinBudget += item.estimatedCost
    } else if (category?.includes('CARB') || category?.includes('KARBOHIDRAT')) {
      breakdown.carbBudget += item.estimatedCost
    } else if (category?.includes('VEGETABLE') || category?.includes('SAYUR')) {
      breakdown.vegetableBudget += item.estimatedCost
    } else if (category?.includes('FRUIT') || category?.includes('BUAH')) {
      breakdown.fruitBudget += item.estimatedCost
    } else {
      breakdown.otherBudget += item.estimatedCost
    }
  })

  return breakdown
}

