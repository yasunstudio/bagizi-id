/**
 * @fileoverview Menu Nutrition Calculation Seed
 * Calculates and aggregates nutrition data from menu ingredients
 * 
 * @version Next.js 15.5.4 / Prisma 6.19.0
 * @author Bagizi-ID Development Team
 * @date January 20, 2025
 * 
 * @description
 * This seed file calculates comprehensive nutrition data for all menus by:
 * 1. Fetching all menu ingredients with their inventory item nutrition data
 * 2. Calculating nutrition per ingredient: (quantity in grams / 100) × nutrition per 100g
 * 3. Aggregating all ingredients to get total nutrition per menu
 * 4. Comparing against AKG (Angka Kecukupan Gizi) standards
 * 5. Storing in MenuNutritionCalculation table
 * 
 * Nutrition fields calculated:
 * - Macronutrients: calories, protein, carbs, fat, fiber
 * - Vitamins: A, B1-B12, C, D, E, K, Folate
 * - Minerals: Calcium, Phosphorus, Iron, Zinc, Iodine, Selenium, Magnesium, Potassium, Sodium
 * - AKG compliance: Daily Value percentages and adequacy flags
 */

import { PrismaClient, NutritionMenu, MenuNutritionCalculation } from "@prisma/client";

/**
 * AKG (Angka Kecukupan Gizi) Standards for Indonesia
 * Based on Permenkes RI No. 28 Tahun 2019
 * 
 * Reference values for school children (6-12 years) - primary target for PMAS program
 */
const AKG_STANDARDS = {
  // Macronutrients (per day)
  calories: 1850,      // kcal/day for children 7-9 years
  protein: 49,         // grams/day
  carbs: 254,          // grams/day
  fat: 62,             // grams/day
  fiber: 23,           // grams/day
  
  // Vitamins (per day)
  vitaminA: 500,       // mcg RE/day
  vitaminB1: 0.9,      // mg/day (thiamin)
  vitaminB2: 1.0,      // mg/day (riboflavin)
  vitaminB3: 10,       // mg/day (niacin)
  vitaminB6: 1.0,      // mg/day
  vitaminB12: 1.5,     // mcg/day
  vitaminC: 45,        // mg/day
  vitaminD: 15,        // mcg/day
  vitaminE: 7,         // mg/day
  vitaminK: 25,        // mcg/day
  folate: 200,         // mcg/day
  
  // Minerals (per day)
  calcium: 1000,       // mg/day
  phosphorus: 500,     // mg/day
  iron: 10,            // mg/day
  zinc: 11,            // mg/day
  iodine: 120,         // mcg/day
  selenium: 20,        // mcg/day
  magnesium: 120,      // mg/day
  potassium: 3000,     // mg/day
  sodium: 1200,        // mg/day
};

/**
 * Meal portion of daily AKG
 * PMAS lunch provides 35% of daily nutritional needs
 * PMT snack provides 15% of daily nutritional needs
 */
const MEAL_AKG_PORTION = {
  PMAS_LUNCH: 0.35,    // 35% of daily AKG
  PMT_SNACK: 0.15,     // 15% of daily AKG
};

/**
 * Calculate nutrition from menu ingredients
 * Formula: (quantity in grams / 100) × nutrition value per 100g
 */
