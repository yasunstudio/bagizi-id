import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const programId = 'cmhp7kqjp01398orjkqapdjaf'
  
  console.log('🔍 Checking Program Enrollments Consistency\n')

  // Get program details
  const program = await prisma.nutritionProgram.findUnique({
    where: { id: programId },
    include: {
      sppg: {
        select: { id: true, name: true, code: true }
      }
    }
  })

  if (!program) {
    console.log('❌ Program not found')
    await prisma.$disconnect()
    return
  }

  console.log('📋 Program Details:')
  console.log(`   ID: ${program.id}`)
  console.log(`   Name: ${program.programName}`)
  console.log(`   Code: ${program.programCode}`)
  console.log(`   SPPG ID: ${program.sppgId}`)
  console.log(`   SPPG Name: ${program.sppg.name}`)
  console.log(`   Allowed Target Groups: ${program.allowedTargetGroups.join(', ')}`)

  // Get all enrollments for this program
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
    },
    orderBy: { targetGroup: 'asc' }
  })

  console.log(`\n📊 Total Enrollments: ${enrollments.length}`)

  if (enrollments.length === 0) {
    console.log('\n⚠️  No enrollments found for this program')
    
    // Check if there are enrollments with wrong SPPG ID
    const wrongSppgEnrollments = await prisma.programBeneficiaryEnrollment.findMany({
      where: {
        programId: program.id,
        sppgId: { not: program.sppgId }
      }
    })

    if (wrongSppgEnrollments.length > 0) {
      console.log(`\n❌ Found ${wrongSppgEnrollments.length} enrollments with WRONG SPPG ID`)
      console.log('   This is why they are not displayed (multi-tenant filter blocks them)')
    }
  } else {
    console.log('\n📝 Enrollment Breakdown by Target Group:')
    
    const groupedByTarget = enrollments.reduce((acc, enrollment) => {
      if (!acc[enrollment.targetGroup]) {
        acc[enrollment.targetGroup] = []
      }
      acc[enrollment.targetGroup].push(enrollment)
      return acc
    }, {})

    Object.entries(groupedByTarget).forEach(([targetGroup, enrolls]) => {
      console.log(`\n   ${targetGroup}: ${enrolls.length} enrollment(s)`)
      enrolls.forEach((enroll, idx) => {
        const sppgMatch = enroll.sppgId === program.sppgId
        console.log(`     ${idx + 1}. ${enroll.beneficiaryOrg.organizationName}`)
        console.log(`        Beneficiaries: ${enroll.targetBeneficiaries}`)
        console.log(`        SPPG Match: ${sppgMatch ? '✅' : '❌ MISMATCH'}`)
      })
    })

    // Summary
    const allMatch = enrollments.every(e => e.sppgId === program.sppgId)
    const matchCount = enrollments.filter(e => e.sppgId === program.sppgId).length
    const targetGroupCount = Object.keys(groupedByTarget).length

    console.log('\n' + '='.repeat(60))
    console.log('📊 Summary:')
    console.log('='.repeat(60))
    console.log(`   Allowed Target Groups: ${program.allowedTargetGroups.length}`)
    console.log(`   Target Groups with Enrollments: ${targetGroupCount}`)
    console.log(`   Total Enrollments: ${enrollments.length}`)
    console.log(`   SPPG ID Matches: ${matchCount}/${enrollments.length}`)
    console.log(`   Status: ${allMatch ? '✅ ALL MATCH' : '❌ HAS MISMATCH'}`)

    // Check for missing target groups
    const enrolledTargetGroups = Object.keys(groupedByTarget)
    const missingTargetGroups = program.allowedTargetGroups.filter(
      tg => !enrolledTargetGroups.includes(tg)
    )

    if (missingTargetGroups.length > 0) {
      console.log(`\n⚠️  Missing enrollments for: ${missingTargetGroups.join(', ')}`)
    } else {
      console.log('\n✅ All allowed target groups have enrollments')
    }
  }

  // Compare with other program (PWK-PMT-2025)
  console.log('\n' + '='.repeat(60))
  console.log('🔍 Comparison with PWK-PMT-2025:')
  console.log('='.repeat(60))

  const otherProgram = await prisma.nutritionProgram.findFirst({
    where: { programCode: 'PWK-PMT-2025' }
  })

  if (otherProgram) {
    const otherEnrollments = await prisma.programBeneficiaryEnrollment.findMany({
      where: { programId: otherProgram.id }
    })

    console.log(`   PWK-PMT-2025: ${otherEnrollments.length} enrollments`)
    console.log(`   ${program.programCode}: ${enrollments.length} enrollments`)
    console.log(`   Difference: ${Math.abs(otherEnrollments.length - enrollments.length)}`)
  }

  await prisma.$disconnect()
}

main().catch(console.error)
