#!/bin/bash

echo "🚀 Setting up Repo Lens..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "⚠️  Please add your GitHub token to .env.local"
    echo "   Get a token from: https://github.com/settings/tokens"
else
    echo "✅ .env.local already exists"
fi

# Check if GitHub token is set
if grep -q "your_github_token_here" .env.local; then
    echo "⚠️  Please update your GitHub token in .env.local"
else
    echo "✅ GitHub token appears to be configured"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your GitHub token to .env.local"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For more information, see README.md" 