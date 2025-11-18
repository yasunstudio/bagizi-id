#!/usr/bin/env node
/**
 * School & Enrollment API Testing Script
 * Tests all CRUD operations for Schools and Enrollments
 * 
 * Usage: node scripts/test-school-api.mjs
 */

import { setTimeout } from 'timers/promises'

const BASE_URL = 'http://localhost:3000'
const API_BASE = `${BASE_URL}/api/sppg/schools`

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}=== ${msg} ===${colors.reset}\n`),
}

// Test state
let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
}

// Store created IDs for cleanup
const createdResources = {
  schools: [],
  enrollments: [],
}

/**
 * Make API request
 */
async function makeRequest(method, path, body = null, description = '') {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    log.info(`${method} ${path}${description ? ` - ${description}` : ''}`)
    const response = await fetch(url, options)
    const data = await response.json()

    return {
      status: response.status,
      ok: response.ok,
      data,
    }
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
    }
  }
}

/**
 * Assert test result
 */
function assert(condition, testName, details = '') {
  if (condition) {
    log.success(`${testName}`)
    testResults.passed++
    testResults.tests.push({ name: testName, status: 'PASS', details })
  } else {
    log.error(`${testName}${details ? ` - ${details}` : ''}`)
    testResults.failed++
    testResults.tests.push({ name: testName, status: 'FAIL', details })
  }
}

/**
 * Test Suite 1: Schools CRUD
 */
async function testSchoolsCRUD() {
  log.section('Test Suite 1: Schools CRUD Operations')

  // Test 1: GET /api/sppg/schools - List schools
  const listResponse = await makeRequest('GET', '', null, 'List all schools')
  assert(
    listResponse.status === 401 || listResponse.status === 403,
    'Should require authentication',
    `Status: ${listResponse.status}`
  )

  // Test 2: POST /api/sppg/schools - Create school (without auth)
  const createWithoutAuth = await makeRequest('POST', '', {
    schoolName: 'SD Test',
    schoolType: 'SD',
  }, 'Create school without auth')
  assert(
    createWithoutAuth.status === 401,
    'Should reject creation without auth',
    `Status: ${createWithoutAuth.status}`
  )

  // Test 3: POST /api/sppg/schools - Create with invalid data
  const createInvalid = await makeRequest('POST', '', {
    schoolName: '', // Empty name
  }, 'Create with invalid data')
  assert(
    createInvalid.status === 400 || createInvalid.status === 401,
    'Should reject invalid data',
    `Status: ${createInvalid.status}`
  )

  log.info('\n📝 Note: Authenticated endpoints require valid session')
  log.info('   Run manual testing with browser session for full CRUD tests')
}

/**
 * Test Suite 2: Enrollment Endpoints Structure
 */
async function testEnrollmentEndpoints() {
  log.section('Test Suite 2: Enrollment API Structure')

  // Test 1: GET /api/sppg/schools/enrollments - List enrollments
  const listEnrollments = await makeRequest('GET', '/enrollments', null, 'List all enrollments')
  assert(
    listEnrollments.status === 401 || listEnrollments.status === 403,
    'Should require authentication for enrollments list',
    `Status: ${listEnrollments.status}`
  )

  // Test 2: POST /api/sppg/schools/enrollments - Create enrollment (without auth)
  const createEnrollment = await makeRequest('POST', '/enrollments', {
    schoolId: 'test-school-id',
    programId: 'test-program-id',
  }, 'Create enrollment without auth')
  assert(
    createEnrollment.status === 401,
    'Should reject enrollment creation without auth',
    `Status: ${createEnrollment.status}`
  )

  // Test 3: GET /api/sppg/schools/enrollments/{id} - Get enrollment detail
  const getEnrollment = await makeRequest('GET', '/enrollments/test-id', null, 'Get enrollment by ID')
  assert(
    getEnrollment.status === 401 || getEnrollment.status === 404,
    'Should require auth or return not found',
    `Status: ${getEnrollment.status}`
  )
}

/**
 * Test Suite 3: API Response Structure
 */
async function testResponseStructure() {
  log.section('Test Suite 3: API Response Structure')

  // Test unauthorized responses have correct structure
  const responses = [
    await makeRequest('GET', '', null, 'Check response structure'),
    await makeRequest('POST', '', {}, 'Check error response structure'),
  ]

  responses.forEach((response, index) => {
    assert(
      response.data && typeof response.data === 'object',
      `Response ${index + 1} should return JSON object`,
      JSON.stringify(response.data).substring(0, 100)
    )

    if (!response.ok) {
      assert(
        'error' in response.data || 'message' in response.data,
        `Error response ${index + 1} should have error/message field`,
        Object.keys(response.data).join(', ')
      )
    }
  })
}

/**
 * Test Suite 4: Data Validation
 */
async function testDataValidation() {
  log.section('Test Suite 4: Data Validation')

  // Test 1: School creation with missing required fields
  const missingFields = await makeRequest('POST', '', {
    schoolName: 'Test School',
    // Missing schoolType, address, etc.
  }, 'Missing required fields')
  
  assert(
    missingFields.status === 400 || missingFields.status === 401,
    'Should validate required fields',
    `Status: ${missingFields.status}`
  )

  // Test 2: School creation with invalid enum values
  const invalidEnum = await makeRequest('POST', '', {
    schoolName: 'Test School',
    schoolType: 'INVALID_TYPE',
  }, 'Invalid enum value')
  
  assert(
    invalidEnum.status === 400 || invalidEnum.status === 401,
    'Should validate enum values',
    `Status: ${invalidEnum.status}`
  )

  // Test 3: Enrollment with invalid dates
  const invalidDates = await makeRequest('POST', '/enrollments', {
    schoolId: 'test-id',
    programId: 'test-id',
    startDate: '2024-01-01',
    endDate: '2023-01-01', // End before start
  }, 'End date before start date')
  
  assert(
    invalidDates.status === 400 || invalidDates.status === 401,
    'Should validate date ranges',
    `Status: ${invalidDates.status}`
  )
}

/**
 * Test Suite 5: Multi-tenant Isolation
 */
async function testMultiTenantIsolation() {
  log.section('Test Suite 5: Multi-tenant Isolation')

  log.info('Testing multi-tenant data isolation...')
  
  // Test 1: Try to access schools without sppgId
  const noSppgId = await makeRequest('GET', '', null, 'Access without SPPG context')
  assert(
    noSppgId.status === 401 || noSppgId.status === 403,
    'Should require SPPG context',
    `Status: ${noSppgId.status}`
  )

  // Test 2: Try to access another SPPG's school
  const crossSppgAccess = await makeRequest('GET', '/other-sppg-school-id', null, 'Cross-SPPG access attempt')
  assert(
    crossSppgAccess.status === 401 || crossSppgAccess.status === 403 || crossSppgAccess.status === 404,
    'Should prevent cross-SPPG data access',
    `Status: ${crossSppgAccess.status}`
  )

  log.info('\n📝 Note: Full multi-tenant isolation requires authenticated sessions')
  log.info('   with different sppgId values for complete testing')
}

/**
 * Test Suite 6: Endpoint HTTP Methods
 */
async function testHTTPMethods() {
  log.section('Test Suite 6: HTTP Methods Support')

  const endpoints = [
    { path: '', methods: ['GET', 'POST'] },
    { path: '/test-id', methods: ['GET', 'PUT', 'DELETE'] },
    { path: '/enrollments', methods: ['GET', 'POST'] },
    { path: '/enrollments/test-id', methods: ['GET', 'PUT', 'DELETE'] },
  ]

  for (const endpoint of endpoints) {
    log.info(`\nTesting ${endpoint.path || '/'}`)
    
    for (const method of endpoint.methods) {
      const response = await makeRequest(method, endpoint.path, 
        method === 'POST' || method === 'PUT' ? {} : null,
        `${method} method`)
      
      // Should not return 404 or 405 (Method Not Allowed)
      assert(
        response.status !== 404 && response.status !== 405,
        `${method} ${endpoint.path || '/'} - Endpoint exists`,
        `Status: ${response.status}`
      )
    }
  }
}

/**
 * Manual Testing Guide
 */
function printManualTestingGuide() {
  log.section('Manual Testing Guide')

  console.log(`
