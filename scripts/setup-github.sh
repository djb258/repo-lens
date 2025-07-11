#!/bin/bash

echo "🔧 Setting up GitHub integration for Repo Lens..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "✅ .env.local created from template"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🔑 GitHub Personal Access Token Setup"
echo "====================================="
echo ""

echo "To create a GitHub Personal Access Token:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Give it a descriptive name (e.g., 'Repo Lens')"
echo "4. Set expiration (recommended: 90 days)"
echo "5. Select these scopes:"
echo "   ✓ repo (Full control of private repositories)"
echo "   ✓ read:user (Read access to user profile)"
echo "6. Click 'Generate token'"
echo "7. Copy the token (you won't see it again!)"
echo ""

# Check current token status
if grep -q "your_github_token_here" .env.local 2>/dev/null; then
    echo "⚠️  Current status: Token not configured"
    echo "   Please update .env.local with your GitHub token"
elif grep -q "GITHUB_TOKEN=" .env.local 2>/dev/null; then
    echo "✅ Current status: Token appears to be configured"
else
    echo "❌ Current status: .env.local file issue"
fi

echo ""
echo "📋 Quick Setup Steps:"
echo "===================="
echo "1. Open .env.local in your editor"
echo "2. Replace 'your_github_token_here' with your actual token"
echo "3. Save the file"
echo "4. Run: npm run dev"
echo "5. Open: http://localhost:3000"
echo ""

echo "🔗 Useful Links:"
echo "==============="
echo "• GitHub Tokens: https://github.com/settings/tokens"
echo "• Repo Lens Docs: https://github.com/djb258/repo-lens"
echo "• Vercel Deployment: https://vercel.com"
echo ""

echo "🎉 Setup complete! Follow the steps above to configure your token." 