import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying SPPG ID Consistency After Fixes\n')

  // Find PWK-PMT-2025 program (maternal/toddler)
  const program = await prisma.nutritionProgram.findFirst({
    where: { programCode: 'PWK-PMT-2025' },
    include: {
      sppg: {
        select: { id: true, name: true, code: true }
      }
    }
  })

  if (!program) {
    console.log('❌ Program PWK-PMT-2025 not found')
    await prisma.$disconnect()
    return
  }

  console.log('📋 Program Details:')
  console.log(`   Name: ${program.programName}`)
  console.log(`   Code: ${program.programCode}`)
  console.log(`   SPPG ID: ${program.sppgId}`)
  console.log(`   SPPG Name: ${program.sppg.name}`)
  console.log(`   Target Groups: ${program.allowedTargetGroups.join(', ')}`)

  // Get enrollments for this program
  const enrollments = await prisma.programBeneficiaryEnrollment.findMany({
    where: { programId: program.id },
    include: {
      beneficiaryOrg: {
        select: {
          organizationName: true,
          type: true,
          subType: true
        }
      }
    }
  })

  console.log(`\n📊 Enrollments Found: ${enrollments.length}`)

  if (enrollments.length === 0) {
    console.log('⚠️  No enrollments found for this program')
  } else {
    console.log('\n📝 Enrollment Details:')
    enrollments.forEach((enrollment, idx) => {
      const sppgMatch = enrollment.sppgId === program.sppgId
      console.log(`\n   ${idx + 1}. ${enrollment.beneficiaryOrg.organizationName}`)
      console.log(`      Target Group: ${enrollment.targetGroup}`)
      console.log(`      Enrollment SPPG ID: ${enrollment.sppgId}`)
      console.log(`      Program SPPG ID: ${program.sppgId}`)
      console.log(`      Match: ${sppgMatch ? '✅ YES' : '❌ NO - MISMATCH!'}`)
      console.log(`      Beneficiaries: ${enrollment.targetBeneficiaries}`)
    })

    // Summary
    const allMatch = enrollments.every(e => e.sppgId === program.sppgId)
    const matchCount = enrollments.filter(e => e.sppgId === program.sppgId).length

    console.log('\n' + '='.repeat(60))
    console.log('📊 SPPG ID Consistency Summary:')
    console.log('='.repeat(60))
    console.log(`   Total Enrollments: ${enrollments.length}`)
    console.log(`   Matching SPPG ID: ${matchCount}/${enrollments.length}`)
    console.log(`   Mismatch: ${enrollments.length - matchCount}`)
    console.log(`   Status: ${allMatch ? '✅ ALL MATCH - FIXED!' : '❌ STILL HAS MISMATCH'}`)
  }

  await prisma.$disconnect()
}

main().catch(console.error)
