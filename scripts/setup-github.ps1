# GitHub Setup Script for Repo Lens

Write-Host "🔧 Setting up GitHub integration for Repo Lens..." -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env.local"
    Write-Host "✅ .env.local created from template" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔑 GitHub Personal Access Token Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "To create a GitHub Personal Access Token:" -ForegroundColor White
Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host "2. Click 'Generate new token (classic)'" -ForegroundColor Yellow
Write-Host "3. Give it a descriptive name (e.g., 'Repo Lens')" -ForegroundColor Yellow
Write-Host "4. Set expiration (recommended: 90 days)" -ForegroundColor Yellow
Write-Host "5. Select these scopes:" -ForegroundColor Yellow
Write-Host "   ✓ repo (Full control of private repositories)" -ForegroundColor Green
Write-Host "   ✓ read:user (Read access to user profile)" -ForegroundColor Green
Write-Host "6. Click 'Generate token'" -ForegroundColor Yellow
Write-Host "7. Copy the token (you won't see it again!)" -ForegroundColor Red
Write-Host ""

# Check current token status
$envContent = Get-Content ".env.local" -Raw -ErrorAction SilentlyContinue
if ($envContent -and $envContent -match "your_github_token_here") {
    Write-Host "⚠️  Current status: Token not configured" -ForegroundColor Yellow
    Write-Host "   Please update .env.local with your GitHub token" -ForegroundColor White
} elseif ($envContent -and $envContent -match "GITHUB_TOKEN=") {
    Write-Host "✅ Current status: Token appears to be configured" -ForegroundColor Green
} else {
    Write-Host "❌ Current status: .env.local file issue" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Quick Setup Steps:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host "1. Open .env.local in your editor" -ForegroundColor White
Write-Host "2. Replace 'your_github_token_here' with your actual token" -ForegroundColor White
Write-Host "3. Save the file" -ForegroundColor White
Write-Host "4. Run: npm run dev" -ForegroundColor White
Write-Host "5. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "🔗 Useful Links:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "• GitHub Tokens: https://github.com/settings/tokens" -ForegroundColor Blue
Write-Host "• Repo Lens Docs: https://github.com/djb258/repo-lens" -ForegroundColor Blue
Write-Host "• Vercel Deployment: https://vercel.com" -ForegroundColor Blue
Write-Host ""

Write-Host "🎉 Setup complete! Follow the steps above to configure your token." -ForegroundColor Green 