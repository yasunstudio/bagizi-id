#!/usr/bin/env node
/**
 * Check Menu Target Groups - Quick verification script
 * Verifies compatibleTargetGroups and special nutrients in database
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Menu Target Groups...\n')

  try {
    // Get menus with target groups
    const menus = await prisma.nutritionMenu.findMany({
      select: {
        menuName: true,
        compatibleTargetGroups: true,
        folicAcid: true,
        iron: true,
        calcium: true,
      },
      orderBy: {
        menuName: 'asc'
      }
    })

    // Group by target groups
    const summary = {}
    
    menus.forEach(menu => {
      const targets = menu.compatibleTargetGroups.length === 0 
        ? ['UNIVERSAL'] 
        : menu.compatibleTargetGroups
      
      targets.forEach(target => {
        summary[target] = (summary[target] || 0) + 1
      })
    })

    // Display summary
    console.log('📊 Total Menus:', menus.length)
    console.log('\n📋 By Target Group:')
    Object.entries(summary)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([target, count]) => {
        const icon = {
          PREGNANT_WOMAN: '🤰',
          BREASTFEEDING_MOTHER: '🤱',
          SCHOOL_CHILDREN: '🎒',
          TODDLER: '👶',
          TEENAGE_GIRL: '👧',
          ELDERLY: '👴',
          UNIVERSAL: '🌍'
        }[target] || '📌'
        console.log(`  ${icon} ${target}: ${count}`)
      })

    // Check nutrients for specific targets
    const withNutrients = menus.filter(m => 
      m.folicAcid || m.iron || m.calcium
    ).length
    
    console.log(`\n✅ With special nutrients: ${withNutrients}/${menus.length}`)
    console.log('✅ Verification Complete!\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
