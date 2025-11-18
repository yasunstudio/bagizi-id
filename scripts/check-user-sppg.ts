/**
 * Check user and SPPG relationship
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'admin@demo.sppg.id' },
      include: {
        sppg: {
          select: {
            id: true,
            code: true,
            name: true,
            status: true,
            isDemoAccount: true,
          }
        }
      }
    })
    
    if (!user) {
      console.log('❌ User not found!')
      return
    }
    
    console.log('👤 User:', {
      id: user.id,
      email: user.email,
      userRole: user.userRole,
      userType: user.userType,
      sppgId: user.sppgId,
      isActive: user.isActive,
    })
    
    console.log('\n🏢 SPPG:', user.sppg || 'NOT FOUND!')
    
    if (!user.sppg) {
      console.log('\n❌ PROBLEM: User has sppgId but SPPG not found!')
      console.log('This will cause access-denied redirect.')
      
      // Check if SPPG exists with different ID
      if (user.sppgId) {
        const sppgExists = await prisma.sPPG.findUnique({
          where: { id: user.sppgId }
        })
        
        if (!sppgExists) {
          console.log('\n🔍 SPPG ID does not exist in database!')
          console.log('Need to update user.sppgId to valid SPPG')
          
          // Find any SPPG
          const anySppg = await prisma.sPPG.findFirst({
            where: { status: 'ACTIVE' }
          })
          
          if (anySppg) {
            console.log(`\n💡 Found active SPPG: ${anySppg.name} (${anySppg.id})`)
            console.log('Updating user...')
            
            await prisma.user.update({
              where: { id: user.id },
              data: { sppgId: anySppg.id }
            })
            
            console.log('✅ User updated successfully!')
          }
        }
      }
    } else {
      console.log('\n✅ User and SPPG relationship is valid!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

checkUser()
