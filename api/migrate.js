const { sql } = require('@vercel/postgres');

/**
 * Database Migration Endpoint
 * Runs necessary migrations to update the database schema
 *
 * GET /api/migrate - Run all pending migrations
 */

module.exports = async (req, res) => {
  const results = {
    started: new Date().toISOString(),
    migrations: []
  };

  try {
    // Migration 1: Remove UNIQUE constraint to enable price history
    try {
      await sql`
        ALTER TABLE prices
        DROP CONSTRAINT IF EXISTS prices_product_id_store_id_key
      `;

      results.migrations.push({
        name: 'remove_prices_unique_constraint',
        status: 'success',
        message: 'Removed UNIQUE constraint from prices table - price history enabled'
      });
    } catch (error) {
      results.migrations.push({
        name: 'remove_prices_unique_constraint',
        status: 'error',
        message: error.message
      });
    }

    // Migration 2: Add index for better query performance (if not exists)
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_prices_recorded_at
        ON prices(recorded_at DESC)
      `;

      results.migrations.push({
        name: 'add_prices_recorded_at_index',
        status: 'success',
        message: 'Added index on prices.recorded_at for better query performance'
      });
    } catch (error) {
      results.migrations.push({
        name: 'add_prices_recorded_at_index',
        status: 'error',
        message: error.message
      });
    }

    // Migration 3: Verify changes
    try {
      const constraintsCheck = await sql`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'prices' AND constraint_type = 'UNIQUE'
      `;

      const hasUniqueConstraint = constraintsCheck.rows.length > 0;

      results.migrations.push({
        name: 'verify_constraints',
        status: 'info',
        message: hasUniqueConstraint
          ? `Warning: UNIQUE constraint still exists: ${constraintsCheck.rows.map(r => r.constraint_name).join(', ')}`
          : 'Verified: No UNIQUE constraints on prices table - price history fully enabled'
      });
    } catch (error) {
      results.migrations.push({
        name: 'verify_constraints',
        status: 'error',
        message: error.message
      });
    }

    results.completed = new Date().toISOString();
    results.success = results.migrations.every(m => m.status !== 'error');

    res.status(200).json(results);

  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({
      error: error.message,
      results
    });
  }
};
