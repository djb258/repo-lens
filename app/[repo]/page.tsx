import { redirect, notFound } from 'next/navigation'
import { parseRepoName } from '@/lib/github'

interface RepoPageProps {
  params: {
    repo: string
  }
}

export default function RepoPage({ params }: RepoPageProps) {
  try {
    // Validate the repository name first
    const { owner, repo } = parseRepoName(params.repo)
    
    // If it's a valid repository name, redirect to overview
    if (owner && repo && owner !== 'unknown' && repo !== 'unknown') {
      redirect(`/${params.repo}/overview-view`)
    } else {
      // Invalid repository name - return 404
      notFound()
    }
  } catch (error) {
    // If parseRepoName throws an error (e.g., for favicon.ico), return 404
    notFound()
  }
} 