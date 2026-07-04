#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  printHelp();
  process.exit(0);
}

const tag = args[0];
const isHeaded = args.includes('--headed');
const isDebug = args.includes('--debug');

/**
 * Print usage information
 */
function printHelp() {
  console.log(`
╔════════════════════════════════════════════════════════╗
║         Salesforce QA Automation Test Runner           ║
╚════════════════════════════════════════════════════════╝

Usage: node test-runner.js <@tag> [options]

Tags:
  @Regression      - Run all regression test scenarios
  @Smoke           - Run smoke test scenarios
  @AccountCreation - Run account creation scenarios
  @Login           - Run login scenarios
  @CriticalPath    - Run critical path scenarios

Options:
  --headed         - Run tests with browser visible
  --debug          - Run with debug logging
  -h, --help       - Show this help message

Examples:
  node test-runner.js @Regression
  node test-runner.js @Smoke --headed
  node test-runner.js @Login --debug
  node test-runner.js @CriticalPath --headed --debug

Features:
  ✓ Filter tests by tags
  ✓ Support for multiple tags (coming soon)
  ✓ Custom logging and reporting
  ✓ Headless and headed mode
  ✓ Debug mode with verbose output
`);
}

/**
 * Validate tag format
 */
function validateTag(tagStr) {
  if (!tagStr.startsWith('@')) {
    console.error(`❌ Error: Tag must start with @ (e.g., @Regression)`);
    process.exit(1);
  }
  return tagStr;
}

/**
 * Find all feature files with the specified tag
 */
function findFeatureFilesWithTag(tag) {
  const featuresDir = path.join(__dirname, 'features');
  const featureFiles = [];

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.feature')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes(tag)) {
          featureFiles.push(filePath);
        }
      }
    });
  }

  walkDir(featuresDir);
  return featureFiles;
}

/**
 * Parse feature file and get scenarios with tag
 */
function getScenarioCountWithTag(featureFile, tag) {
  const content = fs.readFileSync(featureFile, 'utf-8');
  const lines = content.split('\n');

  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(tag) && lines[i].includes('@')) {
      // Check if next non-empty line is a Scenario or Scenario Outline
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine.startsWith('Scenario:') || nextLine.startsWith('Scenario Outline:')) {
          count++;
          break;
        }
        if (nextLine && !nextLine.startsWith('#')) {
          break;
        }
      }
    }
  }
  return count;
}

/**
 * Run tests with specified tag
 */
function runTests(tag) {
  const validatedTag = validateTag(tag);

  console.log(`\n╔════════════════════════════════════════════════════════╗`);
  console.log(`║ Running tests with tag: ${validatedTag.padEnd(32)} ║`);
  console.log(`╚════════════════════════════════════════════════════════╝\n`);

  // Find feature files with the tag
  const featureFiles = findFeatureFilesWithTag(validatedTag);

  if (featureFiles.length === 0) {
    console.error(`\n❌ No feature files found with tag: ${validatedTag}`);
    console.log('\nAvailable tags:');
    console.log('  @Regression, @Smoke, @AccountCreation, @Login, @CriticalPath\n');
    process.exit(1);
  }

  // Print summary
  console.log(`📋 Found ${featureFiles.length} feature file(s) with tag: ${validatedTag}`);
  featureFiles.forEach(file => {
    const scenarios = getScenarioCountWithTag(file, validatedTag);
    console.log(`   ✓ ${path.relative(process.cwd(), file)} (${scenarios} scenario${scenarios !== 1 ? 's' : ''})`);
  });
  console.log('');

  // Build command
  let command = 'npm run build && ';

  // Set environment variables
  let env = `CUCUMBER_TAGS="${validatedTag}"`;

  if (isHeaded) {
    env += ' HEADED=true';
  }

  if (isDebug) {
    env += ' DEBUG=true';
  }

  command = `${env} npm test`;

  console.log(`🚀 Starting test execution...\n`);

  try {
    execSync(command, { stdio: 'inherit', shell: true });
    console.log(`\n✅ Test run completed successfully for tag: ${validatedTag}`);
  } catch (error) {
    console.error(`\n❌ Test run failed for tag: ${validatedTag}`);
    process.exit(1);
  }
}

// Run the tests
runTests(tag);
