/**
 * Direct test to check procurement plans in database
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPlans() {
  try {
    console.log('🔍 Testing procurement plans query...\n')

    // Get DEMO-2025 SPPG
    const demoSppg = await prisma.sPPG.findFirst({
      where: { code: 'DEMO-2025' }
    })

    if (!demoSppg) {
      console.log('❌ DEMO-2025 SPPG not found!')
      return
    }

    console.log('✅ Found DEMO-2025 SPPG:')
    console.log('   ID:', demoSppg.id)
    console.log('   Code:', demoSppg.code)
    console.log('   Name:', demoSppg.name)
    console.log('')

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@demo.sppg.id' }
    })

    if (!adminUser) {
      console.log('❌ admin@demo.sppg.id not found!')
    } else {
      console.log('✅ Found admin@demo.sppg.id:')
      console.log('   sppgId:', adminUser.sppgId)
      console.log('   Match:', adminUser.sppgId === demoSppg.id ? '✅ YES' : '❌ NO')
      console.log('')
    }

    // Query procurement plans for this SPPG
    const plans = await prisma.procurementPlan.findMany({
      where: { sppgId: demoSppg.id },
      include: {
        program: {
          select: {
            name: true
          }
        },
        menuPlan: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            status: true
          }
        }
      }
    })

    console.log(`📊 Found ${plans.length} procurement plans for DEMO-2025:\n`)

    if (plans.length === 0) {
      console.log('⚠️  NO PLANS FOUND!')
      console.log('   This means procurement seed did not create plans for DEMO-2025')
      console.log('   Or plans were created for different SPPG')
    } else {
      plans.forEach((plan, i) => {
        console.log(`${i + 1}. ${plan.planName}`)
        console.log(`   ID: ${plan.id}`)
        console.log(`   Status: ${plan.approvalStatus}`)
        console.log(`   Budget: Rp ${plan.totalBudget?.toLocaleString('id-ID')}`)
        console.log(`   Program: ${plan.program?.name || 'N/A'}`)
        console.log(`   Menu Plan: ${plan.menuPlan ? `✅ ${plan.menuPlan.name}` : '❌ Tidak terhubung'}`)
        if (plan.menuPlan) {
          console.log(`   Menu Period: ${plan.menuPlan.startDate.toLocaleDateString('id-ID')} - ${plan.menuPlan.endDate.toLocaleDateString('id-ID')}`)
        }
        console.log(`   Period: ${plan.planYear}-${String(plan.planMonth).padStart(2, '0')}`)
        console.log('')
      })
    }

    // Check all plans in database
    const allPlans = await prisma.procurementPlan.findMany({
      include: {
        sppg: {
          select: {
            code: true,
            name: true
          }
        }
      }
    })

    console.log(`\n📋 Total plans in database: ${allPlans.length}`)
    if (allPlans.length > 0) {
      console.log('\nAll plans by SPPG:')
      allPlans.forEach(plan => {
        console.log(`  - ${plan.planName} → SPPG: ${plan.sppg?.code}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPlans()
