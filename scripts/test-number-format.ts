/**
 * Test script untuk memverifikasi formatNumberWithSeparator
 */

// Simulate the function
function formatNumberWithSeparator(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString('id-ID')
}

// Test cases
const testCases = [
  { input: 5000, expected: '5.000' },
  { input: 4850, expected: '4.850' },
  { input: 12000000000, expected: '12.000.000.000' },
  { input: 10000, expected: '10.000' },
  { input: 0, expected: '0' },
  { input: null, expected: '0' },
  { input: undefined, expected: '0' },
  { input: 100, expected: '100' },
  { input: 999, expected: '999' },
  { input: 1000, expected: '1.000' },
  { input: 1500000, expected: '1.500.000' },
]

console.log('\n📊 FORMAT NUMBER WITH SEPARATOR TEST')
console.log('═'.repeat(60))

let passed = 0
let failed = 0

testCases.forEach((test, index) => {
  const result = formatNumberWithSeparator(test.input)
  const status = result === test.expected ? '✅' : '❌'
  
  if (result === test.expected) {
    passed++
  } else {
    failed++
  }
  
  console.log(`\nTest ${index + 1}: ${status}`)
  console.log(`  Input:    ${test.input}`)
  console.log(`  Expected: ${test.expected}`)
  console.log(`  Got:      ${result}`)
})

console.log('\n' + '═'.repeat(60))
console.log(`\n✅ Passed: ${passed}/${testCases.length}`)
console.log(`❌ Failed: ${failed}/${testCases.length}`)
console.log('\n' + '═'.repeat(60))

// Specific test for program values
console.log('\n\n🎯 PROGRAM SPECIFIC VALUES:')
console.log('─'.repeat(60))
console.log('targetRecipients (5000):', formatNumberWithSeparator(5000))
console.log('currentRecipients (4850):', formatNumberWithSeparator(4850))
console.log('totalBudget (12000000000):', formatNumberWithSeparator(12000000000))
console.log('budgetPerMeal (10000):', formatNumberWithSeparator(10000))
console.log('\n')
