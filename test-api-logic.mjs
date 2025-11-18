import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAPILogic() {
  try {
    const programId = 'cmhsi5icy00bisvp11af5wedw'
    const sppgId = 'cmhsi5hts007osvp1sr61ri86' // From previous debug
    
    console.log('\n🧪 Testing API Logic (simulating GET /api/sppg/program/[id])\n')
    console.log('=' .repeat(60))
    
    // Simulate the exact query from API endpoint
    const program = await prisma.nutritionProgram.findFirst({
      where: {
        id: programId,
        sppgId: sppgId, // Multi-tenant filter
      },
      include: {
        sppg: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        beneficiaryEnrollments: {
          select: {
            id: true,
            enrollmentStatus: true,
            enrollmentDate: true,
            startDate: true,
            endDate: true,
            targetBeneficiaries: true,
            activeBeneficiaries: true,
            targetGroup: true,
            beneficiaryOrg: {
              select: {
                id: true,
                organizationName: true,
                type: true,
              }
            }
          }
        },
        _count: {
          select: {
            menus: true,
            menuPlans: true,
            productions: true,
            distributions: true,
            beneficiaryEnrollments: true,
            feedback: true,
          },
        },
      },
    })
    
    if (!program) {
      console.log('❌ Program not found (API would return 404)')
      return
    }
    
    console.log('✅ API Query Successful!\n')
    console.log('Program Details:')
    console.log('  ID:', program.id)
    console.log('  Name:', program.name)
    console.log('  Code:', program.programCode)
    console.log('  Status:', program.status)
    console.log('')
    console.log('SPPG:', program.sppg?.name)
    console.log('')
    console.log('Counts:')
    console.log('  Menus:', program._count.menus)
    console.log('  Enrollments:', program._count.beneficiaryEnrollments)
    console.log('  Productions:', program._count.productions)
    console.log('  Distributions:', program._count.distributions)
    console.log('')
    console.log(`Enrollments (${program.beneficiaryEnrollments.length}):`)
    program.beneficiaryEnrollments.slice(0, 3).forEach((e, idx) => {
      console.log(`  ${idx + 1}. ${e.beneficiaryOrg.organizationName}`)
      console.log(`     Type: ${e.beneficiaryOrg.type}`)
      console.log(`     Target Group: ${e.targetGroup}`)
      console.log(`     Status: ${e.enrollmentStatus}`)
      console.log(`     Beneficiaries: ${e.activeBeneficiaries}/${e.targetBeneficiaries}`)
    })
    if (program.beneficiaryEnrollments.length > 3) {
      console.log(`  ... and ${program.beneficiaryEnrollments.length - 3} more`)
    }
    
    console.log('\n✅ API Response would be:')
    console.log('   { success: true, data: { ...program } }')
    console.log('\n🎉 Frontend should now be able to display this program!')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (error.stack) {
      console.error('\nStack:', error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testAPILogic()
