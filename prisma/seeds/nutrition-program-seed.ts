/**
 * @fileoverview Nutrition Program Seed - Program gizi nasional Demo SPPG 2025
 * @version Prisma 6.19.0
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 *
 * Creates 2 main nutrition programs for Demo SPPG Purwakarta:
 * 1. PMAS (Program Makanan Sekolah) - Lunch for school children
 * 2. PMT (Pemberian Makanan Tambahan) - Snacks for vulnerable groups
 */

import { PrismaClient, SPPG, NutritionProgram, ProgramType, TargetGroup, BudgetSource } from '@prisma/client'

/**
 * Seed nutrition programs (2 comprehensive programs)
 * Based on real Indonesian government nutrition programs
 */
export async function seedNutritionProgram(prisma: PrismaClient, sppg: SPPG): Promise<NutritionProgram[]> {
  console.log('  → Creating Nutrition Programs (2 programs)...')

  const programs: NutritionProgram[] = []

  // Program 1: PMAS - Makan Siang Sekolah (School Lunch Program)
  const pmas = await prisma.nutritionProgram.upsert({
    where: {
      programCode: 'PMAS-PWK-2025',
    },
    update: {},
    create: {
      sppgId: sppg.id,
      name: 'Program Makan Siang Anak Sekolah (PMAS) Purwakarta 2025',
      description:
        'Program pemberian makan siang gratis untuk siswa SD/MI di Kabupaten Purwakarta. ' +
        'Menyediakan 1 porsi makan siang bergizi lengkap setiap hari sekolah untuk mendukung ' +
        'tumbuh kembang optimal anak usia sekolah dasar.',
      programCode: 'PMAS-PWK-2025',
      programType: ProgramType.FREE_NUTRITIOUS_MEAL, // MBG (Makan Bergizi Gratis)

      // ✅ SIMPLIFIED (Nov 11, 2025): Single-target = array with 1 item
      allowedTargetGroups: [TargetGroup.SCHOOL_CHILDREN],

      // Program Period (Full year 2025)
      startDate: new Date('2025-01-02'), // After New Year holiday
      endDate: new Date('2025-12-19'), // Before Christmas holiday

      // Feeding Schedule (Weekdays only)
      feedingDays: [1, 2, 3, 4, 5], // Monday to Friday
      mealsPerDay: 1, // Lunch only

      // ✅ UPDATED (Nov 12, 2025): Budget & Recipients with government compliance
      totalBudget: 250000000 * 12, // Rp 250M/month x 12 months = Rp 3B/year
      budgetPerMeal: 15000, // Rp 15,000 per meal (government standard)
      budgetSource: BudgetSource.APBN_PUSAT, // Funded by central government
      budgetYear: 2025, // Fiscal year
      
      // DPA (Dokumen Pelaksanaan Anggaran)
      dpaNumber: 'DPA-024.01.2025.PMAS.PWK',
      dpaDate: new Date('2024-12-15'),
      apbnProgramCode: '024.01.2025.123.PMAS',
      
      // Budget Decree (SK Penetapan Anggaran)
      budgetDecreeNumber: 'SK-MENKEU/2025/001/PMAS-PWK',
      budgetDecreeDate: new Date('2024-12-20'),
      budgetDecreeUrl: 'https://storage.bagizi.id/documents/sk-pmas-pwk-2025.pdf',
      
      // ✅ Budget breakdown (sesuai regulasi: total = 3B)
      foodBudget: 2100000000, // 70% - Rp 2.1B (bahan makanan)
      operationalBudget: 450000000, // 15% - Rp 450M (operasional dapur)
      transportBudget: 210000000, // 7% - Rp 210M (distribusi ke sekolah)
      utilityBudget: 90000000, // 3% - Rp 90M (listrik, air, gas)
      staffBudget: 120000000, // 4% - Rp 120M (gaji tenaga)
      otherBudget: 30000000, // 1% - Rp 30M (lain-lain)
      
      // Approval & audit trail
      budgetApprovedBy: null, // Will be set by system after approval
      budgetApprovedAt: null,
      budgetApprovalNotes: 'Program telah disetujui sesuai SK Menkeu. Prioritas tinggi untuk pencegahan stunting.',
      
      targetRecipients: 5000, // 5,000 students across Purwakarta
      currentRecipients: 4850, // 97% enrollment rate

      // Implementation Area
      implementationArea: 'Kabupaten Purwakarta - 10 Sekolah Dasar Piloting',

      // Status
      status: 'ACTIVE',
    },
  })
  programs.push(pmas)

  // Program 2: PMT - Makanan Tambahan untuk Kelompok Rentan
  const pmt = await prisma.nutritionProgram.upsert({
    where: {
      programCode: 'PMT-PWK-2025',
    },
    update: {},
    create: {
      sppgId: sppg.id,
      name: 'Program Makanan Tambahan (PMT) Kelompok Rentan Purwakarta 2025',
      description:
        'Program pemberian makanan tambahan (PMT) berupa snack bergizi untuk kelompok rentan: ' +
        'ibu hamil, ibu menyusui, balita, dan remaja putri. Program ini fokus pada pencegahan stunting ' +
        'dan perbaikan status gizi kelompok prioritas di Kabupaten Purwakarta.',
      programCode: 'PMT-PWK-2025',
      programType: ProgramType.STUNTING_INTERVENTION, // PMT focuses on stunting prevention

      // ✅ FIXED (Nov 12, 2025): Removed TEENAGE_GIRL for consistency
      // REASON: Schools should use SCHOOL_CHILDREN target group
      // TEENAGE_GIRL kept only for community-based programs (Posyandu/Puskesmas)
      allowedTargetGroups: [
        TargetGroup.PREGNANT_WOMAN,
        TargetGroup.BREASTFEEDING_MOTHER,
        TargetGroup.TODDLER,
        TargetGroup.ELDERLY, // Added elderly for comprehensive vulnerable groups coverage
      ],

      // Program Period (Full year 2025)
      startDate: new Date('2025-01-02'),
      endDate: new Date('2025-12-31'),

      // Feeding Schedule (Daily including weekends for vulnerable groups)
      feedingDays: [0, 1, 2, 3, 4, 5, 6], // Every day (7 days/week)
      mealsPerDay: 2, // Morning snack + Afternoon snack

      // ✅ UPDATED (Nov 12, 2025): Budget & Recipients with government compliance
      totalBudget: 150000000 * 12, // Rp 150M/month x 12 months = Rp 1.8B/year
      budgetPerMeal: 10000, // Rp 10,000 per snack
      budgetSource: BudgetSource.APBD_KABUPATEN, // Funded by local government (Kabupaten)
      budgetYear: 2025, // Fiscal year
      
      // DPA (Dokumen Pelaksanaan Anggaran)
      dpaNumber: 'DPA-APBD.PWK.2025.PMT',
      dpaDate: new Date('2024-11-30'),
      apbnProgramCode: null, // Not APBN, this is APBD
      
      // Budget Decree (SK Penetapan Anggaran)
      budgetDecreeNumber: 'SK-BUPATI-PWK/2025/050/PMT',
      budgetDecreeDate: new Date('2024-12-05'),
      budgetDecreeUrl: 'https://storage.bagizi.id/documents/sk-pmt-pwk-2025.pdf',
      
      // ✅ Budget breakdown (sesuai regulasi: total = 1.8B)
      foodBudget: 1170000000, // 65% - Rp 1.17B (bahan makanan & snack)
      operationalBudget: 306000000, // 17% - Rp 306M (operasional posyandu/puskesmas)
      transportBudget: 144000000, // 8% - Rp 144M (distribusi ke posyandu)
      utilityBudget: 72000000, // 4% - Rp 72M (utilitas)
      staffBudget: 90000000, // 5% - Rp 90M (tenaga kader & nutrisionis)
      otherBudget: 18000000, // 1% - Rp 18M (lain-lain)
      
      // Approval & audit trail
      budgetApprovedBy: null,
      budgetApprovedAt: null,
      budgetApprovalNotes: 'Program PMT untuk kelompok rentan disetujui Bupati Purwakarta. Prioritas pencegahan stunting.',
      
      targetRecipients: 2030, // 2,030 vulnerable individuals (530 pregnant + 350 breastfeeding + 1000 toddler + 150 elderly)
      currentRecipients: 1930, // 95% participation rate

      // Implementation Area
      implementationArea:
        'Kabupaten Purwakarta - 15 Posyandu, 5 Puskesmas, 3 Integrated Service Post',

      // Status
      status: 'ACTIVE',
    },
  })
  programs.push(pmt)

  console.log(`  ✓ Created ${programs.length} nutrition programs:`)
  console.log(`    1. ${pmas.name}`)
  console.log(`       - Type: ${pmas.programType}`)
  console.log(`       - Target: ${pmas.targetRecipients.toLocaleString()} school children`)
  console.log(`       - Budget: Rp ${pmas.totalBudget?.toLocaleString()}/year`)
  console.log(`       - Schedule: Weekdays, 1 meal/day (lunch)`)
  console.log('')
  console.log(`    2. ${pmt.name}`)
  console.log(`       - Type: ${pmt.programType}`)
  console.log(`       - Target: ${pmt.targetRecipients.toLocaleString()} vulnerable individuals`)
  console.log(`       - Budget: Rp ${pmt.totalBudget?.toLocaleString()}/year`)
  console.log(`       - Schedule: Daily, 2 snacks/day`)
  console.log(`       - Multi-Target: Pregnant women, breastfeeding mothers, toddlers, teenage girls`)

  return programs
}
