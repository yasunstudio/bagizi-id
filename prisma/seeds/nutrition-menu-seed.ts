/**
 * @fileoverview Nutrition Menu Seed - 21 Indonesian menus for PMAS & PMT programs
 * @version Prisma 6.19.0
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 *
 * Creates 21 comprehensive Indonesian menus:
 * - 12 MAKAN_SIANG menus (PMAS Program - School lunch)
 * - 9 SNACK menus (PMT Program - Morning & afternoon snacks)
 * 
 * Features:
 * - Target group compatibility (compatibleTargetGroups[])
 * - Special nutrients for vulnerable groups (folicAcid, iron, calcium, vitamins)
 * - Realistic SPPG budget (Rp 10,000-15,000 per meal)
 * - Complete nutrition data per serving
 */

import {
  PrismaClient,
  NutritionProgram,
  FoodCategory,
  NutritionMenu,
  MealType,
  MenuDifficulty,
  CookingMethod,
  TargetGroup,
} from '@prisma/client'

interface NutritionMenuData {
  programId: string
  menuName: string
  menuCode: string
  description: string
  mealType: MealType
  foodCategoryId: string
  servingSize: number // grams
  costPerServing: number // Rupiah
  cookingTime: number // minutes
  preparationTime: number // minutes
  difficulty: MenuDifficulty
  cookingMethod: CookingMethod
  // Target group compatibility
  compatibleTargetGroups: TargetGroup[] // Empty = universal
  // Nutrition per serving (required fields)
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber: number
  // Special nutrients for target groups
  folicAcid?: number // mcg - PREGNANT_WOMAN needs 600
  iron?: number // mg - PREGNANT_WOMAN needs 27, TEENAGE_GIRL needs 15
  calcium?: number // mg - PREGNANT_WOMAN/ELDERLY need 1000+
  vitaminA?: number // mcg - BREASTFEEDING_MOTHER, TODDLER
  vitaminC?: number // mg - General immunity
  vitaminD?: number // mcg - ELDERLY, TODDLER (bone health)
  // Allergens
  allergens: string[]
  isVegetarian: boolean
}

/**
 * Seed 21 nutrition menus for Demo SPPG programs
 */
