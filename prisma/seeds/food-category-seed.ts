/**
 * FoodCategory Seed File
 * 
 * Creates Indonesian food categories for nutrition program:
 * - Protein Hewani (Animal Protein)
 * - Protein Nabati (Plant Protein)
 * - Karbohidrat (Carbohydrates)
 * - Sayuran (Vegetables)
 * - Buah (Fruits)
 * - Lemak & Minyak (Fats & Oils)
 * - Susu & Produk Susu (Dairy Products)
 * - Bumbu & Rempah (Spices & Herbs)
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { PrismaClient, FoodCategory } from '@prisma/client'

/**
 * Food category data structure
 */
interface FoodCategoryData {
  categoryCode: string
  categoryName: string
  categoryNameEn: string
  description: string
  primaryNutrient: string
  servingSizeGram: number
  dailyServings: number
  colorCode: string
  iconName: string
  sortOrder: number
}

/**
 * Indonesian food categories configuration
 */
const FOOD_CATEGORIES: FoodCategoryData[] = [
  {
    categoryCode: 'PROTEIN-HEWANI',
    categoryName: 'Protein Hewani',
    categoryNameEn: 'Animal Protein',
    description: 'Sumber protein dari hewan seperti daging, ayam, ikan, telur, dan produk hewani lainnya. Penting untuk pertumbuhan dan perkembangan tubuh.',
    primaryNutrient: 'Protein',
    servingSizeGram: 100,
    dailyServings: 2,
    colorCode: '#EF4444', // Red
    iconName: 'meat',
    sortOrder: 1
  },
  {
    categoryCode: 'PROTEIN-NABATI',
    categoryName: 'Protein Nabati',
    categoryNameEn: 'Plant Protein',
    description: 'Sumber protein dari tumbuhan seperti tahu, tempe, kacang-kacangan, dan produk kedelai lainnya. Alternatif protein yang sehat dan ekonomis.',
    primaryNutrient: 'Protein',
    servingSizeGram: 100,
    dailyServings: 2,
    colorCode: '#22C55E', // Green
    iconName: 'soybean',
    sortOrder: 2
  },
  {
    categoryCode: 'KARBOHIDRAT',
    categoryName: 'Karbohidrat',
    categoryNameEn: 'Carbohydrates',
    description: 'Sumber energi utama seperti nasi, roti, mie, kentang, dan biji-bijian. Memberikan tenaga untuk aktivitas sehari-hari.',
    primaryNutrient: 'Karbohidrat',
    servingSizeGram: 150,
    dailyServings: 3,
    colorCode: '#F59E0B', // Amber
    iconName: 'rice',
    sortOrder: 3
  },
  {
    categoryCode: 'SAYURAN',
    categoryName: 'Sayuran',
    categoryNameEn: 'Vegetables',
    description: 'Sayur-sayuran segar yang kaya vitamin, mineral, dan serat. Penting untuk pencernaan dan kesehatan tubuh.',
    primaryNutrient: 'Vitamin & Mineral',
    servingSizeGram: 100,
    dailyServings: 3,
    colorCode: '#10B981', // Emerald
    iconName: 'vegetable',
    sortOrder: 4
  },
  {
    categoryCode: 'BUAH',
    categoryName: 'Buah-buahan',
    categoryNameEn: 'Fruits',
    description: 'Buah-buahan segar yang kaya vitamin C, serat, dan antioksidan. Membantu meningkatkan daya tahan tubuh.',
    primaryNutrient: 'Vitamin C',
    servingSizeGram: 100,
    dailyServings: 2,
    colorCode: '#EC4899', // Pink
    iconName: 'fruit',
    sortOrder: 5
  },
  {
    categoryCode: 'SUSU-PRODUK',
    categoryName: 'Susu & Produk Susu',
    categoryNameEn: 'Dairy Products',
    description: 'Susu dan produk olahannya seperti keju, yogurt. Sumber kalsium yang baik untuk tulang dan gigi.',
    primaryNutrient: 'Kalsium',
    servingSizeGram: 200,
    dailyServings: 2,
    colorCode: '#3B82F6', // Blue
    iconName: 'milk',
    sortOrder: 6
  },
  {
    categoryCode: 'LEMAK-MINYAK',
    categoryName: 'Lemak & Minyak',
    categoryNameEn: 'Fats & Oils',
    description: 'Minyak goreng, mentega, margarin, dan sumber lemak lainnya. Digunakan secukupnya untuk memasak.',
    primaryNutrient: 'Lemak',
    servingSizeGram: 10,
    dailyServings: 3,
    colorCode: '#FBBF24', // Yellow
    iconName: 'oil',
    sortOrder: 7
  },
  {
    categoryCode: 'BUMBU-REMPAH',
    categoryName: 'Bumbu & Rempah',
    categoryNameEn: 'Spices & Herbs',
    description: 'Bumbu dapur dan rempah-rempah untuk memberi rasa dan aroma pada masakan. Seperti bawang, cabai, kunyit, jahe, dll.',
    primaryNutrient: 'Fitokimia',
    servingSizeGram: 20,
    dailyServings: 3,
    colorCode: '#8B5CF6', // Purple
    iconName: 'spice',
    sortOrder: 8
  },
  {
    categoryCode: 'GULA-PEMANIS',
    categoryName: 'Gula & Pemanis',
    categoryNameEn: 'Sugar & Sweeteners',
    description: 'Gula pasir, gula merah, madu, dan pemanis lainnya. Digunakan secukupnya untuk memberi rasa manis.',
    primaryNutrient: 'Karbohidrat Sederhana',
    servingSizeGram: 10,
    dailyServings: 2,
    colorCode: '#F97316', // Orange
    iconName: 'sugar',
    sortOrder: 9
  },
  {
    categoryCode: 'MINUMAN',
    categoryName: 'Minuman',
    categoryNameEn: 'Beverages',
    description: 'Minuman seperti air putih, teh, jus buah, dan minuman lainnya. Air putih sangat penting untuk hidrasi.',
    primaryNutrient: 'Air',
    servingSizeGram: 250,
    dailyServings: 8,
    colorCode: '#06B6D4', // Cyan
    iconName: 'drink',
    sortOrder: 10
  }
]