function calculateNutritionFromIngredients(
  ingredients: Array<{
    quantity: number;
    inventoryItem: {
      calories?: number | null;
      protein?: number | null;
      carbohydrates?: number | null;
      fat?: number | null;
      fiber?: number | null;
      vitaminA?: number | null;
      vitaminB1?: number | null;
      vitaminB2?: number | null;
      vitaminB3?: number | null;
      vitaminB6?: number | null;
      vitaminB12?: number | null;
      vitaminC?: number | null;
      vitaminD?: number | null;
      vitaminE?: number | null;
      vitaminK?: number | null;
      folate?: number | null;
      calcium?: number | null;
      phosphorus?: number | null;
      iron?: number | null;
      zinc?: number | null;
      iodine?: number | null;
      selenium?: number | null;
      magnesium?: number | null;
      potassium?: number | null;
      sodium?: number | null;
    };
  }>
) {
  const totals = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    totalVitaminA: 0,
    totalVitaminB1: 0,
    totalVitaminB2: 0,
    totalVitaminB3: 0,
    totalVitaminB6: 0,
    totalVitaminB12: 0,
    totalVitaminC: 0,
    totalVitaminD: 0,
    totalVitaminE: 0,
    totalVitaminK: 0,
    totalFolate: 0,
    totalCalcium: 0,
    totalPhosphorus: 0,
    totalIron: 0,
    totalZinc: 0,
    totalIodine: 0,
    totalSelenium: 0,
    totalMagnesium: 0,
    totalPotassium: 0,
    totalSodium: 0,
  };

  // Aggregate nutrition from all ingredients
  ingredients.forEach(({ quantity, inventoryItem }) => {
    const multiplier = quantity / 100; // Convert to per 100g basis

    // Macronutrients
    totals.totalCalories += (inventoryItem.calories || 0) * multiplier;
    totals.totalProtein += (inventoryItem.protein || 0) * multiplier;
    totals.totalCarbs += (inventoryItem.carbohydrates || 0) * multiplier;
    totals.totalFat += (inventoryItem.fat || 0) * multiplier;
    totals.totalFiber += (inventoryItem.fiber || 0) * multiplier;

    // Vitamins
    totals.totalVitaminA += (inventoryItem.vitaminA || 0) * multiplier;
    totals.totalVitaminB1 += (inventoryItem.vitaminB1 || 0) * multiplier;
    totals.totalVitaminB2 += (inventoryItem.vitaminB2 || 0) * multiplier;
    totals.totalVitaminB3 += (inventoryItem.vitaminB3 || 0) * multiplier;
    totals.totalVitaminB6 += (inventoryItem.vitaminB6 || 0) * multiplier;
    totals.totalVitaminB12 += (inventoryItem.vitaminB12 || 0) * multiplier;
    totals.totalVitaminC += (inventoryItem.vitaminC || 0) * multiplier;
    totals.totalVitaminD += (inventoryItem.vitaminD || 0) * multiplier;
    totals.totalVitaminE += (inventoryItem.vitaminE || 0) * multiplier;
    totals.totalVitaminK += (inventoryItem.vitaminK || 0) * multiplier;
    totals.totalFolate += (inventoryItem.folate || 0) * multiplier;

    // Minerals
    totals.totalCalcium += (inventoryItem.calcium || 0) * multiplier;
    totals.totalPhosphorus += (inventoryItem.phosphorus || 0) * multiplier;
    totals.totalIron += (inventoryItem.iron || 0) * multiplier;
    totals.totalZinc += (inventoryItem.zinc || 0) * multiplier;
    totals.totalIodine += (inventoryItem.iodine || 0) * multiplier;
    totals.totalSelenium += (inventoryItem.selenium || 0) * multiplier;
    totals.totalMagnesium += (inventoryItem.magnesium || 0) * multiplier;
    totals.totalPotassium += (inventoryItem.potassium || 0) * multiplier;
    totals.totalSodium += (inventoryItem.sodium || 0) * multiplier;
  });

  return totals;
}

/**
 * Calculate Daily Value percentages against AKG standards
 * Adjusted for meal portion (35% for PMAS lunch, 15% for PMT snack)
 */
function calculateDailyValues(
  totals: ReturnType<typeof calculateNutritionFromIngredients>,
  mealPortion: number
) {
  const targetAKG = {
    calories: AKG_STANDARDS.calories * mealPortion,
    protein: AKG_STANDARDS.protein * mealPortion,
    carbs: AKG_STANDARDS.carbs * mealPortion,
    fat: AKG_STANDARDS.fat * mealPortion,
    fiber: AKG_STANDARDS.fiber * mealPortion,
  };

  return {
    caloriesDV: (totals.totalCalories / targetAKG.calories) * 100,
    proteinDV: (totals.totalProtein / targetAKG.protein) * 100,
    carbsDV: (totals.totalCarbs / targetAKG.carbs) * 100,
    fatDV: (totals.totalFat / targetAKG.fat) * 100,
    fiberDV: (totals.totalFiber / targetAKG.fiber) * 100,
  };
}

/**
 * Categorize nutrients into excess, deficient, and adequate
 * Based on AKG compliance thresholds:
 * - Adequate: 80-120% of target
 * - Deficient: <80% of target
 * - Excess: >120% of target
 */