export async function seedNutritionMenu(
  prisma: PrismaClient,
  programs: NutritionProgram[],
  foodCategories: FoodCategory[]
): Promise<NutritionMenu[]> {
  console.log('  → Creating Nutrition Menus (21 Indonesian recipes)...')

  // Find programs
  const pmasProgram = programs.find((p) => p.programCode === 'PMAS-PWK-2025')!
  const pmtProgram = programs.find((p) => p.programCode === 'PMT-PWK-2025')!

  // Find food categories
  const proteinHewani = foodCategories.find((c) => c.categoryCode === 'PROTEIN-HEWANI')!
  const karbohidrat = foodCategories.find((c) => c.categoryCode === 'KARBOHIDRAT')!
  const sayuran = foodCategories.find((c) => c.categoryCode === 'SAYURAN')!
  const proteinNabati = foodCategories.find((c) => c.categoryCode === 'PROTEIN-NABATI')!

  const menus: NutritionMenuData[] = [
    // ========================================================================
    // PMAS PROGRAM - MAKAN SIANG (12 Menus for School Children)
    // Universal menus compatible with SCHOOL_CHILDREN
    // ========================================================================

    // Menu 1: Nasi Ayam Goreng + Sayur Asem
    {
      programId: pmasProgram.id,
      menuName: 'Nasi Ayam Goreng dengan Sayur Asem',
      menuCode: 'PMAS-L001',
      description:
        'Nasi putih hangat dengan ayam goreng bumbu kuning, sayur asem segar (kol, labu siam, kacang panjang), dan sambal terasi. Menu favorit anak sekolah yang kaya protein dan vitamin.',
      mealType: 'MAKAN_SIANG',
      foodCategoryId: proteinHewani.id,
      servingSize: 400, // grams
      costPerServing: 15000,
      cookingTime: 45,
      preparationTime: 20,
      difficulty: 'MEDIUM',
      cookingMethod: 'FRY',
      compatibleTargetGroups: [], // Universal - all groups can eat
      calories: 650,
      protein: 35,
      carbohydrates: 75,
      fat: 20,
      fiber: 8,
      iron: 3.5,
      calcium: 80,
      vitaminA: 450,
      vitaminC: 35,
      allergens: [],
      isVegetarian: false,
    },

    // Menu 2: Nasi Soto Ayam
    {
      programId: pmasProgram.id,
      menuName: 'Soto Ayam Kuning Purwakarta',
      menuCode: 'PMAS-L002',
      description:
        'Soto ayam kuning khas Purwakarta dengan kuah kunyit segar, isian daging ayam suwir, tauge, telur rebus, dan perkedel kentang. Dilengkapi nasi putih hangat dan kerupuk.',
      mealType: 'MAKAN_SIANG',
      foodCategoryId: proteinHewani.id,
      servingSize: 450,
      costPerServing: 14000,
      cookingTime: 60,
      preparationTime: 25,
      difficulty: 'MEDIUM',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [],
      calories: 620,
      protein: 32,
      carbohydrates: 70,
      fat: 18,
      fiber: 6,
      iron: 3.2,
      calcium: 70,
      vitaminA: 380,
      vitaminC: 25,
      allergens: ['Telur'],
      isVegetarian: false,
    },

    // Menu 3: Nasi Rendang Daging
    {
      programId: pmasProgram.id,
      menuName: 'Nasi Rendang Daging Sapi',
      menuCode: 'PMAS-L003',
      description:
        'Rendang daging sapi empuk dengan bumbu rempah kaya, dimasak santan kelapa hingga meresap. Disajikan dengan nasi, sambal hijau, dan tumis buncis wortel.',
      mealType: 'MAKAN_SIANG',
      foodCategoryId: proteinHewani.id,
      servingSize: 400,
      costPerServing: 16000,
      cookingTime: 90,
      preparationTime: 30,
      difficulty: 'HARD',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [],
      calories: 720,
      protein: 38,
      carbohydrates: 68,
      fat: 28,
      fiber: 7,
      iron: 4.5,
      calcium: 90,
      vitaminA: 520,
      vitaminC: 30,
      allergens: [],
      isVegetarian: false,
    },

    // Menu 4: Nasi Ikan Bandeng Presto
    {
      programId: pmasProgram.id,
      menuName: 'Nasi Ikan Bandeng Presto',
      menuCode: 'PMAS-L004',
      description:
        'Ikan bandeng presto khas Jawa Barat yang empuk hingga ke durinya, digoreng garing. Disajikan dengan nasi, sambal terasi, dan sayur bayam bening.',
      mealType: 'MAKAN_SIANG',
      foodCategoryId: proteinHewani.id,
      servingSize: 420,
      costPerServing: 13000,
      cookingTime: 50,
      preparationTime: 20,
      difficulty: 'MEDIUM',
      cookingMethod: 'FRY',
      compatibleTargetGroups: [],
      calories: 600,
      protein: 30,
      carbohydrates: 72,
      fat: 16,
      fiber: 6,
      iron: 2.8,
      calcium: 120, // High calcium from fish bones
      vitaminA: 420,
      vitaminC: 28,
      allergens: ['Ikan'],
      isVegetarian: false,
    },

    // Menu 5: Nasi Pecel (Vegetarian)
    {
      programId: pmasProgram.id,
      menuName: 'Nasi Pecel Sayuran',
      menuCode: 'PMAS-L005',
      description:
        'Nasi dengan pecel sayuran rebus (kangkung, bayam, kol, tauge, kacang panjang) disiram bumbu kacang pedas manis. Dilengkapi tempe goreng dan kerupuk.',
      mealType: 'MAKAN_SIANG',
      foodCategoryId: sayuran.id,
      servingSize: 380,
      costPerServing: 10000,
      cookingTime: 35,
      preparationTime: 25,
      difficulty: 'EASY',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [],
      calories: 550,
      protein: 18,
      carbohydrates: 78,
      fat: 15,
      fiber: 12,
      iron: 4.2, // High iron from green veggies
      calcium: 150,
      vitaminA: 680, // Very high from greens
      vitaminC: 45,
      allergens: ['Kacang'],
      isVegetarian: true,
    },

    // Menu 6: Nasi Goreng Spesial
    {
      programId: pmasProgram.id,
      menuName: 'Nasi Goreng Ayam Telur',
      menuCode: 'PMAS-L006',
      description:
        'Nasi goreng dengan potongan ayam, telur dadar iris, sayuran (wortel, kol, buncis), kecap manis. Disajikan dengan acar dan kerupuk.',
      mealType: 'MAKAN_SIANG',
      foodCategoryId: karbohidrat.id,
      servingSize: 400,
      costPerServing: 12000,
      cookingTime: 30,
      preparationTime: 15,
      difficulty: 'EASY',
      cookingMethod: 'STIR_FRY',
      compatibleTargetGroups: [],
      calories: 640,
      protein: 28,
      carbohydrates: 80,
      fat: 20,
      fiber: 6,
      iron: 3.0,
      calcium: 75,
      vitaminA: 420,
      vitaminC: 22,
      allergens: ['Telur'],
      isVegetarian: false,
    },

    // Menu 7: Nasi Gado-Gado
    {
      programId: pmasProgram.id,
      menuName: 'Nasi Gado-Gado Jakarta',
      menuCode: 'PMAS-L007',
      description:
        'Nasi dengan gado-gado sayuran rebus (kentang, kol, wortel, buncis, tauge), telur rebus, tahu goreng, tempe goreng, dan bumbu kacang kental.',
      mealType: 'MAKAN_SIANG',
      foodCategoryId: sayuran.id,
      servingSize: 420,
      costPerServing: 11000,
      cookingTime: 40,
      preparationTime: 25,
      difficulty: 'MEDIUM',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [],
      calories: 580,
      protein: 22,
      carbohydrates: 75,
      fat: 18,
      fiber: 10,
      iron: 3.8,
      calcium: 140,
      vitaminA: 560,
      vitaminC: 38,
      allergens: ['Kacang', 'Telur'],
      isVegetarian: false,
    },

    // Menu 8: Nasi Opor Ayam
    {
      programId: pmasProgram.id,
      menuName: 'Nasi Opor Ayam Santan',
      menuCode: 'PMAS-L008',
      description:
        'Opor ayam santan dengan bumbu rempah (kemiri, ketumbar, bawang putih, jahe), telur rebus, dan sambal goreng kentang. Disajikan dengan nasi hangat.',
      mealType: 'MAKAN_SIANG',
      foodCategoryId: proteinHewani.id,
      servingSize: 400,
      costPerServing: 14000,
      cookingTime: 55,
      preparationTime: 20,
      difficulty: 'MEDIUM',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [],
      calories: 680,
      protein: 33,
      carbohydrates: 70,
      fat: 24,
      fiber: 5,
      iron: 3.2,
      calcium: 85,
      vitaminA: 400,
      vitaminC: 20,
      allergens: ['Telur'],
      isVegetarian: false,
    },

    // Menu 9: Nasi Ayam Bakar Madu
    {
      programId: pmasProgram.id,
      menuName: 'Nasi Ayam Bakar Madu',
      menuCode: 'PMAS-L009',
      description:
        'Ayam bakar dengan olesan bumbu madu manis pedas, dilengkapi lalapan segar (timun, tomat, kol), sambal, dan tumis kangkung.',
      mealType: 'MAKAN_SIANG',
      foodCategoryId: proteinHewani.id,
      servingSize: 400,
      costPerServing: 15000,
      cookingTime: 50,
      preparationTime: 30,
      difficulty: 'MEDIUM',
      cookingMethod: 'GRILL',
      compatibleTargetGroups: [],
      calories: 640,
      protein: 36,
      carbohydrates: 72,
      fat: 18,
      fiber: 7,
      iron: 3.4,
      calcium: 70,
      vitaminA: 480,
      vitaminC: 32,
      allergens: [],
      isVegetarian: false,
    },

    // Menu 10: Nasi Telur Balado
    {
      programId: pmasProgram.id,
      menuName: 'Nasi Telur Balado Tahu Tempe',
      menuCode: 'PMAS-L010',
      description:
        'Telur rebus balado pedas manis, tahu goreng, tempe goreng, dan tumis sayuran (buncis wortel). Menu ekonomis namun bergizi tinggi.',
      mealType: 'MAKAN_SIANG',
      foodCategoryId: proteinNabati.id,
      servingSize: 380,
      costPerServing: 10000,
      cookingTime: 35,
      preparationTime: 15,
      difficulty: 'EASY',
      cookingMethod: 'FRY',
      compatibleTargetGroups: [],
      calories: 560,
      protein: 24,
      carbohydrates: 68,
      fat: 20,
      fiber: 8,
      iron: 4.5, // High from tempeh
      calcium: 180, // High from tofu
      vitaminA: 380,
      vitaminC: 28,
      allergens: ['Telur'],
      isVegetarian: false,
    },

    // Menu 11: Nasi Ikan Nila Goreng
    {
      programId: pmasProgram.id,
      menuName: 'Nasi Ikan Nila Goreng Sambal',
      menuCode: 'PMAS-L011',
      description:
        'Ikan nila segar digoreng garing dengan bumbu kuning, disajikan dengan nasi, sambal terasi, lalapan, dan sayur sop.',
      mealType: 'MAKAN_SIANG',
      foodCategoryId: proteinHewani.id,
      servingSize: 420,
      costPerServing: 12000,
      cookingTime: 40,
      preparationTime: 20,
      difficulty: 'EASY',
      cookingMethod: 'FRY',
      compatibleTargetGroups: [],
      calories: 610,
      protein: 32,
      carbohydrates: 70,
      fat: 18,
      fiber: 6,
      iron: 2.6,
      calcium: 95,
      vitaminA: 400,
      vitaminC: 26,
      allergens: ['Ikan'],
      isVegetarian: false,
    },

    // Menu 12: Nasi Lodeh Sayuran
    {
      programId: pmasProgram.id,
      menuName: 'Nasi Sayur Lodeh Santan',
      menuCode: 'PMAS-L012',
      description:
        'Sayur lodeh santan dengan labu siam, terong, kol, tahu, tempe, dan kacang panjang. Menu berkuah gurih yang mengenyangkan.',
      mealType: 'MAKAN_SIANG',
      foodCategoryId: sayuran.id,
      servingSize: 400,
      costPerServing: 10000,
      cookingTime: 45,
      preparationTime: 20,
      difficulty: 'EASY',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [],
      calories: 520,
      protein: 16,
      carbohydrates: 72,
      fat: 16,
      fiber: 10,
      iron: 3.2,
      calcium: 150,
      vitaminA: 520,
      vitaminC: 35,
      allergens: [],
      isVegetarian: true,
    },

    // ========================================================================
    // PMT PROGRAM - SNACK (9 Menus for Vulnerable Groups)
    // Target-specific menus with special nutrients
    // ========================================================================

    // Snack 1: Bubur Kacang Hijau (for PREGNANT_WOMAN, TODDLER)
    {
      programId: pmtProgram.id,
      menuName: 'Bubur Kacang Hijau Susu',
      menuCode: 'PMT-S001',
      description:
        'Bubur kacang hijau manis dengan santan kelapa dan susu, kaya asam folat dan zat besi. Ideal untuk ibu hamil trimester 1-3 dan balita.',
      mealType: 'SNACK_PAGI',
      foodCategoryId: proteinNabati.id,
      servingSize: 250,
      costPerServing: 8000,
      cookingTime: 40,
      preparationTime: 10,
      difficulty: 'EASY',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [TargetGroup.PREGNANT_WOMAN, TargetGroup.TODDLER],
      calories: 320,
      protein: 12,
      carbohydrates: 55,
      fat: 6,
      fiber: 8,
      folicAcid: 180, // mcg - Good for PREGNANT_WOMAN (needs 600 total/day)
      iron: 4.2, // mg - Helps PREGNANT_WOMAN (needs 27 total/day)
      calcium: 120,
      vitaminA: 180,
      vitaminC: 8,
      allergens: ['Susu'],
      isVegetarian: true,
    },

    // Snack 2: Pisang Goreng Keju (Universal)
    {
      programId: pmtProgram.id,
      menuName: 'Pisang Goreng Keju Coklat',
      menuCode: 'PMT-S002',
      description:
        'Pisang raja goreng renyah dengan taburan keju cheddar dan coklat meses. Snack favorit yang kaya kalium dan kalsium.',
      mealType: 'SNACK_SORE',
      foodCategoryId: karbohidrat.id,
      servingSize: 150,
      costPerServing: 7000,
      cookingTime: 15,
      preparationTime: 10,
      difficulty: 'EASY',
      cookingMethod: 'FRY',
      compatibleTargetGroups: [], // Universal
      calories: 280,
      protein: 6,
      carbohydrates: 45,
      fat: 10,
      fiber: 4,
      calcium: 140, // From cheese
      vitaminA: 80,
      vitaminC: 12,
      allergens: ['Susu', 'Gandum'],
      isVegetarian: true,
    },

    // Snack 3: Lemper Ayam (for SCHOOL_CHILDREN, TEENAGE_GIRL)
    {
      programId: pmtProgram.id,
      menuName: 'Lemper Ayam Ketan',
      menuCode: 'PMT-S003',
      description:
        'Ketan putih dengan isian ayam suir bumbu kuning dibungkus daun pisang. Mengenyangkan dan kaya protein.',
      mealType: 'SNACK_PAGI',
      foodCategoryId: karbohidrat.id,
      servingSize: 120,
      costPerServing: 6000,
      cookingTime: 45,
      preparationTime: 20,
      difficulty: 'MEDIUM',
      cookingMethod: 'STEAM',
      compatibleTargetGroups: [TargetGroup.SCHOOL_CHILDREN, TargetGroup.TEENAGE_GIRL],
      calories: 260,
      protein: 10,
      carbohydrates: 48,
      fat: 4,
      fiber: 2,
      iron: 2.2, // For TEENAGE_GIRL
      calcium: 40,
      vitaminA: 60,
      vitaminC: 5,
      allergens: [],
      isVegetarian: false,
    },

    // Snack 4: Susu Kedelai + Roti (for ELDERLY, PREGNANT_WOMAN)
    {
      programId: pmtProgram.id,
      menuName: 'Susu Kedelai Hangat dengan Roti',
      menuCode: 'PMT-S004',
      description:
        'Susu kedelai segar hangat dengan gula aren dan roti tawar isi selai kacang. Tinggi kalsium untuk kesehatan tulang.',
      mealType: 'SNACK_PAGI',
      foodCategoryId: proteinNabati.id,
      servingSize: 300, // 250ml susu + 50g roti
      costPerServing: 8000,
      cookingTime: 15,
      preparationTime: 5,
      difficulty: 'EASY',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [TargetGroup.ELDERLY, TargetGroup.PREGNANT_WOMAN],
      calories: 280,
      protein: 14,
      carbohydrates: 38,
      fat: 8,
      fiber: 4,
      calcium: 280, // High for ELDERLY bone health
      vitaminD: 2.5, // mcg - For ELDERLY calcium absorption
      iron: 2.8,
      vitaminA: 120,
      vitaminC: 6,
      allergens: ['Kacang', 'Gandum'],
      isVegetarian: true,
    },

    // Snack 5: Bubur Sumsum (for TODDLER, ELDERLY)
    {
      programId: pmtProgram.id,
      menuName: 'Bubur Sumsum Kinca Gula Merah',
      menuCode: 'PMT-S005',
      description:
        'Bubur sumsum lembut dari tepung beras dengan kinca gula merah cair. Mudah dicerna untuk balita dan lansia.',
      mealType: 'SNACK_SORE',
      foodCategoryId: karbohidrat.id,
      servingSize: 200,
      costPerServing: 5000,
      cookingTime: 25,
      preparationTime: 10,
      difficulty: 'EASY',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [TargetGroup.TODDLER, TargetGroup.ELDERLY],
      calories: 220,
      protein: 4,
      carbohydrates: 48,
      fat: 2,
      fiber: 1,
      calcium: 60,
      iron: 1.8,
      vitaminA: 40,
      vitaminD: 1.2, // For TODDLER bone development
      allergens: [],
      isVegetarian: true,
    },

    // Snack 6: Klepon Isi Gula Merah (Universal)
    {
      programId: pmtProgram.id,
      menuName: 'Klepon Isi Gula Merah',
      menuCode: 'PMT-S006',
      description:
        'Klepon tepung ketan berisi gula merah cair, digulung kelapa parut. Jajanan tradisional yang manis dan mengenyangkan.',
      mealType: 'SNACK_SORE',
      foodCategoryId: karbohidrat.id,
      servingSize: 100, // 5 pieces
      costPerServing: 5000,
      cookingTime: 20,
      preparationTime: 15,
      difficulty: 'MEDIUM',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [],
      calories: 200,
      protein: 3,
      carbohydrates: 42,
      fat: 3,
      fiber: 2,
      calcium: 35,
      iron: 1.5,
      vitaminA: 20,
      vitaminC: 2,
      allergens: [],
      isVegetarian: true,
    },

    // Snack 7: Telur Rebus + Ubi Rebus (for PREGNANT_WOMAN, BREASTFEEDING_MOTHER)
    {
      programId: pmtProgram.id,
      menuName: 'Telur Rebus dengan Ubi Jalar Ungu',
      menuCode: 'PMT-S007',
      description:
        'Telur ayam rebus matang sempurna dengan ubi jalar ungu rebus. Kaya vitamin A, asam folat, dan protein untuk ibu hamil/menyusui.',
      mealType: 'SNACK_PAGI',
      foodCategoryId: proteinHewani.id,
      servingSize: 200, // 1 egg + 150g ubi
      costPerServing: 6000,
      cookingTime: 20,
      preparationTime: 5,
      difficulty: 'EASY',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [TargetGroup.PREGNANT_WOMAN, TargetGroup.BREASTFEEDING_MOTHER],
      calories: 240,
      protein: 10,
      carbohydrates: 38,
      fat: 6,
      fiber: 5,
      folicAcid: 120, // mcg - For PREGNANT_WOMAN
      iron: 2.4,
      calcium: 65,
      vitaminA: 820, // Very high! Good for BREASTFEEDING_MOTHER & TODDLER
      vitaminC: 18,
      vitaminD: 1.8,
      allergens: ['Telur'],
      isVegetarian: false,
    },

    // Snack 8: Kolak Pisang Ubi (for PREGNANT_WOMAN, TODDLER)
    {
      programId: pmtProgram.id,
      menuName: 'Kolak Pisang Ubi Santan',
      menuCode: 'PMT-S008',
      description:
        'Kolak pisang dan ubi dengan kuah santan gula merah hangat. Tinggi kalori dan kalium, baik untuk ibu hamil dan balita.',
      mealType: 'SNACK_SORE',
      foodCategoryId: karbohidrat.id,
      servingSize: 250,
      costPerServing: 7000,
      cookingTime: 30,
      preparationTime: 10,
      difficulty: 'EASY',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [TargetGroup.PREGNANT_WOMAN, TargetGroup.TODDLER],
      calories: 300,
      protein: 4,
      carbohydrates: 58,
      fat: 8,
      fiber: 6,
      folicAcid: 60,
      iron: 1.8,
      calcium: 80,
      vitaminA: 420, // From ubi
      vitaminC: 15,
      allergens: [],
      isVegetarian: true,
    },

    // Snack 9: Puding Susu Buah (for ALL vulnerable groups)
    {
      programId: pmtProgram.id,
      menuName: 'Puding Susu Buah Segar',
      menuCode: 'PMT-S009',
      description:
        'Puding susu vanilla lembut dengan topping buah segar (pepaya, pisang, jeruk). Kaya kalsium, vitamin C, dan mudah dicerna.',
      mealType: 'SNACK_SORE',
      foodCategoryId: proteinHewani.id,
      servingSize: 200,
      costPerServing: 8000,
      cookingTime: 20,
      preparationTime: 15,
      difficulty: 'EASY',
      cookingMethod: 'BOIL',
      compatibleTargetGroups: [
        TargetGroup.PREGNANT_WOMAN,
        TargetGroup.BREASTFEEDING_MOTHER,
        TargetGroup.TODDLER,
        TargetGroup.ELDERLY,
      ],
      calories: 260,
      protein: 8,
      carbohydrates: 42,
      fat: 6,
      fiber: 3,
      folicAcid: 40,
      calcium: 220, // High from milk
      iron: 1.2,
      vitaminA: 280,
      vitaminC: 45, // High from fruits
      vitaminD: 2.0,
      allergens: ['Susu'],
      isVegetarian: true,
    },
  ]

  const nutritionMenus: NutritionMenu[] = []

  for (const menu of menus) {
    const created = await prisma.nutritionMenu.upsert({
      where: {
        programId_menuCode: {
          programId: menu.programId,
          menuCode: menu.menuCode,
        },
      },
      update: {},
      create: {
        programId: menu.programId,
        menuName: menu.menuName,
        menuCode: menu.menuCode,
        description: menu.description,
        mealType: menu.mealType,
        foodCategoryId: menu.foodCategoryId,
        servingSize: menu.servingSize,
        costPerServing: menu.costPerServing,
        cookingTime: menu.cookingTime,
        preparationTime: menu.preparationTime,
        difficulty: menu.difficulty,
        cookingMethod: menu.cookingMethod,
        compatibleTargetGroups: menu.compatibleTargetGroups,
        // Special nutrients (stored directly in NutritionMenu for target groups)
        folicAcid: menu.folicAcid,
        iron: menu.iron,
        calcium: menu.calcium,
        vitaminA: menu.vitaminA,
        vitaminC: menu.vitaminC,
        vitaminD: menu.vitaminD,
        // Other attributes
        allergens: menu.allergens,
        isVegetarian: menu.isVegetarian,
        isHalal: true,
        isActive: true,
      },
    })

    nutritionMenus.push(created)
  }

  console.log(`  ✓ Created ${nutritionMenus.length} nutrition menus:`)
  console.log(`    - PMAS (Lunch): 12 menus (Rp 10,000-16,000 per meal)`)
  console.log(`    - PMT (Snack): 9 menus (Rp 5,000-8,000 per snack)`)
  console.log(`    - Universal menus: ${menus.filter((m) => m.compatibleTargetGroups.length === 0).length}`)
  console.log(
    `    - Target-specific: ${menus.filter((m) => m.compatibleTargetGroups.length > 0).length} (with special nutrients)`
  )
  console.log(`    - Vegetarian options: ${menus.filter((m) => m.isVegetarian).length}`)

  return nutritionMenus
}
