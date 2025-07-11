# Repo Lens

A Next.js application that provides a plain-English, visual way to explore your GitHub repositories. Treat each repo like a "book" with an index, summaries, and diagrams.

## Features

- **Repository Overview**: View all your GitHub repositories in a clean, card-based interface
- **File Structure Explorer**: Navigate through repository files with plain-English summaries
- **Markdown Support**: Display and render markdown files with syntax highlighting
- **Mermaid Diagrams**: Visualize repository structure with Mermaid.js diagrams
- **Dark Mode**: Full dark mode support for better viewing experience
- **GitHub Integration**: Seamless integration with GitHub API for real-time data

## Pages

1. **Homepage (`/`)**: Lists all accessible GitHub repositories
2. **Repository Index (`/[repo]`)**: Shows file structure and repository overview
3. **File Detail (`/[repo]/[file]`)**: Displays file content, summaries, and diagrams

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **GitHub API**: Octokit REST API
- **Diagrams**: Mermaid.js
- **Markdown**: React Markdown with syntax highlighting

## Getting Started

### Prerequisites

- Node.js 18+ 
- GitHub Personal Access Token

### Quick Setup

**Option 1: Automated Setup (Recommended)**

**Windows:**
```powershell
.\scripts\setup-github.ps1
```

**macOS/Linux:**
```bash
chmod +x scripts/setup-github.sh
./scripts/setup-github.sh
```

**Option 2: Manual Installation**

1. Clone the repository:
```bash
git clone https://github.com/djb258/repo-lens.git
cd repo-lens
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env.local
```

4. Add your GitHub token to `.env.local`:
```env
GITHUB_TOKEN=your_github_token_here
```

### Creating a GitHub Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read access to user profile)
4. Copy the token and add it to your `.env.local` file

### Detailed Setup Guide

For comprehensive setup instructions, troubleshooting, and security best practices, see [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md).

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
npm start
```

## Repository Structure

To get the most out of Repo Lens, consider adding these files to your repositories:

### `REPO_WIKI.md`
A markdown file containing a plain-English overview of your repository:

```markdown
# Repository Overview

This repository contains a Next.js application for...

## Key Components

- `app/` - Main application code
- `components/` - Reusable React components
- `lib/` - Utility functions and API helpers

## Getting Started

1. Install dependencies
2. Run development server
3. Open in browser
```

### `WIKI_MAP.mmd`
A Mermaid.js diagram showing the repository structure:

```mermaid
graph TD
    A[Repository Root] --> B[app/]
    A --> C[components/]
    A --> D[lib/]
    B --> E[page.tsx]
    B --> F[layout.tsx]
    C --> G[RepoCard.tsx]
    C --> H[FileItem.tsx]
    D --> I[github.ts]
```

## API Endpoints

### GitHub Webhook (Optional)

The application includes a webhook endpoint at `/api/github-webhook` that can receive GitHub push events and automatically update cached data when wiki files are modified.

To set up the webhook:

1. Add webhook secret to `.env.local`:
```env
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
```

2. Configure webhook in your GitHub repository:
   - URL: `https://your-domain.com/api/github-webhook`
   - Content type: `application/json`
   - Events: `Push events`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have questions, please open an issue on GitHub. 