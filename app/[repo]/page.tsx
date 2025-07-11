import { redirect } from 'next/navigation'

interface RepoPageProps {
  params: {
    repo: string
  }
}

export default function RepoPage({ params }: RepoPageProps) {
  redirect(`/${params.repo}/overview-view`)
} 