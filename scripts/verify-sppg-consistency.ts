/**
 * @fileoverview Verify SPPG Data Consistency
 * Script untuk memverifikasi bahwa semua data SPPG menggunakan sppgId yang konsisten
 * dengan user admin@demo.sppg.id
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifySppgConsistency() {
  console.log('🔍 Verifying SPPG Data Consistency...\n')

  try {
    // 1. Get admin@demo.sppg.id user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@demo.sppg.id' },
      select: {
        id: true,
        email: true,
        name: true,
        sppgId: true,
      },
    })

    if (!adminUser || !adminUser.sppgId) {
      console.error('❌ User admin@demo.sppg.id not found or has no sppgId')
      return
    }

    console.log('✅ Found admin user:')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Name: ${adminUser.name}`)
    console.log(`   SPPG ID: ${adminUser.sppgId}\n`)

    // 2. Get SPPG details
    const sppg = await prisma.sPPG.findUnique({
      where: { id: adminUser.sppgId },
      select: {
        id: true,
        code: true,
        name: true,
      },
    })

    if (!sppg) {
      console.error('❌ SPPG not found')
      return
    }

    console.log('✅ SPPG Details:')
    console.log(`   Code: ${sppg.code}`)
    console.log(`   Name: ${sppg.name}`)
    console.log(`   ID: ${sppg.id}\n`)

    // 3. Check all SPPG-related data
    console.log('📊 Checking data consistency...\n')

    const checks = [
      {
        name: 'Users',
        count: await prisma.user.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Departments',
        count: await prisma.department.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Positions',
        count: await prisma.position.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Employees',
        count: await prisma.employee.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Inventory Items',
        count: await prisma.inventoryItem.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Nutrition Programs',
        count: await prisma.nutritionProgram.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'School Beneficiaries',
        count: await prisma.schoolBeneficiary.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Menu Plans',
        count: await prisma.menuPlan.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Menu Plan Templates',
        count: await prisma.menuPlanTemplate.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Suppliers',
        count: await prisma.supplier.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Procurement Plans',
        count: await prisma.procurementPlan.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Procurements',
        count: await prisma.procurement.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Procurement Settings',
        count: await prisma.procurementSettings.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Food Productions',
        count: await prisma.foodProduction.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Vehicles',
        count: await prisma.vehicle.count({ where: { sppgId: adminUser.sppgId } }),
      },
      {
        name: 'Distribution Schedules',
        count: await prisma.distributionSchedule.count({ where: { sppgId: adminUser.sppgId } }),
      },
    ]

    let allConsistent = true

    for (const check of checks) {
      if (check.count > 0) {
        console.log(`   ✅ ${check.name}: ${check.count} records`)
      } else {
        console.log(`   ⚠️  ${check.name}: 0 records (might be expected)`)
        allConsistent = false
      }
    }

    console.log('\n' + '='.repeat(60))
    
    if (allConsistent) {
      console.log('✅ All data is consistent with admin@demo.sppg.id SPPG!')
    } else {
      console.log('⚠️  Some tables have no data (check if this is expected)')
    }
    
    console.log('='.repeat(60))

    // 4. Sample data check - get first items from each table
    console.log('\n📋 Sample Data Check:\n')

    const sampleProgram = await prisma.nutritionProgram.findFirst({
      where: { sppgId: adminUser.sppgId },
      select: { id: true, name: true, sppgId: true },
    })
    if (sampleProgram) {
      console.log(`   Program: "${sampleProgram.name}"`)
      console.log(`   SPPG ID Match: ${sampleProgram.sppgId === adminUser.sppgId ? '✅ Yes' : '❌ No'}`)
    }

    const sampleSchool = await prisma.schoolBeneficiary.findFirst({
      where: { sppgId: adminUser.sppgId },
      select: { id: true, schoolName: true, sppgId: true },
    })
    if (sampleSchool) {
      console.log(`\n   School: "${sampleSchool.schoolName}"`)
      console.log(`   SPPG ID Match: ${sampleSchool.sppgId === adminUser.sppgId ? '✅ Yes' : '❌ No'}`)
    }

    const sampleProcurement = await prisma.procurement.findFirst({
      where: { sppgId: adminUser.sppgId },
      select: { id: true, procurementCode: true, sppgId: true },
    })
    if (sampleProcurement) {
      console.log(`\n   Procurement: "${sampleProcurement.procurementCode}"`)
      console.log(`   SPPG ID Match: ${sampleProcurement.sppgId === adminUser.sppgId ? '✅ Yes' : '❌ No'}`)
    }

    console.log('\n✅ Verification Complete!')

  } catch (error) {
    console.error('❌ Error during verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifySppgConsistency()
