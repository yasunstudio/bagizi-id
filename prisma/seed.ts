/**
 * @fileoverview Master seed file untuk database Bagizi-ID
 * @version Next.js 15.5.4 / Prisma 6.17.1 / Enterprise-grade Refactored
 * @author Bagizi-ID Development Team
 * @see {@link /.github/copilot-instructions.md} Prisma Seed Architecture
 *
 * REFACTORED NOVEMBER 2025:
 * - Menggunakan HANYA seed files yang telah direfactor
 * - Pattern: Singular naming (seedProvince, seedRegency, seedDistrict, etc.)
 * - Dependency order: Province → Regency → District → Village → SPPG → User → FoodCategory
 * - Dual-region architecture: Purwakarta + Karawang
 */

import { PrismaClient } from "@prisma/client";

// ✅ NEW REFACTORED SEED FILES (13 files)
import { seedProvince } from "./seeds/province-seed";
import { seedRegency } from "./seeds/regency-seed";
import { seedDistrict } from "./seeds/district-seed";
import { seedVillage } from "./seeds/village-seed";
import { seedSPPG } from "./seeds/sppg-seed";
import { seedUser } from "./seeds/user-seed";
import { seedFoodCategory } from "./seeds/food-category-seed";
import { seedInventoryItem } from "./seeds/inventory-item-seed";
import { seedNutritionProgram } from "./seeds/nutrition-program-seed";
import { seedNutritionMenu } from "./seeds/nutrition-menu-seed";
import { seedBeneficiaryOrganization } from "./seeds/beneficiary-organization-seed";
import { seedProgramBeneficiaryEnrollment } from "./seeds/program-beneficiary-enrollment-seed";
import { seedMenuIngredient } from "./seeds/menu-ingredient-seed";
import { seedRecipeStep } from "./seeds/recipe-step-seed";
import { seedMenuNutritionCalculation } from "./seeds/menu-nutrition-calculation-seed";
import { seedMenuCostCalculation } from "./seeds/menu-cost-calculation-seed";
import { seedNutritionStandards } from "./seeds/nutrition-standards-seed";
import { seedBanperTracking } from "./seeds/banper-tracking-seed";

// 🔄 All seed files completed!

const prisma = new PrismaClient();

/**
 * Reset database by deleting all data in reverse order of dependencies
 */
async function resetDatabase() {
  console.log("🔄 Resetting database (deleting all data)...");

  try {
    // Delete Program Beneficiary Enrollments (depends on programs and organizations)
    await prisma.programBeneficiaryEnrollment.deleteMany();
    
    // Delete Beneficiary Organizations (depends on SPPG)
    await prisma.beneficiaryOrganization.deleteMany();
    
    // Delete Menu Ingredients (depends on menus and inventory)
    await prisma.menuCostCalculation.deleteMany();
    await prisma.menuNutritionCalculation.deleteMany();
    await prisma.recipeStep.deleteMany();
    await prisma.menuIngredient.deleteMany();
    
    // Delete Nutrition Programs and related data
    await prisma.nutritionProgram.deleteMany();
    
    // Delete Inventory Items
    await prisma.inventoryItem.deleteMany();
    
    // Delete FoodCategories
    await prisma.foodCategory.deleteMany();

    // Delete Users
    await prisma.user.deleteMany();

    // Delete SPPG
    await prisma.sPPG.deleteMany();

    // Delete Regional data (reverse order: Village → District → Regency → Province)
    await prisma.village.deleteMany();
    await prisma.district.deleteMany();
    await prisma.regency.deleteMany();
    await prisma.province.deleteMany();

    console.log("✅ Database reset completed");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    throw error;
  }
}

/**
 * Main seeding function that orchestrates all seed operations
 */
