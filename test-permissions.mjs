/**
 * Test permission logic for SPPG_ADMIN role
 */

// Simulated user with SPPG_ADMIN role
const user = {
  email: 'admin@demo.sppg.id',
  userRole: 'SPPG_ADMIN',
  sppgId: 'test-sppg-id'
}

// Simulated hasRole function
function hasRole(role) {
  if (Array.isArray(role)) {
    return role.includes(user.userRole)
  }
  return user.userRole === role
}

// Test canAccess for beneficiary resource
function testBeneficiaryAccess() {
  const resource = 'beneficiary'
  
  // Check if SPPG_ADMIN has access to beneficiary
  const allowedRoles = ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI']
  const hasAccess = hasRole(allowedRoles)
  
  console.log('=== Beneficiary Access Test ===')
  console.log('User Role:', user.userRole)
  console.log('Resource:', resource)
  console.log('Allowed Roles:', allowedRoles)
  console.log('Has Access:', hasAccess)
  console.log('')
  
  return hasAccess
}

// Test other resources
function testOtherResources() {
  const resources = [
    { name: 'program', roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'] },
    { name: 'menu', roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AHLI_GIZI'] },
    { name: 'procurement', roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN'] },
    { name: 'inventory', roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_AKUNTAN', 'SPPG_PRODUKSI_MANAGER'] },
    { name: 'users', roles: ['SPPG_KEPALA', 'SPPG_ADMIN', 'SPPG_HRD_MANAGER'] },
    { name: 'settings', roles: ['SPPG_KEPALA', 'SPPG_ADMIN'] },
  ]
  
  console.log('=== Other Resources Access Test ===')
  resources.forEach(({ name, roles }) => {
    const hasAccess = hasRole(roles)
    console.log(`${name.padEnd(15)} ${hasAccess ? '✅ ALLOWED' : '❌ DENIED'}`)
  })
}

// Run tests
console.log('Testing permissions for SPPG_ADMIN role\n')
const beneficiaryAccess = testBeneficiaryAccess()
testOtherResources()

console.log('\n=== Summary ===')
console.log(`Beneficiary Access: ${beneficiaryAccess ? '✅ ALLOWED' : '❌ DENIED'}`)

if (beneficiaryAccess) {
  console.log('\n✅ SPPG_ADMIN should be able to see Beneficiary Organization menu!')
} else {
  console.log('\n❌ SPPG_ADMIN CANNOT see Beneficiary Organization menu!')
}
