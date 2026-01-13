#!/usr/bin/env node

/**
 * Validation script for automated code review fixes
 * Checks for:
 * 1. Retry delay cap (max 5000ms) in API gateway
 * 2. aria-label on interactive elements (buttons)
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

let passCount = 0;
let failCount = 0;

function log(message, type = 'info') {
  const prefix = {
    pass: `${colors.green}✓${colors.reset}`,
    fail: `${colors.red}✗${colors.reset}`,
    info: `${colors.yellow}ℹ${colors.reset}`
  }[type] || '';
  console.log(`${prefix} ${message}`);
}

function pass(message) {
  passCount++;
  log(message, 'pass');
}

function fail(message) {
  failCount++;
  log(message, 'fail');
}

/**
 * Test 1: Validate retry delay cap in ecosystem-gateway.js
 */
function testRetryDelayCap() {
  log('\nTest 1: Checking retry delay cap in ecosystem-gateway.js', 'info');
  
  const filePath = path.join(__dirname, '..', 'api', 'ecosystem-gateway.js');
  
  if (!fs.existsSync(filePath)) {
    fail('ecosystem-gateway.js not found');
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for Math.min with 5000 cap
  const hasDelayCap = /Math\.min.*5000/.test(content);
  
  if (hasDelayCap) {
    pass('Retry delay is capped at 5000ms');
  } else {
    fail('Retry delay cap (5000ms) not found or incorrect');
  }
  
  // Additional check: ensure exponential backoff exists
  const hasExponentialBackoff = /Math\.pow\s*\(\s*2\s*,\s*attempt\s*\)/.test(content);
  
  if (hasExponentialBackoff) {
    pass('Exponential backoff logic is present');
  } else {
    fail('Exponential backoff logic not found');
  }
}

/**
 * Test 2: Validate aria-label on close buttons
 */
function testAriaLabels() {
  log('\nTest 2: Checking aria-label on interactive elements', 'info');
  
  const htmlFiles = ['index.html', 'dashboard.html'];
  
  htmlFiles.forEach(fileName => {
    const filePath = path.join(__dirname, '..', fileName);
    
    if (!fs.existsSync(filePath)) {
      fail(`${fileName} not found`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find all buttons with specific classes/ids that should have aria-label
    const closeButtonPattern = /<button[^>]*(?:class|id)=["'][^"']*(?:close|banner-close)[^"']*["'][^>]*>/gi;
    const matches = content.match(closeButtonPattern) || [];
    
    matches.forEach((match, index) => {
      const hasAriaLabel = /aria-label=["'][^"']+["']/.test(match);
      
      if (hasAriaLabel) {
        pass(`${fileName}: Close button ${index + 1} has aria-label`);
      } else {
        fail(`${fileName}: Close button ${index + 1} is missing aria-label`);
      }
    });
    
    if (matches.length === 0) {
      log(`${fileName}: No close buttons found to check`, 'info');
    }
  });
}

/**
 * Test 3: Check for general accessibility patterns
 */
function testAccessibilityPatterns() {
  log('\nTest 3: Checking general accessibility patterns', 'info');
  
  const htmlFiles = ['index.html', 'dashboard.html'];
  
  htmlFiles.forEach(fileName => {
    const filePath = path.join(__dirname, '..', fileName);
    
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for lang attribute
    if (/<html[^>]+lang=["'][a-z]{2}["']/.test(content)) {
      pass(`${fileName}: Has lang attribute on html tag`);
    } else {
      fail(`${fileName}: Missing lang attribute on html tag`);
    }
    
    // Check for alt text on images
    const imgWithoutAlt = /<img(?![^>]*alt=)[^>]*>/.test(content);
    if (!imgWithoutAlt) {
      pass(`${fileName}: All images have alt attributes`);
    } else {
      fail(`${fileName}: Some images are missing alt attributes`);
    }
  });
}

/**
 * Test 4: Validate timeout and retry configuration
 */
function testRetryConfiguration() {
  log('\nTest 4: Checking retry and timeout configuration', 'info');
  
  const filePath = path.join(__dirname, '..', 'api', 'ecosystem-gateway.js');
  
  if (!fs.existsSync(filePath)) {
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for proper timeout configuration
  const hasTimeout = /timeout:\s*\d+/.test(content);
  if (hasTimeout) {
    pass('Timeout configuration is present');
  } else {
    fail('Timeout configuration not found');
  }
  
  // Check for retry count
  const hasRetries = /retries:\s*\d+/.test(content);
  if (hasRetries) {
    pass('Retry count configuration is present');
  } else {
    fail('Retry count configuration not found');
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.bold}${colors.yellow}Quantum Pi Forge - Code Review Fix Validation${colors.reset}\n`);
  console.log('Running automated checks for commit 096fdab fixes...\n');
  
  testRetryDelayCap();
  testAriaLabels();
  testAccessibilityPatterns();
  testRetryConfiguration();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`${colors.green}Passed: ${passCount}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failCount}${colors.reset}`);
  console.log('='.repeat(50) + '\n');
  
  if (failCount > 0) {
    console.log(`${colors.red}${colors.bold}Some checks failed. Please review the issues above.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}All checks passed! ✨${colors.reset}\n`);
    process.exit(0);
  }
}

// Run the tests
main();
