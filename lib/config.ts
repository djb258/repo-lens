// Environment Configuration
// Centralized configuration for all environment variables
import dotenv from 'dotenv'

// Load environment variables from .env file
// Force reload to ensure consistency
try {
  dotenv.config({ override: true })
} catch (error) {
  console.warn('⚠️  Could not load .env file - using system environment variables')
}

export interface AppConfig {
  github: {
    token: string
    username?: string
  }
  logging: {
    centralizedUrl?: string
    centralizedToken?: string
  }
  app: {
    name: string
    version: string
    environment: string
  }
}

// Validate required environment variables
function validateConfig(): AppConfig {
  const config: AppConfig = {
    github: {
      token: process.env.GITHUB_TOKEN || '',
      username: process.env.GITHUB_USERNAME,
    },
    logging: {
      centralizedUrl: process.env.CENTRALIZED_LOG_URL,
      centralizedToken: process.env.CENTRALIZED_LOG_TOKEN,
    },
    app: {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'Repo Lens',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
  }

  // Validate required GitHub token
  if (!config.github.token) {
    console.warn('⚠️  GITHUB_TOKEN not found in environment variables')
    console.warn('   The app will work but with limited GitHub API access')
  } else {
    console.log('✅ GITHUB_TOKEN found and configured')
  }

  // Validate centralized logging configuration
  if (!config.logging.centralizedUrl) {
    console.info('ℹ️  CENTRALIZED_LOG_URL not configured - using local logging only')
  }

  return config
}

// Export the validated configuration
export const config = validateConfig()

// Helper functions for environment-specific behavior
export const isDevelopment = config.app.environment === 'development'
export const isProduction = config.app.environment === 'production'
export const isTest = config.app.environment === 'test'

// GitHub configuration helpers
export const hasGitHubToken = !!config.github.token
export const hasCentralizedLogging = !!config.logging.centralizedUrl

// Export individual config sections for convenience
export const { github, logging, app } = config 