/**
 * Check Program Enrollments - Verify actual data in database
 * Program ID: cmhvm4dh800bvsvpa93d2cvfh
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const programId = 'cmhvt0g5z00bvsvyvmumlo8g6' // PMT Program ID after reset
  
  console.log('🔍 Checking Program:', programId)
  console.log('=' .repeat(80))
  
  // 1. Get Program Details
  const program = await prisma.nutritionProgram.findUnique({
    where: { id: programId },
    select: {
      id: true,
      name: true,
      programCode: true,
      allowedTargetGroups: true,
      targetRecipients: true,
    }
  })
  
  if (!program) {
    console.log('❌ Program not found!')
    return
  }
  
  console.log('\n📋 PROGRAM DETAILS:')
  console.log('   Name:', program.name)
  console.log('   Code:', program.programCode)
  console.log('   Target Recipients:', program.targetRecipients)
  console.log('   Allowed Target Groups:', program.allowedTargetGroups)
  
  // 2. Get ALL enrollments (active + inactive)
  const allEnrollments = await prisma.programBeneficiaryEnrollment.findMany({
    where: { programId },
    select: {
      id: true,
      targetGroup: true,
      isActive: true,
      enrollmentStatus: true,
      targetBeneficiaries: true,
      activeBeneficiaries: true,
      beneficiaryOrg: {
        select: {
          organizationName: true,
          type: true,
        }
      }
    },
    orderBy: {
      enrollmentDate: 'desc'
    }
  })
  
  console.log('\n📊 ALL ENROLLMENTS (Active + Inactive):')
  console.log('   Total Count:', allEnrollments.length)
  
  // Group by targetGroup
  const byTargetGroup = {}
  allEnrollments.forEach(e => {
    if (!byTargetGroup[e.targetGroup]) {
      byTargetGroup[e.targetGroup] = { active: 0, inactive: 0, total: 0 }
    }
    byTargetGroup[e.targetGroup].total++
    if (e.isActive) {
      byTargetGroup[e.targetGroup].active++
    } else {
      byTargetGroup[e.targetGroup].inactive++
    }
  })
  
  console.log('\n   By Target Group:')
  Object.entries(byTargetGroup).forEach(([targetGroup, counts]) => {
    const isAllowed = program.allowedTargetGroups.includes(targetGroup)
    const status = isAllowed ? '✅ ALLOWED' : '❌ NOT ALLOWED'
    console.log(`   - ${targetGroup}: ${counts.total} total (${counts.active} active, ${counts.inactive} inactive) ${status}`)
  })
  
  // 3. Active enrollments only
  const activeEnrollments = allEnrollments.filter(e => e.isActive)
  console.log('\n✅ ACTIVE ENROLLMENTS ONLY:')
  console.log('   Total Count:', activeEnrollments.length)
  
  // 4. Active + Allowed (what should be shown)
  const validEnrollments = activeEnrollments.filter(e => 
    program.allowedTargetGroups.includes(e.targetGroup)
  )
  
  console.log('\n✅ VALID ENROLLMENTS (Active + Allowed Target Groups):')
  console.log('   Total Count:', validEnrollments.length)
  console.log('\n   Details:')
  
  const validByType = {}
  validEnrollments.forEach((e, idx) => {
    console.log(`   ${idx + 1}. ${e.beneficiaryOrg.organizationName}`)
    console.log(`      Type: ${e.beneficiaryOrg.type}`)
    console.log(`      Target Group: ${e.targetGroup}`)
    console.log(`      Status: ${e.enrollmentStatus}`)
    console.log(`      Target: ${e.targetBeneficiaries} | Active: ${e.activeBeneficiaries || 0}`)
    console.log('')
    
    // Count by type
    const type = e.beneficiaryOrg.type
    if (!validByType[type]) validByType[type] = 0
    validByType[type]++
  })
  
  console.log('   By Organization Type:')
  Object.entries(validByType).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}`)
  })
  
  // 5. Invalid enrollments (should NOT be shown)
  const invalidEnrollments = activeEnrollments.filter(e => 
    !program.allowedTargetGroups.includes(e.targetGroup)
  )
  
  if (invalidEnrollments.length > 0) {
    console.log('\n❌ INVALID ENROLLMENTS (Active but NOT in Allowed Target Groups):')
    console.log('   Total Count:', invalidEnrollments.length)
    console.log('   These should NOT appear in the UI!')
    console.log('')
    invalidEnrollments.forEach((e, idx) => {
      console.log(`   ${idx + 1}. ${e.beneficiaryOrg.organizationName}`)
      console.log(`      Type: ${e.beneficiaryOrg.type}`)
      console.log(`      Target Group: ${e.targetGroup} ❌ NOT ALLOWED`)
      console.log(`      Status: ${e.enrollmentStatus}`)
      console.log(`      Target: ${e.targetBeneficiaries} | Active: ${e.activeBeneficiaries || 0}`)
      console.log('')
    })
  }
  
  // 6. Calculate totals
  const totalTarget = validEnrollments.reduce((sum, e) => sum + e.targetBeneficiaries, 0)
  const totalActive = validEnrollments.reduce((sum, e) => sum + (e.activeBeneficiaries || 0), 0)
  
  console.log('\n📈 SUMMARY (Valid Enrollments Only):')
  console.log('   Organizations:', validEnrollments.length)
  console.log('   Total Target Beneficiaries:', totalTarget)
  console.log('   Total Active Beneficiaries:', totalActive)
  console.log('   Progress:', totalActive, '/', totalTarget, `(${Math.round(totalActive/totalTarget*100)}%)`)
  
  console.log('\n' + '='.repeat(80))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
