'use client'

import React from 'react'
import { useBartonMonitoring } from '@/lib/barton'
import { useEnhancedORBTMonitoring } from '@/lib/enhanced-orbt'
import { BartonHealthState, BartonPrinciple } from '@/lib/barton'
import { Severity } from '@/lib/diagnostics'

interface BartonDashboardProps {
  className?: string
}

export default function BartonDashboard({ className = '' }: BartonDashboardProps) {
  const { healthState, metrics } = useBartonMonitoring()
  const { systemState, predictiveAnalytics } = useEnhancedORBTMonitoring()

  const getHealthStateColor = (state: BartonHealthState) => {
    switch (state) {
      case BartonHealthState.OPTIMAL:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case BartonHealthState.NORMAL:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case BartonHealthState.DEGRADED:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case BartonHealthState.CRITICAL:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case BartonHealthState.EMERGENCY:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case BartonHealthState.OFFLINE:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
      case 'degrading':
        return 'text-red-600 dark:text-red-400'
      case 'decreasing':
      case 'improving':
        return 'text-green-600 dark:text-green-400'
      case 'stable':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          🏥 Barton Doctrine Dashboard
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">BP-039</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getHealthStateColor(healthState)}`}>
            {healthState}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            📊 System Health Overview
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Response Time</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics?.responseTime || 0}ms
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Error Rate</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(metrics?.errorRate || 0) * 100}%
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Availability</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics?.availability || 100}%
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Security Score</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics?.securityScore || 10}/10
              </div>
            </div>
          </div>
        </div>

        {/* Predictive Analytics */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            🔮 Predictive Analytics
          </h3>
          
          {predictiveAnalytics && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate Trend:</span>
                <span className={`text-sm font-medium ${getTrendColor(predictiveAnalytics.trendAnalysis.errorRateTrend)}`}>
                  {predictiveAnalytics.trendAnalysis.errorRateTrend}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Performance Trend:</span>
                <span className={`text-sm font-medium ${getTrendColor(predictiveAnalytics.trendAnalysis.performanceTrend)}`}>
                  {predictiveAnalytics.trendAnalysis.performanceTrend}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Overall Risk:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(predictiveAnalytics.riskAssessment.overallRisk)}`}>
                  {predictiveAnalytics.riskAssessment.overallRisk}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Risk Assessment */}
      {predictiveAnalytics && predictiveAnalytics.riskAssessment.riskFactors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            ⚠️ Risk Assessment
          </h3>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="space-y-2">
              {predictiveAnalytics.riskAssessment.riskFactors.map((factor, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-red-600 dark:text-red-400">•</span>
                  <span className="text-sm text-red-700 dark:text-red-300">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mitigation Strategies */}
      {predictiveAnalytics && predictiveAnalytics.riskAssessment.mitigationStrategies.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            🛠️ Mitigation Strategies
          </h3>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="space-y-2">
              {predictiveAnalytics.riskAssessment.mitigationStrategies.map((strategy, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-blue-600 dark:text-blue-400">•</span>
                  <span className="text-sm text-blue-700 dark:text-blue-300">{strategy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Recommendations */}
      {systemState && systemState.systemRecommendations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            💡 System Recommendations
          </h3>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="space-y-2">
              {systemState.systemRecommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span className="text-sm text-green-700 dark:text-green-300">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Detection */}
      {predictiveAnalytics && (
        (predictiveAnalytics.anomalyDetection.unusualErrorPatterns.length > 0 ||
         predictiveAnalytics.anomalyDetection.performanceAnomalies.length > 0 ||
         predictiveAnalytics.anomalyDetection.securityAnomalies.length > 0) && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            🚨 Anomaly Detection
          </h3>
          
          <div className="space-y-3">
            {predictiveAnalytics.anomalyDetection.unusualErrorPatterns.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                  Unusual Error Patterns
                </h4>
                <div className="space-y-1">
                  {predictiveAnalytics.anomalyDetection.unusualErrorPatterns.map((pattern, index) => (
                    <div key={index} className="text-xs text-orange-700 dark:text-orange-300">
                      • {pattern}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {predictiveAnalytics.anomalyDetection.performanceAnomalies.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Performance Anomalies
                </h4>
                <div className="space-y-1">
                  {predictiveAnalytics.anomalyDetection.performanceAnomalies.map((anomaly, index) => (
                    <div key={index} className="text-xs text-yellow-700 dark:text-yellow-300">
                      • {anomaly}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {predictiveAnalytics.anomalyDetection.securityAnomalies.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Security Anomalies
                </h4>
                <div className="space-y-1">
                  {predictiveAnalytics.anomalyDetection.securityAnomalies.map((anomaly, index) => (
                    <div key={index} className="text-xs text-red-700 dark:text-red-300">
                      • {anomaly}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Last Updated */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Last Updated: {systemState?.lastUpdated ? new Date(systemState.lastUpdated).toLocaleString() : 'Never'}</span>
          <span>Barton Doctrine v1.0.0</span>
        </div>
      </div>
    </div>
  )
} 