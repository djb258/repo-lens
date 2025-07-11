# ORPT Repo Lens Viewer - Function Documentation

## Overview
The ORPT Repo Lens Viewer is an interactive manual system for GitHub repositories that provides visual and narrative exploration at multiple altitude levels. It transforms every repository into a comprehensive service manual with plain-English explanations and visual diagrams.

## Architecture
The application follows a multi-level altitude model:
- **40,000 ft**: Global repository index with cards linking to repo pages
- **30,000 ft**: Repository overview with plain-English index, wiki, and Mermaid diagrams
- **20,000 ft**: Module view showing module summary, diagram, and exported functions
- **10,000 ft**: Function view with function explanation, code blocks, and control flow

## Key Components
- **Next.js 14** with App Router for modern React development
- **GitHub REST API** via Octokit for repository access
- **Mermaid.js** for visual architecture diagrams
- **Tailwind CSS** for responsive styling
- **TypeScript** for type safety and developer experience
- **YAML parsing** for structured documentation
- **Interactive components** for user engagement

## Dependencies
- @octokit/rest: GitHub API client
- mermaid: Diagram rendering
- js-yaml: YAML file parsing
- next: React framework
- react: UI library
- typescript: Type safety

## Deployment
The application is designed for Vercel deployment with:
- Automatic builds on GitHub pushes
- Environment variable configuration
- Edge function support
- Global CDN distribution
- Automatic HTTPS

## Troubleshooting
Common issues and solutions:
- GitHub token authentication errors
- Missing VISUALS folder structure
- Mermaid diagram rendering issues
- YAML parsing errors
- Module escalation thresholds 