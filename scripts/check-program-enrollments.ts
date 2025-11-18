import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProgramEnrollments() {
  const programId = 'cmhlj387r0138svemd3j9yze7'
  
  console.log('\n🔍 CHECKING: Program Enrollments Data')
  console.log('═'.repeat(80))
  
  // 1. Get program with enrollments
  const program = await prisma.nutritionProgram.findUnique({
    where: { id: programId },
    select: {
      id: true,
      name: true,
      implementationArea: true,
      programEnrollments: {
        select: {
          id: true,
          status: true,
          targetStudents: true,
          activeStudents: true,
          school: {
            select: {
              id: true,
              schoolName: true,
              schoolCode: true,
              schoolAddress: true,
              districtId: true,
            }
          }
        }
      }
    }
  })

  if (!program) {
    console.log('❌ Program not found')
    process.exit(1)
  }

  console.log('\n📊 Program:', program.name)
  console.log('─'.repeat(80))
  console.log('\n📍 Implementation Area:', program.implementationArea)
  
  console.log('\n🏫 Program Enrollments (ProgramSchoolEnrollment):')
  console.log('─'.repeat(80))
  
  if (program.programEnrollments.length === 0) {
    console.log('\n❌ NO ENROLLMENTS FOUND!')
    console.log('   This is the issue - frontend shows "Belum ada sekolah mitra"')
    console.log('   But this might be incorrect if schools exist in other relations.')
  } else {
    console.log(`\n✅ Found ${program.programEnrollments.length} enrollments:`)
    program.programEnrollments.forEach((enrollment, idx) => {
      console.log(`\n${idx + 1}. ${enrollment.school.schoolName}`)
      console.log(`   School Code: ${enrollment.school.schoolCode}`)
      console.log(`   Status: ${enrollment.status}`)
      console.log(`   Target Students: ${enrollment.targetStudents}`)
      console.log(`   Active Students: ${enrollment.activeStudents}`)
      console.log(`   Address: ${enrollment.school.schoolAddress || 'N/A'}`)
    })
  }

  // 2. Check if there are schools in the system
  console.log('\n\n🔍 CHECKING: Available Schools in Database')
  console.log('─'.repeat(80))
  
  const totalSchools = await prisma.school.count({
    where: {
      sppgId: program.id // This might be wrong - schools might use different relation
    }
  })
  
  console.log(`\nTotal schools linked to this program: ${totalSchools}`)
  
  // 3. Check all schools in system
  const allSchools = await prisma.school.findMany({
    take: 5,
    select: {
      id: true,
      schoolName: true,
      schoolCode: true,
      sppgId: true,
      districtId: true,
    }
  })
  
  console.log(`\nSample schools in system (first 5):`)
  allSchools.forEach((school, idx) => {
    console.log(`${idx + 1}. ${school.schoolName} (${school.schoolCode})`)
    console.log(`   SPPG ID: ${school.sppgId}`)
    console.log(`   District ID: ${school.districtId}`)
  })

  // 4. Analysis
  console.log('\n\n📋 ANALYSIS:')
  console.log('─'.repeat(80))
  
  if (program.programEnrollments.length === 0) {
    console.log('\n⚠️ ISSUE IDENTIFIED:')
    console.log('   Frontend Message: "Belum ada sekolah mitra terdaftar"')
    console.log('   Reality: Need to check if:')
    console.log('   1. Schools exist but not enrolled in this program')
    console.log('   2. Enrollment data needs to be seeded')
    console.log('   3. The relation structure is correct')
    console.log('\n   RECOMMENDED: Check schema for proper enrollment setup')
  } else {
    console.log('\n✅ Data is correct!')
    console.log(`   ${program.programEnrollments.length} schools are properly enrolled`)
  }

  console.log('\n' + '═'.repeat(80))
  console.log('✅ CHECK COMPLETE\n')
  
  await prisma.$disconnect()
}

checkProgramEnrollments().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
