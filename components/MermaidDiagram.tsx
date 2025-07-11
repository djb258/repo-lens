'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
      })
      
      mermaid.render('mermaid-diagram', chart).then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      }).catch((error) => {
        console.error('Error rendering mermaid diagram:', error)
        if (containerRef.current) {
          containerRef.current.innerHTML = '<p className="text-red-500">Error rendering diagram</p>'
        }
      })
    }
  }, [chart])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Repository Structure Diagram
      </h3>
      <div 
        ref={containerRef} 
        className="flex justify-center overflow-x-auto"
      />
    </div>
  )
} 