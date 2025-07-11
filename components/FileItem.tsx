import Link from 'next/link'
import { RepoFile } from '@/lib/github'

interface FileItemProps {
  file: RepoFile
  repoName: string
}

export default function FileItem({ file, repoName }: FileItemProps) {
  const icon = file.type === 'dir' ? '📁' : '📄'
  const size = file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''
  
  return (
    <Link href={`/${repoName}/${file.path}`}>
      <div className="file-item">
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </span>
            {size && (
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                {size}
              </span>
            )}
          </div>
          {file.summary && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {file.summary}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
} 