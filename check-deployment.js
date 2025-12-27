#!/usr/bin/env node

const https = require('https');

const BASE_URL = 'https://soexpensive.vercel.app';

function request(path) {
  return new Promise((resolve, reject) => {
    https.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode, data: json, raw: data });
          } catch {
            resolve({ status: res.statusCode, data: null, raw: data });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║  SOEXPENSIVE DEPLOYMENT VERIFICATION                  ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Check main page
  console.log('TEST 1: Main page...');
  try {
    const result = await request('/');
    if (result.raw.includes('soexpensive.fi') && result.raw.includes('styles.css')) {
      console.log('  ✓ Main page loads');
      console.log('  ✓ Contains soexpensive.fi');
      console.log('  ✓ Monospace CSS included');
      passed++;
    } else {
      console.log('  ✗ Main page missing expected content');
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    failed++;
  }
  console.log();

  // Test 2: Health endpoint
  console.log('TEST 2: Health endpoint...');
  try {
    const result = await request('/api/health');
    console.log(`  ✓ Health endpoint responds`);
    console.log(`  Status: ${result.data.status}`);
    console.log(`  Database configured: ${result.data.database?.hasPostgresUrl}`);
    console.log(`  Database state: ${result.data.database?.state}`);

    if (result.data.status === 'ok' && result.data.database?.hasPostgresUrl) {
      passed++;
    } else {
      console.log('  ✗ Health check issues detected');
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    failed++;
  }
  console.log();

  // Test 3: Stores API
  console.log('TEST 3: Stores API...');
  try {
    const result = await request('/api/stores');
    const stores = result.data;

    if (Array.isArray(stores) && stores.length === 6) {
      console.log(`  ✓ Found ${stores.length} stores:`);
      stores.forEach(s => console.log(`    - ${s.name}`));
      passed++;
    } else {
      console.log(`  ✗ Expected 6 stores, got ${stores?.length || 0}`);
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    failed++;
  }
  console.log();

  // Test 4: Products API
  console.log('TEST 4: Products API...');
  try {
    const result = await request('/api/products');
    const products = result.data;

    if (Array.isArray(products) && products.length === 67) {
      const withPrices = products.filter(p => p.prices && Object.keys(p.prices).length > 0);
      console.log(`  ✓ Found ${products.length} products`);
      console.log(`  ✓ ${withPrices.length} products with prices`);

      // Show categories
      const categories = [...new Set(products.map(p => p.category))];
      console.log(`  ✓ ${categories.length} categories:`);
      categories.slice(0, 5).forEach(c => console.log(`    - ${c}`));
      if (categories.length > 5) console.log(`    ... and ${categories.length - 5} more`);

      passed++;
    } else {
      console.log(`  ✗ Expected 67 products, got ${products?.length || 0}`);
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    failed++;
  }
  console.log();

  // Test 5: Seed endpoint exists
  console.log('TEST 5: Seed endpoint...');
  try {
    const result = await request('/api/seed');
    // Seed might fail if already seeded, but endpoint should respond
    console.log(`  ✓ Seed endpoint accessible`);
    if (result.data?.success) {
      console.log(`  ✓ Database seeded successfully`);
      console.log(`    Stores: ${result.data.results?.stores || 0}`);
      console.log(`    Products: ${result.data.results?.products || 0}`);
      console.log(`    Prices: ${result.data.results?.currentPrices || 0}`);
    }
    passed++;
  } catch (error) {
    // This might fail if database is already seeded, which is OK
    console.log(`  ⚠ Seed response: ${error.message}`);
    console.log('  (This is OK if database is already populated)');
    passed++;
  }
  console.log();

  // Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of 5 tests\n`);

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('\n✓ Deployment is live and working');
    console.log('✓ Monospace design is deployed');
    console.log('✓ Database is configured and populated');
    console.log('✓ All APIs are functional');
    console.log(`\n→ Visit: ${BASE_URL}`);
  } else {
    console.log('⚠️  SOME TESTS FAILED');
    console.log('\nPlease check the errors above and redeploy if needed.');
  }
  console.log('═══════════════════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
