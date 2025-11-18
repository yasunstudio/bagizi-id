import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const programId = 'cmhp6xf8u01388ovp9h8cufgj'
  
  console.log('🔍 Detailed Program & Enrollment Investigation\n')
  
  // Get program with SPPG
  const program = await prisma.nutritionProgram.findUnique({
    where: { id: programId },
    include: {
      sppg: true
    }
  })
  
  if (!program) {
    console.log('❌ Program not found!')
    return
  }
  
  console.log('✅ Program Details:')
  console.log(`   ID: ${program.id}`)
  console.log(`   Name: ${program.name}`)
  console.log(`   Code: ${program.programCode}`)
  console.log(`   SPPG ID: ${program.sppgId}`)
  console.log(`   SPPG Name: ${program.sppg?.sppgName || 'NOT FOUND'}`)
  console.log(`   SPPG Code: ${program.sppg?.sppgCode || 'NOT FOUND'}\n`)
  
  // Get all enrollments for this program
  const enrollments = await prisma.programBeneficiaryEnrollment.findMany({
    where: { programId },
    include: {
      beneficiaryOrg: true
    }
  })
  
  console.log(`📊 Total Enrollments: ${enrollments.length}\n`)
  
  if (enrollments.length > 0) {
    console.log('Enrollment Details:')
    for (const e of enrollments) {
      console.log(`\n   ID: ${e.id}`)
      console.log(`   SPPG ID: ${e.sppgId}`)
      console.log(`   Program ID: ${e.programId}`)
      console.log(`   Target Group: ${e.targetGroup}`)
      console.log(`   Organization: ${e.beneficiaryOrg.organizationName} (${e.beneficiaryOrg.type})`)
      console.log(`   Beneficiaries: ${e.activeBeneficiaries}/${e.targetBeneficiaries}`)
      console.log(`   Status: ${e.enrollmentStatus}`)
      console.log(`   Active: ${e.isActive}`)
    }
  }
  
  // Check if SPPG IDs match
  const sppgIds = new Set(enrollments.map(e => e.sppgId))
  console.log(`\n🔍 SPPG IDs in enrollments: ${Array.from(sppgIds).join(', ')}`)
  console.log(`   Program SPPG ID: ${program.sppgId}`)
  console.log(`   Match: ${sppgIds.has(program.sppgId) ? '✅ YES' : '❌ NO - MISMATCH!'}\n`)
  
  // Get users who can access this SPPG
  const users = await prisma.user.findMany({
    where: { sppgId: program.sppgId },
    select: {
      id: true,
      name: true,
      email: true,
      userRole: true,
      sppgId: true
    }
  })
  
  console.log(`👥 Users with access to SPPG ${program.sppgId}:`)
  if (users.length === 0) {
    console.log('   ⚠️  NO USERS FOUND - This could be the problem!')
  } else {
    for (const u of users) {
      console.log(`   - ${u.name} (${u.email}) - ${u.userRole}`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
