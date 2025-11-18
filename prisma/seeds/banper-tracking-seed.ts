/**
 * @fileoverview Seed file untuk Banper Request Tracking (Government Budget Tracking)
 * @version Next.js 15.5.4 / Prisma 6.19.0
 * @author Bagizi-ID Development Team
 * 
 * Seeds realistic government budget tracking data:
 * - Multiple banper requests in different statuses
 * - Budget allocations from various sources
 * - Transaction history with different categories
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedBanperTracking() {
  console.log('  → Seeding Banper Request Tracking...')

  try {
    // Get existing SPPGs and Programs with creators
    const sppgs = await prisma.sPPG.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        nutritionPrograms: {
          take: 3
        },
        users: {
          where: {
            userRole: {
              in: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN']
            }
          },
          take: 1
        }
      }
    })

    if (sppgs.length === 0) {
      console.log('  ⚠️  No active SPPGs found, skipping Banper tracking seed')
      return
    }

    let totalBanperRequests = 0
    let totalAllocations = 0
    let totalTransactions = 0

    // Create banper requests for each SPPG
    for (const sppg of sppgs) {
      const programs = sppg.nutritionPrograms
      const creator = sppg.users[0]

      if (programs.length === 0 || !creator) continue

      // === BANPER REQUEST 1: DISBURSED (Completed) ===
      const banper1 = await prisma.banperRequestTracking.create({
        data: {
          sppgId: sppg.id,
          programId: programs[0].id,
          bgnRequestNumber: `BGN-2024-${sppg.code}-001`,
          requestedAmount: 500000000, // 500 juta
          operationalPeriod: '12 bulan',
          totalBeneficiaries: 1000,
          foodCostTotal: 350000000,
          operationalCost: 100000000,
          transportCost: 30000000,
          utilityCost: 20000000,
          
          // Submitted info
          bgnStatus: 'DISBURSED',
          bgnSubmissionDate: new Date('2024-01-15'),
          bgnPortalUrl: 'https://bgn.go.id/request/2024-001',
          
          // Approval info
          bgnApprovalNumber: 'SK-001/BGN/2024',
          bgnApprovalDate: new Date('2024-02-20'),
          bgnApprovedByName: 'Dr. Budi Santoso',
          bgnApprovedByPosition: 'Kepala Bagian Anggaran Pemerintah',
          
          // Disbursement info
          disbursedAmount: 500000000,
          disbursedDate: new Date('2024-03-01'),
          bankReferenceNumber: 'TRF-202403-001234',
          bankAccountReceived: '1234567890',
          
          internalNotes: 'Program bantuan pemerintah tahun 2024 untuk makan bergizi anak',
          createdBy: creator.id,
        }
      })
      totalBanperRequests++

      // Create allocation from APBN (not banper)
      const allocation1 = await prisma.programBudgetAllocation.create({
        data: {
          sppgId: sppg.id,
          programId: programs[0].id,
          banperTrackingId: banper1.id,
          source: 'APBN_PUSAT',
          allocatedAmount: 500000000,
          remainingAmount: 320000000, // 180 juta already spent
          spentAmount: 180000000,
          fiscalYear: 2024,
          status: 'ACTIVE',
          allocatedDate: new Date('2024-03-01'),
          allocatedBy: creator.id,
          decreeNumber: 'SK-001/BGN/2024',
          decreeDate: new Date('2024-02-20'),
        }
      })
      totalAllocations++

      // Create transactions for this allocation
      const transactions1 = [
        {
          category: 'FOOD_PROCUREMENT',
          amount: 80000000,
          description: 'Pembelian beras 8000 kg @ Rp 10,000/kg',
          receiptNumber: 'INV-2024-001',
          transactionDate: new Date('2024-03-15'),
        },
        {
          category: 'FOOD_PROCUREMENT',
          amount: 45000000,
          description: 'Pembelian ayam 900 kg @ Rp 50,000/kg',
          receiptNumber: 'INV-2024-002',
          transactionDate: new Date('2024-04-10'),
        },
        {
          category: 'OPERATIONAL',
          amount: 25000000,
          description: 'Biaya listrik dan air bulan Maret-Mei 2024',
          receiptNumber: 'INV-2024-003',
          transactionDate: new Date('2024-05-05'),
        },
        {
          category: 'STAFF_SALARY',
          amount: 30000000,
          description: 'Gaji koki dan staff dapur bulan Maret-April',
          receiptNumber: 'PAYROLL-2024-04',
          transactionDate: new Date('2024-04-30'),
        },
      ] as const

      for (const txData of transactions1) {
        await prisma.budgetTransaction.create({
          data: {
            allocationId: allocation1.id,
            sppgId: sppg.id,
            programId: programs[0].id,
            transactionNumber: `TRX-${sppg.code}-2024-${String(totalTransactions + 1).padStart(4, '0')}`,
            category: txData.category,
            amount: txData.amount,
            description: txData.description,
            receiptNumber: txData.receiptNumber,
            transactionDate: txData.transactionDate,
            approvedBy: creator.id,
            approvedAt: new Date(txData.transactionDate.getTime() + 86400000), // +1 day
            createdBy: creator.id,
          }
        })
        totalTransactions++
      }

      // === BANPER REQUEST 2: APPROVED (Waiting disbursement) ===
      if (programs.length > 1) {
        await prisma.banperRequestTracking.create({
          data: {
            sppgId: sppg.id,
            programId: programs[1].id,
            bgnRequestNumber: `BGN-2025-${sppg.code}-001`,
            requestedAmount: 750000000, // 750 juta
            operationalPeriod: '12 bulan',
            totalBeneficiaries: 1500,
            foodCostTotal: 550000000,
            operationalCost: 150000000,
            transportCost: 30000000,
            utilityCost: 20000000,
            
            bgnStatus: 'APPROVED_BY_BGN',
            bgnSubmissionDate: new Date('2025-10-01'),
            bgnPortalUrl: 'https://bgn.go.id/request/2025-001',
            
            bgnApprovalNumber: 'SK-045/BGN/2025',
            bgnApprovalDate: new Date('2025-11-05'),
            bgnApprovedByName: 'Dr. Ahmad Budiman',
            bgnApprovedByPosition: 'Kepala Bagian Anggaran Pemerintah',
            
            internalNotes: 'Menunggu pencairan dana dari BGN',
            createdBy: creator.id,
          }
        })
        totalBanperRequests++
      }

      // === BANPER REQUEST 3: UNDER REVIEW ===
      if (programs.length > 2) {
        await prisma.banperRequestTracking.create({
          data: {
            sppgId: sppg.id,
            programId: programs[2].id,
            bgnRequestNumber: `BGN-2025-${sppg.code}-002`,
            requestedAmount: 600000000, // 600 juta
            operationalPeriod: '12 bulan',
            totalBeneficiaries: 1200,
            foodCostTotal: 450000000,
            operationalCost: 100000000,
            transportCost: 30000000,
            utilityCost: 20000000,
            
            bgnStatus: 'UNDER_REVIEW_BGN',
            bgnSubmissionDate: new Date('2025-10-15'),
            bgnPortalUrl: 'https://bgn.go.id/request/2025-002',
            
            internalNotes: 'Sedang dalam proses review BGN',
            createdBy: creator.id,
          }
        })
        totalBanperRequests++
      }

      // === MANUAL ALLOCATION 1: APBD Provinsi ===
      const allocation2 = await prisma.programBudgetAllocation.create({
        data: {
          sppgId: sppg.id,
          programId: programs[0].id,
          source: 'APBD_PROVINSI',
          allocatedAmount: 200000000, // 200 juta
          remainingAmount: 80000000, // 120 juta spent
          spentAmount: 120000000,
          fiscalYear: 2024,
          status: 'ACTIVE',
          allocatedDate: new Date('2024-01-10'),
          allocatedBy: creator.id,
          decreeNumber: 'SK-APBD-PROV-2024-001',
          decreeDate: new Date('2024-01-05'),
        }
      })
      totalAllocations++

      // Create transactions for APBD allocation
      const transactions2 = [
        {
          category: 'FOOD_PROCUREMENT',
          amount: 60000000,
          description: 'Pembelian sayuran segar bulanan',
          receiptNumber: 'INV-APBD-001',
          transactionDate: new Date('2024-02-15'),
        },
        {
          category: 'EQUIPMENT',
          amount: 40000000,
          description: 'Pembelian kompor gas industri 5 unit',
          receiptNumber: 'INV-APBD-002',
          transactionDate: new Date('2024-03-20'),
        },
        {
          category: 'PACKAGING',
          amount: 20000000,
          description: 'Pembelian kotak makan dan kemasan',
          receiptNumber: 'INV-APBD-003',
          transactionDate: new Date('2024-04-10'),
        },
      ] as const

      for (const txData of transactions2) {
        await prisma.budgetTransaction.create({
          data: {
            allocationId: allocation2.id,
            sppgId: sppg.id,
            programId: programs[0].id,
            transactionNumber: `TRX-${sppg.code}-2024-${String(totalTransactions + 1).padStart(4, '0')}`,
            category: txData.category,
            amount: txData.amount,
            description: txData.description,
            receiptNumber: txData.receiptNumber,
            transactionDate: txData.transactionDate,
            approvedBy: creator.id,
            approvedAt: new Date(txData.transactionDate.getTime() + 86400000),
            createdBy: creator.id,
          }
        })
        totalTransactions++
      }

      // === MANUAL ALLOCATION 2: HIBAH (Fully Spent) ===
      const allocation3 = await prisma.programBudgetAllocation.create({
        data: {
          sppgId: sppg.id,
          programId: programs[0].id,
          source: 'HIBAH',
          allocatedAmount: 100000000, // 100 juta
          remainingAmount: 0, // Fully spent
          spentAmount: 100000000,
          fiscalYear: 2024,
          status: 'FULLY_SPENT',
          isFullySpent: true,
          allocatedDate: new Date('2024-02-01'),
          allocatedBy: creator.id,
          decreeNumber: 'HIBAH-PT-ABC-2024',
          decreeDate: new Date('2024-01-25'),
        }
      })
      totalAllocations++

      // Transaction for HIBAH allocation
      await prisma.budgetTransaction.create({
        data: {
          allocationId: allocation3.id,
          sppgId: sppg.id,
          programId: programs[0].id,
          transactionNumber: `TRX-${sppg.code}-2024-${String(totalTransactions + 1).padStart(4, '0')}`,
          category: 'TRAINING',
          amount: 100000000,
          description: 'Pelatihan gizi dan manajemen dapur untuk 100 staff',
          receiptNumber: 'INV-HIBAH-001',
          transactionDate: new Date('2024-03-01'),
          approvedBy: creator.id,
          approvedAt: new Date('2024-03-02'),
          createdBy: creator.id,
        }
      })
      totalTransactions++

      // === DRAFT REQUEST (not submitted yet) ===
      await prisma.banperRequestTracking.create({
        data: {
          sppgId: sppg.id,
          programId: programs[0].id,
          bgnRequestNumber: `DRAFT-${sppg.code}-${Date.now()}`,
          requestedAmount: 450000000,
          operationalPeriod: '12 bulan',
          totalBeneficiaries: 900,
          foodCostTotal: 320000000,
          operationalCost: 80000000,
          transportCost: 30000000,
          utilityCost: 20000000,
          
          bgnStatus: 'DRAFT_LOCAL',
          
          internalNotes: 'Draft pengajuan untuk semester 2 tahun 2025',
          createdBy: creator.id,
        }
      })
      totalBanperRequests++
    }

    console.log(`  ✓ Created ${totalBanperRequests} banper requests`)
    console.log(`  ✓ Created ${totalAllocations} budget allocations`)
    console.log(`  ✓ Created ${totalTransactions} budget transactions`)

  } catch (error) {
    console.error('  ✗ Error seeding banper tracking:', error)
    throw error
  }
}

/**
 * Cleanup function - delete all budget tracking data
 */
export async function cleanupBanperTracking() {
  console.log('  → Cleaning up Banper tracking data...')
  
  await prisma.budgetTransaction.deleteMany()
  await prisma.programBudgetAllocation.deleteMany()
  await prisma.banperRequestTracking.deleteMany()
  
  console.log('  ✓ Banper tracking data cleaned up')
}
