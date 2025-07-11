import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Repository } from '@/lib/github'

interface RepoCardProps {
  repo: Repository
}

export default function RepoCard({ repo }: RepoCardProps) {
  return (
    <Link href={`/${repo.full_name}`}>
      <div className="repo-card cursor-pointer">
        <div className="flex items-start space-x-4">
          <Image
            src={repo.owner.avatar_url}
            alt={`${repo.owner.login} avatar`}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {repo.name}
              </h3>
              {repo.private && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  Private
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {repo.owner.login}
            </p>
            {repo.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {repo.description}
              </p>
            )}
            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              {repo.language && (
                <span className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                  {repo.language}
                </span>
              )}
              <span className="flex items-center">
                ⭐ {repo.stargazers_count}
              </span>
              <span className="flex items-center">
                🍴 {repo.forks_count}
              </span>
              <span>
                Updated {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
} 