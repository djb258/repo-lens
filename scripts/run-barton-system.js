#!/usr/bin/env node

/**
 * Barton Doctrine System Runner
 * Comprehensive test and monitoring script for the Barton doctrine implementation
 * Blueprint ID: BP-039 (RepoLens Application)
 */

const { logBartonEvent, getBartonSystemHealth, getBartonMetrics } = require('../lib/barton')
const { logEnhancedORBTEvent, getEnhancedORBTState, getEnhancedORBTPredictiveAnalytics } = require('../lib/enhanced-orbt')
const { Severity, Status } = require('../lib/diagnostics')
const { BartonPrinciple } = require('../lib/barton')

console.log('🏥 Barton Doctrine System Runner')
console.log('=' .repeat(50))
console.log('Blueprint ID: BP-039')
console.log('Enhanced ORBT v2.0.0')
console.log('')

// Test scenarios
const testScenarios = [
  {
    name: 'Normal Operation',
    events: [
      {
        principle: BartonPrinciple.UNIVERSAL_MONITORING,
        udns: '30.GITHUB.api.fetch',
        severity: Severity.GREEN,
        status: Status.SUCCESS,
        message: 'GitHub API fetch successful',
        details: { responseTime: 150, endpoint: '/user/repos' }
      },
      {
        principle: BartonPrinciple.PERFORMANCE_OPTIMIZATION,
        udns: '20.UI.repo-card.render',
        severity: Severity.GREEN,
        status: Status.SUCCESS,
        message: 'Repository card rendered successfully',
        details: { renderTime: 25, component: 'RepoCard' }
      }
    ]
  },
  {
    name: 'Warning Conditions',
    events: [
      {
        principle: BartonPrinciple.PERFORMANCE_OPTIMIZATION,
        udns: '30.GITHUB.api.fetch',
        severity: Severity.YELLOW,
        status: Status.TIMEOUT,
        message: 'GitHub API response slow',
        details: { responseTime: 2500, threshold: 2000 }
      },
      {
        principle: BartonPrinciple.SYSTEM_RESILIENCE,
        udns: '30.DB.neon.syncFail',
        severity: Severity.YELLOW,
        status: Status.FAILED_FETCH,
        message: 'Database sync warning',
        details: { retryCount: 2, maxRetries: 3 }
      }
    ]
  },
  {
    name: 'Critical Issues',
    events: [
      {
        principle: BartonPrinciple.SECURITY_FIRST,
        udns: '30.GITHUB.auth.fail',
        severity: Severity.RED,
        status: Status.FAILED_AUTHENTICATION,
        message: 'GitHub authentication failed',
        details: { error: 'Invalid token', status: 401 }
      },
      {
        principle: BartonPrinciple.AUTOMATED_ESCALATION,
        udns: '40.ROUTER.error',
        severity: Severity.RED,
        status: Status.FAILED_VALIDATION,
        message: 'Critical routing error',
        details: { route: '/invalid-route', error: 'Route not found' }
      }
    ]
  },
  {
    name: 'Performance Degradation',
    events: [
      {
        principle: BartonPrinciple.PERFORMANCE_OPTIMIZATION,
        udns: '20.UI.form.submit',
        severity: Severity.ORANGE,
        status: Status.TIMEOUT,
        message: 'Form submission taking too long',
        details: { responseTime: 5000, threshold: 2000 }
      },
      {
        principle: BartonPrinciple.PREDICTIVE_ANALYTICS,
        udns: '30.GITHUB.api.fetch',
        severity: Severity.ORANGE,
        status: Status.TIMEOUT,
        message: 'API performance degrading',
        details: { responseTime: 3500, trend: 'increasing' }
      }
    ]
  }
]

