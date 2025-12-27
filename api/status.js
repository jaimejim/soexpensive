const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  const status = {
    api: 'ok',
    database: 'ok',
    products: 0,
    stores: 0,
    prices: 0,
    timestamp: new Date().toISOString()
  };

  try {
    // Check if tables exist and get counts separately
    const productsResult = await sql`SELECT COUNT(*) as count FROM products`;
    status.products = parseInt(productsResult.rows[0].count || 0);

    const storesResult = await sql`SELECT COUNT(*) as count FROM stores`;
    status.stores = parseInt(storesResult.rows[0].count || 0);

    const pricesResult = await sql`SELECT COUNT(*) as count FROM prices`;
    status.prices = parseInt(pricesResult.rows[0].count || 0);

    // Check database health
    if (status.products === 0 && status.stores === 0) {
      status.database = 'empty - needs seeding';
    }
  } catch (error) {
    console.error('Database check failed:', error);
    // Check if it's a "table doesn't exist" error
    if (error.message.includes('does not exist')) {
      status.database = 'not initialized - run cleanup & seed';
      status.products = null;
      status.stores = null;
      status.prices = null;
    } else {
      status.database = 'error';
      status.api = 'degraded';
    }
  }

  res.status(200).json(status);
};
