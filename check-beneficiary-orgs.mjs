import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Checking Beneficiary Organizations...\n')

  // Get all beneficiary organizations
  const orgs = await prisma.beneficiaryOrganization.findMany({
    select: {
      id: true,
      organizationCode: true,
      organizationName: true,
      type: true,
      subType: true,
    },
    orderBy: [
      { type: 'asc' },
      { subType: 'asc' },
    ],
  })

  console.log(`Total Organizations: ${orgs.length}\n`)

  // Group by type
  const grouped = orgs.reduce((acc, org) => {
    if (!acc[org.type]) {
      acc[org.type] = {}
    }
    if (!acc[org.type][org.subType]) {
      acc[org.type][org.subType] = []
    }
    acc[org.type][org.subType].push(org)
    return acc
  }, {})

  // Display grouped results
  for (const [type, subTypes] of Object.entries(grouped)) {
    console.log(`\n🏛️  ${type}:`)
    for (const [subType, organizations] of Object.entries(subTypes)) {
      console.log(`  ├─ ${subType}: ${organizations.length} org(s)`)
      organizations.forEach((org) => {
        console.log(`  │  └─ [${org.organizationCode}] ${org.organizationName}`)
      })
    }
  }

  // Verify against schema constraints
  console.log('\n\n✅ Schema Compliance Check:\n')

  const validTypes = ['SCHOOL', 'HEALTH_FACILITY', 'INTEGRATED_SERVICE_POST']
  const validSubTypes = {
    SCHOOL: ['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'SMK', 'PESANTREN'],
    HEALTH_FACILITY: ['PUSKESMAS', 'KLINIK', 'RUMAH_SAKIT'],
    INTEGRATED_SERVICE_POST: ['POSYANDU'],
  }

  let hasViolations = false

  orgs.forEach((org) => {
    // Check type
    if (!validTypes.includes(org.type)) {
      console.log(`❌ Invalid type: ${org.type} in [${org.organizationCode}] ${org.organizationName}`)
      hasViolations = true
    }

    // Check subType
    if (!validSubTypes[org.type]?.includes(org.subType)) {
      console.log(`❌ Invalid subType: ${org.subType} for type ${org.type} in [${org.organizationCode}] ${org.organizationName}`)
      hasViolations = true
    }
  })

  if (!hasViolations) {
    console.log('✅ All organizations comply with new schema!')
    console.log('   • Only 3 organization types (SCHOOL, HEALTH_FACILITY, INTEGRATED_SERVICE_POST)')
    console.log('   • Only 11 valid sub-types')
    console.log('   • No removed types (COMMUNITY_CENTER, RELIGIOUS_INSTITUTION)')
    console.log('   • No removed sub-types (PKK, BALAI_WARGA, MASJID, etc.)')
  }

  console.log('\n📊 Summary:')
  console.log(`   • Total Organizations: ${orgs.length}`)
  console.log(`   • SCHOOL: ${orgs.filter((o) => o.type === 'SCHOOL').length}`)
  console.log(`   • HEALTH_FACILITY: ${orgs.filter((o) => o.type === 'HEALTH_FACILITY').length}`)
  console.log(`   • INTEGRATED_SERVICE_POST: ${orgs.filter((o) => o.type === 'INTEGRATED_SERVICE_POST').length}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
