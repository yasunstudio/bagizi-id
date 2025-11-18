/**
 * Data Migration Script: Convert Programs to Multi-Target Architecture
 * 
 * Phase 1 - November 7, 2025
 * 
 * Purpose: Migrate existing NutritionProgram records to use new multi-target fields
 * 
 * Strategy:
 * - If program has enrollments only for declared targetGroup → Single-target
 * - If program has enrollments for multiple targetGroups → Multi-target (allow all)
 * - If program has no enrollments → Multi-target (allow all)
 * 
 * @see /docs/PROGRAM_MULTI_TARGET_IMPLEMENTATION_ROADMAP.md
 */

import { PrismaClient, TargetGroup } from '@prisma/client'

const prisma = new PrismaClient()

async function migratePrograms() {
  console.log('🔄 Starting program migration to multi-target architecture...\n')
  
  try {
    // Get all existing programs with their enrollments
    const programs = await prisma.nutritionProgram.findMany({
      include: {
        beneficiaryEnrollments: {
          select: { targetGroup: true }
        }
      }
    })
    
    console.log(`📊 Found ${programs.length} programs to migrate\n`)
    
    let migrated = 0
    let errors = 0
    const stats = {
      multiTargetAll: 0,
      multiTargetRestricted: 0,
      singleTarget: 0,
      noEnrollments: 0
    }
    
    for (const program of programs) {
      try {
        // Get unique target groups from enrollments
        const enrollmentTargets = Array.from(
          new Set(program.beneficiaryEnrollments.map(e => e.targetGroup))
        )
        
        console.log(`📝 Migrating: ${program.name}`)
        console.log(`   Program ID: ${program.id}`)
        console.log(`   Current targetGroup: ${program.targetGroup}`)
        console.log(`   Enrollments: ${program.beneficiaryEnrollments.length}`)
        console.log(`   Unique target groups: ${enrollmentTargets.join(', ') || 'None'}`)
        
        // Determine migration strategy
        let isMultiTarget = true
        let allowedTargetGroups: TargetGroup[] = []
        let primaryTargetGroup = program.targetGroup
        let migrationReason = ''
        
        // Case 1: No enrollments yet
        if (enrollmentTargets.length === 0) {
          console.log('   ℹ️  Strategy: No enrollments → Multi-target (allow all)')
          isMultiTarget = true
          allowedTargetGroups = []
          primaryTargetGroup = program.targetGroup
          migrationReason = 'No enrollments yet, set as multi-target for flexibility'
          stats.noEnrollments++
        }
        // Case 2: Single target group in enrollments matching program target
        else if (enrollmentTargets.length === 1 && enrollmentTargets[0] === program.targetGroup) {
          console.log('   ℹ️  Strategy: Single target (enrollments match program) → Keep single-target')
          isMultiTarget = false
          allowedTargetGroups = []
          primaryTargetGroup = program.targetGroup
          migrationReason = 'All enrollments match program target group'
          stats.singleTarget++
        }
        // Case 3: Multiple target groups in enrollments
        else if (enrollmentTargets.length > 1) {
          console.log('   ℹ️  Strategy: Multiple targets in enrollments → Multi-target (allow all)')
          isMultiTarget = true
          allowedTargetGroups = [] // Empty = allow all
          primaryTargetGroup = program.targetGroup // Keep original as primary
          migrationReason = `Found ${enrollmentTargets.length} different target groups in enrollments`
          stats.multiTargetAll++
        }
        // Case 4: Single enrollment target but doesn't match program (data inconsistency)
        else {
          console.log('   ⚠️  Strategy: Mismatch detected → Multi-target (allow all)')
          isMultiTarget = true
          allowedTargetGroups = []
          primaryTargetGroup = program.targetGroup
          migrationReason = 'Enrollment target mismatch, set as multi-target to preserve data'
          stats.multiTargetAll++
        }
        
        // Update program
        await prisma.nutritionProgram.update({
          where: { id: program.id },
          data: {
            isMultiTarget,
            allowedTargetGroups,
            primaryTargetGroup,
            // Keep old targetGroup for backward compatibility
            targetGroup: program.targetGroup
          }
        })
        
        migrated++
        console.log(`   ✅ Migrated successfully`)
        console.log(`   📋 Config: isMultiTarget=${isMultiTarget}, allowedTargetGroups=${allowedTargetGroups.length === 0 ? '[]' : `[${allowedTargetGroups.join(', ')}]`}`)
        console.log(`   💡 Reason: ${migrationReason}\n`)
        
      } catch (error) {
        errors++
        console.error(`   ❌ Error migrating ${program.name}:`, error)
        console.log('')
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(80))
    console.log('✅ Migration completed!\n')
    console.log('📊 Summary:')
    console.log(`   Total programs: ${programs.length}`)
    console.log(`   Successfully migrated: ${migrated}`)
    console.log(`   Errors: ${errors}`)
    console.log('\n📈 Migration Statistics:')
    console.log(`   Multi-target (all allowed): ${stats.multiTargetAll}`)
    console.log(`   Multi-target (restricted): ${stats.multiTargetRestricted}`)
    console.log(`   Single-target: ${stats.singleTarget}`)
    console.log(`   No enrollments: ${stats.noEnrollments}`)
    console.log('='.repeat(80))
    
    // Verify migration
    console.log('\n🔍 Verifying migration...')
    const verifyPrograms = await prisma.nutritionProgram.findMany({
      select: {
        name: true,
        isMultiTarget: true,
        allowedTargetGroups: true,
        primaryTargetGroup: true,
        targetGroup: true
      }
    })
    
    console.log('\n📋 Programs after migration:')
    verifyPrograms.forEach((p, i) => {
      console.log(`\n${i + 1}. ${p.name}`)
      console.log(`   isMultiTarget: ${p.isMultiTarget}`)
      console.log(`   allowedTargetGroups: ${p.allowedTargetGroups.length === 0 ? '[] (all allowed)' : `[${p.allowedTargetGroups.join(', ')}]`}`)
      console.log(`   primaryTargetGroup: ${p.primaryTargetGroup}`)
      console.log(`   targetGroup (legacy): ${p.targetGroup}`)
    })
    
  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migratePrograms()
  .then(() => {
    console.log('\n✅ Migration script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error)
    process.exit(1)
  })
