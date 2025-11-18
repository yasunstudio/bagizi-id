import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditProgramBudget() {
  const programId = 'cmhlj387r0138svemd3j9yze7'
  
  const program = await prisma.nutritionProgram.findUnique({
    where: { id: programId },
    select: {
      id: true,
      name: true,
      programCode: true,
      // BUDGET FIELDS (focus audit)
      totalBudget: true,
      budgetPerMeal: true,
      // RECIPIENTS FIELDS
      targetRecipients: true,
      currentRecipients: true,
      // DATE FIELDS
      startDate: true,
      endDate: true,
      // SCHEDULE FIELDS
      feedingDays: true,
      mealsPerDay: true,
      // OTHER FIELDS
      programType: true,
      targetGroup: true,
      status: true,
    }
  })

  if (!program) {
    console.log('❌ Program not found')
    process.exit(1)
  }

  console.log('\n📊 AUDIT PROGRAM: ' + program.name)
  console.log('═'.repeat(80))
  
  console.log('\n🔢 BUDGET FIELDS:')
  console.log('├─ totalBudget:', program.totalBudget)
  console.log('├─ budgetPerMeal:', program.budgetPerMeal)
  console.log('└─ Data Type:', typeof program.totalBudget, '/', typeof program.budgetPerMeal)
  
  console.log('\n👥 RECIPIENTS FIELDS:')
  console.log('├─ targetRecipients:', program.targetRecipients)
  console.log('├─ currentRecipients:', program.currentRecipients)
  console.log('└─ Data Type:', typeof program.targetRecipients, '/', typeof program.currentRecipients)
  
  console.log('\n📅 DATE FIELDS:')
  console.log('├─ startDate:', program.startDate)
  console.log('├─ endDate:', program.endDate)
  console.log('└─ Data Type:', typeof program.startDate, '/', typeof program.endDate)
  
  console.log('\n🗓️ SCHEDULE FIELDS:')
  console.log('├─ feedingDays:', program.feedingDays)
  console.log('├─ mealsPerDay:', program.mealsPerDay)
  console.log('└─ Data Type:', Array.isArray(program.feedingDays) ? 'Array' : typeof program.feedingDays, '/', typeof program.mealsPerDay)
  
  console.log('\n📋 SCHEMA VALIDATION:')
  console.log('├─ programType:', program.programType)
  console.log('├─ targetGroup:', program.targetGroup)
  console.log('└─ status:', program.status)
  
  console.log('\n✅ AUDIT COMPLETE')
  
  await prisma.$disconnect()
}

auditProgramBudget().catch((error) => {
  console.error('❌ Audit Error:', error)
  process.exit(1)
})
