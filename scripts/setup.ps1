# Repo Lens Setup Script for Windows

Write-Host "🚀 Setting up Repo Lens..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check Node.js version
$majorVersion = (node --version).Split('.')[0].TrimStart('v')
if ([int]$majorVersion -lt 18) {
    Write-Host "❌ Node.js version 18+ is required. Current version: $(node --version)" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env.local"
    Write-Host "⚠️  Please add your GitHub token to .env.local" -ForegroundColor Yellow
    Write-Host "   Get a token from: https://github.com/settings/tokens" -ForegroundColor Cyan
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Check if GitHub token is set
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "your_github_token_here") {
    Write-Host "⚠️  Please update your GitHub token in .env.local" -ForegroundColor Yellow
} else {
    Write-Host "✅ GitHub token appears to be configured" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Add your GitHub token to .env.local" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see README.md" -ForegroundColor Cyan 