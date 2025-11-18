#!/usr/bin/env node

/**
 * Verify PWK-PMAS-2025 Enrollments After Fix
 * Checks if all 6 target groups now have enrollments
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Verifying PWK-PMAS-2025 Enrollments After Fix...\n')

    // Get the program
    const program = await prisma.nutritionProgram.findFirst({
      where: {
        programCode: 'PWK-PMAS-2025'
      },
      include: {
        sppg: {
          select: {
            name: true,
            id: true
          }
        }
      }
    })

    if (!program) {
      console.log('❌ Program PWK-PMAS-2025 not found!')
      return
    }

    console.log(`📋 Program: ${program.name}`)
    console.log(`   Code: ${program.programCode}`)
    console.log(`   SPPG: ${program.sppg.name}`)
    console.log(`   SPPG ID: ${program.sppgId}`)
    console.log(`   Allowed Target Groups: ${program.allowedTargetGroups.length}`)
    console.log(`   Target Groups: ${program.allowedTargetGroups.join(', ')}\n`)

    // Get all enrollments
    const enrollments = await prisma.programBeneficiaryEnrollment.findMany({
      where: {
        programId: program.id
      },
      include: {
        beneficiaryOrg: {
          select: {
            organizationName: true,
            type: true,
            subType: true
          }
        }
      },
      orderBy: [
        { targetGroup: 'asc' }
      ]
    })

    console.log(`📊 Total Enrollments Found: ${enrollments.length}\n`)

    // Group by target group
    const byTargetGroup = {}
    enrollments.forEach(e => {
      if (!byTargetGroup[e.targetGroup]) {
        byTargetGroup[e.targetGroup] = []
      }
      byTargetGroup[e.targetGroup].push(e)
    })

    console.log(`🎯 Target Groups with Enrollments: ${Object.keys(byTargetGroup).length}/${program.allowedTargetGroups.length}\n`)

    // Check each allowed target group
    program.allowedTargetGroups.forEach(targetGroup => {
      const enrollmentsForGroup = byTargetGroup[targetGroup] || []
      const status = enrollmentsForGroup.length > 0 ? '✅' : '❌'
      
      console.log(`${status} ${targetGroup}:`)
      
      if (enrollmentsForGroup.length > 0) {
        enrollmentsForGroup.forEach(e => {
          const sppgMatch = e.sppgId === program.sppgId ? '✅' : '❌'
          console.log(`   ${sppgMatch} ${e.beneficiaryOrg.organizationName}`)
          console.log(`      - Target: ${e.targetBeneficiaries} beneficiaries`)
          console.log(`      - Budget: Rp ${(e.monthlyBudgetAllocation / 1000000).toFixed(1)}M/month`)
          console.log(`      - SPPG ID: ${e.sppgId === program.sppgId ? 'Match' : 'MISMATCH!'}`)
        })
      } else {
        console.log(`   ⚠️  No enrollments found for this target group`)
      }
      console.log('')
    })

    // Summary
    console.log('📈 Summary:')
    console.log(`   Total Enrollments: ${enrollments.length}`)
    console.log(`   Target Groups Covered: ${Object.keys(byTargetGroup).length}/${program.allowedTargetGroups.length}`)
    console.log(`   All SPPG IDs Match: ${enrollments.every(e => e.sppgId === program.sppgId) ? '✅ Yes' : '❌ No'}`)
    
    const missing = program.allowedTargetGroups.filter(tg => !byTargetGroup[tg])
    if (missing.length > 0) {
      console.log(`\n⚠️  Missing Enrollments for:`)
      missing.forEach(tg => console.log(`   - ${tg}`))
    } else {
      console.log(`\n✅ ALL TARGET GROUPS HAVE ENROLLMENTS!`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
