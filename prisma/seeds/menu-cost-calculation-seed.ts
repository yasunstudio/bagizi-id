/**
 * @fileoverview Menu Cost Calculation Seed
 * Calculates comprehensive cost breakdown for all nutrition menus
 * 
 * @version Next.js 15.5.4 / Prisma 6.19.0
 * @author Bagizi-ID Development Team
 * @date January 20, 2025
 * 
 * @description
 * This seed file calculates complete cost data for all menus by:
 * 1. Fetching all menu ingredients with inventory item prices
 * 2. Calculating ingredient costs: quantity (grams) × price per unit
 * 3. Estimating labor costs based on recipe complexity
 * 4. Calculating utility costs (gas, electricity, water)
 * 5. Adding overhead costs (15% of direct costs)
 * 6. Computing cost per portion for pricing decisions
 * 7. Storing in MenuCostCalculation table
 * 
 * Cost components:
 * - Direct costs: Ingredients, labor, utilities, packaging
 * - Indirect costs: Equipment depreciation, cleaning, overhead
 * - Cost ratios: Ingredient%, labor%, overhead%
 * - Cost optimization: Alternative ingredients suggestions
 */

import { PrismaClient, Prisma, NutritionMenu, MenuCostCalculation } from "@prisma/client";

/**
 * Standard cost parameters for institutional kitchen in Indonesia
 * Based on market research and industry standards 2025
 */
const COST_PARAMETERS = {
  // Labor costs (per hour in IDR)
  laborCostPerHour: 25000,        // Rp 25,000/hour for kitchen staff
  
  // Utility costs (average per portion in IDR)
  gasCostPerPortion: 500,         // Rp 500 for cooking gas
  electricityCostPerPortion: 300, // Rp 300 for electricity (refrigeration, lights)
  waterCostPerPortion: 200,       // Rp 200 for water (cooking, washing)
  
  // Other costs (per portion in IDR)
  packagingCostPerPortion: 1000,  // Rp 1,000 for food-grade packaging
  equipmentCostPerPortion: 500,   // Rp 500 for equipment depreciation
  cleaningCostPerPortion: 300,    // Rp 300 for cleaning supplies
  
  // Overhead percentage (industry standard)
  overheadPercentage: 15,         // 15% of direct costs
  
  // Standard portions
  standardPortions: 100,          // Calculate for 100 portions by default
};

/**
 * Estimated preparation and cooking hours based on recipe complexity
 * Based on RecipeStep count and type of cooking methods
 */
const LABOR_TIME_ESTIMATES = {
  // Simple recipes (4-5 steps)
  simple: {
    preparationHours: 0.5,        // 30 minutes prep
    cookingHours: 0.5,            // 30 minutes cooking
  },
  // Medium recipes (6-7 steps)
  medium: {
    preparationHours: 1.0,        // 1 hour prep
    cookingHours: 1.0,            // 1 hour cooking
  },
  // Complex recipes (8+ steps or long cooking time)
  complex: {
    preparationHours: 1.5,        // 1.5 hours prep
    cookingHours: 2.0,            // 2 hours cooking (e.g., rendang, gudeg)
  },
};

/**
 * Ingredient cost breakdown item
 */
interface IngredientCostBreakdown {
  itemName: string;
  itemCode: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
}

/**
 * Calculate total ingredient cost from menu ingredients
 * Uses dual-region pricing (defaults to Purwakarta region)
 */