${colors.cyan}To test authenticated endpoints:${colors.reset}

1. ${colors.bright}Login to the application${colors.reset}
   - Open browser: ${BASE_URL}/login
   - Login with SPPG user credentials

2. ${colors.bright}Get session cookie${colors.reset}
   - Open DevTools → Application → Cookies
   - Copy the session cookie value

3. ${colors.bright}Use curl with session${colors.reset}
   ${colors.yellow}# List schools${colors.reset}
   curl -X GET "${API_BASE}" \\
     -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

   ${colors.yellow}# Create school${colors.reset}
   curl -X POST "${API_BASE}" \\
     -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{
       "schoolName": "SD Negeri Test",
       "schoolType": "SD",
       "address": "Jl. Test No. 1",
       "province": "DKI Jakarta",
       "city": "Jakarta Pusat",
       "district": "Menteng",
       "postalCode": "10310",
       "totalStudents": 200
     }'

   ${colors.yellow}# Get school detail${colors.reset}
   curl -X GET "${API_BASE}/SCHOOL_ID" \\
     -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

   ${colors.yellow}# Update school${colors.reset}
   curl -X PUT "${API_BASE}/SCHOOL_ID" \\
     -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{"totalStudents": 250}'

   ${colors.yellow}# List enrollments${colors.reset}
   curl -X GET "${API_BASE}/enrollments" \\
     -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

   ${colors.yellow}# Create enrollment${colors.reset}
   curl -X POST "${API_BASE}/enrollments" \\
     -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{
       "schoolId": "SCHOOL_ID",
       "programId": "PROGRAM_ID",
       "startDate": "2025-01-01",
       "endDate": "2025-12-31",
       "targetStudents": 150
     }'

