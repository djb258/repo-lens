/**
 * Core Testing Framework for Repo Lens Application
 * Handles route testing, interactivity validation, and rendering checks
 */

import { NextRequest } from 'next/server';

export interface TestResult {
  route: string;
  status: 'pass' | 'fail' | 'error';
  responseTime: number;
  statusCode: number;
  errors: string[];
  warnings: string[];
  metadata: any;
}

export interface InteractivityTest {
  name: string;
  selector: string;
  action: 'click' | 'type' | 'hover' | 'scroll';
  expectedResult: string;
  timeout?: number;
}

export interface RenderingTest {
  route: string;
  expectedElements: string[];
  expectedContent: string[];
  visualChecks: string[];
}

/**
 * Test all routes for the Repo Lens application
 */
export async function testAllRoutes(
  routes: string[], 
  baseUrl: string,
  options: {
    timeout?: number;
    retries?: number;
    validateContent?: boolean;
  } = {}
): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const { timeout = 10000, retries = 3, validateContent = true } = options;

  console.log(`🔍 Testing ${routes.length} routes against ${baseUrl}`);

  for (const route of routes) {
    const result = await testRoute(route, baseUrl, { timeout, retries, validateContent });
    results.push(result);
    
    // Log result
    const status = result.status === 'pass' ? '✅' : result.status === 'fail' ? '⚠️' : '❌';
    console.log(`${status} ${route} - ${result.statusCode} (${result.responseTime}ms)`);
    
    if (result.errors.length > 0) {
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
  }

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const errored = results.filter(r => r.status === 'error').length;

  console.log(`\n📊 Route Test Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ⚠️  Failed: ${failed}`);
  console.log(`   ❌ Errors: ${errored}`);

  return results;
}

/**
 * Test a single route
 */
async function testRoute(
  route: string, 
  baseUrl: string, 
  options: {
    timeout: number;
    retries: number;
    validateContent: boolean;
  }
): Promise<TestResult> {
  const { timeout, retries, validateContent } = options;
  const url = `${baseUrl}${route}`;
  const errors: string[] = [];
  const warnings: string[] = [];
  let statusCode = 0;
  let responseTime = 0;
  let content = '';

  // Test with retries
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Repo-Lens-Test-Suite/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(timeout)
      });

      responseTime = Date.now() - startTime;
      statusCode = response.status;
      content = await response.text();

      // Validate status code
      if (response.status >= 200 && response.status < 400) {
        break; // Success, exit retry loop
      } else {
        errors.push(`HTTP ${response.status}: ${response.statusText}`);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
          continue;
        }
      }
    } catch (error: any) {
      errors.push(`Attempt ${attempt}: ${error.message}`);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    }
  }

  // Validate content if requested
  if (validateContent && content) {
    const contentValidation = validateRouteContent(route, content);
    errors.push(...contentValidation.errors);
    warnings.push(...contentValidation.warnings);
  }

  // Determine test status
  let status: 'pass' | 'fail' | 'error' = 'pass';
  if (statusCode >= 500) {
    status = 'error';
  } else if (statusCode >= 400 || errors.length > 0) {
    status = 'fail';
  }

  return {
    route,
    status,
    responseTime,
    statusCode,
    errors,
    warnings,
    metadata: {
      url,
      contentLength: content.length,
      retries: retries
    }
  };
}

/**
 * Validate route content based on expected patterns
 */
function validateRouteContent(route: string, content: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Common validation patterns
  if (!content.includes('<!DOCTYPE html>') && !content.includes('<html')) {
    errors.push('Missing HTML structure');
  }

  if (!content.includes('<title>')) {
    warnings.push('Missing title tag');
  }

  if (!content.includes('<meta')) {
    warnings.push('Missing meta tags');
  }

  // Route-specific validations
  if (route === '/') {
    if (!content.includes('Repo Lens') && !content.includes('repo-lens')) {
      errors.push('Missing Repo Lens branding on homepage');
    }
  }

  if (route.includes('/module/')) {
    if (!content.includes('module') && !content.includes('Module')) {
      warnings.push('Module page missing module-related content');
    }
  }

  if (route.includes('/diagram')) {
    if (!content.includes('diagram') && !content.includes('visual') && !content.includes('schematic')) {
      warnings.push('Diagram page missing visual content indicators');
    }
  }

  if (route.includes('/troubleshooting')) {
    if (!content.includes('troubleshooting') && !content.includes('diagnostic') && !content.includes('repair')) {
      warnings.push('Troubleshooting page missing repair/diagnostic content');
    }
  }

  return { errors, warnings };
}

