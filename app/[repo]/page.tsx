import { redirect } from 'next/navigation'

interface RepoPageProps {
  params: {
    repo: string
  }
}

export default async function RepoPage({ params }: RepoPageProps) {
  // Redirect to the new ORPT overview page
  redirect(`/${params.repo}/overview`)
} 