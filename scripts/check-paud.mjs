#!/usr/bin/env node

/**
 * Check PAUD organizations
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking PAUD organizations...\n')

  const pauds = await prisma.beneficiaryOrganization.findMany({
    where: {
      type: 'SCHOOL',
      subType: 'PAUD'
    },
    include: {
      sppg: {
        select: {
          name: true
        }
      }
    }
  })

  console.log(`Found ${pauds.length} PAUD organizations:\n`)
  
  pauds.forEach(paud => {
    console.log(`- ${paud.organizationName}`)
    console.log(`  SPPG: ${paud.sppg.name}`)
    console.log(`  SPPG ID: ${paud.sppgId}`)
    console.log(`  ID: ${paud.id}\n`)
  })

  // Check enrollments for TODDLER
  const toddlerEnrollments = await prisma.programBeneficiaryEnrollment.findMany({
    where: {
      targetGroup: 'TODDLER'
    },
    include: {
      beneficiaryOrg: true,
      program: true
    }
  })

  console.log(`\n📊 Found ${toddlerEnrollments.length} TODDLER enrollments:`)
  toddlerEnrollments.forEach(e => {
    console.log(`- ${e.beneficiaryOrg.organizationName}`)
    console.log(`  Program: ${e.program.name}`)
    console.log(`  SPPG ID: ${e.sppgId}`)
  })

  await prisma.$disconnect()
}

main()
