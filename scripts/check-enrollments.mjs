import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Checking ProgramBeneficiaryEnrollment data...\n')

  // Count by target group
  const byTargetGroup = await prisma.programBeneficiaryEnrollment.groupBy({
    by: ['targetGroup'],
    _count: { id: true }
  })

  console.log('By Target Group:')
  byTargetGroup.forEach(g => {
    console.log(`  ${g.targetGroup}: ${g._count.id} enrollments`)
  })

  // Count total
  const total = await prisma.programBeneficiaryEnrollment.count()
  console.log(`\nTotal Enrollments: ${total}`)

  // List all with organization names
  const all = await prisma.programBeneficiaryEnrollment.findMany({
    include: {
      beneficiaryOrg: {
        select: {
          organizationName: true,
          type: true
        }
      },
      program: {
        select: {
          name: true
        }
      }
    }
  })

  console.log('\n📋 All Enrollments:')
  all.forEach((e, i) => {
    console.log(`${i + 1}. ${e.targetGroup} - ${e.beneficiaryOrg.organizationName} (${e.beneficiaryOrg.type})`)
    console.log(`   Program: ${e.program.name}`)
    console.log(`   Beneficiaries: ${e.targetBeneficiaries}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
