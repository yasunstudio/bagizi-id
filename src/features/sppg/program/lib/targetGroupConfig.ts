/**
 * @fileoverview Target Group Configuration untuk Beneficiary Enrollment Form
 * Setiap target group punya field yang berbeda sesuai kebutuhan spesifik mereka
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { TargetGroup } from '@prisma/client'

/**
 * Target Group Display Configuration
 */
export const TARGET_GROUP_CONFIG = {
  SCHOOL_CHILDREN: {
    label: 'Anak Sekolah',
    description: 'Siswa SD, SMP, SMA yang menerima makanan tambahan',
    icon: '🎓',
    color: 'blue',
    beneficiaryLabel: 'Jumlah Siswa',
    ageBreakdownLabel: 'Distribusi Tingkat Pendidikan',
    ageRanges: [
      { key: 'elementaryStudents', label: 'SD (6-12 tahun)' },
      { key: 'juniorHighStudents', label: 'SMP (13-15 tahun)' },
      { key: 'seniorHighStudents', label: 'SMA (16-18 tahun)' },
    ],
    mealTypes: [
      { value: 'BREAKFAST', label: 'Sarapan' },
      { value: 'SNACK', label: 'Makanan Tambahan' },
      { value: 'LUNCH', label: 'Makan Siang' },
    ],
    feedingSchedule: {
      defaultDays: 5, // Senin-Jumat
      defaultMealsPerDay: 1,
      suggestedTimes: {
        breakfast: '07:00',
        lunch: '12:00',
        snack: '10:00',
      }
    },
    specialFields: [
      'className', // Kelas
      'grade', // Tingkat
      'academicYear', // Tahun Ajaran
      'schoolType', // Jenis Sekolah (SD/SMP/SMA)
    ]
  },

  PREGNANT_WOMAN: {
    label: 'Ibu Hamil',
    description: 'Ibu hamil yang memerlukan asupan gizi tambahan',
    icon: '🤰',
    color: 'pink',
    beneficiaryLabel: 'Jumlah Ibu Hamil',
    ageBreakdownLabel: 'Distribusi Usia Kehamilan',
    ageRanges: [
      { key: 'firstTrimester', label: 'Trimester 1 (0-3 bulan)' },
      { key: 'secondTrimester', label: 'Trimester 2 (4-6 bulan)' },
      { key: 'thirdTrimester', label: 'Trimester 3 (7-9 bulan)' },
    ],
    mealTypes: [
      { value: 'BREAKFAST', label: 'Sarapan' },
      { value: 'LUNCH', label: 'Makan Siang' },
      { value: 'SNACK', label: 'Kudapan Sehat' },
    ],
    feedingSchedule: {
      defaultDays: 7, // Setiap hari
      defaultMealsPerDay: 2,
      suggestedTimes: {
        breakfast: '08:00',
        lunch: '12:00',
        snack: '15:00',
      }
    },
    specialFields: [
      'gestationalAge', // Usia Kehamilan
      'riskLevel', // Tingkat Risiko
      'nutritionStatus', // Status Gizi
      'checkupSchedule', // Jadwal Pemeriksaan
      'supplementsNeeded', // Suplemen yang Dibutuhkan
    ]
  },

  BREASTFEEDING_MOTHER: {
    label: 'Ibu Menyusui',
    description: 'Ibu menyusui yang memerlukan gizi untuk produksi ASI',
    icon: '🤱',
    color: 'purple',
    beneficiaryLabel: 'Jumlah Ibu Menyusui',
    ageBreakdownLabel: 'Distribusi Usia Bayi',
    ageRanges: [
      { key: 'babyAge0to6Months', label: 'Bayi 0-6 bulan (ASI Eksklusif)' },
      { key: 'babyAge6to12Months', label: 'Bayi 6-12 bulan (ASI + MPASI)' },
      { key: 'babyAge12to24Months', label: 'Bayi 12-24 bulan (ASI Lanjutan)' },
    ],
    mealTypes: [
      { value: 'BREAKFAST', label: 'Sarapan' },
      { value: 'LUNCH', label: 'Makan Siang' },
      { value: 'DINNER', label: 'Makan Malam' },
      { value: 'SNACK', label: 'Kudapan Sehat' },
    ],
    feedingSchedule: {
      defaultDays: 7, // Setiap hari
      defaultMealsPerDay: 3,
      suggestedTimes: {
        breakfast: '07:00',
        lunch: '12:00',
        dinner: '18:00',
        snack: '10:00',
      }
    },
    specialFields: [
      'babyAge', // Usia Bayi
      'breastfeedingExclusive', // ASI Eksklusif
      'lactationSupport', // Dukungan Laktasi
      'nutritionCounseling', // Konseling Gizi
    ]
  },

  TODDLER: {
    label: 'Balita',
    description: 'Anak usia 0-5 tahun yang memerlukan gizi untuk pertumbuhan',
    icon: '👶',
    color: 'green',
    beneficiaryLabel: 'Jumlah Balita',
    ageBreakdownLabel: 'Distribusi Usia Balita',
    ageRanges: [
      { key: 'age0to2Years', label: 'Baduta (0-2 tahun)' },
      { key: 'age2to5Years', label: 'Balita (2-5 tahun)' },
    ],
    mealTypes: [
      { value: 'BREAKFAST', label: 'Sarapan' },
      { value: 'LUNCH', label: 'Makan Siang' },
      { value: 'SNACK', label: 'Kudapan' },
    ],
    feedingSchedule: {
      defaultDays: 7, // Setiap hari
      defaultMealsPerDay: 2,
      suggestedTimes: {
        breakfast: '08:00',
        lunch: '12:00',
        snack: '15:00',
      }
    },
    specialFields: [
      'growthMonitoring', // Pemantauan Pertumbuhan
      'vaccinationStatus', // Status Imunisasi
      'stunting Status', // Status Stunting
      'developmentalMilestones', // Milestone Perkembangan
      'mpasi Type', // Jenis MPASI
    ]
  },

  TEENAGE_GIRL: {
    label: 'Remaja Putri',
    description: 'Remaja putri usia 12-18 tahun yang memerlukan gizi khusus',
    icon: '👧',
    color: 'orange',
    beneficiaryLabel: 'Jumlah Remaja Putri',
    ageBreakdownLabel: 'Distribusi Usia',
    ageRanges: [
      { key: 'age10to14', label: 'Remaja Awal (10-14 tahun)' },
      { key: 'age15to19', label: 'Remaja Akhir (15-19 tahun)' },
    ],
    mealTypes: [
      { value: 'BREAKFAST', label: 'Sarapan' },
      { value: 'LUNCH', label: 'Makan Siang' },
      { value: 'SNACK', label: 'Makanan Tambahan' },
    ],
    feedingSchedule: {
      defaultDays: 5, // Senin-Jumat (sekolah)
      defaultMealsPerDay: 1,
      suggestedTimes: {
        breakfast: '07:00',
        lunch: '12:00',
        snack: '10:00',
      }
    },
    specialFields: [
      'ironSupplementation', // Suplementasi Zat Besi
      'anemiaScreening', // Skrining Anemia
      'menstrualHealth', // Kesehatan Menstruasi
      'nutritionEducation', // Edukasi Gizi
    ]
  },

  ELDERLY: {
    label: 'Lansia',
    description: 'Lansia usia 60+ tahun yang memerlukan gizi khusus',
    icon: '👴',
    color: 'gray',
    beneficiaryLabel: 'Jumlah Lansia',
    ageBreakdownLabel: 'Distribusi Usia Lansia',
    ageRanges: [
      { key: 'age60to69', label: '60-69 tahun (Lansia Awal)' },
      { key: 'age70to79', label: '70-79 tahun (Lansia Madya)' },
      { key: 'age80Plus', label: '80+ tahun (Lansia Akhir)' },
    ],
    mealTypes: [
      { value: 'BREAKFAST', label: 'Sarapan' },
      { value: 'LUNCH', label: 'Makan Siang' },
      { value: 'DINNER', label: 'Makan Malam' },
    ],
    feedingSchedule: {
      defaultDays: 7, // Setiap hari
      defaultMealsPerDay: 2,
      suggestedTimes: {
        breakfast: '08:00',
        lunch: '12:00',
        dinner: '18:00',
      }
    },
    specialFields: [
      'chronicDiseases', // Penyakit Kronis
      'medicationSchedule', // Jadwal Obat
      'mobilityStatus', // Status Mobilitas
      'chewingDifficulty', // Kesulitan Mengunyah
      'specialDiet', // Diet Khusus
    ]
  },
} as const

/**
 * Get configuration for specific target group
 */
export function getTargetGroupConfig(targetGroup: TargetGroup) {
  return TARGET_GROUP_CONFIG[targetGroup] || TARGET_GROUP_CONFIG.SCHOOL_CHILDREN
}

/**
 * Get label for target group
 */
export function getTargetGroupLabel(targetGroup: TargetGroup): string {
  return TARGET_GROUP_CONFIG[targetGroup]?.label || targetGroup
}

/**
 * Get all target group options for select dropdown
 */
export function getTargetGroupOptions() {
  return Object.entries(TARGET_GROUP_CONFIG).map(([value, config]) => ({
    value: value as TargetGroup,
    label: config.label,
    description: config.description,
    icon: config.icon,
  }))
}

/**
 * Validate age range fields based on target group
 */
export function getRelevantAgeFields(targetGroup: TargetGroup): string[] {
  const config = TARGET_GROUP_CONFIG[targetGroup]
  return config.ageRanges.map(range => range.key)
}
