#!/usr/bin/env node

/**
 * Test script for Menu Assignment Validation API
 * Tests compatibility check between menu and enrollment
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testValidationAPI() {
  console.log('🧪 Testing Menu Assignment Validation API\n')

  try {
    // Get a sample menu with target groups
    const targetSpecificMenu = await prisma.nutritionMenu.findFirst({
      where: {
        compatibleTargetGroups: {
          isEmpty: false, // Has target groups
        },
      },
      select: {
        id: true,
        menuName: true,
        compatibleTargetGroups: true,
        program: {
          select: {
            sppgId: true,
          },
        },
      },
    })

    // Get a universal menu (empty target groups)
    const universalMenu = await prisma.nutritionMenu.findFirst({
      where: {
        compatibleTargetGroups: {
          isEmpty: true, // No target groups = universal
        },
      },
      select: {
        id: true,
        menuName: true,
        compatibleTargetGroups: true,
      },
    })

    // Get enrollments with different target groups
    const enrollments = await prisma.programBeneficiaryEnrollment.findMany({
      take: 3,
      select: {
        id: true,
        targetGroup: true,
        beneficiaryOrg: {
          select: {
            organizationName: true,
          },
        },
      },
    })

    console.log('📊 Test Data Retrieved:\n')

    if (targetSpecificMenu) {
      console.log('✅ Target-Specific Menu:')
      console.log(`   - ID: ${targetSpecificMenu.id}`)
      console.log(`   - Name: ${targetSpecificMenu.menuName}`)
      console.log(`   - Target Groups: ${targetSpecificMenu.compatibleTargetGroups.join(', ')}`)
      console.log()
    }

    if (universalMenu) {
      console.log('✅ Universal Menu:')
      console.log(`   - ID: ${universalMenu.id}`)
      console.log(`   - Name: ${universalMenu.menuName}`)
      console.log(`   - Target Groups: [] (universal - all targets)`)
      console.log()
    }

    console.log(`✅ Found ${enrollments.length} Enrollments:\n`)
    enrollments.forEach((enrollment, index) => {
      console.log(`${index + 1}. ${enrollment.beneficiaryOrg.organizationName}`)
      console.log(`   - ID: ${enrollment.id}`)
      console.log(`   - Target Group: ${enrollment.targetGroup}`)
      console.log()
    })

    // Test scenarios
    console.log('🔍 Test Scenarios:\n')

    if (targetSpecificMenu && enrollments.length > 0) {
      const targetGroups = targetSpecificMenu.compatibleTargetGroups

      // Scenario 1: Compatible assignment
      const compatibleEnrollment = enrollments.find((e) =>
        targetGroups.includes(e.targetGroup)
      )

      if (compatibleEnrollment) {
        console.log('✅ Scenario 1: COMPATIBLE Assignment')
        console.log(`   Menu: ${targetSpecificMenu.menuName}`)
        console.log(`   Allowed for: ${targetGroups.join(', ')}`)
        console.log(`   Enrollment: ${compatibleEnrollment.beneficiaryOrg.organizationName}`)
        console.log(`   Target Group: ${compatibleEnrollment.targetGroup}`)
        console.log(`   Expected: ✅ SUCCESS (compatible)`)
        console.log()
        console.log(`   API Test:`)
        console.log(`   POST /api/sppg/menu-plan/validate-assignment`)
        console.log(`   Body: {`)
        console.log(`     "menuId": "${targetSpecificMenu.id}",`)
        console.log(`     "enrollmentId": "${compatibleEnrollment.id}"`)
        console.log(`   }`)
        console.log()
      }

      // Scenario 2: Incompatible assignment
      const incompatibleEnrollment = enrollments.find(
        (e) => !targetGroups.includes(e.targetGroup)
      )

      if (incompatibleEnrollment) {
        console.log('❌ Scenario 2: INCOMPATIBLE Assignment')
        console.log(`   Menu: ${targetSpecificMenu.menuName}`)
        console.log(`   Allowed for: ${targetGroups.join(', ')}`)
        console.log(`   Enrollment: ${incompatibleEnrollment.beneficiaryOrg.organizationName}`)
        console.log(`   Target Group: ${incompatibleEnrollment.targetGroup}`)
        console.log(`   Expected: ❌ ERROR 400 (incompatible)`)
        console.log()
        console.log(`   API Test:`)
        console.log(`   POST /api/sppg/menu-plan/validate-assignment`)
        console.log(`   Body: {`)
        console.log(`     "menuId": "${targetSpecificMenu.id}",`)
        console.log(`     "enrollmentId": "${incompatibleEnrollment.id}"`)
        console.log(`   }`)
        console.log()
      }
    }

    // Scenario 3: Universal menu (always compatible)
    if (universalMenu && enrollments.length > 0) {
      const anyEnrollment = enrollments[0]

      console.log('🌍 Scenario 3: UNIVERSAL Menu (always compatible)')
      console.log(`   Menu: ${universalMenu.menuName}`)
      console.log(`   Allowed for: ALL target groups`)
      console.log(`   Enrollment: ${anyEnrollment.beneficiaryOrg.organizationName}`)
      console.log(`   Target Group: ${anyEnrollment.targetGroup}`)
      console.log(`   Expected: ✅ SUCCESS (universal menu)`)
      console.log()
      console.log(`   API Test:`)
      console.log(`   POST /api/sppg/menu-plan/validate-assignment`)
      console.log(`   Body: {`)
      console.log(`     "menuId": "${universalMenu.id}",`)
      console.log(`     "enrollmentId": "${anyEnrollment.id}"`)
      console.log(`   }`)
      console.log()
    }

    console.log('📝 How to Test API Manually:\n')
    console.log('1. Start development server: npm run dev')
    console.log('2. Login to application')
    console.log('3. Use Postman/curl to test endpoint:')
    console.log()
    console.log('   curl -X POST http://localhost:3000/api/sppg/menu-plan/validate-assignment \\')
    console.log('     -H "Content-Type: application/json" \\')
    console.log('     -d \'{"menuId":"<menu-id>","enrollmentId":"<enrollment-id>"}\'')
    console.log()
    console.log('4. Or use the API documentation endpoint:')
    console.log('   GET http://localhost:3000/api/sppg/menu-plan/validate-assignment')
    console.log()

    console.log('✅ Test data preparation complete!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testValidationAPI()
