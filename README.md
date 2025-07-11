# RepoLens - GitHub Repository Explorer

A Next.js application that provides visual and plain-English exploration of GitHub repositories, treating each repo like a "book" with an index, summaries, and diagrams.

## 🏗️ Blueprint ID: BP-039

This application implements the **ORBT Doctrine** with universal diagnostic tracking system.

## 🔍 Universal Diagnostic Tracking (ORBT Doctrine)

### Blueprint System
- **Blueprint ID**: `BP-039` (RepoLens Application)
- **Assignment**: Automatically assigned at build time
- **Access**: Available in both frontend and backend code

### UDNS (Universal Diagnostic Number System)
All diagnostic events emit UDNS codes in the format: `ALTITUDE.MODULE.SUBMODULE.ACTION`

#### Altitude Levels
- `00` - Ground level (file system, basic operations)
- `05` - 5k ft (function level detail)
- `10` - 10k ft (module level operations)
- `20` - 20k ft (component interactions)
- `30` - 30k ft (service level operations)
- `40` - 40k ft (system level operations)

#### Module Categories
- `UI` - User Interface components
- `API` - API endpoints and handlers
- `DATABASE` - Database operations
- `GITHUB` - GitHub API operations
- `VISUALS` - Visual file processing
- `NAVIGATION` - Navigation and routing
- `AUTH` - Authentication and authorization
- `PARSER` - File parsing operations
- `MERMAID` - Mermaid diagram processing
- `UTILS` - Utility functions

#### Example UDNS Codes
- `30.GITHUB.repo-fetch.fetch` - GitHub repository fetch operation
- `20.UI.repo-card.load` - Repository card component loading
- `10.PARSER.yaml-parse.parse` - YAML file parsing
- `40.SYSTEM.diagnostic-log.read` - System diagnostic log access

### Diagnostic Event Format
```json
{
  "blueprint_id": "BP-039",
  "diagnostic_code": "30.GITHUB.repo-fetch.fetch",
  "severity": "RED",
  "status": "FAILED_AUTHENTICATION",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "GitHub authentication failed",
  "details": {
    "status": 401,
    "owner": "djb258",
    "repo": "repo-lens"
  }
}
```

### Severity Levels
- **GREEN** - Success, no issues
- **YELLOW** - Warning, minor issues
- **ORANGE** - Critical, multiple issues
- **RED** - Escalated, human intervention required

### Status Types
- `SUCCESS` - Operation completed successfully
- `FAILED_VALIDATION` - Input validation failed
- `FAILED_AUTHENTICATION` - Authentication/authorization failed
- `FAILED_FETCH` - Data fetch operation failed
- `FAILED_PARSE` - Data parsing failed
- `FAILED_RENDER` - UI rendering failed
- `TIMEOUT` - Operation timed out
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Access denied
- `RATE_LIMITED` - API rate limit exceeded
- `ESCALATED` - Requires human intervention

## 🚀 Features

### Multi-Level Altitude Model
1. **Global Repo Index (40,000 ft)** - List all repos with cards linking to repo pages
2. **App Overview (30,000 ft)** - Show plain-English index, repo wiki, Mermaid diagram, and links to modules
3. **Module View (20,000 ft)** - Show module summary, diagram, exported functions/components, links to function views
4. **Function View (10,000 ft)** - Show function explanation, code block, control flow or data map
5. **Optional drill-down (1,000-5,000 ft)** - Detailed logic trees

### Interactive Manual System
- **Altitude markers** in each Markdown file
- **Mini-TOC / breadcrumbs** per view
- **Inline editable comments**
- **"Fix This" button** to prefill Cursor commands
- **Outdated doc warning** if code is newer than docs

### ORPT Repo Lens Viewer (Phase 1)
1. **Page 1 - Repository Index**: List all GitHub repos via API, searchable and clickable
2. **Page 2 - Repository Overview (30k)**: Load `/VISUALS/index.yaml` and `/VISUALS/function_doc.md`, show module list and summary
3. **Page 3 - Repository Diagram (30k schematic)**: Render `/VISUALS/overview.mmd` with Mermaid, color code nodes by issue fix counts
4. **Page 4 - Module Detail (20k → 10k)**: Show raw code, function summary, fixes log, issue summary, visual warnings

