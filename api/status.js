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
    // Check if tables exist and get counts
    const result = await sql`
      SELECT
        (SELECT COUNT(*) FROM products) as products,
        (SELECT COUNT(*) FROM stores) as stores,
        (SELECT COUNT(*) FROM prices) as prices
    `;

    status.products = parseInt(result.rows[0].products || 0);
    status.stores = parseInt(result.rows[0].stores || 0);
    status.prices = parseInt(result.rows[0].prices || 0);

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
