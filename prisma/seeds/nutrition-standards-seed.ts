/**
 * @fileoverview Nutrition Standards Seed Data
 * @version Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * Nutrition standards based on:
 * - Angka Kecukupan Gizi (AKG) Indonesia 2019
 * - WHO/FAO nutrition guidelines
 * - Indonesian Ministry of Health recommendations
 */

import { PrismaClient, TargetGroup, AgeGroup, Gender, ActivityLevel } from '@prisma/client'

/**
 * Seed NutritionStandard table with comprehensive nutrition requirements
 * for all target groups and age ranges
 */
export async function seedNutritionStandards(prisma: PrismaClient) {
  console.log('  → Creating Nutrition Standards...')

  const standards = [
    // ==================== SCHOOL_CHILDREN ====================
    // Anak Sekolah 6-12 tahun (SD) - Laki-laki
    {
      targetGroup: TargetGroup.SCHOOL_CHILDREN,
      ageGroup: AgeGroup.ANAK_6_12,
      gender: Gender.MALE,
      activityLevel: ActivityLevel.MODERATE,
      calories: 1850,
      protein: 49,
      carbohydrates: 254,
      fat: 62,
      fiber: 26,
      calcium: 1000,
      iron: 10,
      vitaminA: 500,
      vitaminC: 45,
      vitaminD: 15,
      vitaminE: 7,
      folate: 300,
      zinc: 11,
      caloriesMin: 1700,
      caloriesMax: 2000,
      proteinMin: 45,
      proteinMax: 55,
      source: 'AKG Indonesia 2019',
      referenceYear: 2019,
      notes: 'Anak laki-laki usia sekolah dasar (6-12 tahun) dengan aktivitas sedang',
      isActive: true,
    },
    // Anak Sekolah 6-12 tahun (SD) - Perempuan
    {
      targetGroup: TargetGroup.SCHOOL_CHILDREN,
      ageGroup: AgeGroup.ANAK_6_12,
      gender: Gender.FEMALE,
      activityLevel: ActivityLevel.MODERATE,
      calories: 1700,
      protein: 49,
      carbohydrates: 233,
      fat: 57,
      fiber: 23,
      calcium: 1000,
      iron: 10,
      vitaminA: 500,
      vitaminC: 45,
      vitaminD: 15,
      vitaminE: 7,
      folate: 300,
      zinc: 11,
      caloriesMin: 1550,
      caloriesMax: 1850,
      proteinMin: 45,
      proteinMax: 55,
      source: 'AKG Indonesia 2019',
      referenceYear: 2019,
      notes: 'Anak perempuan usia sekolah dasar (6-12 tahun) dengan aktivitas sedang',
      isActive: true,
    },

    // Remaja 13-18 tahun (SMP & SMA) - Laki-laki
    {
      targetGroup: TargetGroup.SCHOOL_CHILDREN,
      ageGroup: AgeGroup.REMAJA_13_18,
      gender: Gender.MALE,
      activityLevel: ActivityLevel.MODERATE,
      calories: 2100,
      protein: 56,
      carbohydrates: 289,
      fat: 70,
      fiber: 30,
      calcium: 1200,
      iron: 13,
      vitaminA: 600,
      vitaminC: 50,
      vitaminD: 15,
      vitaminE: 11,
      folate: 400,
      zinc: 14,
      caloriesMin: 1950,
      caloriesMax: 2250,
      proteinMin: 50,
      proteinMax: 60,
      source: 'AKG Indonesia 2019',
      referenceYear: 2019,
      notes: 'Remaja laki-laki SMP & SMA (13-18 tahun) dengan aktivitas sedang',
      isActive: true,
    },
    // Remaja 13-18 tahun (SMP & SMA) - Perempuan
    {
      targetGroup: TargetGroup.SCHOOL_CHILDREN,
      ageGroup: AgeGroup.REMAJA_13_18,
      gender: Gender.FEMALE,
      activityLevel: ActivityLevel.MODERATE,
      calories: 2000,
      protein: 60,
      carbohydrates: 275,
      fat: 67,
      fiber: 28,
      calcium: 1200,
      iron: 20,
      vitaminA: 600,
      vitaminC: 50,
      vitaminD: 15,
      vitaminE: 11,
      folate: 400,
      zinc: 13,
      caloriesMin: 1850,
      caloriesMax: 2150,
      proteinMin: 55,
      proteinMax: 65,
      source: 'AKG Indonesia 2019',
      referenceYear: 2019,
      notes: 'Remaja perempuan SMP & SMA (13-18 tahun) dengan aktivitas sedang',
      isActive: true,
    },

    // ==================== PREGNANT_WOMAN ====================
    // Ibu Hamil (Usia Dewasa 19-59 tahun)
    {
      targetGroup: TargetGroup.PREGNANT_WOMAN,
      ageGroup: AgeGroup.DEWASA_19_59,
      gender: Gender.FEMALE,
      activityLevel: ActivityLevel.MODERATE,
      calories: 2280, // +180 kal dari baseline 2100
      protein: 76, // +20g dari baseline 56g
      carbohydrates: 313,
      fat: 76,
      fiber: 32,
      calcium: 1200,
      iron: 27, // Peningkatan signifikan untuk hemoglobin
      vitaminA: 900,
      vitaminC: 85,
      vitaminD: 15,
      vitaminE: 15,
      folate: 600, // Sangat penting untuk mencegah neural tube defects
      zinc: 12,
      caloriesMin: 2150,
      caloriesMax: 2400,
      proteinMin: 70,
      proteinMax: 85,
      source: 'AKG Indonesia 2019 untuk Ibu Hamil',
      referenceYear: 2019,
      notes: 'Ibu hamil trimester 1 dengan tambahan 180 kkal dan peningkatan protein, zat besi, folat',
      isActive: true,
    },

    // Ibu Hamil Trimester 2 (14-26 minggu)
    {
      targetGroup: TargetGroup.PREGNANT_WOMAN,
      ageGroup: AgeGroup.DEWASA_19_59,
      gender: Gender.FEMALE,
      activityLevel: ActivityLevel.LIGHT,
      calories: 2430, // +330 kal dari baseline
      protein: 76,
      carbohydrates: 334,
      fat: 81,
      fiber: 34,
      calcium: 1200,
      iron: 27,
      vitaminA: 900,
      vitaminC: 85,
      vitaminD: 15,
      vitaminE: 15,
      folate: 600,
      zinc: 12,
      caloriesMin: 2300,
      caloriesMax: 2550,
      proteinMin: 70,
      proteinMax: 85,
      source: 'AKG Indonesia 2019 untuk Ibu Hamil',
      referenceYear: 2019,
      notes: 'Ibu hamil trimester 2 dengan tambahan 330 kkal untuk pertumbuhan janin',
      isActive: true,
    },

    // Ibu Hamil Trimester 3 (27-40 minggu)
    {
      targetGroup: TargetGroup.PREGNANT_WOMAN,
      ageGroup: AgeGroup.DEWASA_19_59,
      gender: Gender.FEMALE,
      activityLevel: ActivityLevel.LIGHT,
      calories: 2430, // +330 kal
      protein: 76,
      carbohydrates: 334,
      fat: 81,
      fiber: 34,
      calcium: 1200,
      iron: 27,
      vitaminA: 900,
      vitaminC: 85,
      vitaminD: 15,
      vitaminE: 15,
      folate: 600,
      zinc: 12,
      caloriesMin: 2300,
      caloriesMax: 2550,
      proteinMin: 70,
      proteinMax: 85,
      source: 'AKG Indonesia 2019 untuk Ibu Hamil',
      referenceYear: 2019,
      notes: 'Ibu hamil trimester 3 dengan kebutuhan tinggi untuk persiapan persalinan',
      isActive: true,
    },

    // ==================== BREASTFEEDING_MOTHER ====================
    // Ibu Menyusui 0-6 bulan (ASI Eksklusif)
    {
      targetGroup: TargetGroup.BREASTFEEDING_MOTHER,
      ageGroup: AgeGroup.DEWASA_19_59,
      gender: Gender.FEMALE,
      activityLevel: ActivityLevel.MODERATE,
      calories: 2630, // +530 kal dari baseline untuk produksi ASI
      protein: 76, // +20g
      carbohydrates: 361,
      fat: 88,
      fiber: 37,
      calcium: 1200,
      iron: 32, // Peningkatan untuk recovery postpartum
      vitaminA: 1300,
      vitaminC: 120,
      vitaminD: 15,
      vitaminE: 19,
      folate: 500,
      zinc: 14,
      caloriesMin: 2500,
      caloriesMax: 2750,
      proteinMin: 70,
      proteinMax: 85,
      source: 'AKG Indonesia 2019 untuk Ibu Menyusui',
      referenceYear: 2019,
      notes: 'Ibu menyusui 0-6 bulan dengan kebutuhan tinggi untuk produksi ASI eksklusif',
      isActive: true,
    },

    // Ibu Menyusui 7-12 bulan (ASI + MPASI)
    {
      targetGroup: TargetGroup.BREASTFEEDING_MOTHER,
      ageGroup: AgeGroup.DEWASA_19_59,
      gender: Gender.FEMALE,
      activityLevel: ActivityLevel.MODERATE,
      calories: 2500, // +400 kal
      protein: 76,
      carbohydrates: 343,
      fat: 83,
      fiber: 35,
      calcium: 1200,
      iron: 32,
      vitaminA: 1300,
      vitaminC: 120,
      vitaminD: 15,
      vitaminE: 19,
      folate: 500,
      zinc: 14,
      caloriesMin: 2350,
      caloriesMax: 2650,
      proteinMin: 70,
      proteinMax: 85,
      source: 'AKG Indonesia 2019 untuk Ibu Menyusui',
      referenceYear: 2019,
      notes: 'Ibu menyusui 7-12 bulan dengan bayi yang sudah mendapat MPASI',
      isActive: true,
    },

    // ==================== TODDLER ====================
    // Balita 1-3 tahun
    {
      targetGroup: TargetGroup.TODDLER,
      ageGroup: AgeGroup.BALITA_2_5,
      gender: null, // Tidak dibedakan untuk balita
      activityLevel: ActivityLevel.MODERATE,
      calories: 1350,
      protein: 26,
      carbohydrates: 215,
      fat: 45,
      fiber: 19,
      calcium: 650,
      iron: 8,
      vitaminA: 400,
      vitaminC: 40,
      vitaminD: 15,
      vitaminE: 6,
      folate: 160,
      zinc: 4,
      caloriesMin: 1200,
      caloriesMax: 1500,
      proteinMin: 20,
      proteinMax: 30,
      source: 'AKG Indonesia 2019',
      referenceYear: 2019,
      notes: 'Balita 1-3 tahun dalam masa pertumbuhan aktif',
      isActive: true,
    },

    // Balita 4-6 tahun (Pra-sekolah)
    {
      targetGroup: TargetGroup.TODDLER,
      ageGroup: AgeGroup.ANAK_6_12,
      gender: null,
      activityLevel: ActivityLevel.MODERATE,
      calories: 1400,
      protein: 35,
      carbohydrates: 220,
      fat: 50,
      fiber: 20,
      calcium: 1000,
      iron: 9,
      vitaminA: 450,
      vitaminC: 45,
      vitaminD: 15,
      vitaminE: 7,
      folate: 200,
      zinc: 5,
      caloriesMin: 1250,
      caloriesMax: 1550,
      proteinMin: 30,
      proteinMax: 40,
      source: 'AKG Indonesia 2019',
      referenceYear: 2019,
      notes: 'Balita 4-6 tahun (pra-sekolah) dengan aktivitas sedang',
      isActive: true,
    },

    // ==================== ELDERLY ====================
    // Lansia 60-64 tahun
    {
      targetGroup: TargetGroup.ELDERLY,
      ageGroup: AgeGroup.LANSIA_60_PLUS,
      gender: Gender.MALE,
      activityLevel: ActivityLevel.LIGHT,
      calories: 1900,
      protein: 64,
      carbohydrates: 261,
      fat: 63,
      fiber: 27,
      calcium: 1000,
      iron: 10,
      vitaminA: 600,
      vitaminC: 90,
      vitaminD: 20, // Peningkatan untuk kesehatan tulang
      vitaminE: 15,
      folate: 400,
      zinc: 13,
      caloriesMin: 1750,
      caloriesMax: 2050,
      proteinMin: 60,
      proteinMax: 70,
      source: 'AKG Indonesia 2019',
      referenceYear: 2019,
      notes: 'Lansia laki-laki 60-64 tahun dengan aktivitas ringan',
      isActive: true,
    },
    {
      targetGroup: TargetGroup.ELDERLY,
      ageGroup: AgeGroup.LANSIA_60_PLUS,
      gender: Gender.FEMALE,
      activityLevel: ActivityLevel.LIGHT,
      calories: 1550,
      protein: 58,
      carbohydrates: 213,
      fat: 52,
      fiber: 22,
      calcium: 1000,
      iron: 10,
      vitaminA: 600,
      vitaminC: 75,
      vitaminD: 20,
      vitaminE: 15,
      folate: 400,
      zinc: 10,
      caloriesMin: 1400,
      caloriesMax: 1700,
      proteinMin: 55,
      proteinMax: 65,
      source: 'AKG Indonesia 2019',
      referenceYear: 2019,
      notes: 'Lansia perempuan 60-64 tahun dengan aktivitas ringan',
      isActive: true,
    },

    // Lansia 65+ tahun
    {
      targetGroup: TargetGroup.ELDERLY,
      ageGroup: AgeGroup.LANSIA_60_PLUS,
      gender: Gender.MALE,
      activityLevel: ActivityLevel.LIGHT,
      calories: 1800,
      protein: 62,
      carbohydrates: 247,
      fat: 60,
      fiber: 25,
      calcium: 1200, // Peningkatan untuk pencegahan osteoporosis
      iron: 10,
      vitaminA: 600,
      vitaminC: 90,
      vitaminD: 20,
      vitaminE: 15,
      folate: 400,
      zinc: 13,
      caloriesMin: 1650,
      caloriesMax: 1950,
      proteinMin: 58,
      proteinMax: 68,
      source: 'AKG Indonesia 2019',
      referenceYear: 2019,
      notes: 'Lansia laki-laki 65+ tahun dengan perhatian khusus pada protein dan kalsium',
      isActive: true,
    },
    {
      targetGroup: TargetGroup.ELDERLY,
      ageGroup: AgeGroup.LANSIA_60_PLUS,
      gender: Gender.FEMALE,
      activityLevel: ActivityLevel.LIGHT,
      calories: 1500,
      protein: 56,
      carbohydrates: 206,
      fat: 50,
      fiber: 21,
      calcium: 1200,
      iron: 10,
      vitaminA: 600,
      vitaminC: 75,
      vitaminD: 20,
      vitaminE: 15,
      folate: 400,
      zinc: 10,
      caloriesMin: 1350,
      caloriesMax: 1650,
      proteinMin: 52,
      proteinMax: 62,
      source: 'AKG Indonesia 2019',
      referenceYear: 2019,
      notes: 'Lansia perempuan 65+ tahun dengan risiko osteoporosis',
      isActive: true,
    },

  ]

  let createdCount = 0
  let updatedCount = 0

  for (const standard of standards) {
    // Find existing record - use separate logic for null vs non-null gender
    const existing = await prisma.nutritionStandard.findFirst({
      where: {
        targetGroup: standard.targetGroup,
        ageGroup: standard.ageGroup,
        gender: standard.gender,
        activityLevel: standard.activityLevel,
      },
    })

    if (existing) {
      await prisma.nutritionStandard.update({
        where: { id: existing.id },
        data: standard,
      })
      updatedCount++
    } else {
      await prisma.nutritionStandard.create({
        data: standard,
      })
      createdCount++
    }
  }

  console.log(`  ✓ Nutrition Standards: ${createdCount} created, ${updatedCount} updated`)
  console.log(`  ℹ Total standards: ${standards.length}`)
}
