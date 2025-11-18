import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const programs = await prisma.nutritionProgram.findMany({
      select: {
        id: true,
        name: true,
        programCode: true,
        programType: true,
        status: true
      }
    })
    
    console.log('\n📋 Available Programs in Database:\n')
    
    if (programs.length === 0) {
      console.log('  ⚠️  No programs found!')
    } else {
      programs.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.name}`)
        console.log(`   ID: ${p.id}`)
        console.log(`   Code: ${p.programCode}`)
        console.log(`   Type: ${p.programType}`)
        console.log(`   Status: ${p.status}`)
        console.log(`   URL: http://localhost:3000/program/${p.id}`)
        console.log()
      })
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
