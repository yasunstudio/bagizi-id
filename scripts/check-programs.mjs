import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Checking NutritionProgram data...\n')

  const programs = await prisma.nutritionProgram.findMany({
    include: {
      beneficiaryEnrollments: {
        select: {
          targetGroup: true,
          beneficiaryOrg: {
            select: {
              organizationName: true,
              type: true
            }
          }
        }
      }
    }
  })

  programs.forEach((p, i) => {
    console.log(`\n${i + 1}. ${p.name}`)
    console.log(`   Code: ${p.programCode}`)
    console.log(`   Type: ${p.programType}`)
    console.log(`   Target Group: ${p.targetGroup}`)
    console.log(`   Enrollments (${p.beneficiaryEnrollments.length}):`)
    
    const grouped = {}
    p.beneficiaryEnrollments.forEach(e => {
      if (!grouped[e.targetGroup]) grouped[e.targetGroup] = 0
      grouped[e.targetGroup]++
    })
    
    Object.entries(grouped).forEach(([group, count]) => {
      console.log(`     - ${group}: ${count}`)
    })
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
