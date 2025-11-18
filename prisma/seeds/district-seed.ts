/**
 * @fileoverview District seed - Kecamatan Purwakarta & Karawang
 * @description Creates District entities for Purwakarta (15) and Karawang (30)
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * @see {@link https://purwakartakab.bps.go.id} BPS Purwakarta
 * @see {@link https://karawangkab.bps.go.id} BPS Karawang
 */

import { PrismaClient, Regency, District } from '@prisma/client'

/**
 * 15 Kecamatan in Kabupaten Purwakarta (Official BPS Data)
 */
const PURWAKARTA_DISTRICTS = [
  { code: '321401', name: 'Jatiluhur' },
  { code: '321402', name: 'Sukatani' },
  { code: '321403', name: 'Purwakarta' }, // Pusat kota
  { code: '321404', name: 'Campaka' },
  { code: '321405', name: 'Maniis' },
  { code: '321406', name: 'Tegalwaru' },
  { code: '321407', name: 'Plered' },
  { code: '321408', name: 'Sukasari' },
  { code: '321409', name: 'Bojong' },
  { code: '321410', name: 'Wanayasa' },
  { code: '321411', name: 'Pasawahan' },
  { code: '321412', name: 'Bungursari' },
  { code: '321413', name: 'Kiarapedes' },
  { code: '321414', name: 'Darangdan' },
  { code: '321415', name: 'Cibatu' }
] as const

/**
 * 30 Kecamatan in Kabupaten Karawang (Official BPS Data)
 */
const KARAWANG_DISTRICTS = [
  { code: '321501', name: 'Pangkalan' },
  { code: '321502', name: 'Tegalwaru' },
  { code: '321503', name: 'Ciampel' },
  { code: '321504', name: 'Telukjambe Timur' },
  { code: '321505', name: 'Telukjambe Barat' },
  { code: '321506', name: 'Karawang Barat' },
  { code: '321507', name: 'Karawang Timur' },
  { code: '321508', name: 'Rengasdengklok' },
  { code: '321509', name: 'Kutawaluya' },
  { code: '321510', name: 'Batujaya' },
  { code: '321511', name: 'Pakisjaya' },
  { code: '321512', name: 'Cilebar' },
  { code: '321513', name: 'Cibuaya' },
  { code: '321514', name: 'Pedes' },
  { code: '321515', name: 'Purwasari' },
  { code: '321516', name: 'Tirtajaya' },
  { code: '321517', name: 'Tirtamulya' },
  { code: '321518', name: 'Klari' },
  { code: '321519', name: 'Cikampek' },
  { code: '321520', name: 'Jatisari' },
  { code: '321521', name: 'Kotabaru' },
  { code: '321522', name: 'Rawamerta' },
  { code: '321523', name: 'Tempuran' },
  { code: '321524', name: 'Purwakarta' },
  { code: '321525', name: 'Lemahabang' },
  { code: '321526', name: 'Telagasari' },
  { code: '321527', name: 'Cilamaya Wetan' },
  { code: '321528', name: 'Cilamaya Kulon' },
  { code: '321529', name: 'Banyusari' },
  { code: '321530', name: 'Jayakerta' }
] as const

/**
 * Seed Districts - Purwakarta (15) & Karawang (30)
 * 
 * @param prisma - Prisma client instance
 * @param regencies - Object with purwakarta and karawang regencies
 * @returns Object with arrays of districts for each regency
 */
export async function seedDistrict(
  prisma: PrismaClient,
  regencies: { purwakarta: Regency; karawang: Regency }
): Promise<{ purwakarta: District[]; karawang: District[] }> {
  console.log('  → Creating Districts (Purwakarta: 15, Karawang: 30)...')

  // Create Purwakarta districts
  const purwakartaDistricts = await Promise.all(
    PURWAKARTA_DISTRICTS.map(async (district) => {
      return prisma.district.upsert({
        where: {
          regencyId_code: {
            regencyId: regencies.purwakarta.id,
            code: district.code
          }
        },
        update: {},
        create: {
          regencyId: regencies.purwakarta.id,
          code: district.code,
          name: district.name
        }
      })
    })
  )

  // Create Karawang districts
  const karawangDistricts = await Promise.all(
    KARAWANG_DISTRICTS.map(async (district) => {
      return prisma.district.upsert({
        where: {
          regencyId_code: {
            regencyId: regencies.karawang.id,
            code: district.code
          }
        },
        update: {},
        create: {
          regencyId: regencies.karawang.id,
          code: district.code,
          name: district.name
        }
      })
    })
  )

  console.log(`  ✓ Created 45 Districts:`)
  console.log(`    - Purwakarta: 15 kecamatan`)
  console.log(`    - Karawang: 30 kecamatan`)

  return {
    purwakarta: purwakartaDistricts,
    karawang: karawangDistricts
  }
}
