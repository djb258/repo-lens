'use client'

import React, { useState } from 'react'

interface InlineCommentProps {
  initialContent?: string
  placeholder?: string
  onSave?: (content: string) => void
  className?: string
}

export default function InlineComment({ 
  initialContent = '', 
  placeholder = 'Add a comment...', 
  onSave,
  className = '' 
}: InlineCommentProps) {
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    if (onSave) {
      onSave(content)
    }
    setIsEditing(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleCancel = () => {
    setContent(initialContent)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 ${className}`}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[80px] p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Press Ctrl+Enter to save
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`group relative ${className}`}>
      {content ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {content}
              </div>
              {isSaved && (
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ✓ Comment saved
                </div>
              )}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
            >
              Edit
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full text-left p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          💬 {placeholder}
        </button>
      )}
    </div>
  )
} 