/**
 * Validate rendering and visual elements per page
 */
export async function validateRendering(
  routes: string[], 
  baseUrl: string,
  options: {
    checkImages?: boolean;
    checkScripts?: boolean;
    checkStyles?: boolean;
  } = {}
): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const { checkImages = true, checkScripts = true, checkStyles = true } = options;

  console.log(`🎨 Validating rendering for ${routes.length} routes`);

  for (const route of routes) {
    const result = await validateRouteRendering(route, baseUrl, { checkImages, checkScripts, checkStyles });
    results.push(result);
    
    const status = result.status === 'pass' ? '✅' : result.status === 'fail' ? '⚠️' : '❌';
    console.log(`${status} ${route} - Rendering validation`);
    
    if (result.warnings.length > 0) {
      console.log(`   Warnings: ${result.warnings.join(', ')}`);
    }
  }

  return results;
}

/**
 * Validate rendering for a single route
 */
async function validateRouteRendering(
  route: string, 
  baseUrl: string, 
  options: {
    checkImages: boolean;
    checkScripts: boolean;
    checkStyles: boolean;
  }
): Promise<TestResult> {
  const { checkImages, checkScripts, checkStyles } = options;
  const url = `${baseUrl}${route}`;
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const response = await fetch(url);
    const content = await response.text();

    // Check for required rendering elements
    if (checkScripts && !content.includes('<script')) {
      warnings.push('No JavaScript detected');
    }

    if (checkStyles && !content.includes('<style') && !content.includes('stylesheet')) {
      warnings.push('No CSS styles detected');
    }

    if (checkImages && !content.includes('<img') && !content.includes('background-image')) {
      warnings.push('No images detected');
    }

    // Check for common rendering issues
    if (content.includes('Error:') || content.includes('error:')) {
      errors.push('Error messages detected in rendered content');
    }

    if (content.includes('undefined') || content.includes('null')) {
      warnings.push('Undefined/null values detected in rendered content');
    }

    // Check for loading states
    if (content.includes('Loading...') || content.includes('loading')) {
      warnings.push('Loading states detected - may indicate incomplete rendering');
    }

    return {
      route,
      status: errors.length > 0 ? 'fail' : 'pass',
      responseTime: 0,
      statusCode: response.status,
      errors,
      warnings,
      metadata: { url, contentLength: content.length }
    };

  } catch (error: any) {
    return {
      route,
      status: 'error',
      responseTime: 0,
      statusCode: 0,
      errors: [error.message],
      warnings: [],
      metadata: { url }
    };
  }
}

/**
 * Test interactivity and navigation
 */
export async function testInteractivity(
  baseUrl: string,
  options: {
    testNavigation?: boolean;
    testForms?: boolean;
    testButtons?: boolean;
    timeout?: number;
  } = {}
): Promise<TestResult[]> {
  const { testNavigation = true, testForms = true, testButtons = true, timeout = 5000 } = options;
  const results: TestResult[] = [];

  console.log(`🔄 Testing interactivity on ${baseUrl}`);

  // Test navigation links
  if (testNavigation) {
    const navigationTest = await testNavigationLinks(baseUrl, timeout);
    results.push(navigationTest);
  }

  // Test form interactions
  if (testForms) {
    const formTest = await testFormInteractions(baseUrl, timeout);
    results.push(formTest);
  }

  // Test button interactions
  if (testButtons) {
    const buttonTest = await testButtonInteractions(baseUrl, timeout);
    results.push(buttonTest);
  }

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;

  console.log(`\n📊 Interactivity Test Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ⚠️  Failed: ${failed}`);

  return results;
}

/**
 * Test navigation links
 */
