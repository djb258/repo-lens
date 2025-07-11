import React from 'react'

interface AltitudeMarkerProps {
  altitude: number
  title: string
  className?: string
}

export default function AltitudeMarker({ altitude, title, className = '' }: AltitudeMarkerProps) {
  const getAltitudeColor = (alt: number) => {
    if (alt >= 40000) return 'bg-blue-500 text-white'
    if (alt >= 30000) return 'bg-green-500 text-white'
    if (alt >= 20000) return 'bg-yellow-500 text-black'
    if (alt >= 10000) return 'bg-orange-500 text-white'
    return 'bg-red-500 text-white'
  }

  const getAltitudeIcon = (alt: number) => {
    if (alt >= 40000) return '🌍'
    if (alt >= 30000) return '✈️'
    if (alt >= 20000) return '🏢'
    if (alt >= 10000) return '🏠'
    return '🔍'
  }

  return (
    <div className={`flex items-center space-x-2 mb-4 p-3 rounded-lg border ${className}`}>
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getAltitudeColor(altitude)}`}>
        <span>{getAltitudeIcon(altitude)}</span>
        <span>{altitude.toLocaleString()} ft</span>
      </div>
      <span className="text-gray-700 dark:text-gray-300 font-medium">{title}</span>
    </div>
  )
} 