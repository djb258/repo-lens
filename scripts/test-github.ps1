# GitHub Token Test Script for Repo Lens

Write-Host "🧪 Testing GitHub Token Configuration..." -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "   Run the setup script first: .\scripts\setup-github.ps1" -ForegroundColor Yellow
    exit 1
}

# Read token from .env.local
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "GITHUB_TOKEN=(.+)") {
    $token = $matches[1].Trim()
    
    if ($token -eq "your_github_token_here") {
        Write-Host "❌ Token not configured!" -ForegroundColor Red
        Write-Host "   Please update .env.local with your actual GitHub token" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ Token found in .env.local" -ForegroundColor Green
    Write-Host "   Token starts with: $($token.Substring(0, [Math]::Min(10, $token.Length)))..." -ForegroundColor Gray
} else {
    Write-Host "❌ GITHUB_TOKEN not found in .env.local!" -ForegroundColor Red
    exit 1
}

# Test GitHub API
Write-Host ""
Write-Host "🔍 Testing GitHub API connection..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "token $token"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    $response = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers -Method Get
    
    Write-Host "✅ GitHub API connection successful!" -ForegroundColor Green
    Write-Host "   Authenticated as: $($response.login)" -ForegroundColor Cyan
    Write-Host "   User ID: $($response.id)" -ForegroundColor Gray
    
    # Test repositories endpoint
    Write-Host ""
    Write-Host "📚 Testing repositories access..." -ForegroundColor Yellow
    
    $reposResponse = Invoke-RestMethod -Uri "https://api.github.com/user/repos?per_page=5" -Headers $headers -Method Get
    
    Write-Host "✅ Repositories access successful!" -ForegroundColor Green
    Write-Host "   Found $($reposResponse.Count) repositories (showing first 5)" -ForegroundColor Cyan
    
    foreach ($repo in $reposResponse) {
        Write-Host "   • $($repo.full_name)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "🎉 All tests passed! Your GitHub token is working correctly." -ForegroundColor Green
    Write-Host "   You can now run: npm run dev" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ GitHub API test failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*401*") {
        Write-Host "   This usually means the token is invalid or expired." -ForegroundColor Yellow
        Write-Host "   Please check your token at: https://github.com/settings/tokens" -ForegroundColor Cyan
    } elseif ($_.Exception.Message -like "*403*") {
        Write-Host "   This usually means the token doesn't have the required permissions." -ForegroundColor Yellow
        Write-Host "   Make sure your token has 'repo' and 'read:user' scopes." -ForegroundColor Cyan
    }
    
    exit 1
} 