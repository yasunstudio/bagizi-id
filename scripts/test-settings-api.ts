/**
 * @fileoverview Test Procurement Settings API
 * Quick script to test if settings API returns data correctly
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSettingsAPI() {
  console.log('🔍 Testing Procurement Settings API...\n')

  try {
    // 1. Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@demo.sppg.id' },
      select: {
        id: true,
        email: true,
        name: true,
        sppgId: true,
        userRole: true,
      },
    })

    if (!adminUser) {
      console.error('❌ User admin@demo.sppg.id not found')
      return
    }

    console.log('✅ Admin User Found:')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   SPPG ID: ${adminUser.sppgId}`)
    console.log(`   Role: ${adminUser.userRole}\n`)

    if (!adminUser.sppgId) {
      console.error('❌ Admin user has no sppgId!')
      return
    }

    // 2. Check if settings exist
    const settings = await prisma.procurementSettings.findUnique({
      where: { sppgId: adminUser.sppgId },
      include: {
        approvalLevels: {
          orderBy: { level: 'asc' },
        },
        customCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        notificationRules: true,
        paymentTerms: {
          where: { isActive: true },
          orderBy: { code: 'asc' },
        },
        qcChecklists: {
          where: { isActive: true },
          orderBy: { code: 'asc' },
        },
      },
    })

    if (!settings) {
      console.log('⚠️  No settings found for this SPPG')
      console.log('   This is why the page shows "Initialize" button\n')
      console.log('Solution: Settings should be created via seed or initialize endpoint')
      return
    }

    console.log('✅ Settings Found!')
    console.log(`   Settings ID: ${settings.id}`)
    console.log(`   Auto Approve Threshold: Rp ${settings.autoApproveThreshold.toLocaleString()}`)
    console.log(`   Require QC Photos: ${settings.requireQCPhotos}`)
    console.log(`   Default Payment Term: ${settings.defaultPaymentTerm}\n`)

    console.log('📊 Related Data:')
    console.log(`   Approval Levels: ${settings.approvalLevels.length}`)
    console.log(`   Custom Categories: ${settings.customCategories.length}`)
    console.log(`   Notification Rules: ${settings.notificationRules.length}`)
    console.log(`   Payment Terms: ${settings.paymentTerms.length}`)
    console.log(`   QC Checklists: ${settings.qcChecklists.length}\n`)

    if (settings.approvalLevels.length > 0) {
      console.log('📋 Approval Levels:')
      settings.approvalLevels.forEach((level) => {
        console.log(`   Level ${level.level}: ${level.levelName}`)
        console.log(`      Range: Rp ${level.minAmount.toLocaleString()} - ${level.maxAmount ? `Rp ${level.maxAmount.toLocaleString()}` : 'Unlimited'}`)
        console.log(`      Role: ${level.requiredRole}`)
      })
      console.log('')
    }

    if (settings.paymentTerms.length > 0) {
      console.log('💰 Payment Terms:')
      settings.paymentTerms.forEach((term) => {
        console.log(`   ${term.code}: ${term.name} (${term.dueDays} days)`)
      })
      console.log('')
    }

    console.log('✅ Settings API Test Complete!')
    console.log('\n🎯 Expected Page Behavior:')
    console.log('   - useSettings() hook should return this data')
    console.log('   - Page should show settings form (NOT initialize button)')
    console.log('   - All tabs should have data')
    console.log('\n⚠️  If page still shows "Initialize" button:')
    console.log('   1. Check browser console for API errors')
    console.log('   2. Verify user is logged in as admin@demo.sppg.id')
    console.log('   3. Check Network tab for /api/sppg/procurement/settings response')
    console.log('   4. Clear browser cache and reload')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSettingsAPI()
