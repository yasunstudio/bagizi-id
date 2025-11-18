/**
 * @fileoverview Regency seed - Kabupaten Purwakarta & Karawang data
 * @description Creates Regency entities for Purwakarta and Karawang
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { PrismaClient, Province, Regency, RegencyType } from '@prisma/client'

/**
 * Seed Regencies - Kabupaten Purwakarta & Karawang
 * 
 * @param prisma - Prisma client instance
 * @param province - Jawa Barat province entity
 * @returns Object with both regency entities
 */
export async function seedRegency(
  prisma: PrismaClient,
  province: Province
): Promise<{ purwakarta: Regency; karawang: Regency }> {
  console.log('  → Creating Regencies (Purwakarta & Karawang)...')

  const [purwakarta, karawang] = await Promise.all([
    // Kabupaten Purwakarta
    prisma.regency.upsert({
      where: {
        provinceId_code: {
          provinceId: province.id,
          code: '3214'
        }
      },
      update: {},
      create: {
        provinceId: province.id,
        code: '3214',
        name: 'Purwakarta',
        type: RegencyType.REGENCY
      }
    }),

    // Kabupaten Karawang
    prisma.regency.upsert({
      where: {
        provinceId_code: {
          provinceId: province.id,
          code: '3215'
        }
      },
      update: {},
      create: {
        provinceId: province.id,
        code: '3215',
        name: 'Karawang',
        type: RegencyType.REGENCY
      }
    })
  ])

  console.log(`  ✓ Created 2 Regencies:`)
  console.log(`    - ${purwakarta.type} ${purwakarta.name} (${purwakarta.code})`)
  console.log(`    - ${karawang.type} ${karawang.name} (${karawang.code})`)
  
  return { purwakarta, karawang }
}
