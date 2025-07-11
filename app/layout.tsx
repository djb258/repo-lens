import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Repo Lens - GitHub Repository Explorer',
  description: 'View your GitHub repositories in a plain-English, visual way',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-github-dark text-gray-900 dark:text-white min-h-screen`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
} 