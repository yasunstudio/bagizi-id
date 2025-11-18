/**
 * Find PMT Program ID
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const pmtProgram = await prisma.nutritionProgram.findFirst({
    where: { programCode: 'PMT-PWK-2025' },
    select: {
      id: true,
      name: true,
      programCode: true,
      allowedTargetGroups: true,
      targetRecipients: true,
    }
  })
  
  if (!pmtProgram) {
    console.log('❌ PMT program not found!')
    return
  }
  
  console.log('✅ PMT Program Found:')
  console.log('   ID:', pmtProgram.id)
  console.log('   Name:', pmtProgram.name)
  console.log('   Code:', pmtProgram.programCode)
  console.log('   Target Recipients:', pmtProgram.targetRecipients)
  console.log('   Allowed Target Groups:', pmtProgram.allowedTargetGroups)
  console.log('')
  console.log('🌐 URL:', `http://localhost:3000/program/${pmtProgram.id}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
