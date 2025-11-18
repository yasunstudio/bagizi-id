/**
 * Test script to check if procurement plans exist in database
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPlansQuery() {
  try {
    console.log('🔍 Checking procurement plans in database...\n')

    // Get all SPPG
    const sppgs = await prisma.sppg.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      }
    })

    console.log(`📊 Found ${sppgs.length} SPPG in database:`)
    sppgs.forEach(sppg => {
      console.log(`  - ${sppg.code}: ${sppg.name}`)
    })
    console.log('')

    // Get all procurement plans
    const allPlans = await prisma.procurementPlan.findMany({
      include: {
        sppg: {
          select: {
            code: true,
            name: true,
          }
        },
        program: {
          select: {
            name: true
          }
        }
      }
    })

    console.log(`📋 Found ${allPlans.length} procurement plans in database:\n`)

    if (allPlans.length === 0) {
      console.log('⚠️  NO PLANS FOUND! Database might not be seeded properly.')
      console.log('   Run: npm run db:seed')
    } else {
      allPlans.forEach((plan, index) => {
        console.log(`${index + 1}. ${plan.planName}`)
        console.log(`   ID: ${plan.id}`)
        console.log(`   SPPG: ${plan.sppg?.code} - ${plan.sppg?.name}`)
        console.log(`   Program: ${plan.program?.name || 'N/A'}`)
        console.log(`   Status: ${plan.approvalStatus}`)
        console.log(`   Budget: Rp ${plan.totalBudget?.toLocaleString('id-ID') || 0}`)
        console.log(`   Period: ${plan.planYear}-${String(plan.planMonth).padStart(2, '0')}`)
        console.log(`   Created: ${plan.createdAt}`)
        console.log('')
      })
    }

    // Check if DEMO SPPG has plans
    const demoSppg = sppgs.find(s => s.code === 'SPPG-DEMO-2025')
    if (demoSppg) {
      const demoPlans = await prisma.procurementPlan.findMany({
        where: {
          sppgId: demoSppg.id
        },
        include: {
          program: {
            select: {
              name: true
            }
          }
        }
      })

      console.log(`\n🎯 DEMO SPPG (${demoSppg.code}) has ${demoPlans.length} plans:`)
      if (demoPlans.length === 0) {
        console.log('   ⚠️  No plans for DEMO SPPG!')
      } else {
        demoPlans.forEach(plan => {
          console.log(`   - ${plan.planName} (${plan.approvalStatus})`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testPlansQuery()
