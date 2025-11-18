/**
 * Script untuk memverifikasi data program enrollments
 * Membandingkan data di database dengan yang ditampilkan di frontend
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyProgramEnrollments() {
  const programId = 'cmhvm4dh800bvsvpa93d2cvfh'
  
  console.log('🔍 Verifikasi Data Program Enrollments')
  console.log('=' .repeat(80))
  console.log(`Program ID: ${programId}\n`)
  
  try {
    // Fetch program data dengan enrollments seperti di API
    const program = await prisma.nutritionProgram.findUnique({
      where: { id: programId },
      include: {
        beneficiaryEnrollments: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            enrollmentStatus: true,
            enrollmentDate: true,
            startDate: true,
            endDate: true,
            targetBeneficiaries: true,
            activeBeneficiaries: true,
            targetGroup: true,
            isActive: true,
            beneficiaryOrg: {
              select: {
                id: true,
                organizationName: true,
                type: true,
              }
            }
          },
          orderBy: {
            enrollmentDate: 'desc'
          }
        }
      }
    })
    
    if (!program) {
      console.log('❌ Program tidak ditemukan!')
      return
    }
    
    console.log('📋 PROGRAM INFO')
    console.log(`Nama: ${program.name}`)
    console.log(`Code: ${program.programCode}`)
    console.log(`Implementation Area: ${program.implementationArea}`)
    console.log(`Target Recipients: ${program.targetRecipients}`)
    console.log(`Current Recipients: ${program.currentRecipients}`)
    console.log(`\n`)
    
    console.log('📊 ENROLLMENT DATA DARI DATABASE')
    console.log('=' .repeat(80))
    console.log(`Total Enrollments (isActive=true): ${program.beneficiaryEnrollments.length}\n`)
    
    // Calculate totals
    let totalTarget = 0
    let totalActive = 0
    
    program.beneficiaryEnrollments.forEach((enrollment, idx) => {
      totalTarget += enrollment.targetBeneficiaries
      totalActive += enrollment.activeBeneficiaries || 0
      
      console.log(`${idx + 1}. ${enrollment.beneficiaryOrg.organizationName}`)
      console.log(`   Tipe: ${enrollment.beneficiaryOrg.type}`)
      console.log(`   Target: ${enrollment.targetBeneficiaries} penerima`)
      console.log(`   Aktif: ${enrollment.activeBeneficiaries || 0} penerima`)
      console.log(`   Status Enrollment: ${enrollment.enrollmentStatus}`)
      console.log(`   Is Active: ${enrollment.isActive}`)
      console.log(`   Target Group: ${enrollment.targetGroup}`)
      console.log(`   Enrollment Date: ${enrollment.enrollmentDate.toISOString().split('T')[0]}`)
      console.log(`   ID: ${enrollment.id}`)
      console.log('')
    })
    
    console.log('=' .repeat(80))
    console.log('📈 SUMMARY')
    console.log(`Total Organizations (Active): ${program.beneficiaryEnrollments.length}`)
    console.log(`Total Target from Enrollments: ${totalTarget}`)
    console.log(`Total Active from Enrollments: ${totalActive}`)
    console.log(`\nProgram Target: ${program.targetRecipients}`)
    console.log(`Program Current: ${program.currentRecipients}`)
    console.log(`\n⚠️  Gap Analysis:`)
    console.log(`   Target vs Enrollments: ${program.targetRecipients - totalTarget} (${totalTarget} / ${program.targetRecipients})`)
    console.log(`   Active vs Target: ${totalTarget - totalActive} (${totalActive} / ${totalTarget})`)
    
    // Check for duplicates
    console.log('\n🔍 DUPLICATE CHECK')
    console.log('=' .repeat(80))
    const orgNames = program.beneficiaryEnrollments.map(e => e.beneficiaryOrg.organizationName)
    const duplicates = orgNames.filter((name, index) => orgNames.indexOf(name) !== index)
    
    if (duplicates.length > 0) {
      console.log('⚠️  DITEMUKAN DUPLIKAT:')
      const uniqueDuplicates = [...new Set(duplicates)]
      uniqueDuplicates.forEach(name => {
        const count = orgNames.filter(n => n === name).length
        console.log(`   - "${name}" muncul ${count} kali`)
      })
      
      console.log('\n📋 Detail Duplikat:')
      uniqueDuplicates.forEach(dupName => {
        const dups = program.beneficiaryEnrollments.filter(
          e => e.beneficiaryOrg.organizationName === dupName
        )
        console.log(`\n   ${dupName}:`)
        dups.forEach(d => {
          console.log(`   - ID: ${d.id}`)
          console.log(`     Target: ${d.targetBeneficiaries}, Aktif: ${d.activeBeneficiaries}`)
          console.log(`     Status: ${d.enrollmentStatus}, Active: ${d.isActive}`)
          console.log(`     Org ID: ${d.beneficiaryOrg.id}`)
        })
      })
    } else {
      console.log('✅ Tidak ada duplikat organisasi')
    }
    
    // Group by type
    console.log('\n📊 GROUP BY TYPE')
    console.log('=' .repeat(80))
    const byType = program.beneficiaryEnrollments.reduce((acc, e) => {
      const type = e.beneficiaryOrg.type
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(e)
      return acc
    }, {})
    
    Object.keys(byType).forEach(type => {
      const items = byType[type]
      const totalT = items.reduce((sum, i) => sum + i.targetBeneficiaries, 0)
      const totalA = items.reduce((sum, i) => sum + (i.activeBeneficiaries || 0), 0)
      console.log(`${type}: ${items.length} org, Target: ${totalT}, Aktif: ${totalA}`)
      items.forEach(item => {
        console.log(`  - ${item.beneficiaryOrg.organizationName} (T:${item.targetBeneficiaries}, A:${item.activeBeneficiaries})`)
      })
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyProgramEnrollments()