function categorizeNutrients(dailyValues: ReturnType<typeof calculateDailyValues>) {
  const excessNutrients: string[] = [];
  const deficientNutrients: string[] = [];
  const adequateNutrients: string[] = [];

  Object.entries(dailyValues).forEach(([nutrient, percentage]) => {
    if (percentage > 120) {
      excessNutrients.push(nutrient.replace('DV', ''));
    } else if (percentage < 80) {
      deficientNutrients.push(nutrient.replace('DV', ''));
    } else {
      adequateNutrients.push(nutrient.replace('DV', ''));
    }
  });

  return { excessNutrients, deficientNutrients, adequateNutrients };
}

/**
 * Seed function to calculate and store nutrition data for all menus
 */
export async function seedMenuNutritionCalculation(
  prisma: PrismaClient,
  menus: NutritionMenu[]
): Promise<MenuNutritionCalculation[]> {
  console.log("  → Calculating nutrition from menu ingredients...");

  const calculations: MenuNutritionCalculation[] = [];
  let menusWithNutrition = 0;

  for (const menu of menus) {
    // Fetch menu ingredients with inventory nutrition data
    const menuIngredients = await prisma.menuIngredient.findMany({
      where: { menuId: menu.id },
      include: {
        inventoryItem: {
          select: {
            itemName: true,
            calories: true,
            protein: true,
            carbohydrates: true,
            fat: true,
            fiber: true,
            vitaminA: true,
            vitaminB1: true,
            vitaminB2: true,
            vitaminB3: true,
            vitaminB6: true,
            vitaminB12: true,
            vitaminC: true,
            vitaminD: true,
            vitaminE: true,
            vitaminK: true,
            folate: true,
            calcium: true,
            phosphorus: true,
            iron: true,
            zinc: true,
            iodine: true,
            selenium: true,
            magnesium: true,
            potassium: true,
            sodium: true,
          },
        },
      },
    });

    if (menuIngredients.length === 0) {
      console.log(`    ⚠️  ${menu.menuCode}: No ingredients found, skipping`);
      continue;
    }

    // Calculate total nutrition from ingredients
    const totals = calculateNutritionFromIngredients(menuIngredients);

    // Determine meal portion based on menu code (PMAS lunch or PMT snack)
    const mealPortion = menu.menuCode.startsWith("PMAS")
      ? MEAL_AKG_PORTION.PMAS_LUNCH
      : MEAL_AKG_PORTION.PMT_SNACK;

    // Calculate Daily Value percentages
    const dailyValues = calculateDailyValues(totals, mealPortion);

    // Categorize nutrients
    const { excessNutrients, deficientNutrients, adequateNutrients } =
      categorizeNutrients(dailyValues);

    // Check AKG compliance (adequate if calories and protein both 80-120%)
    const meetsCalorieAKG = dailyValues.caloriesDV >= 80 && dailyValues.caloriesDV <= 120;
    const meetsProteinAKG = dailyValues.proteinDV >= 80 && dailyValues.proteinDV <= 120;
    const meetsAKG = meetsCalorieAKG && meetsProteinAKG;

    // Create nutrition calculation record
    const calculation = await prisma.menuNutritionCalculation.upsert({
      where: { menuId: menu.id },
      update: {
        ...totals,
        ...dailyValues,
        meetsCalorieAKG,
        meetsProteinAKG,
        meetsAKG,
        excessNutrients,
        deficientNutrients,
        adequateNutrients,
        calculatedAt: new Date(),
        calculationMethod: "AUTO",
        isStale: false,
        ingredientsLastModified: new Date(),
      },
      create: {
        menuId: menu.id,
        ...totals,
        ...dailyValues,
        meetsCalorieAKG,
        meetsProteinAKG,
        meetsAKG,
        excessNutrients,
        deficientNutrients,
        adequateNutrients,
        calculatedAt: new Date(),
        calculationMethod: "AUTO",
        isStale: false,
        ingredientsLastModified: new Date(),
      },
    });

    calculations.push(calculation);
    menusWithNutrition++;
  }

  console.log(`  ✓ Created ${calculations.length} nutrition calculations:`);
  console.log(`    - Menus with nutrition data: ${menusWithNutrition}/${menus.length}`);
  console.log(`    - AKG compliance checked against Indonesian standards`);
  console.log(`    - PMAS meals: 35% of daily AKG target`);
  console.log(`    - PMT snacks: 15% of daily AKG target`);

  return calculations;
}
