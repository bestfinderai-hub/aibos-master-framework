#!/usr/bin/env node

/**
 * GitHub Intelligence CLI
 * Usage: node cli.js [command] [options]
 */

require('dotenv').config();
const GitHubIntelligence = require('./intelligence-runner');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('❌ ERROR: GITHUB_TOKEN environment variable not set');
  console.error('Set it: export GITHUB_TOKEN=your_github_token');
  process.exit(1);
}

const intelligence = new GitHubIntelligence(GITHUB_TOKEN);

async function main() {
  const command = process.argv[2] || 'run';

  switch (command) {
    case 'run':
      console.log('🚀 Running GitHub Intelligence Engine...\n');
      const result = await intelligence.run();
      process.exit(result.success ? 0 : 1);

    case 'help':
      console.log(`
GitHub Intelligence CLI

Usage:
  node cli.js run           - Run full intelligence analysis
  node cli.js help          - Show this help

Environment:
  GITHUB_TOKEN              - Required: GitHub API token

Schedule:
  This runs daily at 06:00 UTC in production.
      `);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run: node cli.js help');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
