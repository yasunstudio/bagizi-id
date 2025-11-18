import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const programId = 'cmhsi5icy00bisvp11af5wedw'
    
    console.log('\n🔍 Debugging Program:', programId)
    console.log('=' .repeat(60))
    
    // 1. Check if program exists
    const program = await prisma.nutritionProgram.findUnique({
      where: { id: programId },
      include: {
        sppg: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        beneficiaryEnrollments: {
          select: {
            id: true,
            enrollmentStatus: true,
            targetBeneficiaries: true,
            activeBeneficiaries: true,
          }
        },
        _count: {
          select: {
            menus: true,
            menuPlans: true,
            beneficiaryEnrollments: true,
          }
        }
      }
    })
    
    if (!program) {
      console.log('\n❌ Program NOT FOUND in database!')
      return
    }
    
    console.log('\n✅ Program Found!')
    console.log('\nBasic Info:')
    console.log('  ID:', program.id)
    console.log('  Name:', program.name)
    console.log('  Code:', program.programCode)
    console.log('  Type:', program.programType)
    console.log('  Status:', program.status)
    console.log('  SPPG ID:', program.sppgId)
    
    console.log('\nSPPG Info:')
    console.log('  Name:', program.sppg?.name || 'N/A')
    console.log('  Code:', program.sppg?.code || 'N/A')
    
    console.log('\nCounts:')
    console.log('  Menus:', program._count.menus)
    console.log('  Menu Plans:', program._count.menuPlans)
    console.log('  Enrollments:', program._count.beneficiaryEnrollments)
    
    console.log('\nEnrollments:')
    if (program.beneficiaryEnrollments.length === 0) {
      console.log('  No enrollments found')
    } else {
      program.beneficiaryEnrollments.forEach((e, idx) => {
        console.log(`  ${idx + 1}. Status: ${e.enrollmentStatus}, Target: ${e.targetBeneficiaries}, Active: ${e.activeBeneficiaries}`)
      })
    }
    
    // 2. Check demo user
    console.log('\n👤 Checking Demo Users:')
    const users = await prisma.user.findMany({
      where: {
        sppgId: program.sppgId
      },
      select: {
        id: true,
        email: true,
        userRole: true,
        sppgId: true
      }
    })
    
    console.log(`  Found ${users.length} users for this SPPG:`)
    users.forEach(u => {
      console.log(`    - ${u.email} (${u.userRole})`)
    })
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
