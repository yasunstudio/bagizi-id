#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Menu Data for Demo SPPG...\n')

  // Get Demo SPPG
  const demoSppg = await prisma.sppg.findFirst({
    where: { email: 'admin@demo.sppg.id' }
  })

  if (!demoSppg) {
    console.log('❌ Demo SPPG not found')
    return
  }

  console.log(`✅ Found SPPG: ${demoSppg.name}`)
  console.log(`   ID: ${demoSppg.id}\n`)

  // Get menus
  const menus = await prisma.nutritionMenu.findMany({
    where: {
      program: {
        sppgId: demoSppg.id
      }
    },
    include: {
      _count: {
        select: {
          ingredients: true,
          recipeSteps: true
        }
      }
    },
    take: 10
  })

  console.log(`📋 Found ${menus.length} menus\n`)

  menus.forEach((menu, idx) => {
    const hasIngredients = menu._count.ingredients > 0 ? '✅' : '❌'
    const hasRecipe = menu._count.recipeSteps > 0 ? '✅' : '❌'
    
    console.log(`${idx + 1}. ${menu.menuName}`)
    console.log(`   ${hasIngredients} Ingredients: ${menu._count.ingredients}`)
    console.log(`   ${hasRecipe} Recipe Steps: ${menu._count.recipeSteps}`)
    console.log()
  })

  // Summary
  const menusWithIngredients = menus.filter(m => m._count.ingredients > 0).length
  const menusWithRecipes = menus.filter(m => m._count.recipeSteps > 0).length

  console.log('📊 Summary:')
  console.log(`   Menus with ingredients: ${menusWithIngredients}/${menus.length}`)
  console.log(`   Menus with recipes: ${menusWithRecipes}/${menus.length}`)

  await prisma.$disconnect()
}

main().catch(console.error)
