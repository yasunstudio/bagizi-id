/**
 * @fileoverview Village seed - Sample Desa/Kelurahan Purwakarta & Karawang
 * @description Creates sample Village entities (30 Purwakarta + 60 Karawang)
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { PrismaClient, District, Village, VillageType } from '@prisma/client'

const PURWAKARTA_VILLAGES = [
  { districtCode: '321401', code: '3214012001', name: 'Jatiluhur' },
  { districtCode: '321401', code: '3214012002', name: 'Margasari' },
  { districtCode: '321402', code: '3214022001', name: 'Sukatani' },
  { districtCode: '321402', code: '3214022002', name: 'Ciganea' },
  { districtCode: '321403', code: '3214031001', name: 'Nagrikidul' },
  { districtCode: '321403', code: '3214031002', name: 'Nagrikaler' },
  { districtCode: '321404', code: '3214042001', name: 'Campaka' },
  { districtCode: '321404', code: '3214042002', name: 'Ciseureuh' },
  { districtCode: '321405', code: '3214052001', name: 'Maniis' },
  { districtCode: '321405', code: '3214052002', name: 'Palumbonsari' },
  { districtCode: '321406', code: '3214062001', name: 'Tegalwaru' },
  { districtCode: '321406', code: '3214062002', name: 'Pasirhalang' },
  { districtCode: '321407', code: '3214072001', name: 'Plered' },
  { districtCode: '321407', code: '3214072002', name: 'Citalang' },
  { districtCode: '321408', code: '3214082001', name: 'Sukasari' },
  { districtCode: '321408', code: '3214082002', name: 'Gandasoli' },
  { districtCode: '321409', code: '3214092001', name: 'Bojong' },
  { districtCode: '321409', code: '3214092002', name: 'Kertamukti' },
  { districtCode: '321410', code: '3214102001', name: 'Wanayasa' },
  { districtCode: '321410', code: '3214102002', name: 'Balekambang' },
  { districtCode: '321411', code: '3214112001', name: 'Pasawahan' },
  { districtCode: '321411', code: '3214112002', name: 'Cibening' },
  { districtCode: '321412', code: '3214122001', name: 'Bungursari' },
  { districtCode: '321412', code: '3214122002', name: 'Ciharashas' },
  { districtCode: '321413', code: '3214132001', name: 'Kiarapedes' },
  { districtCode: '321413', code: '3214132002', name: 'Sukamulya' },
  { districtCode: '321414', code: '3214142001', name: 'Darangdan' },
  { districtCode: '321414', code: '3214142002', name: 'Cipule' },
  { districtCode: '321415', code: '3214152001', name: 'Cibatu' },
  { districtCode: '321415', code: '3214152002', name: 'Cikopo' }
] as const

const KARAWANG_VILLAGES = [
  { districtCode: '321501', code: '3215012001', name: 'Pangkalan' },
  { districtCode: '321501', code: '3215012002', name: 'Kutapohaci' },
  { districtCode: '321502', code: '3215022001', name: 'Tegalwaru' },
  { districtCode: '321502', code: '3215022002', name: 'Pinayungan' },
  { districtCode: '321503', code: '3215032001', name: 'Ciampel' },
  { districtCode: '321503', code: '3215032002', name: 'Karyamukti' },
  { districtCode: '321504', code: '3215042001', name: 'Telukjambe Timur' },
  { districtCode: '321504', code: '3215042002', name: 'Sirnabaya' },
  { districtCode: '321505', code: '3215052001', name: 'Telukjambe Barat' },
  { districtCode: '321505', code: '3215052002', name: 'Kalijaya' },
  { districtCode: '321506', code: '3215061001', name: 'Tunggakjati' },
  { districtCode: '321506', code: '3215061002', name: 'Adiarsa Barat' },
  { districtCode: '321507', code: '3215071001', name: 'Tanjungpura' },
  { districtCode: '321507', code: '3215071002', name: 'Palumbonsari' },
  { districtCode: '321508', code: '3215082001', name: 'Rengasdengklok Utara' },
  { districtCode: '321508', code: '3215082002', name: 'Rengasdengklok Selatan' },
  { districtCode: '321509', code: '3215092001', name: 'Kutawaluya' },
  { districtCode: '321509', code: '3215092002', name: 'Kutamekar' },
  { districtCode: '321510', code: '3215102001', name: 'Batujaya' },
  { districtCode: '321510', code: '3215102002', name: 'Segaran' },
  { districtCode: '321511', code: '3215112001', name: 'Pakisjaya' },
  { districtCode: '321511', code: '3215112002', name: 'Mulangsari' },
  { districtCode: '321512', code: '3215122001', name: 'Cilebar' },
  { districtCode: '321512', code: '3215122002', name: 'Cikuntul' },
  { districtCode: '321513', code: '3215132001', name: 'Cibuaya' },
  { districtCode: '321513', code: '3215132002', name: 'Sukasari' },
  { districtCode: '321514', code: '3215142001', name: 'Pedes' },
  { districtCode: '321514', code: '3215142002', name: 'Karangjaya' },
  { districtCode: '321515', code: '3215152001', name: 'Purwasari' },
  { districtCode: '321515', code: '3215152002', name: 'Kilarap' },
  { districtCode: '321516', code: '3215162001', name: 'Tirtajaya' },
  { districtCode: '321516', code: '3215162002', name: 'Kondangjaya' },
  { districtCode: '321517', code: '3215172001', name: 'Tirtamulya' },
  { districtCode: '321517', code: '3215172002', name: 'Sedari' },
  { districtCode: '321518', code: '3215182001', name: 'Klari' },
  { districtCode: '321518', code: '3215182002', name: 'Duren' },
  { districtCode: '321519', code: '3215192001', name: 'Cikampek Selatan' },
  { districtCode: '321519', code: '3215192002', name: 'Cikampek Utara' },
  { districtCode: '321520', code: '3215202001', name: 'Jatisari' },
  { districtCode: '321520', code: '3215202002', name: 'Jatimulya' },
  { districtCode: '321521', code: '3215212001', name: 'Kotabaru' },
  { districtCode: '321521', code: '3215212002', name: 'Tamelang' },
  { districtCode: '321522', code: '3215222001', name: 'Rawamerta' },
  { districtCode: '321522', code: '3215222002', name: 'Karyasari' },
  { districtCode: '321523', code: '3215232001', name: 'Tempuran' },
  { districtCode: '321523', code: '3215232002', name: 'Tanjungsari' },
  { districtCode: '321524', code: '3215242001', name: 'Purwakarta' },
  { districtCode: '321524', code: '3215242002', name: 'Karyamukti' },
  { districtCode: '321525', code: '3215252001', name: 'Lemahabang' },
  { districtCode: '321525', code: '3215252002', name: 'Parungsari' },
  { districtCode: '321526', code: '3215262001', name: 'Telagasari' },
  { districtCode: '321526', code: '3215262002', name: 'Lamaran' },
  { districtCode: '321527', code: '3215272001', name: 'Cilamaya Wetan' },
  { districtCode: '321527', code: '3215272002', name: 'Muara' },
  { districtCode: '321528', code: '3215282001', name: 'Cilamaya Kulon' },
  { districtCode: '321528', code: '3215282002', name: 'Pasirjaya' },
  { districtCode: '321529', code: '3215292001', name: 'Banyusari' },
  { districtCode: '321529', code: '3215292002', name: 'Sukamekar' },
  { districtCode: '321530', code: '3215302001', name: 'Jayakerta' },
  { districtCode: '321530', code: '3215302002', name: 'Sukajaya' }
] as const

export async function seedVillage(
  prisma: PrismaClient,
  districts: { purwakarta: District[]; karawang: District[] }
): Promise<{ purwakarta: Village[]; karawang: Village[] }> {
  console.log('  → Creating Villages (Purwakarta: 30, Karawang: 60)...')

  const purwakartaDistrictMap = new Map(
    districts.purwakarta.map(d => [d.code, d.id])
  )

  const purwakartaVillages = await Promise.all(
    PURWAKARTA_VILLAGES.map(async (village) => {
      const districtId = purwakartaDistrictMap.get(village.districtCode)
      if (!districtId) {
        throw new Error(`District ${village.districtCode} not found for Purwakarta`)
      }

      return prisma.village.upsert({
        where: {
          districtId_code: {
            districtId,
            code: village.code
          }
        },
        update: {},
        create: {
          districtId,
          code: village.code,
          name: village.name,
          type: VillageType.RURAL_VILLAGE
        }
      })
    })
  )

  const karawangDistrictMap = new Map(
    districts.karawang.map(d => [d.code, d.id])
  )

  const karawangVillages = await Promise.all(
    KARAWANG_VILLAGES.map(async (village) => {
      const districtId = karawangDistrictMap.get(village.districtCode)
      if (!districtId) {
        throw new Error(`District ${village.districtCode} not found for Karawang`)
      }

      return prisma.village.upsert({
        where: {
          districtId_code: {
            districtId,
            code: village.code
          }
        },
        update: {},
        create: {
          districtId,
          code: village.code,
          name: village.name,
          type: VillageType.RURAL_VILLAGE
        }
      })
    })
  )

  console.log(`  ✓ Created 90 Villages:`)
  console.log(`    - Purwakarta: 30 desa/kelurahan (2 per kecamatan)`)
  console.log(`    - Karawang: 60 desa/kelurahan (2 per kecamatan)`)

  return {
    purwakarta: purwakartaVillages,
    karawang: karawangVillages
  }
}