function calculateIngredientCost(
  ingredients: Array<{
    quantity: number;
    inventoryItem: {
      itemName: string;
      itemCode: string | null;
      unit: string;
      costPerUnit: number | null;
      lastPrice: number | null;
      averagePrice: number | null;
    };
  }>
): { totalCost: number; breakdown: IngredientCostBreakdown[] } {
  let totalCost = 0;
  const breakdown: IngredientCostBreakdown[] = [];

  ingredients.forEach(({ quantity, inventoryItem }) => {
    // Get price (priority: costPerUnit > lastPrice > averagePrice > 0)
    const unitPrice =
      inventoryItem.costPerUnit ||
      inventoryItem.lastPrice ||
      inventoryItem.averagePrice ||
      0;

    // Calculate cost based on unit
    // Note: Most prices are per kg (1000g), need to convert
    let itemCost = 0;
    if (inventoryItem.unit === "kg" || inventoryItem.unit === "Kg") {
      // Price per kg, quantity in grams
      itemCost = (quantity / 1000) * unitPrice;
    } else if (inventoryItem.unit === "liter" || inventoryItem.unit === "L") {
      // Price per liter, quantity in ml (assume 1g = 1ml for liquids)
      itemCost = (quantity / 1000) * unitPrice;
    } else if (inventoryItem.unit === "pcs" || inventoryItem.unit === "buah") {
      // Price per piece, quantity is count
      itemCost = quantity * unitPrice;
    } else {
      // Default: assume price matches quantity unit
      itemCost = quantity * unitPrice;
    }

    totalCost += itemCost;

    breakdown.push({
      itemName: inventoryItem.itemName,
      itemCode: inventoryItem.itemCode,
      quantity: quantity,
      unit: inventoryItem.unit,
      unitPrice: unitPrice,
      totalCost: Math.round(itemCost),
    });
  });

  return {
    totalCost: Math.round(totalCost),
    breakdown,
  };
}

/**
 * Estimate labor hours based on recipe complexity
 * Determined by number of recipe steps and cooking methods
 */
function estimateLaborHours(recipeStepCount: number, menuCode: string): {
  preparationHours: number;
  cookingHours: number;
} {
  // Complex menus (rendang, gudeg - long cooking time)
  if (menuCode.includes("L003") || menuCode.includes("L012")) {
    return LABOR_TIME_ESTIMATES.complex;
  }
  
  // Simple menus (less than 5 steps)
  if (recipeStepCount <= 5) {
    return LABOR_TIME_ESTIMATES.simple;
  }
  
  // Medium complexity (6-7 steps)
  if (recipeStepCount <= 7) {
    return LABOR_TIME_ESTIMATES.medium;
  }
  
  // Complex (8+ steps)
  return LABOR_TIME_ESTIMATES.complex;
}

/**
 * Calculate utility costs (gas, electricity, water)
 */
function calculateUtilityCosts(portions: number): {
  gasCost: number;
  electricityCost: number;
  waterCost: number;
  totalUtilityCost: number;
} {
  const gasCost = portions * COST_PARAMETERS.gasCostPerPortion;
  const electricityCost = portions * COST_PARAMETERS.electricityCostPerPortion;
  const waterCost = portions * COST_PARAMETERS.waterCostPerPortion;
  
  return {
    gasCost: Math.round(gasCost),
    electricityCost: Math.round(electricityCost),
    waterCost: Math.round(waterCost),
    totalUtilityCost: Math.round(gasCost + electricityCost + waterCost),
  };
}

/**
 * Calculate other direct costs (packaging, equipment, cleaning)
 */
function calculateOtherCosts(portions: number): {
  packagingCost: number;
  equipmentCost: number;
  cleaningCost: number;
} {
  return {
    packagingCost: Math.round(portions * COST_PARAMETERS.packagingCostPerPortion),
    equipmentCost: Math.round(portions * COST_PARAMETERS.equipmentCostPerPortion),
    cleaningCost: Math.round(portions * COST_PARAMETERS.cleaningCostPerPortion),
  };
}

/**
 * Suggest cost optimization strategies based on ingredient costs
 */
