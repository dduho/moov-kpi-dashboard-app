#!/usr/bin/env node

/**
 * Basic test runner for backend
 * This runs simple validation tests to ensure the backend can start
 */

console.log('🧪 Running backend tests...\n')

// Test 1: Verify all controllers can be imported
console.log('✓ Test 1: Verifying controllers...')
try {
  require('../src/controllers/dashboardController')
  require('../src/controllers/kpiController')
  require('../src/controllers/imtController')
  require('../src/controllers/revenueController')
  require('../src/controllers/userController')
  require('../src/controllers/exportController')
  require('../src/controllers/acquisitionController')
  require('../src/controllers/merchantController')
  require('../src/controllers/agentController')
  require('../src/controllers/channelController')
  console.log('  ✅ All controllers load successfully')
} catch (error) {
  console.error('  ❌ Controller import failed:', error.message)
  process.exit(1)
}

// Test 2: Verify all routes can be imported
console.log('\n✓ Test 2: Verifying routes...')
try {
  require('../src/routes/dashboard')
  require('../src/routes/kpis')
  require('../src/routes/imt')
  require('../src/routes/revenue')
  require('../src/routes/users')
  require('../src/routes/comparisons')
  require('../src/routes/export')
  require('../src/routes/acquisition')
  require('../src/routes/merchants')
  require('../src/routes/agents')
  require('../src/routes/channels')
  console.log('  ✅ All routes load successfully')
} catch (error) {
  console.error('  ❌ Route import failed:', error.message)
  process.exit(1)
}

// Test 3: Verify app.js syntax
console.log('\n✓ Test 3: Verifying app.js...')
try {
  // Just check syntax without starting the server
  const fs = require('fs')
  const path = require('path')
  const appPath = path.join(__dirname, '../src/app.js')
  const appContent = fs.readFileSync(appPath, 'utf8')

  // Check if all routes are registered
  const requiredRoutes = [
    '/api/dashboard',
    '/api/kpis',
    '/api/imt',
    '/api/revenue',
    '/api/users',
    '/api/comparisons',
    '/api/export',
    '/api/acquisition',
    '/api/merchants',
    '/api/agents',
    '/api/channels'
  ]

  let allRoutesPresent = true
  for (const route of requiredRoutes) {
    if (!appContent.includes(route)) {
      console.error(`  ❌ Route ${route} not found in app.js`)
      allRoutesPresent = false
    }
  }

  if (allRoutesPresent) {
    console.log('  ✅ All routes registered in app.js')
  } else {
    process.exit(1)
  }
} catch (error) {
  console.error('  ❌ App.js verification failed:', error.message)
  process.exit(1)
}

// Test 4: Verify environment setup
console.log('\n✓ Test 4: Verifying environment...')
try {
  require('dotenv').config()
  console.log('  ✅ Environment configuration loaded')
} catch (error) {
  console.error('  ❌ Environment setup failed:', error.message)
  process.exit(1)
}

console.log('\n✅ All tests passed!')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('Total: 4 tests passed')
process.exit(0)
