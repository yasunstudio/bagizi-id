import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const programId = 'cmhp6xf8u01388ovp9h8cufgj'
  
  console.log(`🔍 Checking Program: ${programId}\n`)
  
  // Get program detail
  const program = await prisma.nutritionProgram.findUnique({
    where: { id: programId },
    include: {
      beneficiaryEnrollments: {
        include: {
          beneficiaryOrg: true
        }
      },
      sppg: true
    }
  })
  
  if (!program) {
    console.log('❌ Program not found!')
    return
  }
  
  console.log(`✅ Program: ${program.name}`)
  console.log(`   Code: ${program.programCode}`)
  console.log(`   SPPG: ${program.sppg.sppgName}`)
  console.log(`   Status: ${program.status}`)
  console.log(`   Allowed Target Groups: ${program.allowedTargetGroups?.join(', ') || 'N/A'}`)
  console.log(`   Primary Target Group: ${program.primaryTargetGroup || 'N/A'}`)
  console.log(`   Total Enrollments: ${program.beneficiaryEnrollments.length}\n`)
  
  if (program.beneficiaryEnrollments.length === 0) {
    console.log('⚠️  NO ENROLLMENTS FOUND!')
    console.log('\n🔍 Checking if this is a school program...')
    
    // Check if there are school enrollments for this program
    const schoolEnrollments = await prisma.programSchoolEnrollment.findMany({
      where: { programId },
      include: { school: true }
    })
    
    console.log(`   School enrollments: ${schoolEnrollments.length}`)
    
    if (schoolEnrollments.length > 0) {
      console.log('\n📚 School Enrollments Found:')
      for (const e of schoolEnrollments) {
        console.log(`   - ${e.school.schoolName}: ${e.activeStudents} students`)
      }
      
      console.log('\n❌ PROBLEM: School enrollments exist but NOT migrated to beneficiary enrollments!')
      console.log('💡 REASON: Program might not have SCHOOL_CHILDREN in allowedTargetGroups')
    }
  } else {
    console.log('📊 Enrollments by Target Group:')
    const byTargetGroup = {}
    for (const enrollment of program.beneficiaryEnrollments) {
      if (!byTargetGroup[enrollment.targetGroup]) {
        byTargetGroup[enrollment.targetGroup] = []
      }
      byTargetGroup[enrollment.targetGroup].push(enrollment)
    }
    
    for (const [targetGroup, enrollments] of Object.entries(byTargetGroup)) {
      console.log(`\n   ${targetGroup}: ${enrollments.length} enrollments`)
      for (const e of enrollments) {
        console.log(`      - ${e.beneficiaryOrg.organizationName} (${e.beneficiaryOrg.type})`)
        console.log(`        Beneficiaries: ${e.activeBeneficiaries}/${e.targetBeneficiaries}`)
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
