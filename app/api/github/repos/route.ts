import { NextRequest, NextResponse } from 'next/server';
import { ModularUtils } from '../../../modules/shared/utils';
import { ApiResponse, GitHubRepository } from '../../../modules/types';

// ORBT and Barton Doctrine Compliant GitHub Repositories API
export async function GET(request: NextRequest) {
  const timerId = ModularUtils.Performance.startTimer('GitHubReposAPI');
  
  // Initialize response with Barton diagnostic tracking
  const response: ApiResponse<GitHubRepository[]> = {
    success: false,
    data: null,
    error: null,
    diagnostics: [],
    timestamp: new Date()
  };

  try {
    // Create initial diagnostic
    const initDiagnostic = ModularUtils.Barton.createDiagnostic(
      'GitHub Repositories API request initiated',
      'info',
      'github',
      { 
        method: 'GET',
        url: request.url,
        timestamp: new Date().toISOString()
      }
    );
    response.diagnostics.push(initDiagnostic);

    // Check for GitHub token
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      const errorDiagnostic = ModularUtils.Barton.createDiagnostic(
        'GitHub token not configured',
        'error',
        'github',
        { 
          context: 'environment_variable',
          required: 'GITHUB_TOKEN'
        }
      );
      response.diagnostics.push(errorDiagnostic);
      
      response.error = 'GitHub token not configured. Please set GITHUB_TOKEN environment variable.';
      response.success = false;
      
      const loadTime = ModularUtils.Performance.endTimer(timerId);
      console.log(`[GitHubReposAPI] Request failed in ${loadTime.toFixed(2)}ms - No token`);
      
      return NextResponse.json(response, { status: 500 });
    }

    // Start ORBT Observe phase
    const orbtCycle = ModularUtils.Barton.createORBTCycle();
    const observeDiagnostic = ModularBartonUtils.createDiagnostic(
      'ORBT Observe phase started for GitHub API',
      'info',
      'orbt',
      { phase: 'observe', status: 'active' }
    );
    response.diagnostics.push(observeDiagnostic);

    // Fetch repositories from GitHub API
    const githubResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Repo-Lens/1.0'
      }
    });

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text();
      const errorDiagnostic = ModularUtils.Barton.createDiagnostic(
        `GitHub API error: ${githubResponse.status} ${githubResponse.statusText}`,
        'error',
        'github',
        { 
          status: githubResponse.status,
          statusText: githubResponse.statusText,
          responseText: errorText,
          url: 'https://api.github.com/user/repos'
        }
      );
      response.diagnostics.push(errorDiagnostic);
      
      response.error = `GitHub API error: ${githubResponse.status} ${githubResponse.statusText}`;
      response.success = false;
      
      const loadTime = ModularUtils.Performance.endTimer(timerId);
      console.log(`[GitHubReposAPI] Request failed in ${loadTime.toFixed(2)}ms - API error`);
      
      return NextResponse.json(response, { status: githubResponse.status });
    }

    const repos = await githubResponse.json();

    // Validate repository data
    if (!Array.isArray(repos)) {
      const errorDiagnostic = ModularUtils.Barton.createDiagnostic(
        'Invalid response format from GitHub API',
        'error',
        'github',
        { 
          expected: 'array',
          received: typeof repos,
          data: repos
        }
      );
      response.diagnostics.push(errorDiagnostic);
      
      response.error = 'Invalid response format from GitHub API';
      response.success = false;
      
      const loadTime = ModularUtils.Performance.endTimer(timerId);
      console.log(`[GitHubReposAPI] Request failed in ${loadTime.toFixed(2)}ms - Invalid format`);
      
      return NextResponse.json(response, { status: 500 });
    }

    // Enhance repositories with doctrine numbering and ORBT cycles
    const enhancedRepos = ModularUtils.GitHub.enhanceRepositoryList(repos);

    // Create success diagnostic
    const successDiagnostic = ModularUtils.Barton.createDiagnostic(
      `Successfully fetched and enhanced ${enhancedRepos.length} repositories`,
      'info',
      'github',
      { 
        count: enhancedRepos.length,
        enhanced: true,
        timestamp: new Date().toISOString()
      }
    );
    response.diagnostics.push(successDiagnostic);

    // Update ORBT cycle to completed
    const completedOrbtCycle = ModularUtils.Barton.updateORBTCyclePhase(
      orbtCycle, 'observe', 'completed', { repositories: enhancedRepos }, [successDiagnostic]
    );

    // Add ORBT completion diagnostic
    const orbtCompletionDiagnostic = ModularUtils.Barton.createDiagnostic(
      'ORBT Observe phase completed successfully',
      'info',
      'orbt',
      { 
        phase: 'observe', 
        status: 'completed',
        repositoriesProcessed: enhancedRepos.length
      }
    );
    response.diagnostics.push(orbtCompletionDiagnostic);

    // Set successful response
    response.success = true;
    response.data = enhancedRepos;

    const loadTime = ModularUtils.Performance.endTimer(timerId);
    console.log(`[GitHubReposAPI] Request completed in ${loadTime.toFixed(2)}ms - ${enhancedRepos.length} repos`);

    return NextResponse.json(response);

  } catch (error) {
    // Handle unexpected errors
    const errorDiagnostic = ModularUtils.Error.handleError(
      error as Error,
      'GitHub Repositories API',
      'api-github-repos'
    );
    response.diagnostics.push(errorDiagnostic);

    // Add recovery steps
    errorDiagnostic.resolutionSteps = ModularUtils.Error.createRecoverySteps(
      error as Error,
      'GitHub API'
    );

    response.error = (error as Error).message;
    response.success = false;

    const loadTime = ModularUtils.Performance.endTimer(timerId);
    console.log(`[GitHubReposAPI] Request failed in ${loadTime.toFixed(2)}ms - Exception`);

    return NextResponse.json(response, { status: 500 });
  }
}

// Import the missing ModularBartonUtils
import { ModularBartonUtils } from '../../../modules/shared/utils'; 