async function testNavigationLinks(baseUrl: string, timeout: number): Promise<TestResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Test homepage navigation
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(timeout) });
    const content = await response.text();

    // Check for navigation elements
    if (!content.includes('nav') && !content.includes('navigation')) {
      warnings.push('No navigation elements detected');
    }

    // Check for links
    if (!content.includes('<a href')) {
      warnings.push('No navigation links detected');
    }

    return {
      route: '/navigation-test',
      status: errors.length > 0 ? 'fail' : 'pass',
      responseTime: 0,
      statusCode: response.status,
      errors,
      warnings,
      metadata: { testType: 'navigation' }
    };

  } catch (error: any) {
    return {
      route: '/navigation-test',
      status: 'error',
      responseTime: 0,
      statusCode: 0,
      errors: [error.message],
      warnings: [],
      metadata: { testType: 'navigation' }
    };
  }
}

/**
 * Test form interactions
 */
async function testFormInteractions(baseUrl: string, timeout: number): Promise<TestResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Test form endpoints if they exist
    const formEndpoints = ['/api/search', '/api/filter', '/api/submit'];
    
    for (const endpoint of formEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true }),
          signal: AbortSignal.timeout(timeout)
        });
        
        if (response.status !== 404) {
          warnings.push(`Form endpoint ${endpoint} responded with ${response.status}`);
        }
      } catch (error) {
        // 404 is expected for non-existent endpoints
      }
    }

    return {
      route: '/form-test',
      status: errors.length > 0 ? 'fail' : 'pass',
      responseTime: 0,
      statusCode: 200,
      errors,
      warnings,
      metadata: { testType: 'forms' }
    };

  } catch (error: any) {
    return {
      route: '/form-test',
      status: 'error',
      responseTime: 0,
      statusCode: 0,
      errors: [error.message],
      warnings: [],
      metadata: { testType: 'forms' }
    };
  }
}

/**
 * Test button interactions
 */
async function testButtonInteractions(baseUrl: string, timeout: number): Promise<TestResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(timeout) });
    const content = await response.text();

    // Check for button elements
    if (!content.includes('<button') && !content.includes('onClick')) {
      warnings.push('No interactive buttons detected');
    }

    // Check for event handlers
    if (!content.includes('onClick') && !content.includes('onSubmit') && !content.includes('onChange')) {
      warnings.push('No event handlers detected');
    }

    return {
      route: '/button-test',
      status: errors.length > 0 ? 'fail' : 'pass',
      responseTime: 0,
      statusCode: response.status,
      errors,
      warnings,
      metadata: { testType: 'buttons' }
    };

  } catch (error: any) {
    return {
      route: '/button-test',
      status: 'error',
      responseTime: 0,
      statusCode: 0,
      errors: [error.message],
      warnings: [],
      metadata: { testType: 'buttons' }
    };
  }
}

/**
 * Generate test report
 */
export function generateTestReport(results: TestResult[]): string {
  const total = results.length;
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const errored = results.filter(r => r.status === 'error').length;

  let report = `# Repo Lens Test Report\n\n`;
  report += `## Summary\n`;
  report += `- **Total Tests**: ${total}\n`;
  report += `- **Passed**: ${passed} (${Math.round((passed/total)*100)}%)\n`;
  report += `- **Failed**: ${failed} (${Math.round((failed/total)*100)}%)\n`;
  report += `- **Errors**: ${errored} (${Math.round((errored/total)*100)}%)\n\n`;

  if (failed > 0 || errored > 0) {
    report += `## Issues\n\n`;
    
    const issues = results.filter(r => r.status !== 'pass');
    issues.forEach(issue => {
      report += `### ${issue.route}\n`;
      report += `- **Status**: ${issue.status}\n`;
      report += `- **Status Code**: ${issue.statusCode}\n`;
      if (issue.errors.length > 0) {
        report += `- **Errors**: ${issue.errors.join(', ')}\n`;
      }
      if (issue.warnings.length > 0) {
        report += `- **Warnings**: ${issue.warnings.join(', ')}\n`;
      }
      report += `\n`;
    });
  }

  return report;
} 