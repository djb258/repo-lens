# parseRepoStructure Function (10,000 ft)

## 🎯 Purpose
Parses the structure of a GitHub repository and extracts documentation files for the Repo Lens application. This function serves as the primary data fetcher for repository exploration.

## 📋 Function Signature
```typescript
export async function parseRepoStructure(
  owner: string,
  repo: string
): Promise<RepoFile[]>
```

## 🔧 Parameters
- **owner** (string): GitHub username or organization name
- **repo** (string): Repository name

## 📤 Returns
- **RepoFile[]**: Array of repository files with metadata and content

## 🔄 Process Flow
1. **Fetch Contents**: Get repository contents via GitHub API
2. **Process Files**: Iterate through each file/directory
3. **Extract Documentation**: Look for REPO_WIKI.md and WIKI_MAP.mmd
4. **Enrich Data**: Add lastModified timestamps and content
5. **Return Structure**: Provide complete repository file list

## 📁 File Types Handled
- **Directories**: Folders and subdirectories
- **Files**: All file types with size information
- **Documentation**: Special handling for .md and .mmd files
- **Symlinks**: Repository symlinks and submodules

## 🎨 Key Features
- **Error Handling**: Graceful fallbacks for missing files
- **Content Extraction**: Base64 decoding of file contents
- **Metadata Enrichment**: Last modified timestamps
- **Type Safety**: Full TypeScript support

## 🔗 Dependencies
- `@octokit/rest` for GitHub API access
- `Buffer` for base64 decoding
- Custom `RepoFile` interface

## 🚨 Error Cases
- **API Failures**: Network or authentication issues
- **Missing Files**: Documentation files not found
- **Invalid Content**: Corrupted or unreadable files
- **Rate Limiting**: GitHub API rate limit exceeded

## 💡 Usage Example
```typescript
const files = await parseRepoStructure('username', 'repo-name')
const wikiFile = files.find(f => f.name === 'REPO_WIKI.md')
const diagramFile = files.find(f => f.name === 'WIKI_MAP.mmd')
```

## 🔄 Related Functions
- `getRepository()` - Get repository metadata
- `getFileContent()` - Extract individual file content
- `getModuleInfo()` - Get module-specific information
- `getFunctionInfo()` - Get function-level details 