// Run test scenarios
async function runTestScenarios() {
  console.log('🧪 Running Test Scenarios...')
  console.log('')

  for (const scenario of testScenarios) {
    console.log(`📋 Scenario: ${scenario.name}`)
    console.log('-'.repeat(30))

    for (const event of scenario.events) {
      console.log(`  🔍 Logging: ${event.udns}`)
      console.log(`     Message: ${event.message}`)
      console.log(`     Severity: ${event.severity}`)
      console.log(`     Principle: ${event.principle}`)
      
      // Log to Barton system
      logBartonEvent(
        event.principle,
        event.udns,
        event.severity,
        event.status,
        event.message,
        event.details
      )

      // Log to Enhanced ORBT system
      logEnhancedORBTEvent(
        event.udns,
        event.severity,
        event.status,
        event.message,
        event.details,
        event.principle
      )

      console.log('')
    }

    // Wait a bit between scenarios
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

// Display system status
function displaySystemStatus() {
  console.log('📊 System Status Report')
  console.log('=' .repeat(30))

  // Barton System Health
  const bartonHealth = getBartonSystemHealth()
  const bartonMetrics = getBartonMetrics()
  
  console.log(`🏥 Barton Health: ${bartonHealth}`)
  console.log(`📈 Response Time: ${bartonMetrics.responseTime}ms`)
  console.log(`❌ Error Rate: ${(bartonMetrics.errorRate * 100).toFixed(2)}%`)
  console.log(`✅ Availability: ${bartonMetrics.availability}%`)
  console.log(`🔒 Security Score: ${bartonMetrics.securityScore}/10`)
  console.log('')

  // Enhanced ORBT State
  const enhancedORBTState = getEnhancedORBTState()
  const predictiveAnalytics = getEnhancedORBTPredictiveAnalytics()
  
  console.log(`🚀 Enhanced ORBT Health: ${enhancedORBTState.systemHealth}`)
  console.log(`🔮 Error Rate Trend: ${predictiveAnalytics.trendAnalysis.errorRateTrend}`)
  console.log(`⚡ Performance Trend: ${predictiveAnalytics.trendAnalysis.performanceTrend}`)
  console.log(`⚠️  Overall Risk: ${predictiveAnalytics.riskAssessment.overallRisk}`)
  console.log('')

  // Risk Factors
  if (predictiveAnalytics.riskAssessment.riskFactors.length > 0) {
    console.log('🚨 Risk Factors:')
    predictiveAnalytics.riskAssessment.riskFactors.forEach(factor => {
      console.log(`  • ${factor}`)
    })
    console.log('')
  }

  // Mitigation Strategies
  if (predictiveAnalytics.riskAssessment.mitigationStrategies.length > 0) {
    console.log('🛠️  Mitigation Strategies:')
    predictiveAnalytics.riskAssessment.mitigationStrategies.forEach(strategy => {
      console.log(`  • ${strategy}`)
    })
    console.log('')
  }

  // Anomalies
  const anomalies = [
    ...predictiveAnalytics.anomalyDetection.unusualErrorPatterns,
    ...predictiveAnalytics.anomalyDetection.performanceAnomalies,
    ...predictiveAnalytics.anomalyDetection.securityAnomalies
  ]

  if (anomalies.length > 0) {
    console.log('🚨 Detected Anomalies:')
    anomalies.forEach(anomaly => {
      console.log(`  • ${anomaly}`)
    })
    console.log('')
  }
}

// Continuous monitoring
function startContinuousMonitoring() {
  console.log('🔄 Starting Continuous Monitoring...')
  console.log('Press Ctrl+C to stop')
  console.log('')

  const interval = setInterval(() => {
    const health = getBartonSystemHealth()
    const risk = getEnhancedORBTPredictiveAnalytics().riskAssessment.overallRisk
    
    const healthIndicator = health === 'OPTIMAL' ? '🟢' : 
                           health === 'NORMAL' ? '🔵' : 
                           health === 'DEGRADED' ? '🟡' : 
                           health === 'CRITICAL' ? '🟠' : '🔴'
    
    const riskIndicator = risk === 'low' ? '🟢' : 
                         risk === 'medium' ? '🟡' : 
                         risk === 'high' ? '🟠' : '🔴'
    
    process.stdout.write(`\r${healthIndicator} Health: ${health} | ${riskIndicator} Risk: ${risk} | ${new Date().toLocaleTimeString()}`)
  }, 2000)

  return interval
}

// Main execution
async function main() {
  try {
    // Run test scenarios
    await runTestScenarios()
    
    // Display initial status
    displaySystemStatus()
    
    // Start continuous monitoring
    const monitoringInterval = startContinuousMonitoring()
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Stopping Barton System...')
      clearInterval(monitoringInterval)
      
      console.log('\n📊 Final System Status:')
      displaySystemStatus()
      
      console.log('\n✅ Barton Doctrine System completed successfully!')
      process.exit(0)
    })

  } catch (error) {
    console.error('❌ Error running Barton system:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = {
  runTestScenarios,
  displaySystemStatus,
  startContinuousMonitoring
} 