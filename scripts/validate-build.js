#!/usr/bin/env node

// ORBT Build Validation Script
// Runs UDNS validation and fails build if any diagnostic codes are invalid or undocumented

const { UDNSValidator } = require('../lib/udns_validator.ts')

async function validateBuild() {
  console.log('🔍 ORBT Build Validation Starting...')
  console.log('='.repeat(50))

  try {
    const validator = new UDNSValidator()
    const result = await validator.validateProject()
    
    console.log(validator.generateReport(result))
    
    if (!result.isValid) {
      console.error('\n❌ Build validation FAILED!')
      console.error('Fix the above UDNS validation errors before building.')
      process.exit(1)
    }
    
    console.log('\n✅ Build validation PASSED!')
    console.log('All diagnostic codes are valid and documented.')
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message)
    process.exit(1)
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateBuild()
}

module.exports = { validateBuild } 