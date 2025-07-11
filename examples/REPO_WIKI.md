# Repo Lens - Repository Overview

Repo Lens is a Next.js application that provides a plain-English, visual way to explore GitHub repositories. It treats each repository like a "book" with an index, summaries, and diagrams.

## Key Components

### Frontend Structure
- `app/` - Next.js app router pages and layouts
- `components/` - Reusable React components
- `lib/` - Utility functions and GitHub API integration

### Core Features
- **Repository Browser**: View all accessible GitHub repositories
- **File Explorer**: Navigate through repository files with summaries
- **Markdown Rendering**: Display and render markdown content
- **Mermaid Diagrams**: Visualize repository structure
- **Dark Mode**: Full dark mode support

### API Integration
- GitHub REST API via Octokit
- Webhook support for real-time updates
- Secure token-based authentication

## Getting Started

1. **Install Dependencies**: `npm install`
2. **Configure Environment**: Add GitHub token to `.env.local`
3. **Start Development**: `npm run dev`
4. **Build for Production**: `npm run build`

## File Structure

The application follows a clean, modular structure:

- **Pages**: Each route has its own page component
- **Components**: Reusable UI components with TypeScript
- **Utilities**: GitHub API helpers and type definitions
- **Styling**: Tailwind CSS with custom components

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **API**: GitHub REST API via Octokit
- **Diagrams**: Mermaid.js for visualizations
- **Deployment**: Vercel-ready configuration

## Development Workflow

1. Create feature branch
2. Implement changes with TypeScript
3. Test with development server
4. Build and deploy to Vercel
5. Monitor webhook events for updates

## Contributing

The project welcomes contributions! Please follow the established patterns and ensure all code is properly typed with TypeScript. 