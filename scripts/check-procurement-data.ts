/**
 * Quick script to check procurement data in database
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking procurement data...\n')

  // Check SPPG count
  const sppgCount = await prisma.sppg.count()
  console.log(`📊 SPPG records: ${sppgCount}`)

  // Check Procurement count
  const procurementCount = await prisma.procurement.count()
  console.log(`📦 Procurement records: ${procurementCount}`)

  // Check PaymentTransaction count
  const paymentCount = await prisma.paymentTransaction.count()
  console.log(`💰 PaymentTransaction records: ${paymentCount}\n`)

  // Check demo user
  const demoUser = await prisma.user.findUnique({
    where: { email: 'kepala@demo.sppg.id' },
    select: {
      id: true,
      name: true,
      email: true,
      userRole: true,
      sppgId: true,
    }
  })

  if (demoUser) {
    console.log('👤 Demo User (kepala@demo.sppg.id):')
    console.log(`   - ID: ${demoUser.id}`)
    console.log(`   - Name: ${demoUser.name}`)
    console.log(`   - Role: ${demoUser.userRole}`)
    console.log(`   - SPPG ID: ${demoUser.sppgId}\n`)

    if (demoUser.sppgId) {
      // Check procurements for this SPPG
      const sppgProcurements = await prisma.procurement.findMany({
        where: { sppgId: demoUser.sppgId },
        select: {
          id: true,
          procurementCode: true,
          totalAmount: true,
          paidAmount: true,
          paymentStatus: true,
          paymentDue: true,
        },
        take: 5
      })

      console.log(`📋 Procurements for this SPPG: ${sppgProcurements.length}`)
      sppgProcurements.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.procurementCode}`)
        console.log(`      Total: Rp ${p.totalAmount.toLocaleString()}`)
        console.log(`      Paid: Rp ${p.paidAmount.toLocaleString()}`)
        console.log(`      Status: ${p.paymentStatus}`)
        console.log(`      Due: ${p.paymentDue?.toISOString().split('T')[0] || 'N/A'}`)
      })
    }
  } else {
    console.log('❌ Demo user not found!')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