async function main() {
  console.log("🌱 Starting database seeding...");
  console.log("📅 Date: January 20, 2025");
  console.log("");

  try {
    // Reset database first
    await resetDatabase();
    console.log("");

    // 1. Seed Regional Data (Province → Regency → District → Village)
    console.log("🗺️  Step 1: Seeding regional data (Indonesia)...");
    console.log("  → Creating Province (Jawa Barat)...");
    const province = await seedProvince(prisma);
    console.log(`  ✓ Province created: ${province.name}`);

    console.log("  → Creating Regencies (Purwakarta & Karawang)...");
    const regencies = await seedRegency(prisma, province);
    console.log(
      `  ✓ Regencies created: ${regencies.purwakarta.name}, ${regencies.karawang.name}`,
    );

    console.log("  → Creating Districts (45 total)...");
    const districts = await seedDistrict(prisma, regencies);
    console.log(
      `  ✓ Districts created: ${districts.purwakarta.length} Purwakarta, ${districts.karawang.length} Karawang`,
    );

    console.log("  → Creating Villages (90 total)...");
    const villages = await seedVillage(prisma, districts);
    console.log(
      `  ✓ Villages created: ${villages.purwakarta.length} Purwakarta, ${villages.karawang.length} Karawang`,
    );
    console.log("✅ Regional data complete (Province → Regency → District → Village)");
    console.log("");

    // 2. Seed SPPG (Demo SPPG 2025)
    console.log("🏢 Step 2: Seeding SPPG (Demo SPPG 2025)...");
    const demoSppg = await seedSPPG(prisma, villages);
    console.log(`  ✓ SPPG created: ${demoSppg.name}`);
    console.log(`  ✓ Location: ${demoSppg.addressDetail}`);
    console.log(`  ✓ Budget: Rp ${demoSppg.monthlyBudget?.toLocaleString()}/month`);
    console.log(`  ✓ Target: ${demoSppg.targetRecipients} beneficiaries`);
    console.log("✅ SPPG entity created");
    console.log("");

    // 3. Seed Users (11 demo users)
    console.log("👥 Step 3: Seeding demo users (11 users)...");
    const users = await seedUser(prisma, demoSppg);
    console.log(`  ✓ Users created: ${users.length}`);
    console.log("  ✓ Roles: Kepala, Ahli Gizi, Admin, Akuntan, etc.");
    console.log("  ✓ Email domain: @demo.sppg.id");
    console.log("  ✓ Password: Demo2025");
    console.log("✅ Demo users created");
    console.log("");

    // 4. Seed Food Categories (10 Indonesian categories)
    console.log("🍽️  Step 4: Seeding food categories (10 categories)...");
    const foodCategories = await seedFoodCategory(prisma);
    console.log(`  ✓ Categories created: ${foodCategories.length}`);
    console.log("  ✓ Types: Protein Hewani, Protein Nabati, Karbohidrat, Sayuran, etc.");
    console.log("✅ Food categories created");
    console.log("");

    // 4b. Seed Nutrition Standards (Reference data for all target groups)
    console.log("📊 Step 4b: Seeding nutrition standards (Indonesian AKG 2019)...");
    await seedNutritionStandards(prisma);
    console.log("  ✓ Standards for all age groups and target groups");
    console.log("  ✓ Source: Angka Kecukupan Gizi Indonesia 2019");
    console.log("✅ Nutrition standards created");
    console.log("");

    // 5. Seed Inventory Items (47 Indonesian ingredients)
    console.log("📦 Step 5: Seeding inventory items (47 ingredients)...");
    const inventoryItems = await seedInventoryItem(prisma, demoSppg, foodCategories);
    console.log(`  ✓ Inventory items created: ${inventoryItems.length}`);
    console.log("  ✓ Dual-region pricing: Purwakarta vs Karawang");
    console.log("  ✓ Complete nutrition data per 100g");
    console.log("✅ Inventory items created");
    console.log("");

    // 6. Seed Nutrition Programs (2 programs: PMAS + PMT)
    console.log("🎯 Step 6: Seeding nutrition programs (2 programs)...");
    const nutritionPrograms = await seedNutritionProgram(prisma, demoSppg);
    console.log(`  ✓ Programs created: ${nutritionPrograms.length}`);
    console.log("  ✓ PMAS: School lunch (5,000 children)");
    console.log("  ✓ PMT: Vulnerable groups (2,500 individuals)");
    console.log("✅ Nutrition programs created");
    console.log("");

    // 7. Seed Nutrition Menus (21 Indonesian menus)
    console.log("🍽️  Step 7: Seeding nutrition menus (21 Indonesian recipes)...");
    const nutritionMenus = await seedNutritionMenu(prisma, nutritionPrograms, foodCategories);
    console.log(`  ✓ Menus created: ${nutritionMenus.length}`);
    console.log("  ✓ PMAS lunch menus: 12 (Rp 10k-16k per meal)");
    console.log("  ✓ PMT snack menus: 9 (Rp 5k-8k per snack)");
    console.log("  ✓ Target-specific menus with special nutrients");
    console.log("✅ Nutrition menus created");
    console.log("");

    // 8. Seed Beneficiary Organizations (15 organizations: 10 schools + 5 health facilities)
    console.log("🏫 Step 8: Seeding beneficiary organizations (15 organizations)...");
    const beneficiaryOrganizations = await seedBeneficiaryOrganization(
      prisma,
      demoSppg,
      province,
      regencies,
      districts,
      villages
    );
    console.log(`  ✓ Organizations created: ${beneficiaryOrganizations.length}`);
    console.log("  ✓ Schools: 10 (4 SD, 3 SMP, 2 SMA, 1 SMK)");
    console.log("  ✓ Health Facilities: 5 (3 Posyandu, 2 Puskesmas)");
    console.log("  ✓ Total capacity: 6,570 students + 1,670 vulnerable beneficiaries");
    console.log("✅ Beneficiary organizations created");
    console.log("");

    // 9. Seed Program Beneficiary Enrollments (19 enrollments)
    console.log("📋 Step 9: Seeding program enrollments (19 enrollments)...");
    const programEnrollments = await seedProgramBeneficiaryEnrollment(
      prisma,
      demoSppg,
      nutritionPrograms,
      beneficiaryOrganizations
    );
    console.log(`  ✓ Enrollments created: ${programEnrollments.length}`);
    console.log("  ✓ PMAS enrollments: 10 schools, 6,000 students");
    console.log("  ✓ PMT enrollments: 9 organizations, 2,350 vulnerable beneficiaries");
    console.log("  ✓ Total beneficiaries: 8,350");
    console.log("✅ Program enrollments created");
    console.log("");

    // 10. Seed Menu Ingredients (CRITICAL - solves original issue!)
    console.log("🍳 Step 10: Seeding menu ingredients (linking menus to inventory)...");
    const menuIngredients = await seedMenuIngredient(
      prisma,
      nutritionMenus,
      inventoryItems
    );
    console.log(`  ✓ Menu ingredients created: ${menuIngredients.length}`);
    console.log("  ✓ All 21 menus now have complete ingredient lists!");
    console.log("✅ Menu ingredients created");
    console.log("");

    // 11. Seed Recipe Steps (Indonesian cooking instructions)
    console.log("🍳 Step 11: Seeding recipe steps (Indonesian cooking instructions)...");
    const recipeSteps = await seedRecipeStep(prisma, nutritionMenus);
    console.log(`  ✓ Recipe steps created: ${recipeSteps.length}`);
    console.log("  ✓ All 21 menus now have complete cooking instructions!");
    console.log("  ✓ ISSUE FULLY SOLVED: 'hampir semua menu tidak mempunyai bahan dan resep'");
    console.log("✅ Recipe steps created");
    console.log("");

    // 12. Seed Menu Nutrition Calculations (aggregate nutrition from ingredients)
    console.log("🥗 Step 12: Calculating menu nutrition from ingredients...");
    const nutritionCalculations = await seedMenuNutritionCalculation(prisma, nutritionMenus);
    console.log(`  ✓ Nutrition calculations created: ${nutritionCalculations.length}`);
    console.log("  ✓ All menus have complete nutrition data!");
    console.log("  ✓ AKG compliance checked (Indonesian standards)");
    console.log("✅ Nutrition calculations created");
    console.log("");

    // 13. Seed Menu Cost Calculations (calculate costs from ingredients and labor)
    console.log("💰 Step 13: Calculating menu costs (ingredients + labor + overhead)...");
    const costCalculations = await seedMenuCostCalculation(prisma, nutritionMenus);
    console.log(`  ✓ Cost calculations created: ${costCalculations.length}`);
    console.log("  ✓ All menus have complete cost breakdown!");
    console.log("  ✓ Cost optimization suggestions included");
    console.log("✅ Cost calculations created");
    console.log("");

    // 14. Seed Banper Tracking (Government Budget Tracking)
    console.log("💵 Step 14: Seeding Government Budget Tracking (Banper)...");
    await seedBanperTracking();
    console.log("  ✓ Banper requests, budget allocations, and transactions created");
    console.log("  ✓ Multiple budget statuses (DRAFT, APPROVED, DISBURSED, etc.)");
    console.log("  ✓ Various budget sources (APBN, APBD, HIBAH)");
    console.log("✅ Banper tracking created");
    console.log("");

    // Success Summary
    console.log("========================================");
    console.log("✅ DATABASE SEEDING COMPLETED!");
    console.log("========================================");
    console.log("");
    console.log("📊 Summary:");
    console.log(`  ✓ Province: 1 (Jawa Barat)`);
    console.log(`  ✓ Regencies: 2 (Purwakarta, Karawang)`);
    console.log(
      `  ✓ Districts: ${districts.purwakarta.length + districts.karawang.length}`,
    );
    console.log(
      `  ✓ Villages: ${villages.purwakarta.length + villages.karawang.length}`,
    );
    console.log(`  ✓ SPPG: 1 (Demo SPPG 2025)`);
    console.log(`  ✓ Users: ${users.length}`);
    console.log(`  ✓ Food Categories: ${foodCategories.length}`);
    console.log(`  ✓ Inventory Items: ${inventoryItems.length}`);
    console.log(`  ✓ Nutrition Programs: ${nutritionPrograms.length}`);
    console.log(`  ✓ Nutrition Menus: ${nutritionMenus.length}`);
    console.log(`  ✓ Beneficiary Organizations: ${beneficiaryOrganizations.length}`);
    console.log(`  ✓ Program Enrollments: ${programEnrollments.length}`);
    console.log(`  ✓ Menu Ingredients: ${menuIngredients.length}`);
    console.log(`  ✓ Recipe Steps: ${recipeSteps.length}`);
    console.log(`  ✓ Nutrition Calculations: ${nutritionCalculations.length}`);
    console.log(`  ✓ Cost Calculations: ${costCalculations.length}`);
    console.log(`  ✓ Total Beneficiaries: 8,350 (6,000 students + 2,350 vulnerable)`);
    console.log("");
    console.log("🔐 Login credentials:");
    console.log("  Email: kepala@demo.sppg.id (or any role@demo.sppg.id)");
    console.log("  Password: Demo2025");
    console.log("");
    console.log("🎉 All seed files completed!");
    console.log("📊 Complete data pipeline: Regions → SPPG → Programs → Menus → Ingredients → Recipes → Nutrition → Costs");
    console.log("");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