/**
 * Seed FoodCategory entities
 * 
 * Creates Indonesian food categories for nutrition program.
 * Categories are used to organize inventory items and nutrition menus.
 * 
 * @param prisma - Prisma Client instance
 * @returns Promise<FoodCategory[]> - Array of created FoodCategory entities
 * 
 * @example
 * ```typescript
 * const categories = await seedFoodCategory(prisma)
 * console.log(categories.length) // 10 categories
 * ```
 */
export async function seedFoodCategory(
  prisma: PrismaClient
): Promise<FoodCategory[]> {
  console.log('  → Creating Indonesian Food Categories...')

  const categories = await Promise.all(
    FOOD_CATEGORIES.map(async (categoryData) => {
      const category = await prisma.foodCategory.upsert({
        where: {
          categoryCode: categoryData.categoryCode
        },
        update: {},
        create: {
          categoryCode: categoryData.categoryCode,
          categoryName: categoryData.categoryName,
          categoryNameEn: categoryData.categoryNameEn,
          description: categoryData.description,
          primaryNutrient: categoryData.primaryNutrient,
          servingSizeGram: categoryData.servingSizeGram,
          dailyServings: categoryData.dailyServings,
          colorCode: categoryData.colorCode,
          iconName: categoryData.iconName,
          sortOrder: categoryData.sortOrder,
          isActive: true
        }
      })

      console.log(`    ✓ ${category.categoryName} (${category.categoryCode})`)
      return category
    })
  )

  console.log(`  ✓ Created ${categories.length} food categories`)
  console.log(`    Categories: Protein Hewani, Protein Nabati, Karbohidrat, Sayuran, Buah, Susu, Lemak, Bumbu, Gula, Minuman`)

  return categories
}
