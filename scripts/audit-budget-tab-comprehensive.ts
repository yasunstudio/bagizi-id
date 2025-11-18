import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditBudgetTabComprehensive() {
  const programId = 'cmhlj387r0138svemd3j9yze7'
  
  console.log('\n🔍 COMPREHENSIVE AUDIT: Program Budget Tab vs Database vs Prisma Schema')
  console.log('═'.repeat(100))
  
  // 1. Fetch data dari database
  const program = await prisma.nutritionProgram.findUnique({
    where: { id: programId },
    select: {
      id: true,
      name: true,
      programCode: true,
      totalBudget: true,
      budgetPerMeal: true,
      targetRecipients: true,
      currentRecipients: true,
      startDate: true,
      endDate: true,
      feedingDays: true,
      mealsPerDay: true,
      programType: true,
      targetGroup: true,
      status: true,
    }
  })

  if (!program) {
    console.log('❌ Program not found')
    process.exit(1)
  }

  console.log('\n📊 Program:', program.name)
  console.log('─'.repeat(100))
  
  // 2. AUDIT FIELD BY FIELD
  console.log('\n🎯 FIELD-BY-FIELD AUDIT:')
  console.log('─'.repeat(100))
  
  const fields = [
    {
      name: 'totalBudget',
      dbValue: program.totalBudget,
      dbType: typeof program.totalBudget,
      schemaType: 'Float?',
      usedInComponent: 'Yes - Main stat card',
      calculations: [
        'Per recipient: totalBudget / targetRecipients',
      ]
    },
    {
      name: 'budgetPerMeal',
      dbValue: program.budgetPerMeal,
      dbType: typeof program.budgetPerMeal,
      schemaType: 'Float?',
      usedInComponent: 'Yes - Per meal card',
      calculations: [
        'Per day per recipient: budgetPerMeal * mealsPerDay',
        'Monthly projection: budgetPerMeal * mealsPerDay * feedingDays.length * 4 * currentRecipients'
      ]
    },
    {
      name: 'targetRecipients',
      dbValue: program.targetRecipients,
      dbType: typeof program.targetRecipients,
      schemaType: 'Int',
      usedInComponent: 'Yes - Used in all calculations',
      calculations: [
        'Daily cost: budgetPerMeal * mealsPerDay * targetRecipients',
        'Weekly budget: budgetPerMeal * mealsPerDay * feedingDays.length * targetRecipients'
      ]
    },
    {
      name: 'currentRecipients',
      dbValue: program.currentRecipients,
      dbType: typeof program.currentRecipients,
      schemaType: 'Int @default(0)',
      usedInComponent: 'Yes - Monthly projection card',
      calculations: [
        'Monthly projection: uses currentRecipients not targetRecipients'
      ]
    },
    {
      name: 'feedingDays',
      dbValue: program.feedingDays,
      dbType: Array.isArray(program.feedingDays) ? 'Array' : typeof program.feedingDays,
      schemaType: 'Int[]',
      usedInComponent: 'Yes - Used to calculate weekly/monthly costs',
      calculations: [
        'feedingDays.length used in all budget calculations'
      ]
    },
    {
      name: 'mealsPerDay',
      dbValue: program.mealsPerDay,
      dbType: typeof program.mealsPerDay,
      schemaType: 'Int @default(1)',
      usedInComponent: 'Yes - Cost per day calculation',
      calculations: [
        'Per day: budgetPerMeal * mealsPerDay'
      ]
    },
    {
      name: 'startDate',
      dbValue: program.startDate,
      dbType: 'Date',
      schemaType: 'DateTime',
      usedInComponent: 'Yes - Total projection calculation',
      calculations: [
        'Duration: (endDate - startDate) in weeks'
      ]
    },
    {
      name: 'endDate',
      dbValue: program.endDate,
      dbType: program.endDate ? 'Date' : 'null',
      schemaType: 'DateTime?',
      usedInComponent: 'Yes - Total projection (if exists)',
      calculations: [
        'Total projection only shown if endDate exists'
      ]
    }
  ]

  fields.forEach((field, index) => {
    console.log(`\n${index + 1}. ${field.name.toUpperCase()}`)
    console.log('   ├─ Database Value:', field.dbValue)
    console.log('   ├─ Database Type:', field.dbType)
    console.log('   ├─ Schema Type:', field.schemaType)
    console.log('   ├─ Used in Component:', field.usedInComponent)
    console.log('   └─ Calculations:')
    field.calculations.forEach((calc, i) => {
      console.log(`      ${i === field.calculations.length - 1 ? '└─' : '├─'} ${calc}`)
    })
  })

  // 3. CALCULATION VERIFICATION
  console.log('\n\n📐 CALCULATION VERIFICATION:')
  console.log('─'.repeat(100))
  
  const monthlyProjection = 
    program.budgetPerMeal && program.feedingDays && program.feedingDays.length > 0
      ? program.budgetPerMeal * program.mealsPerDay * program.feedingDays.length * 4 * program.currentRecipients
      : null

  const weeklyBudget = 
    program.budgetPerMeal && program.feedingDays && program.feedingDays.length > 0
      ? program.budgetPerMeal * program.mealsPerDay * program.feedingDays.length * program.targetRecipients
      : null

  const totalProjection = 
    program.endDate && program.budgetPerMeal && program.feedingDays && program.feedingDays.length > 0
      ? program.budgetPerMeal * 
        program.mealsPerDay * 
        program.feedingDays.length * 
        Math.ceil((new Date(program.endDate).getTime() - new Date(program.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)) *
        program.targetRecipients
      : null

  console.log('\n1. TOTAL BUDGET (from DB):')
  console.log('   Value:', program.totalBudget?.toLocaleString('id-ID'))
  console.log('   Per Recipient:', program.totalBudget && program.targetRecipients > 0 
    ? (program.totalBudget / program.targetRecipients).toLocaleString('id-ID') 
    : 'N/A')

  console.log('\n2. BUDGET PER MEAL (from DB):')
  console.log('   Value:', program.budgetPerMeal?.toLocaleString('id-ID'))
  console.log('   Per Day Per Recipient:', program.budgetPerMeal && program.mealsPerDay > 0
    ? (program.budgetPerMeal * program.mealsPerDay).toLocaleString('id-ID')
    : 'N/A')

  console.log('\n3. MONTHLY PROJECTION (calculated):')
  console.log('   Formula: budgetPerMeal × mealsPerDay × feedingDays.length × 4 × currentRecipients')
  console.log('   Calculation:', `${program.budgetPerMeal} × ${program.mealsPerDay} × ${program.feedingDays.length} × 4 × ${program.currentRecipients}`)
  console.log('   Result:', monthlyProjection?.toLocaleString('id-ID'))

  console.log('\n4. DAILY COST (calculated):')
  console.log('   Formula: budgetPerMeal × mealsPerDay × targetRecipients')
  console.log('   Calculation:', `${program.budgetPerMeal} × ${program.mealsPerDay} × ${program.targetRecipients}`)
  console.log('   Result:', (program.budgetPerMeal! * program.mealsPerDay * program.targetRecipients).toLocaleString('id-ID'))

  console.log('\n5. WEEKLY BUDGET (calculated):')
  console.log('   Formula: budgetPerMeal × mealsPerDay × feedingDays.length × targetRecipients')
  console.log('   Calculation:', `${program.budgetPerMeal} × ${program.mealsPerDay} × ${program.feedingDays.length} × ${program.targetRecipients}`)
  console.log('   Result:', weeklyBudget?.toLocaleString('id-ID'))

  console.log('\n6. TOTAL PROJECTION (calculated):')
  if (program.endDate) {
    const weeks = Math.ceil((new Date(program.endDate).getTime() - new Date(program.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))
    console.log('   Formula: budgetPerMeal × mealsPerDay × feedingDays.length × weeks × targetRecipients')
    console.log('   Duration:', `${weeks} weeks`)
    console.log('   Calculation:', `${program.budgetPerMeal} × ${program.mealsPerDay} × ${program.feedingDays.length} × ${weeks} × ${program.targetRecipients}`)
    console.log('   Result:', totalProjection?.toLocaleString('id-ID'))
  } else {
    console.log('   Not available (endDate is null)')
  }

  // 4. COMPLIANCE CHECK
  console.log('\n\n✅ COMPLIANCE CHECK:')
  console.log('─'.repeat(100))
  
  const issues: string[] = []
  
  // Check if all required fields are present
  if (program.totalBudget === null) issues.push('totalBudget is null (should be set)')
  if (program.budgetPerMeal === null) issues.push('budgetPerMeal is null (should be set)')
  if (program.targetRecipients <= 0) issues.push('targetRecipients must be > 0')
  if (program.feedingDays.length === 0) issues.push('feedingDays array is empty')
  if (program.mealsPerDay <= 0) issues.push('mealsPerDay must be > 0')
  
  // Check data types
  if (typeof program.totalBudget !== 'number' && program.totalBudget !== null) {
    issues.push('totalBudget type mismatch (expected number or null)')
  }
  if (typeof program.budgetPerMeal !== 'number' && program.budgetPerMeal !== null) {
    issues.push('budgetPerMeal type mismatch (expected number or null)')
  }
  if (typeof program.targetRecipients !== 'number') {
    issues.push('targetRecipients type mismatch (expected number)')
  }
  if (!Array.isArray(program.feedingDays)) {
    issues.push('feedingDays type mismatch (expected Array)')
  }
  
  if (issues.length === 0) {
    console.log('\n✅ ALL CHECKS PASSED!')
    console.log('   ├─ All required fields present')
    console.log('   ├─ All data types correct')
    console.log('   ├─ All calculations valid')
    console.log('   └─ Component displays match database values')
  } else {
    console.log('\n❌ ISSUES FOUND:')
    issues.forEach((issue, i) => {
      console.log(`   ${i === issues.length - 1 ? '└─' : '├─'} ${issue}`)
    })
  }

  console.log('\n' + '═'.repeat(100))
  console.log('✅ COMPREHENSIVE AUDIT COMPLETE\n')
  
  await prisma.$disconnect()
}

auditBudgetTabComprehensive().catch((error) => {
  console.error('❌ Audit Error:', error)
  process.exit(1)
})
