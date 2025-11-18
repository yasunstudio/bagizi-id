#!/usr/bin/env node

/**
 * Check Menu Ingredients and Recipes for Demo SPPG
 */

import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔍 Checking Menu Ingredients and Recipes for Demo SPPG...\n')

    // Get Demo SPPG
    const demoSppg = await prisma.sppg.findFirst({
      where: { code: 'DEMO-2025' }
    })

    if (!demoSppg) {
      console.log('❌ Demo SPPG not found!')
      return
    }

    console.log(`📋 SPPG: ${demoSppg.name} (${demoSppg.code})`)
    console.log(`   ID: ${demoSppg.id}\n`)

    // Get programs for this SPPG
    const programs = await prisma.nutritionProgram.findMany({
      where: { sppgId: demoSppg.id },
      select: { id: true, name: true }
    })

    console.log(`📊 Programs: ${programs.length}`)
    programs.forEach(p => console.log(`   - ${p.name}`))
    console.log('')

    // Get menus for these programs
    const menus = await prisma.nutritionMenu.findMany({
      where: {
        programId: { in: programs.map(p => p.id) }
      },
      include: {
        ingredients: {
          include: {
            inventoryItem: {
              select: {
                itemName: true,
                itemCode: true
              }
            }
          }
        },
        recipeSteps: true
      },
      orderBy: { menuName: 'asc' }
    })

    console.log(`🍽️  Total Menus: ${menus.length}\n`)

    // Check ingredients and recipes
    let menusWithIngredients = 0
    let menusWithRecipes = 0
    let totalIngredients = 0
    let totalRecipeSteps = 0

    menus.forEach(menu => {
      const hasIngredients = menu.ingredients.length > 0
      const hasRecipes = menu.recipeSteps.length > 0
      
      if (hasIngredients) menusWithIngredients++
      if (hasRecipes) menusWithRecipes++
      
      totalIngredients += menu.ingredients.length
      totalRecipeSteps += menu.recipeSteps.length
      
      const ingredientStatus = hasIngredients ? '✅' : '❌'
      const recipeStatus = hasRecipes ? '✅' : '❌'
      
      console.log(`${ingredientStatus} ${recipeStatus} ${menu.menuName}`)
      console.log(`   Ingredients: ${menu.ingredients.length}, Recipe Steps: ${menu.recipeSteps.length}`)
      
      if (!hasIngredients) {
        console.log(`   ⚠️  NO INGREDIENTS!`)
      }
      if (!hasRecipes) {
        console.log(`   ⚠️  NO RECIPE STEPS!`)
      }
      console.log('')
    })

    // Summary
    console.log('📈 Summary:')
    console.log(`   Total Menus: ${menus.length}`)
    console.log(`   Menus with Ingredients: ${menusWithIngredients}/${menus.length} (${((menusWithIngredients/menus.length)*100).toFixed(1)}%)`)
    console.log(`   Menus with Recipes: ${menusWithRecipes}/${menus.length} (${((menusWithRecipes/menus.length)*100).toFixed(1)}%)`)
    console.log(`   Total Ingredients: ${totalIngredients}`)
    console.log(`   Total Recipe Steps: ${totalRecipeSteps}`)
    console.log(`   Avg Ingredients per Menu: ${(totalIngredients/menus.length).toFixed(1)}`)
    console.log(`   Avg Recipe Steps per Menu: ${(totalRecipeSteps/menus.length).toFixed(1)}`)

    if (menusWithIngredients === 0) {
      console.log('\n❌ CRITICAL: No menus have ingredients! Check seed file.')
    }
    if (menusWithRecipes === 0) {
      console.log('\n❌ CRITICAL: No menus have recipe steps! Check seed file.')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
