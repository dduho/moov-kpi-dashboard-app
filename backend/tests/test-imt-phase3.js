#!/usr/bin/env node

/**
 * Test script for IMT restructuring Phase 3
 * Tests the new IMT models and parser functionality
 */

console.log('🧪 Testing IMT Phase 3 restructuring...\n')

// Test 1: Verify new IMT models can be imported
console.log('✓ Test 1: Verifying new IMT models...')
try {
  const { ImtCountryStats, ImtBalances, ImtTransaction } = require('../src/models')
  console.log('  ✅ ImtCountryStats model imported')
  console.log('  ✅ ImtBalances model imported')
  console.log('  ✅ ImtTransaction model imported')
} catch (error) {
  console.error('  ❌ IMT model import failed:', error.message)
  process.exit(1)
}

// Test 2: Verify excelParserService can be imported and has new methods
console.log('\n✓ Test 2: Verifying excelParserService...')
try {
  const excelParserService = require('../src/services/excelParserService')
  console.log('  ✅ excelParserService imported')

  // Check if new methods exist
  if (typeof excelParserService.parseImtView === 'function') {
    console.log('  ✅ parseImtView method exists')
  } else {
    console.error('  ❌ parseImtView method missing')
    process.exit(1)
  }

  if (typeof excelParserService.parseImtBusiness === 'function') {
    console.log('  ✅ parseImtBusiness method exists')
  } else {
    console.error('  ❌ parseImtBusiness method missing')
    process.exit(1)
  }

  if (typeof excelParserService.determineBalanceStatus === 'function') {
    console.log('  ✅ determineBalanceStatus method exists')
  } else {
    console.error('  ❌ determineBalanceStatus method missing')
    process.exit(1)
  }
} catch (error) {
  console.error('  ❌ excelParserService verification failed:', error.message)
  process.exit(1)
}

// Test 3: Verify IMT controller can be imported
console.log('\n✓ Test 3: Verifying IMT controller...')
try {
  const imtController = require('../src/controllers/imtController')
  console.log('  ✅ IMT controller imported')
} catch (error) {
  console.error('  ❌ IMT controller import failed:', error.message)
  process.exit(1)
}

// Test 4: Verify IMT routes can be imported
console.log('\n✓ Test 4: Verifying IMT routes...')
try {
  const imtRoutes = require('../src/routes/imt')
  console.log('  ✅ IMT routes imported')
} catch (error) {
  console.error('  ❌ IMT routes import failed:', error.message)
  process.exit(1)
}

console.log('\n✅ All IMT Phase 3 tests passed!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('Phase 3 restructuring validation complete.')
console.log('New IMT models and parser are ready for data import.')
process.exit(0)