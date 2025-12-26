const fs = require('fs');
const { execSync } = require('child_process');

// Check if database exists
if (!fs.existsSync('./prices.db')) {
  console.log('Database not found. Seeding initial data...');
  execSync('node seed.js', { stdio: 'inherit' });
} else {
  console.log('Database already exists. Skipping seed.');
}
