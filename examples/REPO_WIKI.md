# Repo Lens - Repository Overview (30,000 ft)

## 🎯 Purpose
Repo Lens is an interactive manual system for GitHub repositories that provides visual and narrative exploration at multiple altitude levels. It transforms every repository into a comprehensive service manual with plain-English explanations and visual diagrams.

## 🏗️ Architecture Overview
The application follows a multi-level altitude model:
- **40,000 ft**: Global repository index
- **30,000 ft**: Repository overview and architecture
- **20,000 ft**: Module-level documentation
- **10,000 ft**: Function-level details
- **1,000-5,000 ft**: Detailed logic trees (future)

## 📁 Core Structure
```
Repo Lens/
├── app/                    # Next.js app router pages
│   ├── [repo]/            # Repository-specific pages
│   ├── [module]/          # Module-level views
│   └── [function]/        # Function-level details
├── components/            # Reusable UI components
├── lib/                   # Utilities and API helpers
└── examples/              # Documentation examples
```

## 🔧 Key Technologies
- **Next.js 14** with App Router
- **GitHub REST API** for repository access
- **Mermaid.js** for visual diagrams
- **Tailwind CSS** for styling
- **TypeScript** for type safety

## 🎨 Design Philosophy
- **Consistent UI**: GitHub-like interface across all levels
- **Progressive Disclosure**: Information revealed at appropriate altitudes
- **Interactive Elements**: Comments, fix buttons, and navigation
- **Visual Documentation**: Diagrams alongside text explanations

## 📚 Documentation Structure
Each repository should contain:
- `REPO_WIKI.md` - 30,000 ft overview
- `WIKI_MAP.mmd` - 30,000 ft visual diagram
- `MODULE_MAP/[module].mmd` - 20,000 ft module diagrams
- `FUNCTION_SUMMARY/[func].md` - 10,000 ft function docs

## 🚀 Features
- ✅ Altitude markers in documentation
- ✅ Breadcrumb navigation
- ✅ Inline editable comments
- ✅ "Fix This" buttons with Cursor commands
- ✅ Outdated documentation warnings
- ✅ Mermaid diagram rendering
- ✅ Responsive design

## 🔄 Development Workflow
1. Create repository documentation files
2. Add altitude markers and visual diagrams
3. Deploy to Vercel for instant access
4. Use inline comments for ongoing notes
5. Monitor outdated documentation warnings

## 🎯 Use Cases
- **Onboarding**: New team members understanding codebases
- **Maintenance**: Quick reference for system architecture
- **Documentation**: Living documentation that stays current
- **Code Reviews**: Context-aware review assistance
- **Troubleshooting**: Multi-level problem diagnosis 