function suggestCostOptimizations(
  ingredientCostRatio: number,
  laborCostRatio: number,
  totalCost: number
): string[] {
  const optimizations: string[] = [];

  // High ingredient cost (>60%)
  if (ingredientCostRatio > 60) {
    optimizations.push("Pertimbangkan bahan alternatif yang lebih ekonomis");
    optimizations.push("Negosiasi harga dengan supplier untuk volume besar");
    optimizations.push("Gunakan bahan musiman yang lebih murah");
  }

  // High labor cost (>30%)
  if (laborCostRatio > 30) {
    optimizations.push("Sederhanakan proses memasak untuk efisiensi waktu");
    optimizations.push("Gunakan peralatan modern untuk mengurangi waktu persiapan");
    optimizations.push("Batch cooking untuk menghemat waktu tenaga kerja");
  }

  // Very high total cost (>Rp 15,000 per porsi)
  if (totalCost > 15000) {
    optimizations.push("Review keseluruhan resep untuk efisiensi biaya");
    optimizations.push("Pertimbangkan menu alternatif dengan nilai gizi serupa");
  }

  // Reasonable cost - positive feedback
  if (totalCost <= 12000 && ingredientCostRatio <= 60) {
    optimizations.push("Biaya sudah optimal untuk kualitas gizi yang diberikan");
  }

  return optimizations;
}

/**
 * Suggest alternative ingredients for cost reduction
 */
function suggestAlternativeIngredients(menuCode: string): string[] {
  const alternatives: string[] = [];

  // PMAS lunch menus with protein
  if (menuCode.startsWith("PMAS-L")) {
    if (menuCode.includes("L001") || menuCode.includes("L007")) {
      alternatives.push("Ayam: Gunakan bagian paha/sayap (lebih murah dari fillet)");
    }
    if (menuCode.includes("L003")) {
      alternatives.push("Daging sapi: Substitute dengan ayam atau tempe untuk biaya lebih rendah");
    }
    if (menuCode.includes("L002") || menuCode.includes("L009")) {
      alternatives.push("Ikan: Gunakan ikan lokal musiman (lebih segar dan murah)");
    }
  }

  // General alternatives
  alternatives.push("Sayuran: Prioritas sayuran lokal dan musiman");
  alternatives.push("Bumbu: Beli dalam jumlah besar untuk harga lebih murah");

  return alternatives;
}

/**
 * Seed function to calculate and store cost data for all menus
 */
