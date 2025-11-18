/**
 * SPPG Seed File
 * 
 * Creates Demo SPPG 2025 for Purwakarta with realistic data:
 * - Located in one of the Purwakarta villages
 * - Realistic address, coordinates, and contact information
 * - Proper budget allocation for nutrition programs
 * - Active status with organization type: PEMERINTAH (Government)
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { 
  PrismaClient, 
  SPPG, 
  Village,
  OrganizationType,
  SppgStatus,
  Timezone
} from '@prisma/client'

/**
 * Seed SPPG entity for Demo SPPG 2025
 * 
 * Creates a realistic government SPPG organization in Purwakarta
 * with proper regional references and budget allocation.
 * 
 * @param prisma - Prisma Client instance
 * @param villages - Villages data from village seed (dual-region)
 * @returns Promise<SPPG> - Created SPPG entity
 * 
 * @example
 * ```typescript
 * const villages = await seedVillage(prisma, districts)
 * const sppg = await seedSPPG(prisma, villages)
 * console.log(sppg.name) // "Demo SPPG 2025"
 * ```
 */
export async function seedSPPG(
  prisma: PrismaClient,
  villages: { purwakarta: Village[]; karawang: Village[] }
): Promise<SPPG> {
  console.log('  → Creating Demo SPPG 2025 for Purwakarta...')

  // Select Jatiluhur village (first village in Purwakarta - tourism area)
  const jatiluhurVillage = villages.purwakarta.find(v => v.name === 'Jatiluhur')
  
  if (!jatiluhurVillage) {
    throw new Error('Jatiluhur village not found in Purwakarta villages')
  }

  // Get full village data with relations
  const villageWithRelations = await prisma.village.findUnique({
    where: { id: jatiluhurVillage.id },
    include: {
      district: {
        include: {
          regency: {
            include: {
              province: true
            }
          }
        }
      }
    }
  })

  if (!villageWithRelations) {
    throw new Error('Failed to fetch village with relations')
  }

  // Create Demo SPPG 2025
  const sppg = await prisma.sPPG.upsert({
    where: {
      code: 'SPPG-DEMO-2025'
    },
    update: {},
    create: {
      // Identity & Code
      code: 'SPPG-DEMO-2025',
      name: 'Demo SPPG 2025',
      description: 'Satuan Pelayanan Pemenuhan Gizi Demo untuk Kabupaten Purwakarta tahun 2025. Melayani program makan siang anak sekolah (PMAS) dan pemberian makanan tambahan (PMT) untuk balita, ibu hamil, ibu menyusui, dan lansia.',

      // Location - Jatiluhur, Purwakarta (near Waduk Jatiluhur)
      addressDetail: 'Jl. Raya Jatiluhur No. 125, Desa Jatiluhur, Kecamatan Jatiluhur',
      provinceId: villageWithRelations.district.regency.provinceId,
      regencyId: villageWithRelations.district.regencyId,
      districtId: villageWithRelations.districtId,
      villageId: villageWithRelations.id,
      postalCode: '41152',
      coordinates: '-6.5153,107.3889', // Near Waduk Jatiluhur
      timezone: Timezone.WIB,

      // Contact Information
      phone: '0264-8524125',
      email: 'info@demo.sppg.id',
      
      // Person In Charge (PIC)
      picName: 'Dr. Siti Nurhaliza, S.Gz., M.Gizi',
      picPosition: 'Kepala SPPG',
      picEmail: 'kepala@demo.sppg.id',
      picPhone: '0264-8524126',
      picWhatsapp: '081234567890',

      // Organization Details
      organizationType: OrganizationType.PEMERINTAH,
      establishedYear: 2025,
      targetRecipients: 5000, // Target: 5000 beneficiaries (realistic for demo)
      maxRadius: 15.0, // Maximum radius: 15 km
      maxTravelTime: 45, // Maximum travel time: 45 minutes
      operationStartDate: new Date('2025-01-01'),
      operationEndDate: null, // Ongoing operation

      // Status & Demo Settings
      status: SppgStatus.ACTIVE,
      isDemoAccount: true,
      demoStartedAt: new Date('2025-01-01'),
      demoExpiresAt: new Date('2026-01-01'), // 1 year demo period
      demoMaxBeneficiaries: 5000,
      demoAllowedFeatures: [
        'MENU_MANAGEMENT',
        'PROCUREMENT',
        'PRODUCTION',
        'DISTRIBUTION',
        'INVENTORY',
        'REPORTING',
        'ANALYTICS',
        'BENEFICIARY_MANAGEMENT'
      ],

      // Budget Allocation (Realistic for 5000 beneficiaries)
      monthlyBudget: 250000000, // Rp 250 juta/bulan
      yearlyBudget: 3000000000, // Rp 3 miliar/tahun
      budgetStartDate: new Date('2025-01-01'),
      budgetEndDate: new Date('2025-12-31'),
      budgetCurrency: 'IDR',
      budgetAllocation: {
        // Budget breakdown
        foodIngredients: 1800000000, // 60% - Rp 1.8 miliar (bahan makanan)
        laborCosts: 600000000,       // 20% - Rp 600 juta (gaji karyawan)
        utilities: 300000000,        // 10% - Rp 300 juta (listrik, air, gas)
        equipment: 150000000,        // 5% - Rp 150 juta (peralatan dapur)
        transportation: 90000000,    // 3% - Rp 90 juta (distribusi)
        operational: 60000000,       // 2% - Rp 60 juta (operasional lainnya)
        
        // Per-beneficiary calculation
        perBeneficiaryMonthly: 50000,     // Rp 50,000/penerima/bulan
        perBeneficiaryYearly: 600000,     // Rp 600,000/penerima/tahun
        
        // Program allocation
        programs: {
          pmasLunch: 1500000000,    // 50% - Program Makan Siang Anak Sekolah
          pmtSnack: 900000000,      // 30% - Pemberian Makanan Tambahan
          training: 300000000,      // 10% - Pelatihan & Pendampingan
          monitoring: 300000000     // 10% - Monitoring & Evaluasi
        }
      },
      budgetAutoReset: true,
      budgetAlertThreshold: 80, // Alert when 80% budget used
    },
    include: {
      province: true,
      regency: true,
      district: true,
      village: true
    }
  })

  console.log(`  ✓ Created SPPG: ${sppg.name} (${sppg.code})`)
  console.log(`    Location: ${sppg.addressDetail}`)
  console.log(`    Village: ${villageWithRelations.name}, District: ${villageWithRelations.district.name}`)
  console.log(`    Coordinates: ${sppg.coordinates}`)
  console.log(`    Target Recipients: ${sppg.targetRecipients.toLocaleString('id-ID')} beneficiaries`)
  console.log(`    Monthly Budget: Rp ${sppg.monthlyBudget?.toLocaleString('id-ID')}`)
  console.log(`    Demo Period: ${sppg.demoStartedAt?.toLocaleDateString('id-ID')} - ${sppg.demoExpiresAt?.toLocaleDateString('id-ID')}`)

  return sppg
}
