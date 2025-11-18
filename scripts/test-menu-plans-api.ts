/**
 * Test Menu Plans API Response Structure
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testMenuPlansApi() {
  try {
    // Simulate what the API does
    const user = await prisma.user.findFirst({
      where: { email: 'admin@demo.sppg.id' }
    })
    
    if (!user?.sppgId) {
      console.error('❌ No sppgId found for user')
      return
    }
    
    console.log(`✅ User: ${user.email}`)
    console.log(`✅ SPPG ID: ${user.sppgId}\n`)
    
    // Fetch menu plans exactly like API does
    const menuPlans = await prisma.menuPlan.findMany({
      where: {
        sppgId: user.sppgId,
        isArchived: false,
        status: 'APPROVED',
      },
      select: {
        id: true,
        programId: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        status: true,
        totalDays: true,
        totalMenus: true,
        totalEstimatedCost: true,
        averageCostPerDay: true,
        approvedAt: true,
      },
      orderBy: [
        { status: 'asc' },
        { startDate: 'desc' },
      ],
    })
    
    console.log(`📊 Found ${menuPlans.length} APPROVED menu plans:\n`)
    
    menuPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name}`)
      console.log(`   ID: ${plan.id}`)
      console.log(`   Status: ${plan.status}`)
      console.log(`   Total Menus: ${plan.totalMenus}`)
      console.log(`   Total Cost: Rp ${plan.totalEstimatedCost.toLocaleString('id-ID')}`)
      console.log(`   Start: ${plan.startDate.toLocaleDateString('id-ID')}`)
      console.log(`   End: ${plan.endDate.toLocaleDateString('id-ID')}`)
      console.log('')
    })
    
    // Simulate API response structure
    const apiResponse = {
      success: true,
      data: menuPlans,
      meta: {
        total: menuPlans.length,
        sppgId: user.sppgId,
        filters: {
          status: 'APPROVED',
          isArchived: false,
        },
      },
    }
    
    console.log('🔍 API Response Structure:')
    console.log(JSON.stringify(apiResponse, null, 2))
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

testMenuPlansApi()
