/**
 * Check APPROVED MenuPlans with assignments
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkApprovedPlans() {
  try {
    const plans = await prisma.menuPlan.findMany({
      where: { status: 'APPROVED' },
      include: {
        assignments: {
          include: {
            menu: { select: { menuName: true, costPerServing: true } }
          },
          take: 3
        },
        sppg: { select: { name: true, code: true } }
      }
    })

    console.log('📊 APPROVED Menu Plans:\n')
    
    if (plans.length === 0) {
      console.log('❌ No APPROVED plans found!')
      return
    }

    plans.forEach(plan => {
      console.log(`✅ ${plan.name}`)
      console.log(`   SPPG: ${plan.sppg.name} (${plan.sppg.code})`)
      console.log(`   Total Menus: ${plan.totalMenus}`)
      console.log(`   Total Cost: Rp ${plan.totalEstimatedCost.toLocaleString('id-ID')}`)
      console.log(`   Assignments: ${plan.assignments.length} items (showing first 3)`)
      
      plan.assignments.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.menu.menuName}: ${a.plannedPortions} porsi × Rp ${a.menu.costPerServing.toLocaleString('id-ID')} = Rp ${a.estimatedCost.toLocaleString('id-ID')}`)
      })
      console.log('') // Empty line
    })

    console.log(`\n🎯 Total APPROVED plans: ${plans.length}`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

checkApprovedPlans()