### Diagnostic Dashboard
- **Real-time monitoring** of all diagnostic events
- **Severity-based filtering** and visualization
- **Module statistics** and performance metrics
- **Export functionality** for diagnostic data
- **Visual overlays** highlighting affected modules

## 📁 File Structure

### Documentation Files
```
REPO_WIKI.md          # 30k altitude - Repository overview
WIKI_MAP.mmd          # 30k altitude - Visual repository map
MODULE_MAP/
  [module].mmd        # 20k altitude - Module diagrams
FUNCTION_SUMMARY/
  [func].md           # 10k altitude - Function documentation
```

### ORPT System Files
```
/VISUALS/
  index.yaml          # Module index and metadata
  function_doc.md     # Function documentation
  overview.mmd        # Mermaid overview diagram
/troubleshooting/
  issue_log.yaml      # Issue tracking and counts
/training/
  fixes.yaml          # Fix history and solutions
```

### Diagnostic System
```
lib/
  diagnostics.ts      # Universal diagnostic tracking
components/
  DiagnosticOverlay.tsx   # Visual diagnostic indicators
  DiagnosticDashboard.tsx # Comprehensive diagnostic view
app/
  diagnostics/
    page.tsx          # Diagnostic dashboard page
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- GitHub Personal Access Token

### Installation
```bash
# Clone the repository
git clone https://github.com/djb258/repo-lens.git
cd repo-lens

# Install dependencies
npm install

# Set up GitHub token
npm run setup:github
# Or manually create .env.local with:
# GITHUB_TOKEN=your_github_token_here

# Start development server
npm run dev
```

### GitHub Token Setup
The app requires a GitHub Personal Access Token with the following scopes:
- `repo` - Full control of private repositories
- `read:user` - Read user profile data

## 🔧 Usage

### Basic Navigation
1. **Homepage** (`/`) - Repository index with search and filtering
2. **Repository Overview** (`/[owner]/[repo]`) - High-level repository information
3. **Module View** (`/[owner]/[repo]/[module]`) - Module-specific details
4. **Function View** (`/[owner]/[repo]/[module]/[function]`) - Function-level analysis
5. **Diagnostics** (`/diagnostics`) - Universal diagnostic dashboard

### Diagnostic Monitoring
- **Real-time tracking** of all application events
- **Visual indicators** on affected components
- **Severity-based alerts** and escalation
- **Export capabilities** for analysis
- **Centralized logging** (Neon database integration planned)

### ORPT Features
- **Color-coded diagrams** based on issue counts
- **Fix history tracking** with escalation warnings
- **Visual overlays** for problematic modules
- **Interactive tooltips** with detailed information

## 🎨 Technologies

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **GitHub REST API**
- **Mermaid.js** (diagrams)
- **React Markdown** (content rendering)
- **Universal Diagnostic System** (ORBT Doctrine)

## 📊 Diagnostic Examples

### Authentication Failure
```
BP-039::30.GITHUB.auth.fetch - RED - FAILED_AUTHENTICATION - GitHub authentication failed
```

### Successful Repository Load
```
BP-039::20.UI.repo-card.complete - GREEN - SUCCESS - Successfully loaded 25 repositories
```

### Parse Error
```
BP-039::10.PARSER.yaml-parse.parse - ORANGE - FAILED_PARSE - Invalid YAML format in index.yaml
```

## 🔮 Future Enhancements

### Phase 2 Features
- **Neon database integration** for centralized logging
- **Real-time collaboration** features
- **Advanced visualization** options
- **Automated issue detection** and resolution
- **Performance analytics** and optimization

### Diagnostic Enhancements
- **Machine learning** for pattern recognition
- **Predictive analytics** for issue prevention
- **Automated escalation** workflows
- **Integration with external** monitoring tools

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with diagnostic tracking
4. Add tests and documentation
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the diagnostic dashboard for system status
- Review the ORBT doctrine documentation

---

**Blueprint BP-039** - RepoLens Application with Universal Diagnostic Tracking 