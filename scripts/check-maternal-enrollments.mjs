import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Program PWK-PMT-2025 enrollments...\n')
  
  // Get program
  const program = await prisma.nutritionProgram.findFirst({
    where: { programCode: 'PWK-PMT-2025' },
    include: {
      beneficiaryEnrollments: {
        include: {
          beneficiaryOrg: true
        }
      }
    }
  })
  
  if (!program) {
    console.log('❌ Program PWK-PMT-2025 not found!')
    return
  }
  
  console.log(`✅ Program: ${program.name}`)
  console.log(`   Code: ${program.programCode}`)
  console.log(`   Allowed Target Groups: ${program.allowedTargetGroups.join(', ')}`)
  console.log(`   Total Enrollments: ${program.beneficiaryEnrollments.length}\n`)
  
  // Group by target group
  const byTargetGroup = {}
  for (const enrollment of program.beneficiaryEnrollments) {
    if (!byTargetGroup[enrollment.targetGroup]) {
      byTargetGroup[enrollment.targetGroup] = []
    }
    byTargetGroup[enrollment.targetGroup].push(enrollment)
  }
  
  console.log('📊 Enrollments by Target Group:')
  for (const [targetGroup, enrollments] of Object.entries(byTargetGroup)) {
    console.log(`\n   ${targetGroup}: ${enrollments.length} enrollments`)
    for (const e of enrollments) {
      console.log(`      - ${e.beneficiaryOrg.organizationName} (${e.beneficiaryOrg.type})`)
      console.log(`        Beneficiaries: ${e.activeBeneficiaries}/${e.targetBeneficiaries}`)
    }
  }
  
  // Check if target groups match allowedTargetGroups
  const actualTargetGroups = Object.keys(byTargetGroup).sort()
  const allowedTargetGroups = program.allowedTargetGroups.sort()
  
  console.log(`\n🎯 Validation:`)
  console.log(`   Expected target groups: ${allowedTargetGroups.join(', ')}`)
  console.log(`   Actual target groups: ${actualTargetGroups.join(', ')}`)
  
  const isValid = JSON.stringify(actualTargetGroups) === JSON.stringify(allowedTargetGroups)
  console.log(`   Match: ${isValid ? '✅ YES' : '❌ NO'}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