export async function seedMenuCostCalculation(
  prisma: PrismaClient,
  menus: NutritionMenu[]
): Promise<MenuCostCalculation[]> {
  console.log("  → Calculating costs from menu ingredients...");

  const calculations: MenuCostCalculation[] = [];
  let menusWithCostData = 0;

  for (const menu of menus) {
    // Fetch menu ingredients with inventory pricing data
    const menuIngredients = await prisma.menuIngredient.findMany({
      where: { menuId: menu.id },
      include: {
        inventoryItem: {
          select: {
            itemName: true,
            itemCode: true,
            unit: true,
            costPerUnit: true,
            lastPrice: true,
            averagePrice: true,
          },
        },
      },
    });

    // Fetch recipe steps to estimate labor hours
    const recipeSteps = await prisma.recipeStep.findMany({
      where: { menuId: menu.id },
      select: { stepNumber: true },
    });

    if (menuIngredients.length === 0) {
      console.log(`    ⚠️  ${menu.menuCode}: No ingredients found, skipping`);
      continue;
    }

    // 1. Calculate ingredient costs
    const { totalCost: totalIngredientCost, breakdown: ingredientBreakdown } =
      calculateIngredientCost(menuIngredients);

    // 2. Estimate labor hours and calculate labor cost
    const { preparationHours, cookingHours } = estimateLaborHours(
      recipeSteps.length,
      menu.menuCode
    );
    const totalLaborHours = preparationHours + cookingHours;
    const totalLaborCost = Math.round(
      totalLaborHours * COST_PARAMETERS.laborCostPerHour * COST_PARAMETERS.standardPortions
    );

    // 3. Calculate utility costs
    const utilityCosts = calculateUtilityCosts(COST_PARAMETERS.standardPortions);

    // 4. Calculate other costs
    const otherCosts = calculateOtherCosts(COST_PARAMETERS.standardPortions);

    // 5. Calculate totals
    const totalDirectCost =
      totalIngredientCost +
      totalLaborCost +
      utilityCosts.totalUtilityCost +
      otherCosts.packagingCost +
      otherCosts.equipmentCost +
      otherCosts.cleaningCost;

    const overheadCost = Math.round(
      (totalDirectCost * COST_PARAMETERS.overheadPercentage) / 100
    );
    const totalIndirectCost = overheadCost;
    const grandTotalCost = totalDirectCost + totalIndirectCost;
    const costPerPortion = Math.round(grandTotalCost / COST_PARAMETERS.standardPortions);

    // 6. Calculate cost ratios
    const ingredientCostRatio = Math.round((totalIngredientCost / grandTotalCost) * 100);
    const laborCostRatio = Math.round((totalLaborCost / grandTotalCost) * 100);
    const overheadCostRatio = Math.round((overheadCost / grandTotalCost) * 100);

    // 7. Generate optimization suggestions
    const costOptimizations = suggestCostOptimizations(
      ingredientCostRatio,
      laborCostRatio,
      costPerPortion
    );
    const alternativeIngredients = suggestAlternativeIngredients(menu.menuCode);

    // Create cost calculation record
    const calculation = await prisma.menuCostCalculation.upsert({
      where: { menuId: menu.id },
      update: {
        totalIngredientCost,
        ingredientBreakdown: ingredientBreakdown as unknown as Prisma.InputJsonValue,
        laborCostPerHour: COST_PARAMETERS.laborCostPerHour,
        preparationHours,
        cookingHours,
        totalLaborCost,
        gasCost: utilityCosts.gasCost,
        electricityCost: utilityCosts.electricityCost,
        waterCost: utilityCosts.waterCost,
        totalUtilityCost: utilityCosts.totalUtilityCost,
        packagingCost: otherCosts.packagingCost,
        equipmentCost: otherCosts.equipmentCost,
        cleaningCost: otherCosts.cleaningCost,
        overheadPercentage: COST_PARAMETERS.overheadPercentage,
        overheadCost,
        totalDirectCost,
        totalIndirectCost,
        grandTotalCost,
        plannedPortions: COST_PARAMETERS.standardPortions,
        costPerPortion,
        ingredientCostRatio,
        laborCostRatio,
        overheadCostRatio,
        costOptimizations,
        alternativeIngredients,
        calculatedAt: new Date(),
        calculationMethod: "AUTO",
        isStale: false,
        ingredientsLastModified: new Date(),
      },
      create: {
        menuId: menu.id,
        totalIngredientCost,
        ingredientBreakdown: ingredientBreakdown as unknown as Prisma.InputJsonValue,
        laborCostPerHour: COST_PARAMETERS.laborCostPerHour,
        preparationHours,
        cookingHours,
        totalLaborCost,
        gasCost: utilityCosts.gasCost,
        electricityCost: utilityCosts.electricityCost,
        waterCost: utilityCosts.waterCost,
        totalUtilityCost: utilityCosts.totalUtilityCost,
        packagingCost: otherCosts.packagingCost,
        equipmentCost: otherCosts.equipmentCost,
        cleaningCost: otherCosts.cleaningCost,
        overheadPercentage: COST_PARAMETERS.overheadPercentage,
        overheadCost,
        totalDirectCost,
        totalIndirectCost,
        grandTotalCost,
        plannedPortions: COST_PARAMETERS.standardPortions,
        costPerPortion,
        ingredientCostRatio,
        laborCostRatio,
        overheadCostRatio,
        costOptimizations,
        alternativeIngredients,
        calculatedAt: new Date(),
        calculationMethod: "AUTO",
        isStale: false,
        ingredientsLastModified: new Date(),
      },
    });

    calculations.push(calculation);
    menusWithCostData++;
  }

  console.log(`  ✓ Created ${calculations.length} cost calculations:`);
  console.log(`    - Menus with cost data: ${menusWithCostData}/${menus.length}`);
  console.log(`    - Standard portions: ${COST_PARAMETERS.standardPortions} per menu`);
  console.log(`    - Labor cost: Rp ${COST_PARAMETERS.laborCostPerHour.toLocaleString()}/hour`);
  console.log(`    - Overhead: ${COST_PARAMETERS.overheadPercentage}% of direct costs`);

  return calculations;
}
