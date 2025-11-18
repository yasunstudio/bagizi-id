/**
 * @fileoverview Province seed - Jawa Barat province data
 * @description Creates Province entity for Jawa Barat
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { PrismaClient, IndonesiaRegion, Timezone } from '@prisma/client'

/**
 * Seed Province - Jawa Barat
 * 
 * @param prisma - Prisma client instance
 * @returns Created Province entity
 */
export async function seedProvince(prisma: PrismaClient) {
  console.log('  → Creating Province (Jawa Barat)...')

  const province = await prisma.province.upsert({
    where: { code: '32' },
    update: {},
    create: {
      code: '32',
      name: 'Jawa Barat',
      region: IndonesiaRegion.JAWA,
      timezone: Timezone.WIB
    }
  })

  console.log(`  ✓ Created Province: ${province.name} (${province.code})`)
  
  return province
}
