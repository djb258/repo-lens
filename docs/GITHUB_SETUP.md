# GitHub Setup Guide for Repo Lens

This guide will help you set up GitHub integration for Repo Lens so you can view your repositories in a plain-English, visual way.

## Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**
```powershell
.\scripts\setup-github.ps1
```

**macOS/Linux:**
```bash
chmod +x scripts/setup-github.sh
./scripts/setup-github.sh
```

### Option 2: Manual Setup

Follow the steps below to manually configure GitHub integration.

## Step 1: Create a GitHub Personal Access Token

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Sign in to your GitHub account if needed

2. **Generate New Token**
   - Click "Generate new token (classic)"
   - Note: Fine-grained tokens are not yet supported

3. **Configure Token**
   - **Note**: Give it a descriptive name like "Repo Lens"
   - **Expiration**: Set to 90 days (recommended) or your preferred duration
   - **Scopes**: Select the following permissions:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `read:user` (Read access to user profile)

4. **Generate and Copy**
   - Click "Generate token"
   - **Important**: Copy the token immediately - you won't see it again!

## Step 2: Configure Environment Variables

1. **Create Environment File**
   ```bash
   cp env.example .env.local
   ```

2. **Add Your Token**
   - Open `.env.local` in your text editor
   - Replace `your_github_token_here` with your actual token:
   ```env
   GITHUB_TOKEN=ghp_your_actual_token_here
   ```

3. **Save the File**
   - Make sure to save `.env.local` in your project root

## Step 3: Start the Application

1. **Install Dependencies** (if not already done)
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to: http://localhost:3000
   - You should now see your GitHub repositories!

## Troubleshooting

### "Failed to fetch repositories" Error

**Common Causes:**
- Token not added to `.env.local`
- Token has expired
- Token doesn't have correct permissions
- Network connectivity issues

**Solutions:**
1. Verify your token is in `.env.local`
2. Check token expiration at https://github.com/settings/tokens
3. Ensure token has `repo` and `read:user` scopes
4. Restart the development server after making changes

### Token Security Best Practices

- ✅ Use environment variables (never commit tokens to git)
- ✅ Set reasonable expiration dates
- ✅ Use descriptive token names
- ✅ Regularly rotate tokens
- ❌ Never share tokens publicly
- ❌ Don't use tokens in client-side code

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | Your GitHub Personal Access Token | Yes |
| `GITHUB_WEBHOOK_SECRET` | Secret for webhook verification | No |

## Deployment Setup

### Vercel Deployment

1. **Connect Repository**
   - Push your code to GitHub
   - Connect repository to Vercel

2. **Add Environment Variables**
   - Go to Vercel project settings
   - Add `GITHUB_TOKEN` with your token value
   - Redeploy the application

3. **Verify Deployment**
   - Your app should now work on Vercel with GitHub integration

### Other Platforms

The same environment variable setup applies to other deployment platforms:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Advanced Configuration

### Webhook Setup (Optional)

For real-time updates when repository files change:

1. **Add Webhook Secret**
   ```env
   GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
   ```

2. **Configure GitHub Webhook**
   - Go to your repository settings
   - Navigate to Webhooks
   - Add webhook URL: `https://your-domain.com/api/github-webhook`
   - Set content type to `application/json`
   - Select "Push events"

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your token permissions
3. Check the browser console for errors
4. Review the application logs
5. Open an issue on GitHub: https://github.com/djb258/repo-lens/issues

## Security Notes

- Your GitHub token is stored locally in `.env.local`
- The token is only used server-side for API calls
- Never expose your token in client-side code
- Consider using GitHub Apps for production deployments

---

**Need Help?** Check out the [main README](../README.md) or open an issue on GitHub. 