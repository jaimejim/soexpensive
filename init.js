const { execSync } = require('child_process');
const db = require('./db');

async function init() {
  try {
    // Check if database has been seeded
    const isInitialized = await db.isDatabaseInitialized();

    if (!isInitialized) {
      console.log('Database not seeded. Running seed script...');
      execSync('node seed.js', { stdio: 'inherit' });
    } else {
      console.log('Database already seeded. Skipping initialization.');
    }
  } catch (error) {
    console.error('Initialization check failed:', error.message);
    console.log('Will attempt to seed database...');
    execSync('node seed.js', { stdio: 'inherit' });
  }
}

// Run init if not in production (in production, seed separately)
if (process.env.NODE_ENV !== 'production') {
  init();
}

module.exports = init;
