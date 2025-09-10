#!/usr/bin/env node

/**
 * Test Runner for Dinner Helper App
 * This script runs all tests and provides a summary
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Dinner Helper App Test Runner');
console.log('================================\n');

// Check if Jest is installed
function checkJestInstalled() {
  try {
    execSync('npx jest --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Install dependencies if needed
function installDependencies() {
  console.log('📦 Installing test dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Run unit tests
function runUnitTests() {
  console.log('🔬 Running unit tests...');
  try {
    execSync('npx jest --verbose', { stdio: 'inherit' });
    console.log('✅ Unit tests completed\n');
  } catch (error) {
    console.error('❌ Unit tests failed:', error.message);
    return false;
  }
  return true;
}

// Run tests with coverage
function runTestsWithCoverage() {
  console.log('📊 Running tests with coverage...');
  try {
    execSync('npx jest --coverage --watchAll=false', { stdio: 'inherit' });
    console.log('✅ Coverage report generated\n');
  } catch (error) {
    console.error('❌ Coverage tests failed:', error.message);
    return false;
  }
  return true;
}

// Check if integration test file exists
function checkIntegrationTest() {
  const integrationTestPath = path.join(__dirname, '__tests__', 'integration.test.html');
  if (fs.existsSync(integrationTestPath)) {
    console.log('🌐 Integration test file found:');
    console.log(`   ${integrationTestPath}`);
    console.log('   Open this file in your browser to run manual integration tests\n');
  }
}

// Main test runner
function main() {
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found. Please run this from the project root directory.');
    process.exit(1);
  }

  // Install dependencies if Jest is not available
  if (!checkJestInstalled()) {
    installDependencies();
  }

  // Run unit tests
  const unitTestsPassed = runUnitTests();
  
  // Run coverage tests
  const coverageTestsPassed = runTestsWithCoverage();
  
  // Check integration test
  checkIntegrationTest();

  // Summary
  console.log('📋 Test Summary');
  console.log('===============');
  console.log(`Unit Tests: ${unitTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Coverage Tests: ${coverageTestsPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('Integration Tests: 🌐 Manual testing required');
  
  if (unitTestsPassed && coverageTestsPassed) {
    console.log('\n🎉 All automated tests passed!');
    console.log('💡 Don\'t forget to run the integration tests manually.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the output above.');
    process.exit(1);
  }
}

// Run the tests
main();

