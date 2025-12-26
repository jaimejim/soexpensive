#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks if the Vercel deployment is working correctly
 */

const https = require('https');

const DEPLOYMENT_URL = process.argv[2] || process.env.DEPLOYMENT_URL;

if (!DEPLOYMENT_URL) {
  console.error('❌ Please provide deployment URL as argument or set DEPLOYMENT_URL environment variable');
  console.log('Usage: node verify-deployment.js https://your-app.vercel.app');
  process.exit(1);
}

console.log('🔍 Verifying deployment at:', DEPLOYMENT_URL);
console.log('');

async function checkEndpoint(path, description) {
  return new Promise((resolve) => {
    const url = new URL(path, DEPLOYMENT_URL);

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const status = res.statusCode;
        const icon = status === 200 ? '✅' : '❌';
        console.log(`${icon} ${description}: ${status}`);

        if (path === '/api/health' && status === 200) {
          try {
            const health = JSON.parse(data);
            console.log('   Database configured:', health.database.hasPostgresUrl ? '✅' : '❌');
            console.log('   Database state:', health.database.state);
          } catch (e) {
            console.log('   Could not parse health response');
          }
        }

        resolve(status === 200);
      });
    }).on('error', (err) => {
      console.log(`❌ ${description}: Error - ${err.message}`);
      resolve(false);
    });
  });
}

async function verify() {
  console.log('Checking endpoints...\n');

  const checks = [
    checkEndpoint('/', 'Home page'),
    checkEndpoint('/api/health', 'Health check'),
    checkEndpoint('/api/stores', 'Stores API'),
    checkEndpoint('/api/products', 'Products API'),
  ];

  const results = await Promise.all(checks);
  const allPassed = results.every(r => r);

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    console.log('✅ All checks passed! Deployment is working.');
  } else {
    console.log('⚠️  Some checks failed. Please review the errors above.');
  }

  console.log('='.repeat(50) + '\n');

  return allPassed;
}

verify().then(success => {
  process.exit(success ? 0 : 1);
});