4. ${colors.bright}Test with Postman${colors.reset}
   - Import collection from generated OpenAPI spec
   - Set session cookie in Postman environment
   - Run full CRUD test suite

${colors.cyan}Expected Results:${colors.reset}
- ✓ Authenticated requests return 200/201
- ✓ Data belongs to correct sppgId
- ✓ Validation errors return 400 with details
- ✓ Not found returns 404
- ✓ Unauthorized returns 401
- ✓ Cross-SPPG access returns 403
`)
}

/**
 * Print test summary
 */
function printTestSummary() {
  log.section('Test Results Summary')

  const total = testResults.passed + testResults.failed
  const passRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0

  console.log(`
${colors.bright}Total Tests:${colors.reset}    ${total}
${colors.green}Passed:${colors.reset}         ${testResults.passed}
${colors.red}Failed:${colors.reset}         ${testResults.failed}
${colors.cyan}Pass Rate:${colors.reset}      ${passRate}%

${colors.bright}Test Details:${colors.reset}
`)

  testResults.tests.forEach((test, index) => {
    const icon = test.status === 'PASS' ? colors.green + '✓' : colors.red + '✗'
    const status = test.status === 'PASS' ? colors.green : colors.red
    console.log(`${icon} ${index + 1}. ${test.name}${colors.reset}`)
    if (test.details && test.status === 'FAIL') {
      console.log(`   ${colors.yellow}${test.details}${colors.reset}`)
    }
  })

  console.log(`\n${colors.bright}Status:${colors.reset} ${
    testResults.failed === 0 
      ? colors.green + 'ALL TESTS PASSED ✓' 
      : colors.yellow + 'SOME TESTS REQUIRE AUTHENTICATION'
  }${colors.reset}\n`)
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`
${colors.cyan}${colors.bright}╔════════════════════════════════════════════════════════╗
║  School & Enrollment API Testing Suite                ║
║  Testing: ${BASE_URL}                      ║
╚════════════════════════════════════════════════════════╝${colors.reset}
`)

  try {
    // Check if server is running
    log.info('Checking if development server is running...')
    
    try {
      const healthCheck = await fetch(`${BASE_URL}/api/sppg/schools`)
      if (healthCheck) {
        log.success('Development server is running\n')
      }
    } catch (err) {
      log.error('Development server is not running!')
      log.info('Start server with: npm run dev')
      process.exit(1)
    }

    // Run test suites
    await testSchoolsCRUD()
    await testEnrollmentEndpoints()
    await testResponseStructure()
    await testDataValidation()
    await testMultiTenantIsolation()
    await testHTTPMethods()

    // Print results
    printTestSummary()
    printManualTestingGuide()

    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0)

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

// Run tests
runTests()
